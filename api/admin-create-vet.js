import { createClient } from "@supabase/supabase-js";

// Admin paneli bu uç noktayı çağırarak yeni bir veteriner kliniği
// oluşturur VE o klinik için bir giriş hesabı davetiyesi gönderir.
// Vet, e-postasına gelen davet linkine tıklayıp kendi şifresini
// belirleyerek Veteriner Portalı'na giriş yapabilir.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: "Unauthorized" });
  if (userData.user.user_metadata?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { clinicName, city, country, specialty, phone, email } = req.body || {};
  if (!clinicName || !email) {
    return res.status(400).json({ error: "clinicName and email are required" });
  }

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: vetRow, error: insertError } = await admin
    .from("vets")
    .insert({ clinic_name: clinicName, city, country, specialty, phone, email, approved: true })
    .select()
    .single();

  if (insertError) return res.status(500).json({ error: insertError.message });

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role: "vet", vet_id: vetRow.id },
    redirectTo: process.env.SITE_URL || "https://paw-wallet.vercel.app",
  });

  if (inviteError) {
    // Klinik kaydı oluşturuldu ama davet gönderilemedi — kaydı geri al
    await admin.from("vets").delete().eq("id", vetRow.id);
    return res.status(500).json({ error: inviteError.message });
  }

  await admin.from("vets").update({ user_id: invited.user.id }).eq("id", vetRow.id);

  return res.status(200).json({ ok: true, vetId: vetRow.id, invitedEmail: email });
}
