import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Kullanıcı "Premium'a Geç" dediğinde bu uç nokta çağrılır.
// Stripe'ın kendi barındırdığı ödeme sayfasına yönlendiren bir link üretir.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: "Unauthorized" });

  const user = userData.user;
  const { billingCycle } = req.body || {}; // "monthly" | "yearly"
  const priceId =
    billingCycle === "yearly" ? process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID;

  if (!priceId) return res.status(400).json({ error: "Invalid billing cycle" });

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Daha önce bir Stripe müşterisi oluşturulmuş mu bak, yoksa yeni oluştur
  const { data: existingSub } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).single();

  let customerId = existingSub?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await admin.from("subscriptions").upsert({ user_id: user.id, stripe_customer_id: customerId, plan: "free", status: "inactive" });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.SITE_URL}/?upgraded=1`,
    cancel_url: `${process.env.SITE_URL}/`,
    metadata: { user_id: user.id, billing_cycle: billingCycle || "monthly" },
  });

  return res.status(200).json({ url: session.url });
}
