import { createClient } from "@supabase/supabase-js";

// Bir veterinerin, ONAYLI hastasının dosyasına aşı/sağlık/ilaç kaydı
// EKLEYEBİLMESİNİ ve KENDİ EKLEDİĞİ aşıların "yapıldı/yapılmadı" durumunu
// değiştirebilmesini sağlayan uç nokta. Başka hiçbir alana dokunmaz.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: "Unauthorized" });

  const { dogId, action, type, entry, vaccineId, confirmed } = req.body || {};
  if (!dogId) return res.status(400).json({ error: "Invalid request" });

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Bu kullanıcı gerçekten bir vet mi, hangi kliniğe ait?
  const { data: vetRow, error: vetError } = await admin
    .from("vets")
    .select("id, clinic_name")
    .eq("user_id", userData.user.id)
    .single();
  if (vetError || !vetRow) return res.status(403).json({ error: "Not a vet account" });

  // Bu hayvana ONAYLI bir ataması var mı? (Birincil + İkincil ikisi de olabilir,
  // bu yüzden tekil değil, liste olarak sorguluyoruz)
  const { data: assignments, error: assignmentError } = await admin
    .from("vet_assignment_requests")
    .select("id")
    .eq("vet_id", vetRow.id)
    .eq("dog_id", dogId)
    .eq("status", "approved")
    .limit(1);
  if (assignmentError) return res.status(500).json({ error: assignmentError.message });
  if (!assignments || assignments.length === 0) {
    return res.status(403).json({ error: "No approved assignment for this patient" });
  }

  const { data: dogRow, error: dogError } = await admin.from("dogs").select("user_id, payload").eq("id", dogId).single();
  if (dogError || !dogRow) return res.status(404).json({ error: "Patient not found" });

  const payload = dogRow.payload || {};

  // --- Vetin KENDİ eklediği bir aşının yapıldı/yapılmadı durumunu değiştirmesi ---
  if (action === "toggle_confirm") {
    const vaccines = payload.vaccines || [];
    const target = vaccines.find((v) => v.id === vaccineId);
    if (!target) return res.status(404).json({ error: "Vaccine record not found" });
    if (!target.addedByVet || target.vet !== vetRow.clinic_name) {
      return res.status(403).json({ error: "You can only confirm vaccines you added yourself" });
    }
    const updatedVaccines = vaccines.map((v) => (v.id === vaccineId ? { ...v, confirmed } : v));
    const { error: updateError } = await admin
      .from("dogs")
      .update({ payload: { ...payload, vaccines: updatedVaccines } })
      .eq("id", dogId);
    if (updateError) return res.status(500).json({ error: updateError.message });
    return res.status(200).json({ success: true });
  }

  // --- Yeni bir aşı / sağlık kaydı / ilaç ekleme ---
  if (!["vaccine", "health", "medication"].includes(type) || !entry) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const newEntry = {
    ...entry,
    id: `v${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    vet: vetRow.clinic_name,
    addedByVet: true,
  };

  const fieldMap = { vaccine: "vaccines", health: "healthRecords", medication: "medications" };
  const field = fieldMap[type];
  const updatedPayload = { ...payload, [field]: [...(payload[field] || []), newEntry] };

  const { error: updateError } = await admin.from("dogs").update({ payload: updatedPayload }).eq("id", dogId);
  if (updateError) return res.status(500).json({ error: updateError.message });

  await admin.from("activity_logs").insert({
    user_id: dogRow.user_id,
    action: type === "vaccine" ? "vaccine_added" : type === "health" ? "health_record_added" : "medication_added",
    details: `${vetRow.clinic_name} tarafından eklendi — ${payload.name || ""}`,
  });

  return res.status(200).json({ success: true });
}

