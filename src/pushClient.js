import { supabase } from "./supabaseClient";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export async function getPushPermissionState() {
  if (!(await isPushSupported())) return "unsupported";
  if (typeof Notification === "undefined") return "unsupported";
  try {
    return Notification.permission; // "default" | "granted" | "denied"
  } catch {
    return "unsupported";
  }
}

export async function subscribeToPush(userId) {
  if (!(await isPushSupported())) throw new Error("Push not supported");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permission denied");

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
    });
  }

  const json = subscription.toJSON();
  await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      keys: json.keys,
    },
    { onConflict: "endpoint" }
  );

  return subscription;
}

export async function unsubscribeFromPush() {
  if (!(await isPushSupported())) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
    await subscription.unsubscribe();
  }
}
