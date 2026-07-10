import { createClient } from "@supabase/supabase-js";

// Admin paneli bu uç noktayı çağırarak toplam kullanıcı ve veteriner
// sayısını alır. Sadece rolü "admin" olan, geçerli bir oturumu olan
// kişiler çağırabilir.

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

  return res.status(200).json({
    totalUsers,
    totalOwners,
    totalVetAccounts,
    vetListingCount: vetListingCount || 0,
    pendingRequestCount: pendingRequestCount || 0,
    serviceProviderCount: serviceProviderCount || 0,
  });
}
