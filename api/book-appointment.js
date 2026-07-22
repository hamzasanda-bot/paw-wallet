import { createClient } from "@supabase/supabase-js";

// Bir sahibin, bir vetten randevu almasını sağlayan uç nokta.
// Aynı saatin iki kez alınmasını, veritabanındaki UNIQUE kısıtlaması
// üzerinden kesin olarak engelliyoruz (yarış durumuna karşı).

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: "Unauthorized" });

  const { vetId, dogId, date, time, note } = req.body || {};
  if (!vetId || !dogId || !date || !time) return res.status(400).json({ error: "Missing fields" });

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Bu hayvan gerçekten bu kullanıcıya mı ait?
  const { data: dogRow, error: dogError } = await admin.from("dogs").select("user_id, payload").eq("id", dogId).single();
  if (dogError || !dogRow || dogRow.user_id !== userData.user.id) {
    return res.status(403).json({ error: "Not your pet" });
  }

  const { data: vetRow } = await admin.from("vets").select("slot_minutes").eq("id", vetId).single();
  const slotMinutes = vetRow?.slot_minutes || 30;

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const newStart = toMinutes(time);
  const newEnd = newStart + slotMinutes;

  const { data: sameDayAppts } = await admin
    .from("vet_appointments")
    .select("appt_time, appt_end_time")
    .eq("vet_id", vetId)
    .eq("appt_date", date)
    .neq("status", "cancelled");
  const overlaps = (sameDayAppts || []).some((a) => {
    const s = toMinutes(a.appt_time);
    const e = a.appt_end_time ? toMinutes(a.appt_end_time) : s + slotMinutes;
    return newStart < e && s < newEnd;
  });
  if (overlaps) return res.status(409).json({ error: "SLOT_TAKEN" });

  const { error: insertError } = await admin.from("vet_appointments").insert({
    vet_id: vetId,
    dog_id: dogId,
    owner_user_id: userData.user.id,
    dog_name: dogRow.payload?.name || "",
    appt_date: date,
    appt_time: time,
    note: note || "",
    status: "booked",
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return res.status(409).json({ error: "SLOT_TAKEN" });
    }
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(200).json({ success: true });
}
