import Link from "next/link";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Get Access — The Path Template Generator",
};

export default async function PricingPage() {
  const session = await getSession();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0e0c",
        color: "#f5f1ea",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* HEADER */}
      <header style={{ padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#D4A878", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ← The Path
        </Link>
        {!session && (
          <Link href="/login" style={{ color: "#888", textDecoration: "none", fontSize: "14px" }}>
            Already have an account? Sign in →
          </Link>
        )}
      </header>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "60px 40px 0", maxWidth: "680px", margin: "0 auto" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A878", marginBottom: "20px" }}>
          One-time access · No subscription
        </p>
        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "20px", letterSpacing: "-0.02em" }}>
          Your complete event funnel.<br />Written by AI.
        </h1>
        <p style={{ color: "#888", fontSize: "1.1rem", lineHeight: 1.65, marginBottom: "48px" }}>
          Pay once, get instant access to the customisation wizard. Fill in your details, upload your materials, and Claude writes all eight funnel pages in your voice — in minutes.
        </p>
      </section>

      {/* PRICING CARD */}
      <section style={{ maxWidth: "460px", margin: "0 auto", padding: "0 40px 80px" }}>
        <div
          style={{
            background: "#1a1917",
            border: "1px solid #D4A87840",
            borderRadius: "24px",
            padding: "48px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "4px" }}>
            $379
          </div>
          <div style={{ color: "#888", marginBottom: "32px", fontSize: "14px" }}>
            One-time payment · Instant access
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px", textAlign: "left" }}>
            {[
              "10-step customisation wizard",
              "Upload existing materials + files",
              "AI tone analysis from your content",
              "8 fully-written funnel pages",
              "All 6 visual theme styles to choose from",
              "Regenerate any page at any time",
              "File & image upload for your funnel",
              "Support via email",
            ].map((item) => (
              <div key={item} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ color: "#D4A878", fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: "14px" }}>{item}</span>
              </div>
            ))}
          </div>

          {session?.hasPaid ? (
            <Link
              href="/app/wizard"
              style={{
                display: "block",
                background: "#D4A878",
                color: "#0f0e0c",
                padding: "18px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "16px",
                marginBottom: "12px",
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
                  background: "#D4A878",
                  color: "#0f0e0c",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: "pointer",
                  marginBottom: "12px",
                }}
              >
                Get instant access — $379 →
              </button>
            </form>
          )}

          <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.5 }}>
            Secure checkout via Stripe · {session ? "Signed in as " + session.email : <Link href="/login" style={{ color: "#888" }}>Sign in first to link your account</Link>}
          </p>
        </div>

        {/* GUARANTEE */}
        <div style={{ marginTop: "24px", textAlign: "center", padding: "20px", border: "1px solid #2a2926", borderRadius: "12px", fontSize: "13px", color: "#666", lineHeight: 1.5 }}>
          If the AI-generated funnel doesn't meet your expectations, contact us within 7 days for a full refund.
        </div>
      </section>

      {/* WHAT HAPPENS AFTER */}
      <section style={{ maxWidth: "680px", margin: "0 auto", padding: "0 40px 80px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "32px", textAlign: "center" }}>
          What happens after you pay
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {[
            { n: "1", title: "Sign in to your account", desc: "You'll be prompted to sign in or create a passwordless account linked to your purchase." },
            { n: "2", title: "Complete the 10-step wizard", desc: "Tell us about yourself, your event, your programme, your audience, and your voice. Upload existing materials for AI to analyse." },
            { n: "3", title: "AI writes your entire funnel", desc: "Claude 3.5 Sonnet reads all your materials, matches your tone, and writes all 8 pages in a single generation run — usually under 3 minutes." },
            { n: "4", title: "Preview and refine", desc: "Review every page in a live preview. Regenerate any section you want to adjust, or update your inputs and run again." },
          ].map((step) => (
            <div key={step.n} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#D4A878", color: "#0f0e0c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
                {step.n}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: "6px" }}>{step.title}</h3>
                <p style={{ color: "#888", margin: 0, lineHeight: 1.55, fontSize: "14px" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: "32px 40px", textAlign: "center", fontSize: "12px", color: "#333", borderTop: "1px solid #1a1917" }}>
        © {new Date().getFullYear()} The Path Template Generator
      </footer>
    </main>
  );
}
