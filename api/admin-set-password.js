import { createClient } from "@supabase/supabase-js";

// Admin paneli bu uç noktayı çağırarak bir kullanıcının şifresini
// e-posta göndermeden DOĞRUDAN değiştirir. Sadece rolü "admin" olan
// kişiler çağırabilir.

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

  const { email, newPassword } = req.body || {};
  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "email and newPassword (min 6 chars) are required" });
  }

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) return res.status(500).json({ error: listError.message });

  const target = usersPage.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
  if (!target) return res.status(404).json({ error: "User not found" });

  const { error: updateError } = await admin.auth.admin.updateUserById(target.id, { password: newPassword });
  if (updateError) return res.status(500).json({ error: updateError.message });

  return res.status(200).json({ ok: true });
}
