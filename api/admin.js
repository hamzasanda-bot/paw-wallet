import { createClient } from "@supabase/supabase-js";

// Tüm admin-only işlemleri TEK bir fonksiyonda topluyoruz — Vercel'in
// Hobby planındaki "en fazla 12 sunucu fonksiyonu" sınırını aşmamak için.
// Hangi işlemin yapılacağı ?action=... parametresiyle belirleniyor:
//   GET  ?action=stats                    → panel istatistikleri
//   GET  ?action=logs&email=...           → hareket kayıtları
//   GET  ?action=access-requests          → bekleyen işletme başvuruları
//   POST ?action=create-vet               → yeni veteriner/groomer hesabı + davet
//   POST ?action=set-password             → mevcut kullanıcının şifresini değiştir
//   POST ?action=create-user              → yeni kullanıcı (davetsiz, doğrudan)
//   POST ?action=approve-access-request   → başvuruyu onayla, hesap aç + davet gönder
//   POST ?action=reject-access-request    → başvuruyu reddet
//   POST ?action=verify-vet               → profili incele, herkese açık listeye al

async function createVetAccount(admin, { businessType, clinicName, city, country, specialty, phone, email }) {
  const { data: vetRow, error: insertError } = await admin
    .from("vets")
    .insert({
      business_type: businessType === "groomer" ? "groomer" : "vet",
      clinic_name: clinicName,
      city,
      country,
      specialty,
      phone,
      email,
      approved: true,
    })
    .select()
    .single();
  if (insertError) return { error: insertError.message };

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role: "vet", vet_id: vetRow.id },
    redirectTo: process.env.SITE_URL || "https://paw-wallet.vercel.app",
  });

  if (inviteError) {
    await admin.from("vets").delete().eq("id", vetRow.id);
    return { error: inviteError.message };
  }

  await admin.from("vets").update({ user_id: invited.user.id }).eq("id", vetRow.id);
  return { vetId: vetRow.id };
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: "Unauthorized" });
  if (userData.user.user_metadata?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const action = req.query.action;

  // ---------- STATS ----------
  if (action === "stats") {
    const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listError) return res.status(500).json({ error: listError.message });

    const totalUsers = usersPage.users.length;
    const totalVetAccounts = usersPage.users.filter((u) => u.user_metadata?.role === "vet").length;
    const totalOwners = totalUsers - totalVetAccounts;

    const { count: vetListingCount } = await admin.from("vets").select("*", { count: "exact", head: true });
    const { count: pendingRequestCount } = await admin
      .from("vet_assignment_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    const { count: serviceProviderCount } = await admin
      .from("service_providers")
      .select("*", { count: "exact", head: true });
    const { count: pendingAccessRequestCount } = await admin
      .from("business_access_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    return res.status(200).json({
      totalUsers,
      totalOwners,
      totalVetAccounts,
      vetListingCount: vetListingCount || 0,
      pendingRequestCount: pendingRequestCount || 0,
      serviceProviderCount: serviceProviderCount || 0,
      pendingAccessRequestCount: pendingAccessRequestCount || 0,
    });
  }

  // ---------- LOGS ----------
  if (action === "logs") {
    const emailFilter = (req.query.email || "").trim().toLowerCase();

    const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listError) return res.status(500).json({ error: listError.message });

    const emailById = {};
    for (const u of usersPage.users) emailById[u.id] = u.email;

    let userIdFilter = null;
    if (emailFilter) {
      const match = usersPage.users.find((u) => (u.email || "").toLowerCase().includes(emailFilter));
      if (!match) return res.status(200).json({ logs: [] });
      userIdFilter = match.id;
    }

    let query = admin.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(300);
    if (userIdFilter) query = query.eq("user_id", userIdFilter);

    const { data: logs, error: logsError } = await query;
    if (logsError) return res.status(500).json({ error: logsError.message });

    const enriched = (logs || []).map((l) => ({ ...l, email: emailById[l.user_id] || "—" }));
    return res.status(200).json({ logs: enriched });
  }

  // ---------- ACCESS REQUESTS (list) ----------
  if (action === "access-requests") {
    const { data: requests, error: reqError } = await admin
      .from("business_access_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (reqError) return res.status(500).json({ error: reqError.message });
    return res.status(200).json({ requests: requests || [] });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ---------- CREATE VET ----------
  if (action === "create-vet") {
    const { businessType, clinicName, city, country, specialty, phone, email } = req.body || {};
    if (!clinicName || !email) {
      return res.status(400).json({ error: "clinicName and email are required" });
    }
    const result = await createVetAccount(admin, { businessType, clinicName, city, country, specialty, phone, email });
    if (result.error) return res.status(500).json({ error: result.error });
    return res.status(200).json({ ok: true, vetId: result.vetId, invitedEmail: email });
  }

  // ---------- SET PASSWORD ----------
  if (action === "set-password") {
    const { email, newPassword } = req.body || {};
    if (!email || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "email and newPassword (min 6 chars) are required" });
    }

    const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listError) return res.status(500).json({ error: listError.message });

    const target = usersPage.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (!target) return res.status(404).json({ error: "User not found" });

    const { error: updateError } = await admin.auth.admin.updateUserById(target.id, { password: newPassword });
    if (updateError) return res.status(500).json({ error: updateError.message });
    return res.status(200).json({ ok: true });
  }

  // ---------- CREATE USER ----------
  if (action === "create-user") {
    const { email, password, firstName, lastName } = req.body || {};
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "email and password (min 6 chars) are required" });
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName || "", last_name: lastName || "" },
    });
    if (createError) return res.status(500).json({ error: createError.message });
    return res.status(200).json({ ok: true, userId: created.user.id, email });
  }

  // ---------- APPROVE ACCESS REQUEST ----------
  if (action === "approve-access-request") {
    const { requestId } = req.body || {};
    if (!requestId) return res.status(400).json({ error: "requestId is required" });

    const { data: reqRow, error: reqError } = await admin
      .from("business_access_requests")
      .select("*")
      .eq("id", requestId)
      .single();
    if (reqError || !reqRow) return res.status(404).json({ error: "Request not found" });

    const result = await createVetAccount(admin, {
      businessType: reqRow.business_type,
      clinicName: reqRow.business_name,
      city: reqRow.city,
      country: reqRow.country,
      specialty: [],
      phone: reqRow.phone,
      email: reqRow.email,
    });
    if (result.error) return res.status(500).json({ error: result.error });

    await admin.from("business_access_requests").update({ status: "approved" }).eq("id", requestId);
    return res.status(200).json({ ok: true, vetId: result.vetId });
  }

  // ---------- VERIFY VET (profile reviewed & approved for public listing) ----------
  if (action === "verify-vet") {
    const { vetId } = req.body || {};
    if (!vetId) return res.status(400).json({ error: "vetId is required" });
    const { error } = await admin.from("vets").update({ verified: true }).eq("id", vetId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  // ---------- REJECT ACCESS REQUEST ----------
  if (action === "reject-access-request") {
    const { requestId } = req.body || {};
    if (!requestId) return res.status(400).json({ error: "requestId is required" });

    const { error } = await admin.from("business_access_requests").update({ status: "rejected" }).eq("id", requestId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: "Unknown action" });
}
