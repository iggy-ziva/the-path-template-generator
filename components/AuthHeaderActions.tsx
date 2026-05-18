"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Session {
  email: string;
  hasPaid: boolean;
}

interface Props {
  /** "dark" = landing/pricing pages (dark text on light bg)
   *  "light" = theme pages (dark text on white ThemeSwitcher bar) */
  variant?: "dark" | "light";
  /** Hide the "Get access" CTA — useful on the pricing page itself */
  hideCta?: boolean;
}

const Z = {
  pink:  "#FF007E",
  coral: "#FA2A45",
  white: "#FFFFFF",
  muted: "#8A7A6A",
  font:  'var(--font-barlow), -apple-system, sans-serif',
};

export default function AuthHeaderActions({ variant = "dark", hideCta = false }: Props) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setSession(data ?? null))
      .catch(() => setSession(null));
  }, []);

  // Still loading — render nothing to avoid layout shift
  if (session === undefined) return null;

  const textColor   = variant === "dark" ? Z.muted   : "#555";
  const signInColor = variant === "dark" ? Z.muted   : "#555";

  if (session) {
    // ── Logged in ──────────────────────────────────────────────────────
    const initial = session.email.charAt(0).toUpperCase();
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Profile circle */}
        <Link
          href="/app/wizard"
          title={session.email}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 100%)`,
            color: Z.white,
            fontFamily: Z.font,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(250,42,69,0.3)",
          }}
        >
          {initial}
        </Link>

        {/* Sign out */}
        <form action="/api/auth/logout" method="POST" style={{ margin: 0 }}>
          <button
            type="submit"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: Z.font,
              fontSize: 14,
              fontWeight: 600,
              color: textColor,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  // ── Logged out ────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <Link
        href="/login"
        style={{
          fontFamily: Z.font,
          color: signInColor,
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Sign in
      </Link>
      {!hideCta && (
        <form action="/api/stripe/create-session" method="POST" style={{ display: "inline" }}>
          <button
            type="submit"
            style={{
              background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 55%, #FD1562 100%)`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              color: Z.white,
              border: "none",
              borderRadius: 12,
              fontFamily: Z.font,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.02em",
              padding: "11px 24px",
              cursor: "pointer",
            }}
          >
            Get access — $379
          </button>
        </form>
      )}
    </div>
  );
}
