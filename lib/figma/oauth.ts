// Figma OAuth 2 helpers. Client credentials come from env; the app exchanges an
// authorization code for access/refresh tokens and refreshes them on demand.
// Tokens live in the `figma_connections` table and never reach the browser.

import type { SupabaseClient } from "@supabase/supabase-js";

const AUTHORIZE_URL = "https://www.figma.com/oauth";
const TOKEN_URL = "https://api.figma.com/v1/oauth/token";
const REFRESH_URL = "https://api.figma.com/v1/oauth/refresh";
// Figma's legacy single scope that grants file read access on every OAuth app
// without needing granular scopes enabled. Override with FIGMA_OAUTH_SCOPE if
// you've opted your app into granular scopes (e.g. "files:read").
const DEFAULT_SCOPE = "file_read";

// Refresh a little before the real expiry to avoid edge-of-expiry failures.
const EXPIRY_SKEW_MS = 60_000;

export function figmaOAuthConfigured(): boolean {
  return Boolean(process.env.FIGMA_OAUTH_CLIENT_ID && process.env.FIGMA_OAUTH_CLIENT_SECRET);
}

export function figmaScope(): string {
  return process.env.FIGMA_OAUTH_SCOPE ?? DEFAULT_SCOPE;
}

/** Resolve the redirect URI: explicit env wins, else derive from the request origin. */
export function figmaRedirectUri(origin: string): string {
  return process.env.FIGMA_OAUTH_REDIRECT_URI ?? `${origin}/api/figma/oauth/callback`;
}

export function buildAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.FIGMA_OAUTH_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    scope: figmaScope(),
    state,
    response_type: "code",
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

function basicAuthHeader(): string {
  const id = process.env.FIGMA_OAUTH_CLIENT_ID ?? "";
  const secret = process.env.FIGMA_OAUTH_CLIENT_SECRET ?? "";
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

interface FigmaTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user_id?: string;
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<FigmaTokenResponse> {
  const body = new URLSearchParams({ redirect_uri: redirectUri, code, grant_type: "authorization_code" });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: basicAuthHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Figma token exchange failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return (await res.json()) as FigmaTokenResponse;
}

async function refreshAccessToken(refreshToken: string): Promise<FigmaTokenResponse> {
  const body = new URLSearchParams({ refresh_token: refreshToken });
  const res = await fetch(REFRESH_URL, {
    method: "POST",
    headers: { Authorization: basicAuthHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Figma token refresh failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return (await res.json()) as FigmaTokenResponse;
}

function expiryFromNow(expiresInSec?: number): string | null {
  if (!expiresInSec || !Number.isFinite(expiresInSec)) return null;
  return new Date(Date.now() + expiresInSec * 1000).toISOString();
}

/** Persist (upsert) a freshly obtained token set for a user. */
export async function storeFigmaTokens(
  supabase: SupabaseClient,
  userId: string,
  tokens: FigmaTokenResponse,
  extra?: { figmaHandle?: string },
): Promise<void> {
  await supabase.from("figma_connections").upsert(
    {
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: expiryFromNow(tokens.expires_in),
      figma_user_id: tokens.user_id ?? null,
      figma_handle: extra?.figmaHandle ?? null,
      scope: figmaScope(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function getFigmaConnection(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ connected: boolean; figmaHandle?: string | null }> {
  const { data } = await supabase
    .from("figma_connections")
    .select("figma_handle")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? { connected: true, figmaHandle: data.figma_handle } : { connected: false };
}

export async function disconnectFigma(supabase: SupabaseClient, userId: string): Promise<void> {
  await supabase.from("figma_connections").delete().eq("user_id", userId);
}

/**
 * Returns a valid Figma access token for the user, refreshing (and persisting)
 * it when expired. Returns null when the user has no connection or the refresh
 * fails (they must reconnect).
 */
export async function getValidFigmaToken(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("figma_connections")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data?.access_token) return null;

  const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : null;
  const stillValid = !expiresAt || expiresAt - EXPIRY_SKEW_MS > Date.now();
  if (stillValid) return data.access_token;

  if (!data.refresh_token) return null;
  try {
    const refreshed = await refreshAccessToken(data.refresh_token);
    await supabase
      .from("figma_connections")
      .update({
        access_token: refreshed.access_token,
        // Figma may or may not rotate the refresh token; keep the old one if absent.
        refresh_token: refreshed.refresh_token ?? data.refresh_token,
        expires_at: expiryFromNow(refreshed.expires_in),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    return refreshed.access_token;
  } catch (err) {
    console.error("Figma token refresh error:", err);
    return null;
  }
}
