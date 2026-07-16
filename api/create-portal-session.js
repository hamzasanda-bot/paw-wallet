import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Kullanıcı "Aboneliği Yönet" dediğinde bu uç nokta çağrılır.
// Stripe'ın kendi barındırdığı fatura/iptal yönetim sayfasına link üretir.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: "Unauthorized" });

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: sub } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", userData.user.id).single();

  if (!sub?.stripe_customer_id) return res.status(400).json({ error: "No subscription found" });

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.SITE_URL}/`,
  });

  return res.status(200).json({ url: portalSession.url });
}
