"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const Z = {
  cream:      "#FCFAF6",
  creamMid:   "#FCF8EF",
  creamDeep:  "#F5EEE0",
  charcoal:   "#2E2E2E",
  muted:      "#8A7A6A",
  faint:      "#C8B8A4",
  pink:       "#FF007E",
  coral:      "#FA2A45",
  white:      "#FFFFFF",
  fontDisplay:'"kudryashev-d-contrast", serif',
  fontBody:   'var(--font-barlow), -apple-system, sans-serif',
  fontAccent: 'var(--font-caveat), cursive',
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ type: "no_purchase" | "general"; message: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app/wizard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "no_purchase") {
          setError({ type: "no_purchase", message: data.message });
        } else {
          setError({ type: "general", message: data.error ?? "Failed to send code" });
        }
        return;
      }
      router.push(`/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
    } catch {
      setError({ type: "general", message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: Z.cream,
        color: Z.charcoal,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: Z.fontBody,
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient blob */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "-15%", right: "-10%",
        width: "60vw", height: "60vw", maxWidth: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,0,126,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

        {/* Logo back-link */}
        <Link
          href="/"
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <Image
            src="/ziva-marketing-logo.png"
            alt="Ziva Marketing"
            width={120}
            height={40}
            style={{ width: 120, height: "auto" }}
          />
        </Link>

        {/* Card */}
        <div
          style={{
            background: Z.white,
            borderRadius: 20,
            padding: "40px 36px",
            border: `1px solid ${Z.creamDeep}`,
            boxShadow: "0 4px 32px rgba(245,83,12,0.07), 0 1px 6px rgba(0,0,0,0.04)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top accent */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${Z.pink}, ${Z.coral})`,
            borderRadius: "20px 20px 0 0",
          }} />

          <h1
            style={{
              fontFamily: Z.fontDisplay,
              fontSize: "2rem",
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: Z.charcoal,
              marginBottom: 8,
            }}
          >
            Sign in
          </h1>
          <p style={{ fontFamily: Z.fontBody, color: Z.muted, marginBottom: 32, lineHeight: 1.6, fontSize: 14 }}>
            We&rsquo;ll send a 6-digit code to your email. No password needed.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: Z.fontBody,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                  color: Z.muted,
                }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: Z.creamMid,
                  border: `1px solid ${Z.creamDeep}`,
                  borderRadius: 10,
                  color: Z.charcoal,
                  fontFamily: Z.fontBody,
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* General error */}
            {error?.type === "general" && (
              <div
                style={{
                  background: "#FFF0F3",
                  border: `1px solid rgba(250,42,69,0.2)`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 16,
                  fontFamily: Z.fontBody,
                  fontSize: 13,
                  color: Z.coral,
                  lineHeight: 1.5,
                }}
              >
                {error.message}
              </div>
            )}

            {/* No purchase error */}
            {error?.type === "no_purchase" && (
              <div
                style={{
                  background: "#FFF0F3",
                  border: `1px solid rgba(250,42,69,0.2)`,
                  borderRadius: 12,
                  padding: "20px",
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    fontFamily: Z.fontBody,
                    fontSize: 14,
                    color: Z.charcoal,
                    marginBottom: 14,
                    lineHeight: 1.6,
                  }}
                >
                  No purchase found for <strong>{email}</strong>.<br />
                  Get access to The Path to continue.
                </p>
                <form action="/api/stripe/create-session" method="POST">
                  <input type="hidden" name="email" value={email} />
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 55%, #FD1562 100%)`,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      color: Z.white,
                      border: "none",
                      borderRadius: 10,
                      fontFamily: Z.fontBody,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Get access — $379 →
                  </button>
                </form>
              </div>
            )}

            {!error?.type || error.type === "general" ? (
              <button
                type="submit"
                disabled={loading || !email}
                style={{
                  width: "100%",
                  padding: 16,
                  background: loading || !email
                    ? Z.faint
                    : `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 55%, #FD1562 100%)`,
                  boxShadow: loading || !email ? "none" : "0 4px 16px rgba(0,0,0,0.15)",
                  color: Z.white,
                  border: "none",
                  borderRadius: 10,
                  fontFamily: Z.fontBody,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading || !email ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? "Sending code…" : "Send verification code →"}
              </button>
            ) : null}
          </form>

          <p
            style={{
              fontFamily: Z.fontBody,
              fontSize: 12,
              color: Z.faint,
              textAlign: "center",
              marginTop: 24,
              lineHeight: 1.5,
            }}
          >
            By signing in you agree to our{" "}
            <a href="#" style={{ color: Z.muted }}>Terms</a> and{" "}
            <a href="#" style={{ color: Z.muted }}>Privacy Policy</a>.
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontFamily: Z.fontBody, fontSize: 14, color: Z.muted }}>
          Don&rsquo;t have access yet?{" "}
          <Link href="/pricing" style={{ color: Z.pink, textDecoration: "none", fontWeight: 700 }}>
            Get The Path →
          </Link>
        </p>
      </div>
    </main>
  );
}
