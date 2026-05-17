import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "fallback-secret-change-in-production-32ch"
);

const PROTECTED_PATHS = ["/app"];
const AUTH_PATHS = ["/login", "/verify"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));

  const token = request.cookies.get("ptg_session")?.value;

  let session = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      session = payload;
    } catch {
      // invalid token
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuth && session) {
    return NextResponse.redirect(new URL("/app/wizard", request.url));
  }

  // Guard protected routes
  if (isProtected) {
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    // Check payment for /app routes (except /app/pricing-required which shows the paywall)
    const hasPaid = (session as { hasPaid?: boolean }).hasPaid;
    if (!hasPaid && !pathname.startsWith("/app/pricing-required")) {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/verify"],
};
