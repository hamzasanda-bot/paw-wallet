import { supabase } from "./supabaseClient";

export async function logActivity(userId, action, details = "") {
  if (!userId) return;
  try {
    await supabase.from("activity_logs").insert({ user_id: userId, action, details });
  } catch {
    /* loglama başarısız olursa uygulamayı bloklamasın */
  }
}
