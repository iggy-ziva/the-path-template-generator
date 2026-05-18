import Link from "next/link";
import { getSession } from "@/lib/session";
import AuthHeaderActions from "@/components/AuthHeaderActions";

export const metadata = {
  title: "Get Access — The Path by Ziva Marketing",
};

// ─── Ziva brand tokens (mirrored from landing page) ───────────────────────────
const Z = {
  cream:      "#FCFAF6",
  creamMid:   "#FCF8EF",
  creamDeep:  "#F5EEE0",
  charcoal:   "#2E2E2E",
  muted:      "#8A7A6A",
  faint:      "#C8B8A4",
  pink:       "#FF007E",
  coral:      "#FA2A45",
  orange:     "#F5530C",
  white:      "#FFFFFF",
  fontDisplay:'"kudryashev-d-contrast", serif',
  fontBody:   'var(--font-barlow), -apple-system, sans-serif',
  fontAccent: 'var(--font-caveat), cursive',
};

const FEATURES = [
  "Figma template files — download and customise immediately",
  "10-step AI wizard, saved at every step",
  "Upload your existing copy, bio and brand materials",
  "AI tone analysis matched to your voice",
  "All 6 visual theme styles included",
  "8 fully-written funnel pages generated",
  "Download production-ready HTML, CSS & JS for every page",
  "Regenerate any page or section at any time",
  "Email support throughout",
];

const STEPS = [
  {
    n: "1",
    title: "Get instant access",
    desc: "After checkout you'll receive a magic link to sign in — no password needed. Your account is permanently linked to your purchase.",
  },
  {
    n: "2",
    title: "Download your Figma templates",
    desc: "All six theme styles are available immediately as Figma files. Hand them to your designer or customise them yourself as a starting point.",
  },
  {
    n: "3",
    title: "Complete the AI wizard at your own pace",
    desc: "A guided 10-step wizard walks you through your event details, audience, programme, and brand voice. Upload existing materials so the AI can match your style. Your progress is saved after every step — come back anytime.",
  },
  {
    n: "4",
    title: "AI writes your entire funnel",
    desc: "Once your wizard is complete, Claude analyses everything you've submitted and writes all 8 funnel pages in your voice in a single generation run.",
  },
  {
    n: "5",
    title: "Preview, refine, and download",
    desc: "Review every page in a live preview. Regenerate any section you want to adjust. When you're happy, download production-ready HTML, CSS and JS for all 8 pages — ready to deploy.",
  },
];

export default async function PricingPage() {
  const session = await getSession();

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
      {/* Ambient gradient blobs */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: "55vw", height: "55vw", maxWidth: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,0,126,0.07) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "-8%",
          width: "50vw", height: "50vw", maxWidth: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,83,12,0.06) 0%, transparent 70%)",
        }} />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "relative", zIndex: 10,
          padding: "24px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            fontFamily: Z.fontBody,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: Z.muted,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← The Path
        </Link>
        <AuthHeaderActions variant="dark" hideCta />
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 1,
          textAlign: "center",
          padding: "56px 40px 0",
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontFamily: Z.fontAccent,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: Z.pink,
            marginBottom: 18,
          }}
        >
          One-time access · No subscription
        </p>
        <h1
          style={{
            fontFamily: Z.fontDisplay,
            fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "0.02em",
            color: Z.charcoal,
            marginBottom: 20,
          }}
        >
          Your complete event funnel.<br />
          Designed, written, and ready to launch.
        </h1>
        <p
          style={{
            fontFamily: Z.fontBody,
            color: Z.muted,
            fontSize: "1.05rem",
            lineHeight: 1.7,
            marginBottom: 52,
            maxWidth: 560,
            margin: "0 auto 52px",
          }}
        >
          Get instant access to Figma templates for all six styles, then work through the
          AI wizard at your own pace. When you&rsquo;re done, download production-ready
          HTML, CSS and JS for all eight funnel pages.
        </p>
      </section>

      {/* ── Pricing card ───────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 1,
          maxWidth: 500,
          margin: "0 auto",
          padding: "0 24px 72px",
        }}
      >
        <div
          style={{
            background: Z.white,
            border: `1px solid ${Z.creamDeep}`,
            borderRadius: 24,
            padding: "48px 40px",
            textAlign: "center",
            boxShadow: "0 4px 32px rgba(245,83,12,0.07), 0 1px 6px rgba(0,0,0,0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${Z.pink}, ${Z.coral}, ${Z.orange})`,
              borderRadius: "24px 24px 0 0",
            }}
          />

          {/* Price */}
          <div
            style={{
              fontFamily: Z.fontDisplay,
              fontSize: "4rem",
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: Z.charcoal,
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            $379
          </div>
          <div
            style={{
              fontFamily: Z.fontBody,
              color: Z.muted,
              marginBottom: 36,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            One-time payment · Instant access
          </div>

          {/* Feature list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 13,
              marginBottom: 36,
              textAlign: "left",
            }}
          >
            {FEATURES.map((item) => (
              <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span
                  style={{
                    color: Z.pink,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                    fontSize: 14,
                  }}
                >
                  ✓
                </span>
                <span
                  style={{
                    fontFamily: Z.fontBody,
                    fontSize: 14,
                    color: Z.charcoal,
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {session?.hasPaid ? (
            <Link
              href="/app/wizard"
              style={{
                display: "block",
                background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 55%, #FD1562 100%)`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                color: Z.white,
                padding: "18px",
                borderRadius: 14,
                textDecoration: "none",
                fontFamily: Z.fontBody,
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: "0.02em",
                marginBottom: 14,
              }}
            >
              Go to your wizard →
            </Link>
          ) : (
            <form action="/api/stripe/create-session" method="POST">
              <input type="hidden" name="email" value={session?.email ?? ""} />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "18px",
                  background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 55%, #FD1562 100%)`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                  color: Z.white,
                  border: "none",
                  borderRadius: 14,
                  fontFamily: Z.fontBody,
                  fontWeight: 700,
                  fontSize: 16,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  marginBottom: 14,
                  transition: "opacity 0.2s, transform 0.2s",
                }}
              >
                Get instant access — $379
              </button>
            </form>
          )}

          <p
            style={{
              fontFamily: Z.fontBody,
              fontSize: 12,
              color: Z.faint,
              lineHeight: 1.5,
            }}
          >
            Secure checkout via Stripe ·{" "}
            {session
              ? `Signed in as ${session.email}`
              : <Link href="/login" style={{ color: Z.muted, textDecoration: "underline" }}>Sign in first to link your account</Link>
            }
          </p>
        </div>

        {/* Guarantee */}
        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            padding: "18px 24px",
            background: Z.creamMid,
            border: `1px solid ${Z.creamDeep}`,
            borderRadius: 14,
            fontFamily: Z.fontBody,
            fontSize: 13,
            color: Z.muted,
            lineHeight: 1.6,
          }}
        >
          If the AI-generated funnel doesn&rsquo;t meet your expectations,
          contact us within 7 days for a full refund.
        </div>
      </section>

      {/* ── What happens after ─────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 1,
          maxWidth: 680,
          margin: "0 auto",
          padding: "0 40px 96px",
        }}
      >
        <p
          style={{
            fontFamily: Z.fontAccent,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: Z.faint,
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          How it works
        </p>
        <h2
          style={{
            fontFamily: Z.fontDisplay,
            fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: Z.charcoal,
            textAlign: "center",
            marginBottom: 48,
            lineHeight: 1.2,
          }}
        >
          What happens after you pay
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {STEPS.map((step) => (
            <div key={step.n} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 100%)`,
                  color: Z.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: Z.fontBody,
                  fontWeight: 800,
                  fontSize: 15,
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(250,42,69,0.25)",
                }}
              >
                {step.n}
              </div>
              <div style={{ paddingTop: 6 }}>
                <h3
                  style={{
                    fontFamily: Z.fontBody,
                    fontWeight: 700,
                    fontSize: 16,
                    color: Z.charcoal,
                    margin: "0 0 6px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: Z.fontBody,
                    color: Z.muted,
                    margin: 0,
                    lineHeight: 1.65,
                    fontSize: 14,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
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
