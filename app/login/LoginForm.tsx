"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app/wizard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send code");
      router.push(`/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0f0e0c", color: "#f5f1ea", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', -apple-system, sans-serif", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <Link href="/" style={{ display: "block", marginBottom: "40px", textAlign: "center", color: "#D4A878", textDecoration: "none", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ← The Path
        </Link>
        <div style={{ background: "#1a1917", borderRadius: "20px", padding: "40px", border: "1px solid #2a2926" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.02em" }}>Sign in</h1>
          <p style={{ color: "#888", marginBottom: "32px", lineHeight: 1.5 }}>We'll send a verification code to your email. No password needed.</p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#aaa" }}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus
                style={{ width: "100%", padding: "14px 16px", background: "#0f0e0c", border: "1px solid #2a2926", borderRadius: "10px", color: "#f5f1ea", fontSize: "15px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            {error && <div style={{ background: "#3a1a1a", border: "1px solid #5a2a2a", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#ff8a8a" }}>{error}</div>}
            <button type="submit" disabled={loading || !email}
              style={{ width: "100%", padding: "16px", background: loading ? "#555" : "#D4A878", color: "#0f0e0c", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "15px", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Sending code…" : "Send verification code →"}
            </button>
          </form>
          <p style={{ fontSize: "12px", color: "#555", textAlign: "center", marginTop: "24px", lineHeight: 1.5 }}>
            By signing in, you agree to our <a href="#" style={{ color: "#888" }}>Terms</a> and <a href="#" style={{ color: "#888" }}>Privacy Policy</a>.
          </p>
        </div>
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#555" }}>
          Don't have an account?{" "}
          <Link href="/pricing" style={{ color: "#D4A878", textDecoration: "none", fontWeight: 600 }}>Get access →</Link>
        </p>
      </div>
    </main>
  );
}
