import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";

function s(theme: ThemeConfig) {
  return {
    page: { background: theme.colors.canvas, color: theme.colors.text, fontFamily: theme.fonts.bodyFamily } as React.CSSProperties,
    displayFont: { fontFamily: theme.fonts.displayFamily } as React.CSSProperties,
    accent: { color: theme.colors.accent } as React.CSSProperties,
    highlight: { color: theme.colors.highlight } as React.CSSProperties,
    accentBg: { background: theme.colors.accent, color: "#fff" } as React.CSSProperties,
    darkBg: { background: theme.colors.dark, color: "#fff" } as React.CSSProperties,
  };
}

export default async function CheckoutPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const styles = s(theme);
  const upsellHref = `/themes/${themeSlug}/upsell`;

  const presets =
    theme.event.priceMax === 88
      ? [22, 44, 66, 88]
      : theme.event.priceMax === 66
      ? [0, 22, 44, 66]
      : [0, 27, 47, 97];

  return (
    <main style={styles.page}>
      {/* HEADER */}
      <header
        style={{
          ...styles.darkBg,
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href={`/themes/${themeSlug}`} style={{ textDecoration: "none", color: "#fff", fontWeight: 700, fontFamily: theme.fonts.displayFamily }}>
          {theme.host.name}
        </Link>
        <div style={{ display: "flex", gap: "24px", fontSize: "13px", opacity: 0.6 }}>
          <span>🔒 Secure</span>
          <span>✓ Instant confirmation</span>
          <span>✓ Recording included</span>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "48px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "48px",
          alignItems: "start",
        }}
      >
        {/* LEFT — FORM */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.colors.accent, marginBottom: "8px" }}>
            Step 1 of 3 — Registration
          </p>
          <h1 style={{ ...styles.displayFont, fontSize: "2rem", fontWeight: 700, marginBottom: "8px" }}>
            Reserve your seat
          </h1>
          <p style={{ opacity: 0.65, marginBottom: "40px" }}>
            {theme.event.name} · {theme.event.date} · {theme.event.time} {theme.event.timezone}
          </p>

          {/* Price selector */}
          <div
            style={{
              background: "#fff",
              border: `1px solid ${theme.colors.accent}30`,
              borderRadius: "16px",
              padding: "28px",
              marginBottom: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Choose your contribution</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
              {presets.map((amount) => (
                <button
                  key={amount}
                  style={{
                    padding: "14px 8px",
                    border: amount === presets[2] ? `2px solid ${theme.colors.accent}` : "2px solid #e0e0e0",
                    borderRadius: "10px",
                    background: amount === presets[2] ? `${theme.colors.accent}10` : "#fff",
                    cursor: "pointer",
                    fontWeight: amount === presets[2] ? 700 : 500,
                    fontSize: "15px",
                    color: amount === presets[2] ? theme.colors.accent : theme.colors.text,
                  }}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <p style={{ fontSize: "12px", opacity: 0.55 }}>
              Pay what feels right. ${presets[2]} is the suggested contribution. All amounts receive identical access.
            </p>
          </div>

          {/* Customer info */}
          <div
            style={{
              background: "#fff",
              border: `1px solid ${theme.colors.accent}30`,
              borderRadius: "16px",
              padding: "28px",
              marginBottom: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Your details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              {["First name", "Last name"].map((label) => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>{label}</label>
                  <input
                    type="text"
                    placeholder={label}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Payment */}
          <div
            style={{
              background: "#fff",
              border: `1px solid ${theme.colors.accent}30`,
              borderRadius: "16px",
              padding: "28px",
              marginBottom: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Payment</h2>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {["Card", "PayPal"].map((method) => (
                <button
                  key={method}
                  style={{
                    padding: "10px 20px",
                    border: method === "Card" ? `2px solid ${theme.colors.accent}` : "2px solid #e0e0e0",
                    borderRadius: "8px",
                    background: method === "Card" ? `${theme.colors.accent}10` : "#fff",
                    cursor: "pointer",
                    fontWeight: method === "Card" ? 700 : 500,
                    fontSize: "13px",
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <input
                type="text"
                placeholder="Card number"
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input type="text" placeholder="MM / YY" style={{ padding: "12px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none" }} />
                <input type="text" placeholder="CVC" style={{ padding: "12px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none" }} />
              </div>
              <input type="text" placeholder="Name on card" style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none" }} />
            </div>
          </div>

          <Link
            href={upsellHref}
            style={{
              display: "block",
              background: theme.colors.accent,
              color: "#fff",
              padding: "18px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "16px",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            Complete registration →
          </Link>
          <p style={{ fontSize: "12px", textAlign: "center", opacity: 0.5 }}>
            🔒 Your payment is secured with 256-bit SSL encryption
          </p>
        </div>

        {/* RIGHT — SUMMARY */}
        <div>
          <div
            style={{
              ...styles.darkBg,
              borderRadius: "16px",
              padding: "28px",
              position: "sticky",
              top: "110px",
            }}
          >
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.colors.highlight, marginBottom: "16px" }}>
              Your registration
            </p>
            <h2 style={{ ...styles.displayFont, fontSize: "1.3rem", fontWeight: 700, marginBottom: "8px" }}>
              {theme.event.name}
            </h2>
            <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "24px" }}>with {theme.host.name}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              {[
                { label: "Date", value: theme.event.date },
                { label: "Time", value: `${theme.event.time} ${theme.event.timezone}` },
                { label: "Duration", value: theme.event.duration },
                { label: "Format", value: "Live online via " + theme.event.platform },
              ].map((d) => (
                <div key={d.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ opacity: 0.55 }}>{d.label}</span>
                  <span style={{ fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "24px" }}>
              <p style={{ fontWeight: 700, marginBottom: "10px", color: theme.colors.highlight }}>What's included:</p>
              {["Live ceremony attendance", "Full event recording", "Integration guide", "Q&A access"].map((item) => (
                <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ color: theme.colors.highlight }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "16px", fontSize: "13px" }}>
              <p style={{ margin: 0, opacity: 0.7, lineHeight: 1.5 }}>
                A recording of this event will be available to all registered participants within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ ...styles.darkBg, padding: "24px 40px", textAlign: "center", fontSize: "12px", opacity: 0.4 }}>
        © {new Date().getFullYear()} {theme.host.legalEntity} · Results vary · This is a demo template
      </footer>
    </main>
  );
}
