"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
};

export default function VerifyForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const next = searchParams.get("next") ?? "/app/wizard";

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next_ = [...code];
    next_[index] = digit;
    setCode(next_);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (next_.every((d) => d !== "") && digit) submitCode(next_.join(""));
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) { setCode(text.split("")); submitCode(text); }
  }

  async function submitCode(codeStr: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeStr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code");
      router.push(data.hasPaid ? next : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function resendCode() {
    setResending(true);
    try {
      await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } finally {
      setResending(false);
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
        position: "absolute", top: "-15%", left: "-10%",
        width: "60vw", height: "60vw", maxWidth: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,83,12,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "block",
            marginBottom: 40,
            textAlign: "center",
            fontFamily: Z.fontBody,
            color: Z.muted,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          ← The Path
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
            Check your email
          </h1>
          <p style={{ fontFamily: Z.fontBody, color: Z.muted, marginBottom: 32, lineHeight: 1.6, fontSize: 14 }}>
            We sent a 6-digit code to{" "}
            <span style={{ color: Z.charcoal, fontWeight: 700 }}>{email}</span>.
            It expires in 15 minutes.
          </p>

          {/* Code inputs */}
          <div
            style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}
            onPaste={handlePaste}
          >
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                style={{
                  width: 48,
                  height: 60,
                  textAlign: "center",
                  fontFamily: Z.fontBody,
                  fontSize: 24,
                  fontWeight: 700,
                  background: digit ? Z.creamMid : Z.cream,
                  border: digit
                    ? `2px solid ${Z.pink}`
                    : `1px solid ${Z.creamDeep}`,
                  borderRadius: 10,
                  color: Z.charcoal,
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
              />
            ))}
          </div>

          {error && (
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
              }}
            >
              {error}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", fontFamily: Z.fontBody, color: Z.muted, fontSize: 13, marginBottom: 16 }}>
              Verifying…
            </div>
          )}

          <div style={{ textAlign: "center", fontFamily: Z.fontBody, fontSize: 13, color: Z.faint }}>
            Didn&rsquo;t receive it?{" "}
            <button
              onClick={resendCode}
              disabled={resending}
              style={{
                background: "none",
                border: "none",
                color: resent ? "#22c55e" : Z.pink,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: Z.fontBody,
                padding: 0,
              }}
            >
              {resent ? "Sent!" : resending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontFamily: Z.fontBody, fontSize: 14, color: Z.muted }}>
          Wrong email?{" "}
          <Link href="/login" style={{ color: Z.pink, textDecoration: "none", fontWeight: 700 }}>
            Go back
          </Link>
        </p>
      </div>
    </main>
  );
}
