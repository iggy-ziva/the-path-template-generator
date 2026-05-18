"use client";

import Image from "next/image";
import Link from "next/link";
import { THEME_LIST } from "@/lib/themes";
import AnimatedBlobs from "@/components/AnimatedBlobs";
import AuthHeaderActions from "@/components/AuthHeaderActions";

// ─── Ziva brand tokens ────────────────────────────────────────────────────────
const Z = {
  cream:       "#FCFAF6",
  creamMid:    "#FCF8EF",
  creamDeep:   "#F5EEE0",
  charcoal:    "#2E2E2E",
  muted:       "#8A7A6A",
  faint:       "#C8B8A4",
  pink:        "#FF007E",
  coral:       "#FA2A45",
  orange:      "#F5530C",
  amber:       "#FFA620",
  purple:      "#8C369F",
  teal:        "#7CDCE9",
  white:       "#FFFFFF",
  fontDisplay: '"kudryashev-d-contrast", serif',
  fontBody:    'var(--font-barlow), -apple-system, sans-serif',
  fontAccent:  'var(--font-caveat), cursive',
};

const gradientBtn: React.CSSProperties = {
  background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 55%, #FD1562 100%)`,
  boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
  color: Z.white,
  border: "none",
  cursor: "pointer",
};

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: Z.cream,
        color: Z.charcoal,
        fontFamily: Z.fontBody,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Ambient gradient blobs (brand running gradient at ~12% opacity) ── */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-10%", left: "-5%",
          width: "60vw", height: "60vw", maxWidth: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(250,42,69,0.10) 0%, transparent 70%)`,
        }} />
        <div style={{
          position: "absolute", top: "5%", right: "-8%",
          width: "50vw", height: "50vw", maxWidth: 680,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,0,126,0.08) 0%, transparent 70%)`,
        }} />
        <div style={{
          position: "absolute", top: "45%", left: "30%",
          width: "70vw", height: "40vw", maxWidth: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(245,83,12,0.07) 0%, transparent 70%)`,
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "-5%",
          width: "45vw", height: "45vw", maxWidth: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(140,54,159,0.07) 0%, transparent 70%)`,
        }} />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "relative", zIndex: 10,
          padding: "28px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Image
            src="/ziva-marketing-logo.png"
            alt="Ziva Marketing"
            width={120}
            height={44}
            style={{ objectFit: "contain", objectPosition: "left" }}
            priority
          />
        </div>

        {/* Nav */}
        <AuthHeaderActions variant="dark" />
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 1,
          textAlign: "center",
          padding: "80px 40px 72px",
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        {/* H1 — product name */}
        <h1
          style={{
            fontFamily: Z.fontDisplay,
            fontSize: "clamp(3.6rem, 9vw, 7rem)",
            fontWeight: 400,
            lineHeight: 1.0,
            letterSpacing: "0.04em",
            color: Z.charcoal,
            marginBottom: 20,
          }}
        >
          The Path<span style={{ color: Z.pink }}>™</span>
        </h1>

        {/* H2 — AI system description */}
        <h2
          style={{
            fontFamily: Z.fontBody,
            fontSize: "clamp(1.15rem, 2.4vw, 1.5rem)",
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
            color: Z.charcoal,
            maxWidth: 620,
            margin: "0 auto 32px",
            textWrap: "balance",
          } as React.CSSProperties}
        >
          Ziva&rsquo;s proprietary funnel launch system — now powered by AI.
          <br />
          <span style={{ display: "inline-block", marginTop: 10 }} className="ziva-gradient-text">
            Build your complete eight-page event funnel in minutes, written entirely in your voice.
          </span>
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontFamily: Z.fontBody,
            fontSize: "1.1rem",
            color: Z.muted,
            maxWidth: 540,
            margin: "0 auto 44px",
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          Browse six facilitation styles below and find the one that fits your voice.
          Once you have access, a guided wizard walks you through everything the AI needs —
          your style, your event, your audience. What used to take weeks of design and copywriting
          is done in days, at your own pace. Your progress is always saved.
        </p>

        {/* Primary CTA */}
        <form action="/api/stripe/create-session" method="POST" style={{ display: "inline" }}>
          <button
            type="submit"
            className="ziva-gradient-btn"
            style={{
              ...gradientBtn,
              fontFamily: Z.fontBody,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.03em",
              padding: "18px 44px",
              borderRadius: 14,
            }}
          >
            Get Instant Access — $379
          </button>
        </form>
      </section>

      {/* ── What's included ────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 1,
          maxWidth: 960,
          margin: "0 auto 80px",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        {[
          {
            n: "8",
            label: "Funnel pages generated",
            sub: "Landing · Checkout · Upsell · Thank-you · Replay · Program · Program checkout · Program thank-you",
          },
          {
            n: "AI",
            label: "Tone-matched copy",
            sub: "Claude analyses your existing materials and writes in your voice — not a generic template",
          },
          {
            n: "∞",
            label: "Regenerate anytime",
            sub: "Update your inputs and re-run the AI as your event evolves",
          },
        ].map((item) => (
          <div
            key={item.n}
            style={{
              background: Z.white,
              borderRadius: 18,
              padding: "32px 28px",
              border: `1px solid ${Z.creamDeep}`,
              boxShadow: "0 2px 16px rgba(245,83,12,0.06), 0 1px 4px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top accent line */}
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${Z.pink}, ${Z.coral}, ${Z.orange})`,
                borderRadius: "18px 18px 0 0",
              }}
            />
            <div
              className="ziva-gradient-text"
              style={{
                fontFamily: Z.fontDisplay,
                fontSize: "2.4rem",
                fontWeight: 400,
                letterSpacing: "0.02em",
                marginBottom: 10,
                display: "inline-block",
              }}
            >
              {item.n}
            </div>
            <div
              style={{
                fontFamily: Z.fontBody,
                fontWeight: 700,
                fontSize: 16,
                color: Z.charcoal,
                marginBottom: 10,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontFamily: Z.fontBody,
                fontSize: 13,
                color: Z.muted,
                lineHeight: 1.6,
              }}
            >
              {item.sub}
            </div>
          </div>
        ))}
      </section>

      {/* ── Theme showcase ─────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px 120px",
        }}
      >
        {/* Section header */}
        <p
          style={{
            fontFamily: Z.fontAccent,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: Z.faint,
            marginBottom: 14,
            textAlign: "center",
          }}
        >
          Choose a vibe to explore
        </p>
        <h2
          style={{
            fontFamily: Z.fontDisplay,
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: Z.charcoal,
            textAlign: "center",
            marginBottom: 52,
            lineHeight: 1.2,
          }}
        >
          Six facilitator styles. Full funnel previews.
        </h2>

        {/* Cards grid — funnel theme colors are preserved untouched */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
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
                  background: theme.colors.surfaceCanvas,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 48px rgba(0,0,0,0.14)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                }}
              >
                <div
                  style={{
                    height: 6,
                    background: `linear-gradient(90deg, ${theme.colors.accentPrimary}, ${theme.colors.accentHighlight})`,
                  }}
                />
                <div style={{ padding: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: theme.colors.accentPrimary,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: theme.colors.accentPrimary,
                          fontFamily: theme.fonts.bodyFamily,
                        }}
                      >
                        {theme.label} · {theme.descriptor}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: theme.colors.textPrimary,
                          fontFamily: theme.fonts.displayFamily,
                        }}
                      >
                        {theme.host.name}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: theme.colors.textPrimary,
                      fontFamily: theme.fonts.displayFamily,
                      lineHeight: 1.3,
                      marginBottom: 12,
                    }}
                  >
                    {theme.event.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: theme.colors.textPrimary,
                      opacity: 0.6,
                      fontFamily: theme.fonts.bodyFamily,
                      lineHeight: 1.5,
                      marginBottom: 20,
                    }}
                  >
                    {theme.event.tagline}
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: theme.colors.accentPrimary,
                      color: "#fff",
                      padding: "8px 16px",
                      borderRadius: 100,
                      fontSize: 12,
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

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "96px 40px",
          textAlign: "center",
          background: Z.charcoal,
        }}
      >
        <AnimatedBlobs />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontFamily: Z.fontDisplay,
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: Z.white,
              marginBottom: 18,
              lineHeight: 1.15,
            }}
          >
            Ready to build your funnel?
          </h2>
          <p
            style={{
              fontFamily: Z.fontBody,
              color: Z.faint,
              marginBottom: 44,
              fontSize: "1.05rem",
              lineHeight: 1.6,
              maxWidth: 460,
              margin: "0 auto 44px",
            }}
          >
            One-time payment. AI-generated copy. Eight pages ready to launch.
          </p>
          <form action="/api/stripe/create-session" method="POST" style={{ display: "inline" }}>
            <button
              type="submit"
              className="ziva-gradient-btn"
              style={{
                ...gradientBtn,
                fontFamily: Z.fontBody,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.03em",
                padding: "20px 52px",
                borderRadius: 14,
              }}
            >
              Get Access — $379
            </button>
          </form>
          <div
            style={{
              marginTop: 18,
              fontFamily: Z.fontBody,
              fontSize: 13,
              color: Z.faint,
              opacity: 0.7,
            }}
          >
            Secure checkout via Stripe · Instant access
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        style={{
          position: "relative", zIndex: 1,
          background: Z.charcoal,
          borderTop: `1px solid rgba(255,255,255,0.06)`,
          padding: "28px 40px",
          textAlign: "center",
          fontFamily: Z.fontBody,
          fontSize: 13,
          color: Z.muted,
        }}
      >
        <span style={{ color: Z.faint, opacity: 0.7 }}>
          © {new Date().getFullYear()}{" "}
          <span style={{ color: Z.pink, opacity: 1 }}>Ziva Marketing</span>
          {" "}· The Path Template Generator · All rights reserved
        </span>
      </footer>
    </main>
  );
}
