import { createClient } from "@supabase/supabase-js";

// Belirli bir vet + tarih için müsait randevu saatlerini hesaplar.
// Vetin haftalık müsaitlik bloklarından, o güne ait olanları alır,
// önceden alınmış (iptal edilmemiş) randevuları çıkarır.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { vetId, date } = req.body || {};
  if (!vetId || !date) return res.status(400).json({ error: "Missing vetId or date" });

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: vetRow, error: vetError } = await admin
    .from("vets")
    .select("availability, slot_minutes")
    .eq("id", vetId)
    .single();
  if (vetError || !vetRow) return res.status(404).json({ error: "Vet not found" });

  const slotMinutes = vetRow.slot_minutes || 30;
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay(); // 0=Pazar ... 6=Cumartesi
  const blocks = (vetRow.availability || []).filter((b) => b.day === dayOfWeek);

  if (blocks.length === 0) return res.status(200).json({ slots: [] });

  // Bu vet + tarih için zaten alınmış (iptal edilmemiş) saatleri çek
  const { data: existing } = await admin
    .from("vet_appointments")
    .select("appt_time")
    .eq("vet_id", vetId)
    .eq("appt_date", date)
    .neq("status", "cancelled");
  const taken = new Set((existing || []).map((r) => r.appt_time));

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const toHHMM = (mins) => {
    const h = Math.floor(mins / 60)
      .toString()
      .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const now = new Date();
  const isToday = date === now.toISOString().slice(0, 10);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (const block of blocks) {
    let start = toMinutes(block.start);
    const end = toMinutes(block.end);
    while (start + slotMinutes <= end) {
      const hhmm = toHHMM(start);
      const isPast = isToday && start <= nowMinutes;
      if (!taken.has(hhmm) && !isPast) slots.push(hhmm);
      start += slotMinutes;
    }
  }

  slots.sort();
  return res.status(200).json({ slots });
}
