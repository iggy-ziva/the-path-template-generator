"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const Z = {
  cream:    "#FCFAF6",
  creamDeep:"#F5EEE0",
  charcoal: "#2E2E2E",
  muted:    "#8A7A6A",
  pink:     "#FF007E",
  coral:    "#FA2A45",
  white:    "#FFFFFF",
  font:     'var(--font-barlow), -apple-system, sans-serif',
  display:  '"kudryashev-d-contrast", serif',
};

export default function DesignServiceThankYouContent() {
  const params = useSearchParams();
  const theme = params.get("theme") ?? "your";

  return (
    <main style={{ minHeight: "100vh", background: Z.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>

      {/* Logo */}
      <Link href="/" style={{ marginBottom: 48 }}>
        <Image src="/ziva-marketing-logo.png" alt="Ziva Marketing" width={120} height={40} style={{ width: 120, height: "auto" }} />
      </Link>

      {/* Card */}
      <div style={{ background: Z.white, borderRadius: 24, padding: "56px 48px", maxWidth: 560, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.07)", border: `1px solid ${Z.creamDeep}` }}>

        {/* Icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 28px",
          fontSize: 28,
        }}>
          ✓
        </div>

        <p style={{ fontFamily: Z.font, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: Z.pink, marginBottom: 12 }}>
          Order confirmed
        </p>

        <h1 style={{ fontFamily: Z.display, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, color: Z.charcoal, lineHeight: 1.2, marginBottom: 20 }}>
          We&rsquo;ve got your {theme} theme — let&rsquo;s get started.
        </h1>

        <p style={{ fontFamily: Z.font, fontSize: 16, color: Z.muted, lineHeight: 1.7, marginBottom: 12 }}>
          Your payment has been received. Someone from the Ziva team will be in touch within <strong style={{ color: Z.charcoal }}>48 hours</strong> to kick off the design process.
        </p>

        <p style={{ fontFamily: Z.font, fontSize: 14, color: Z.muted, lineHeight: 1.7, marginBottom: 40 }}>
          In the meantime, if you haven&rsquo;t completed the wizard yet, now is a great time — the more detail you provide, the better we can match your brand.
        </p>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${Z.creamDeep}`, margin: "0 0 36px" }} />

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link
            href="/app/wizard"
            style={{
              display: "block",
              background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 100%)`,
              color: Z.white,
              fontFamily: Z.font,
              fontSize: 15,
              fontWeight: 700,
              padding: "16px 24px",
              borderRadius: 12,
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            Complete the wizard →
          </Link>
          <Link
            href="/"
            style={{
              display: "block",
              background: Z.creamDeep,
              color: Z.charcoal,
              fontFamily: Z.font,
              fontSize: 14,
              fontWeight: 600,
              padding: "14px 24px",
              borderRadius: 12,
              textDecoration: "none",
            }}
          >
            Back to home
          </Link>
        </div>
      </div>

      <p style={{ marginTop: 32, fontFamily: Z.font, fontSize: 13, color: Z.muted }}>
        Questions? Email us at{" "}
        <a href="mailto:hello@ziva.marketing" style={{ color: Z.pink, textDecoration: "none", fontWeight: 600 }}>
          hello@ziva.marketing
        </a>
      </p>
    </main>
  );
}
