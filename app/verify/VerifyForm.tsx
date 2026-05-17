"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
      router.push(data.hasPaid ? next : "/pricing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function resendCode() {
    setResending(true);
    try {
      await fetch("/api/auth/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } finally { setResending(false); }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0f0e0c", color: "#f5f1ea", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', -apple-system, sans-serif", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <Link href="/" style={{ display: "block", marginBottom: "40px", textAlign: "center", color: "#D4A878", textDecoration: "none", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ← The Path
        </Link>
        <div style={{ background: "#1a1917", borderRadius: "20px", padding: "40px", border: "1px solid #2a2926" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.02em" }}>Check your email</h1>
          <p style={{ color: "#888", marginBottom: "32px", lineHeight: 1.5 }}>
            We sent a 6-digit code to <span style={{ color: "#f5f1ea", fontWeight: 600 }}>{email}</span>. It expires in 15 minutes.
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }} onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input key={i} ref={(el) => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleDigit(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} disabled={loading}
                style={{ width: "48px", height: "60px", textAlign: "center", fontSize: "24px", fontWeight: 700, background: "#0f0e0c", border: digit ? "2px solid #D4A878" : "1px solid #2a2926", borderRadius: "10px", color: "#f5f1ea", outline: "none" }}
              />
            ))}
          </div>
          {error && <div style={{ background: "#3a1a1a", border: "1px solid #5a2a2a", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#ff8a8a" }}>{error}</div>}
          {loading && <div style={{ textAlign: "center", color: "#888", fontSize: "13px", marginBottom: "16px" }}>Verifying…</div>}
          <div style={{ textAlign: "center", fontSize: "13px", color: "#555" }}>
            Didn't receive it?{" "}
            <button onClick={resendCode} disabled={resending} style={{ background: "none", border: "none", color: resent ? "#4ade80" : "#D4A878", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
              {resent ? "Sent!" : resending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#555" }}>
          Wrong email? <Link href="/login" style={{ color: "#D4A878", textDecoration: "none", fontWeight: 600 }}>Go back</Link>
        </p>
      </div>
    </main>
  );
}
