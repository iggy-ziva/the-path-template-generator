import type { SupabaseClient } from "@supabase/supabase-js";
import type { SessionPayload } from "./session";

/**
 * Returns a guaranteed user UUID.
 * If session.userId is missing (old session cookie), looks the user up by email.
 * If the user row doesn't exist yet, creates it.
 */
export async function getOrCreateUserId(
  session: SessionPayload,
  supabase: SupabaseClient
): Promise<string | null> {
  if (session.userId) return session.userId;

  // Fallback: look up by email
  const { data, error } = await supabase
    .from("users")
    .upsert({ email: session.email }, { onConflict: "email" })
    .select("id")
    .single();

  if (error || !data) {
    console.error("getOrCreateUserId error:", error);
    return null;
  }
  return data.id;
}
