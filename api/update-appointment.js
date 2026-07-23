import { createClient } from "@supabase/supabase-js";

// Vet/groomer'ın kendi randevusunu iptal etmesi, yeniden planlaması ya da
// tamamlandı olarak işaretlemesi İÇİN; AYRICA sahibin kendi randevusunu
// iptal edip yeniden planlaması İÇİN kullanılan tek uç nokta. Sahip "done"
// aksiyonunu kullanamaz — bu yetki vet/groomer'da kalır. Girilen not, hem
// burada hem de (hayvana bağlı bir randevuysa) karşı tarafta görünür.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: "Unauthorized" });

  const { appointmentId, action, note, newDate, newStartTime, newEndTime } = req.body || {};
  if (!appointmentId || !["cancel", "reschedule", "done"].includes(action)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: apptRow, error: apptError } = await admin
    .from("vet_appointments")
    .select("*")
    .eq("id", appointmentId)
    .single();
  if (apptError || !apptRow) return res.status(404).json({ error: "Appointment not found" });

  // Bu isteği yapan kişi bu randevunun vet'i mi, yoksa sahibi mi?
  const { data: vetRow } = await admin.from("vets").select("id, slot_minutes").eq("user_id", userData.user.id).single();
  const isVet = vetRow && vetRow.id === apptRow.vet_id;
  const isOwner = apptRow.owner_user_id === userData.user.id;

  if (!isVet && !isOwner) return res.status(403).json({ error: "Forbidden" });
  if (isOwner && !isVet && action === "done") {
    return res.status(403).json({ error: "Only the vet/groomer can mark an appointment as done" });
  }

  const slotMinutes = (isVet ? vetRow.slot_minutes : null) || 30;

  if (action === "cancel") {
    const { error } = await admin
      .from("vet_appointments")
      .update({ status: "cancelled", status_note: note || "" })
      .eq("id", appointmentId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (action === "done") {
    const { error } = await admin
      .from("vet_appointments")
      .update({ status: "done", status_note: note || "" })
      .eq("id", appointmentId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // --- reschedule ---
  if (!newDate || !newStartTime || !newEndTime) {
    return res.status(400).json({ error: "Missing new date/time for reschedule" });
  }
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const newStart = toMinutes(newStartTime);
  const newEnd = toMinutes(newEndTime);
  if (newEnd <= newStart) return res.status(400).json({ error: "End time must be after start time" });

  const { data: sameDayAppts } = await admin
    .from("vet_appointments")
    .select("id, appt_time, appt_end_time")
    .eq("vet_id", apptRow.vet_id)
    .eq("appt_date", newDate)
    .neq("status", "cancelled")
    .neq("id", appointmentId);
  const overlaps = (sameDayAppts || []).some((a) => {
    const s = toMinutes(a.appt_time);
    const e = a.appt_end_time ? toMinutes(a.appt_end_time) : s + slotMinutes;
    return newStart < e && s < newEnd;
  });
  if (overlaps) return res.status(409).json({ error: "SLOT_TAKEN" });

  const { error } = await admin
    .from("vet_appointments")
    .update({
      appt_date: newDate,
      appt_time: newStartTime,
      appt_end_time: newEndTime,
      status: "rescheduled",
      status_note: note || "",
    })
    .eq("id", appointmentId);
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true });
}
