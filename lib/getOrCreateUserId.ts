import type { SupabaseClient } from "@supabase/supabase-js";
import type { SessionPayload } from "./session";

/**
 * Returns the user's UUID from the session.
 * If session.userId is missing (old session cookie), falls back to a SELECT by email.
 */
export async function getOrCreateUserId(
  session: SessionPayload,
  supabase: SupabaseClient
): Promise<string | null> {
  if (session.userId) return session.userId;

  // Fallback for old session cookies that predate userId being stored in the JWT
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.email)
    .single();

  if (error || !data) {
    console.error("getOrCreateUserId: could not resolve userId for", session.email, error);
    return null;
  }
  return data.id;
}
