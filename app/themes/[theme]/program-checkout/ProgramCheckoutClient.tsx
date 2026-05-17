"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ThemeConfig } from "@/lib/themes";

export default function ProgramCheckoutClient({ theme }: { theme: ThemeConfig }) {
  const [selectedPlan, setSelectedPlan] = useState<"full" | "plan">("full");
  const router = useRouter();

  const plans = [
    { id: "full" as const, label: "Full Investment", badge: "Best value", amount: `$${theme.program.price.toLocaleString()}`, sub: "One payment · Instant access", note: "Includes all bonuses" },
    { id: "plan" as const, label: "Payment Plan", badge: null, amount: theme.program.paymentPlan, sub: "Spread over 3 months", note: "First payment charged today" },
  ];
  const selected = plans.find((p) => p.id === selectedPlan)!;

  const styles = {
    page: { background: theme.colors.canvas, color: theme.colors.text, fontFamily: theme.fonts.bodyFamily } as React.CSSProperties,
    displayFont: { fontFamily: theme.fonts.displayFamily } as React.CSSProperties,
    darkBg: { background: theme.colors.dark, color: "#fff" } as React.CSSProperties,
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" };

  return (
    <main style={styles.page}>
      <header style={{ ...styles.darkBg, padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href={`/themes/${theme.slug}/program`} style={{ textDecoration: "none", color: "#fff", fontWeight: 700, fontFamily: theme.fonts.displayFamily }}>
          ← {theme.host.name}
        </Link>
        <div style={{ display: "flex", gap: "24px", fontSize: "13px", opacity: 0.6 }}>
          <span>🔒 Secure checkout</span>
          <span>✓ {theme.program.duration} programme</span>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 40px", display: "grid", gridTemplateColumns: "1fr 380px", gap: "48px", alignItems: "start" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.colors.accent, marginBottom: "8px" }}>Enrolment</p>
          <h1 style={{ ...styles.displayFont, fontSize: "2rem", fontWeight: 700, marginBottom: "8px" }}>{theme.program.name}</h1>
          <p style={{ opacity: 0.65, marginBottom: "40px" }}>with {theme.host.name} · {theme.program.duration}</p>

          {/* Plan selector */}
          <div style={{ background: "#fff", border: `1px solid ${theme.colors.accent}30`, borderRadius: "16px", padding: "28px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Choose your payment option</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {plans.map((plan) => (
                <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                  style={{ padding: "20px", border: selectedPlan === plan.id ? `2px solid ${theme.colors.accent}` : "2px solid #e0e0e0", borderRadius: "12px", background: selectedPlan === plan.id ? `${theme.colors.accent}08` : "#fff", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${selectedPlan === plan.id ? theme.colors.accent : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {selectedPlan === plan.id && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: theme.colors.accent }} />}
                      </div>
                      <span style={{ fontWeight: 700 }}>{plan.label}</span>
                      {plan.badge && <span style={{ background: theme.colors.highlight, color: theme.colors.dark, padding: "2px 8px", borderRadius: "100px", fontSize: "11px", fontWeight: 700 }}>{plan.badge}</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", opacity: 0.6, paddingLeft: "28px" }}>{plan.note}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: "1.2rem", color: theme.colors.accent, fontFamily: theme.fonts.displayFamily }}>{plan.amount}</div>
                    <div style={{ fontSize: "12px", opacity: 0.5 }}>{plan.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Customer info */}
          <div style={{ background: "#fff", border: `1px solid ${theme.colors.accent}30`, borderRadius: "16px", padding: "28px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Your details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>First name</label><input type="text" placeholder="First name" style={inputStyle} /></div>
              <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Last name</label><input type="text" placeholder="Last name" style={inputStyle} /></div>
            </div>
            <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Email</label><input type="email" placeholder="you@example.com" style={inputStyle} /></div>
          </div>

          {/* Payment */}
          <div style={{ background: "#fff", border: `1px solid ${theme.colors.accent}30`, borderRadius: "16px", padding: "28px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Payment</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              <input type="text" placeholder="Card number" style={inputStyle} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input type="text" placeholder="MM / YY" style={inputStyle} />
                <input type="text" placeholder="CVC" style={inputStyle} />
              </div>
            </div>
          </div>

          <button onClick={() => router.push(`/themes/${theme.slug}/program-thank-you`)}
            style={{ display: "block", width: "100%", background: theme.colors.accent, color: "#fff", padding: "18px", borderRadius: "12px", border: "none", fontWeight: 700, fontSize: "16px", cursor: "pointer", marginBottom: "12px" }}>
            Complete enrolment — {selected.amount} →
          </button>
          <p style={{ fontSize: "12px", textAlign: "center", opacity: 0.5 }}>🔒 Secured with 256-bit SSL encryption</p>
        </div>

        {/* Right col */}
        <div>
          <div style={{ ...styles.darkBg, borderRadius: "16px", padding: "28px", position: "sticky", top: "110px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.colors.highlight, marginBottom: "16px" }}>Your enrolment</p>
            <h2 style={{ ...styles.displayFont, fontSize: "1.3rem", fontWeight: 700, marginBottom: "6px" }}>{theme.program.name}</h2>
            <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "24px" }}>with {theme.host.name} · {theme.program.duration}</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)", fontSize: "14px" }}>
              <span style={{ opacity: 0.65 }}>Selected plan</span>
              <span style={{ fontWeight: 700, color: theme.colors.highlight }}>{selected.amount}</span>
            </div>
            <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "24px" }}>
              <p style={{ fontWeight: 700, marginBottom: "10px", color: theme.colors.highlight }}>Included:</p>
              {["Live weekly sessions", "All recordings", "Community access", "Bonuses", "Guarantee"].map((item) => (
                <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ color: theme.colors.highlight }}>✓</span><span>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "16px", fontSize: "12px", lineHeight: 1.5, opacity: 0.7 }}>
              <strong>Guarantee:</strong> Complete the first sessions. If you don't feel the programme is right for you, receive a full refund.
            </div>
          </div>
        </div>
      </div>

      <footer style={{ ...styles.darkBg, padding: "24px 40px", textAlign: "center", fontSize: "12px", opacity: 0.4 }}>
        © {new Date().getFullYear()} {theme.host.legalEntity}
      </footer>
    </main>
  );
}
