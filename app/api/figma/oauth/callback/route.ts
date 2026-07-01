import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";
import { exchangeCodeForToken, figmaRedirectUri, storeFigmaTokens } from "@/lib/figma/oauth";

function getServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

/** OAuth redirect target: verifies state, exchanges the code, stores tokens. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("figma_oauth_state")?.value;

  const wizardUrl = new URL("/app/wizard", req.url);

  const fail = (reason: string) => {
    wizardUrl.searchParams.set("figma", reason);
    const res = NextResponse.redirect(wizardUrl);
    res.cookies.delete("figma_oauth_state");
    return res;
  };

  if (!session) return fail("error");
  if (!code || !state || !cookieState || state !== cookieState) return fail("error");

  try {
    const redirectUri = figmaRedirectUri(req.nextUrl.origin);
    const tokens = await exchangeCodeForToken(code, redirectUri);

    const supabase = getServiceClient();
    const userId = await getOrCreateUserId(session, supabase);
    if (!userId) return fail("error");

    // Best-effort: capture the Figma handle for display.
    let handle: string | undefined;
    try {
      const me = await fetch("https://api.figma.com/v1/me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        signal: AbortSignal.timeout(10000),
      });
      if (me.ok) {
        const meJson = (await me.json()) as { handle?: string; email?: string };
        handle = meJson.handle ?? meJson.email;
      }
    } catch {
      /* non-fatal */
    }

    await storeFigmaTokens(supabase, userId, tokens, { figmaHandle: handle });
    wizardUrl.searchParams.set("figma", "connected");
    const res = NextResponse.redirect(wizardUrl);
    res.cookies.delete("figma_oauth_state");
    return res;
  } catch (err) {
    console.error("Figma OAuth callback error:", err);
    return fail("error");
  }
}
