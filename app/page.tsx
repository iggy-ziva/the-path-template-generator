"use client";

import Link from "next/link";
import { THEME_LIST } from "@/lib/themes";

const metadata = {
  title: "The Path Template Generator — AI-Powered Funnel Templates",
};

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0e0c",
        color: "#f5f1ea",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "40px 40px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#888",
          }}
        >
          The Path
        </span>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link
            href="/login"
            style={{
              color: "#f5f1ea",
              textDecoration: "none",
              fontSize: "14px",
              opacity: 0.7,
            }}
          >
            Sign in
          </Link>
          <Link
            href="/pricing"
            style={{
              background: "#f5f1ea",
              color: "#0f0e0c",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 700,
              padding: "10px 20px",
              borderRadius: "100px",
            }}
          >
            Get access — $379
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "100px 40px 80px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#D4A878",
            marginBottom: "24px",
          }}
        >
          AI-Powered Funnel Templates
        </p>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: "24px",
            letterSpacing: "-0.02em",
          }}
        >
          Your entire funnel.<br />Written by AI.<br />Built around your voice.
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#aaa",
            maxWidth: "520px",
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          Browse six distinct facilitation styles below. When you find the one that resonates, get access and let AI write your complete event funnel — all eight pages — in minutes.
        </p>
        <Link
          href="/pricing"
          style={{
            display: "inline-block",
            background: "#D4A878",
            color: "#0f0e0c",
            textDecoration: "none",
            fontSize: "15px",
            fontWeight: 700,
            padding: "16px 36px",
            borderRadius: "100px",
            letterSpacing: "0.02em",
          }}
        >
          Get instant access — $379
        </Link>
      </section>

      {/* What's included */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto 80px",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
        }}
      >
        {[
          { n: "8", label: "Funnel pages generated", sub: "Landing · Checkout · Upsell · Thank-you · Replay · Program · Program checkout · Program thank-you" },
          { n: "AI", label: "Tone-matched copy", sub: "Claude analyses your existing materials and writes in your voice — not a generic template" },
          { n: "∞", label: "Regenerate anytime", sub: "Update your inputs and re-run the AI as your event evolves" },
        ].map((item) => (
          <div
            key={item.n}
            style={{
              background: "#1a1917",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid #2a2926",
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "#D4A878",
                marginBottom: "8px",
              }}
            >
              {item.n}
            </div>
            <div style={{ fontWeight: 600, marginBottom: "8px" }}>{item.label}</div>
            <div style={{ fontSize: "13px", color: "#888", lineHeight: 1.5 }}>{item.sub}</div>
          </div>
        ))}
      </section>

      {/* Theme showcase */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px 120px" }}>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#888",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Choose a vibe to explore
        </p>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "48px",
            letterSpacing: "-0.01em",
          }}
        >
          Six facilitator styles. Full funnel previews.
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {THEME_LIST.map((theme) => (
            <Link
              key={theme.slug}
              href={`/themes/${theme.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: theme.colors.canvas,
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.05)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                {/* Color band */}
                <div
                  style={{
                    height: "6px",
                    background: `linear-gradient(90deg, ${theme.colors.accent}, ${theme.colors.highlight})`,
                  }}
                />
                <div style={{ padding: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: theme.colors.accent,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: theme.colors.accent,
                          fontFamily: theme.fonts.bodyFamily,
                        }}
                      >
                        {theme.label} · {theme.descriptor}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: theme.colors.text,
                          fontFamily: theme.fonts.displayFamily,
                        }}
                      >
                        {theme.host.name}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: theme.colors.text,
                      fontFamily: theme.fonts.displayFamily,
                      lineHeight: 1.3,
                      marginBottom: "12px",
                    }}
                  >
                    {theme.event.name}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: theme.colors.text,
                      opacity: 0.6,
                      fontFamily: theme.fonts.bodyFamily,
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    {theme.event.tagline}
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: theme.colors.accent,
                      color: "#fff",
                      padding: "8px 16px",
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: 700,
                      fontFamily: theme.fonts.bodyFamily,
                    }}
                  >
                    Explore this style →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          background: "#1a1917",
          borderTop: "1px solid #2a2926",
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}
        >
          Ready to build your funnel?
        </h2>
        <p style={{ color: "#888", marginBottom: "36px", fontSize: "1.1rem" }}>
          One-time payment. AI-generated copy. Eight pages ready to launch.
        </p>
        <Link
          href="/pricing"
          style={{
            display: "inline-block",
            background: "#D4A878",
            color: "#0f0e0c",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: 700,
            padding: "18px 40px",
            borderRadius: "100px",
          }}
        >
          Get access — $379
        </Link>
        <div style={{ marginTop: "16px", fontSize: "13px", color: "#666" }}>
          Secure checkout via Stripe · Instant access
        </div>
      </section>

      <footer
        style={{
          padding: "32px 40px",
          textAlign: "center",
          fontSize: "13px",
          color: "#555",
          borderTop: "1px solid #1a1917",
        }}
      >
        © {new Date().getFullYear()} The Path Template Generator · All rights reserved
      </footer>
    </main>
  );
}
