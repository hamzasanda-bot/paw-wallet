import { createClient } from "@supabase/supabase-js";

// Bu uç nokta, QR koddan taranan "kayıp köpek kartı" sayfası için
// GİRİŞ GEREKTİRMEDEN çağrılabilir. Bu yüzden sadece bulan kişinin
// sahibe ulaşması için gereken MİNİMUM bilgiyi döndürür — tüm sağlık
// kayıtları, belgeler, ev adresi gibi hassas veriler asla dönmez.

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Missing id" });

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: row, error } = await admin.from("dogs").select("payload").eq("id", id).single();
  if (error || !row) return res.status(404).json({ error: "Not found" });

  const dog = row.payload || {};

  // Sadece güvenli/gerekli alanları döndür — tam kaydı asla dışarı vermiyoruz
  const publicCard = {
    name: dog.name || "",
    species: dog.species || "dog",
    breed: dog.breed || "",
    photo: dog.photo || null,
    microchip: dog.microchip || "",
    passportNumber: dog.passportNumber || "",
    ownerName: dog.ownerName || "",
    ownerPhoneCode: dog.ownerPhoneCode || "",
    ownerPhoneNumber: dog.ownerPhoneNumber || "",
    emergencyName: dog.emergencyName || "",
    emergencyPhoneCode: dog.emergencyPhoneCode || "",
    emergencyPhoneNumber: dog.emergencyPhoneNumber || "",
  };

  return res.status(200).json(publicCard);
}
