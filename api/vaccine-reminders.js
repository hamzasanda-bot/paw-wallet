import { createClient } from "@supabase/supabase-js";

// Bu fonksiyon her gün otomatik çalışır (bkz. vercel.json).
// 1) Supabase'deki tüm köpekleri okur
// 2) Her aşının "sonraki doz" tarihine göre kalan günü hesaplar
// 3) Tam olarak 30, 7 veya 1 gün kaldıysa ve daha önce o eşik için mail atılmadıysa
//    Resend üzerinden sahibine hatırlatma e-postası gönderir
// 4) Hangi eşiklerin gönderildiğini aşının kaydına işler (tekrar tekrar mail atmamak için)

export default async function handler(req, res) {
  // Basit bir güvenlik önlemi: sadece doğru "secret" ile çağrılırsa çalışsın.
  // Vercel Cron bu URL'i her gün otomatik çağıracak: /api/vaccine-reminders?secret=...
  const secret = req.query.secret;
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: rows, error } = await supabase.from("dogs").select("id, payload");
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sentLog = [];

  for (const row of rows || []) {
    const dog = row.payload;
    if (!dog || !dog.ownerEmail || !Array.isArray(dog.vaccines)) continue;

    let changed = false;

    for (const vaccine of dog.vaccines) {
      if (!vaccine.nextDate) continue;
      const nextDate = new Date(vaccine.nextDate + "T00:00:00");
      const daysLeft = Math.round((nextDate - today) / 86400000);

      let threshold = null;
      if (daysLeft === 30) threshold = "30";
      else if (daysLeft === 7) threshold = "7";
      else if (daysLeft === 1) threshold = "1";

      if (!threshold) continue;

      const alreadySent = vaccine.remindersSent || [];
      if (alreadySent.includes(threshold)) continue;

      try {
        await sendReminderEmail({ dog, vaccine, daysLeft });
        vaccine.remindersSent = [...alreadySent, threshold];
        changed = true;
        sentLog.push(`${dog.name} → ${vaccine.name} (${threshold} gün kala) → ${dog.ownerEmail}`);
      } catch (err) {
        sentLog.push(`HATA: ${dog.name} → ${vaccine.name}: ${err.message}`);
      }
    }

    if (changed) {
      await supabase.from("dogs").upsert({ id: row.id, payload: dog });
    }
  }

  return res.status(200).json({ ok: true, checked: rows?.length || 0, sent: sentLog });
}

async function sendReminderEmail({ dog, vaccine, daysLeft }) {
  const label = daysLeft === 30 ? "1 ay" : daysLeft === 7 ? "1 hafta" : "1 gün";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Paw Wallet <onboarding@resend.dev>",
      to: dog.ownerEmail,
      subject: `🐾 ${dog.name} için aşı hatırlatması — ${label} kaldı`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2a24;">
          <h2 style="color: #1B3A2F;">Aşı Hatırlatması</h2>
          <p><strong>${dog.name}</strong> adlı köpeğinizin <strong>${vaccine.name}</strong> aşısının bir sonraki dozuna
          <strong>${label}</strong> kaldı.</p>
          <p>Planlanan tarih: <strong>${vaccine.nextDate}</strong></p>
          <p style="margin-top: 24px; font-size: 13px; color: #5b6d63;">— Paw Wallet</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend API error: ${response.status} ${text}`);
  }
}
