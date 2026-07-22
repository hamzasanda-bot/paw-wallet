import { createClient } from "@supabase/supabase-js";

// Bir vet/groomer, uygulama dışından (telefon, kapıdan gelen müşteri vb.)
// aldığı bir randevuyu kendi takviminde işaretleyip o saat ARALIĞINI
// kapatabilir. Aralık, vetin kendi randevu süresi (slot_minutes) kadar
// parçalara bölünüp hepsi tek seferde (ya hep ya hiç) rezerve edilir.

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function toHHMM(mins) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

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

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: vetRow, error: vetError } = await admin
    .from("vets")
    .select("id, slot_minutes")
    .eq("user_id", userData.user.id)
    .single();
  if (vetError || !vetRow) return res.status(403).json({ error: "Not a vet/groomer account" });

  const slotMinutes = vetRow.slot_minutes || 30;
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (end <= start) return res.status(400).json({ error: "End time must be after start time" });

  const times = [];
  for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
    times.push(toHHMM(t));
  }
  if (times.length === 0) times.push(startTime);

  const dogName = customerName || reason || "Harici Randevu";
  const rows = times.map((t) => ({
    vet_id: vetRow.id,
    dog_id: null,
    owner_user_id: userData.user.id,
    dog_name: dogName,
    appt_date: date,
    appt_time: t,
    status: "booked",
    note: reason || "",
  }));

  // Tek bir INSERT ifadesiyle tüm parçaları ekliyoruz — biri bile
  // çakışırsa (aynı saat zaten doluysa) hiçbiri eklenmez.
  const { error: insertError } = await admin.from("vet_appointments").insert(rows);

  if (insertError) {
    if (insertError.code === "23505") {
      return res.status(409).json({ error: "SLOT_TAKEN" });
    }
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(200).json({ success: true });
}

