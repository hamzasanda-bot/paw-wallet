import { createClient } from "@supabase/supabase-js";

// Admin paneli bu uç noktayı çağırarak kullanıcı hareket kayıtlarını
// (activity_logs) e-posta ile eşleştirilmiş halde alır. Sadece rolü
// "admin" olan, geçerli bir oturumu olan kişiler çağırabilir.
// ?email=... verilirse sadece o kullanıcının kayıtları döner.

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
