import { createClient } from "@supabase/supabase-js";

// Admin paneli bu uç noktayı çağırarak, davet e-postası beklemeden
// DOĞRUDAN bir kullanıcı hesabı (köpek sahibi) oluşturur — e-posta
// zaten onaylanmış sayılır, admin belirlediği şifreyi test kullanıcısına
// elden iletebilir.

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

  const { email, password, firstName, lastName } = req.body || {};
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "email and password (min 6 chars) are required" });
  }

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName || "", last_name: lastName || "" },
  });

  if (createError) return res.status(500).json({ error: createError.message });

  return res.status(200).json({ ok: true, userId: created.user.id, email });
}
