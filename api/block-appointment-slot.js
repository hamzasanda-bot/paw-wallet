import { createClient } from "@supabase/supabase-js";

// Bir vet/groomer, uygulama dışından (telefon, kapıdan gelen müşteri vb.)
// aldığı bir randevuyu kendi takviminde işaretleyip o saat ARALIĞINI
// kapatabilir. Artık TEK bir kayıt olarak, gerçek başlangıç+bitiş
// saatiyle saklanıyor — 30 dakika da olsa 3 saat de olsa fark etmez.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: "Unauthorized" });

  const { date, startTime, endTime, reason, customerName } = req.body || {};
  if (!date || !startTime || !endTime) return res.status(400).json({ error: "Missing date/startTime/endTime" });
  if (endTime <= startTime) return res.status(400).json({ error: "End time must be after start time" });

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: vetRow, error: vetError } = await admin
    .from("vets")
    .select("id, slot_minutes")
    .eq("user_id", userData.user.id)
    .single();
  if (vetError || !vetRow) return res.status(403).json({ error: "Not a vet/groomer account" });

  const slotMinutes = vetRow.slot_minutes || 30;

  // Bu aralık, aynı vet için mevcut herhangi bir randevuyla (normal ya da
  // harici) çakışıyor mu? Çakışıyorsa reddet.
  const { data: sameDayAppts } = await admin
    .from("vet_appointments")
    .select("appt_time, appt_end_time")
    .eq("vet_id", vetRow.id)
    .eq("appt_date", date)
    .neq("status", "cancelled");

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const newStart = toMinutes(startTime);
  const newEnd = toMinutes(endTime);

  const overlaps = (sameDayAppts || []).some((a) => {
    const s = toMinutes(a.appt_time);
    const e = a.appt_end_time ? toMinutes(a.appt_end_time) : s + slotMinutes;
    return newStart < e && s < newEnd;
  });
  if (overlaps) return res.status(409).json({ error: "SLOT_TAKEN" });

  const dogName = customerName || reason || "Harici Randevu";
  const { error: insertError } = await admin.from("vet_appointments").insert({
    vet_id: vetRow.id,
    dog_id: null,
    owner_user_id: userData.user.id,
    dog_name: dogName,
    appt_date: date,
    appt_time: startTime,
    appt_end_time: endTime,
    status: "booked",
    note: reason || "",
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return res.status(409).json({ error: "SLOT_TAKEN" });
    }
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(200).json({ success: true });
}
