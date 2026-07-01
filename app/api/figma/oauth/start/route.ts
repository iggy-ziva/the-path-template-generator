import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/session";
import { buildAuthorizeUrl, figmaOAuthConfigured, figmaRedirectUri } from "@/lib/figma/oauth";

/** Kicks off the Figma OAuth flow: sets a CSRF state cookie and redirects to Figma. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  const wizardUrl = new URL("/app/wizard", req.url);
  if (!session) {
    wizardUrl.searchParams.set("figma", "error");
    return NextResponse.redirect(wizardUrl);
  }
  if (!figmaOAuthConfigured()) {
    wizardUrl.searchParams.set("figma", "unconfigured");
    return NextResponse.redirect(wizardUrl);
  }

  const state = nanoid();
  const redirectUri = figmaRedirectUri(req.nextUrl.origin);
  const res = NextResponse.redirect(buildAuthorizeUrl(redirectUri, state));
  res.cookies.set("figma_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
