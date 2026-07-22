import { createClient } from "@supabase/supabase-js";

// Bir vet/groomer, uygulama dışından (telefon, kapıdan gelen müşteri vb.)
// aldığı bir randevuyu kendi takviminde işaretleyip o saati kapatabilir.
// Bu sayede aynı saat, uygulama üzerinden başka biri tarafından da alınamaz.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: "Unauthorized" });

  const { date, time, note } = req.body || {};
  if (!date || !time) return res.status(400).json({ error: "Missing date or time" });

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: vetRow, error: vetError } = await admin
    .from("vets")
    .select("id")
    .eq("user_id", userData.user.id)
    .single();
  if (vetError || !vetRow) return res.status(403).json({ error: "Not a vet/groomer account" });

  const { error: insertError } = await admin.from("vet_appointments").insert({
    vet_id: vetRow.id,
    dog_id: null,
    owner_user_id: userData.user.id,
    dog_name: note || "Harici Randevu",
    appt_date: date,
    appt_time: time,
    status: "booked",
    note: note || "",
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return res.status(409).json({ error: "SLOT_TAKEN" });
    }
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(200).json({ success: true });
}
