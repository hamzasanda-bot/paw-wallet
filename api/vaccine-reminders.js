import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Bu fonksiyon her gün otomatik çalışır (bkz. vercel.json).
// 1) Supabase'deki tüm köpekleri okur
// 2) Her aşının "sonraki doz" tarihine göre kalan günü hesaplar
//    -> tam olarak 30, 7 veya 1 gün kaldıysa hatırlatma e-postası + push bildirimi gönderir
// 3) Her randevunun tarihine göre kalan günü hesaplar
//    -> tam olarak 1 gün kaldıysa hatırlatma e-postası + push bildirimi gönderir
// 4) Daha önce gönderilenleri kayda işler (tekrar tekrar göndermemek için)

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:hello@paw-wallet.app",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  // Basit bir güvenlik önlemi: sadece doğru "secret" ile çağrılırsa çalışsın.
  // Vercel Cron bu URL'i her gün otomatik çağıracak: /api/vaccine-reminders?secret=...
  const secret = req.query.secret;
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: rows, error } = await supabase.from("dogs").select("id, payload, user_id");
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sentLog = [];

  for (const row of rows || []) {
    const dog = row.payload;
    if (!dog) continue;

    let changed = false;

    // --- Aşı hatırlatmaları (30 / 7 / 1 gün kala) ---
    for (const vaccine of dog.vaccines || []) {
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

      const label = daysLeft === 30 ? "1 ay" : daysLeft === 7 ? "1 hafta" : "1 gün";
      const title = `🐾 ${dog.name} için aşı hatırlatması`;
      const body = `${vaccine.name} aşısının bir sonraki dozuna ${label} kaldı.`;

      try {
        if (dog.ownerEmail) await sendVaccineReminderEmail({ dog, vaccine, daysLeft });
        await sendPushToUser(supabase, row.user_id, { title, body });
        vaccine.remindersSent = [...alreadySent, threshold];
        changed = true;
        sentLog.push(`AŞI: ${dog.name} → ${vaccine.name} (${threshold} gün kala)`);
      } catch (err) {
        sentLog.push(`HATA (aşı): ${dog.name} → ${vaccine.name}: ${err.message}`);
      }
    }

    // --- Randevu hatırlatmaları (1 gün kala) ---
    for (const appt of dog.appointments || []) {
      if (!appt.date) continue;
      const apptDate = new Date(appt.date + "T00:00:00");
      const daysLeft = Math.round((apptDate - today) / 86400000);

      if (daysLeft !== 1) continue;
      if (appt.reminderSent) continue;

      const title = `🐾 ${dog.name} için yarın randevu var`;
      const body = `${appt.type} randevusu yarın${appt.time ? `, saat ${appt.time}` : ""}.`;

      try {
        if (dog.ownerEmail) await sendAppointmentReminderEmail({ dog, appt });
        await sendPushToUser(supabase, row.user_id, { title, body });
        appt.reminderSent = true;
        changed = true;
        sentLog.push(`RANDEVU: ${dog.name} → ${appt.type} (${appt.date})`);
      } catch (err) {
        sentLog.push(`HATA (randevu): ${dog.name} → ${appt.type}: ${err.message}`);
      }
    }

    if (changed) {
      await supabase.from("dogs").upsert({ id: row.id, payload: dog });
    }
  }

  return res.status(200).json({ ok: true, checked: rows?.length || 0, sent: sentLog });
}

async function sendPushToUser(supabase, userId, { title, body }) {
  if (!userId || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;

  const { data: subs } = await supabase.from("push_subscriptions").select("*").eq("user_id", userId);
  if (!subs || subs.length === 0) return;

  const payload = JSON.stringify({ title, body, url: "/" });

  for (const sub of subs) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
    } catch (err) {
      // Abonelik artık geçersizse (kullanıcı bildirimleri kapatmış olabilir) sessizce sil
      if (err.statusCode === 404 || err.statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }
}

async function sendEmail({ to, subject, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Paw Wallet <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend API error: ${response.status} ${text}`);
  }
}

async function sendVaccineReminderEmail({ dog, vaccine, daysLeft }) {
  const label = daysLeft === 30 ? "1 ay" : daysLeft === 7 ? "1 hafta" : "1 gün";
  await sendEmail({
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
  });
}

async function sendAppointmentReminderEmail({ dog, appt }) {
  const typeLabel = appt.type === "Aşı" ? "Aşı" : appt.type === "Kontrol" ? "Kontrol" : "Muayene";
  await sendEmail({
    to: dog.ownerEmail,
    subject: `🐾 ${dog.name} için yarın randevu var`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2a24;">
        <h2 style="color: #1B3A2F;">Randevu Hatırlatması</h2>
        <p><strong>${dog.name}</strong> adlı köpeğinizin <strong>${typeLabel}</strong> randevusu yarına
        (<strong>${appt.date}</strong>${appt.time ? `, saat <strong>${appt.time}</strong>` : ""}) planlandı.</p>
        ${appt.vet ? `<p>Veteriner / klinik: <strong>${appt.vet}</strong></p>` : ""}
        <p style="margin-top: 24px; font-size: 13px; color: #5b6d63;">— Paw Wallet</p>
      </div>
    `,
  });
}

