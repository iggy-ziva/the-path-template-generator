"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

interface Props {
  themeSlug: string;
  themeLabel: string;
  onClose: () => void;
}

const Z = {
  pink:    "#FF007E",
  coral:   "#FA2A45",
  cream:   "#FCFAF6",
  charcoal:"#2E2E2E",
  muted:   "#8A7A6A",
  faint:   "#C8B8A4",
  creamDeep:"#F5EEE0",
  white:   "#FFFFFF",
  font:    'var(--font-barlow), -apple-system, sans-serif',
  display: '"kudryashev-d-contrast", serif',
};

export default function DownloadThemeModal({ themeSlug, themeLabel, onClose }: Props) {

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: Z.cream,
          borderRadius: 24,
          padding: "48px 40px 40px",
          maxWidth: 780,
          width: "100%",
          position: "relative",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: Z.creamDeep,
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: Z.muted,
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Heading */}
        <p style={{ fontFamily: Z.font, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: Z.pink, marginBottom: 8 }}>
          {themeLabel} Theme
        </p>
        <h2 style={{ fontFamily: Z.display, fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: Z.charcoal, marginBottom: 8, lineHeight: 1.2 }}>
          How would you like to use this theme?
        </h2>
        <p style={{ fontFamily: Z.font, fontSize: 15, color: Z.muted, marginBottom: 36, lineHeight: 1.6 }}>
          Choose the path that fits your situation. All three lead to the same destination — a live funnel that converts.
        </p>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>

          {/* Card 1 — Download */}
          <div style={{ background: Z.white, borderRadius: 16, padding: "28px 24px", border: `1.5px solid ${Z.creamDeep}`, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🎨</div>
            <h3 style={{ fontFamily: Z.font, fontSize: 15, fontWeight: 700, color: Z.charcoal, marginBottom: 10, lineHeight: 1.3 }}>
              Download the design file
            </h3>
            <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, lineHeight: 1.65, marginBottom: 16, flex: 1 }}>
              This is a <strong>Figma file</strong> — a free professional design tool. Download it if you (or a designer you work with) are comfortable customising layouts, fonts, and colours. Once designed, a web developer can build and host the final site for you.
            </p>
            <a
              href={`/api/themes/${themeSlug}/figma`}
              style={{
                display: "block",
                textAlign: "center",
                background: Z.charcoal,
                color: Z.white,
                fontFamily: Z.font,
                fontSize: 13,
                fontWeight: 700,
                padding: "12px 20px",
                borderRadius: 10,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              Download Figma file →
            </a>
          </div>

          {/* Card 2 — Hire Ziva */}
          <div style={{ background: Z.white, borderRadius: 16, padding: "28px 24px", border: `2px solid ${Z.pink}`, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${Z.pink}, ${Z.coral})` }} />
            <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
            <h3 style={{ fontFamily: Z.font, fontSize: 15, fontWeight: 700, color: Z.charcoal, marginBottom: 6, lineHeight: 1.3 }}>
              Let Ziva do the design
            </h3>
            <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, color: Z.pink, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              From $2,000 — design only
            </p>
            <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, lineHeight: 1.65, marginBottom: 8, flex: 1 }}>
              We take your wizard output and customise the entire Figma file for you — your brand colours, fonts, copy, and images — fully production-ready to hand to a developer. <em>Hosting and technical setup are not included.</em>
            </p>
            <form action="/api/stripe/design-service" method="POST" style={{ margin: 0 }}>
              <input type="hidden" name="theme_slug" value={themeSlug} />
              <input type="hidden" name="theme_label" value={themeLabel} />
              <button
                type="submit"
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 100%)`,
                  color: Z.white,
                  fontFamily: Z.font,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "12px 20px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                Order design service →
              </button>
            </form>
          </div>

          {/* Card 3 — Wizard */}
          <div style={{ background: Z.white, borderRadius: 16, padding: "28px 24px", border: `1.5px solid ${Z.creamDeep}`, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
            <h3 style={{ fontFamily: Z.font, fontSize: 15, fontWeight: 700, color: Z.charcoal, marginBottom: 10, lineHeight: 1.3 }}>
              Use the AI wizard instead
            </h3>
            <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, lineHeight: 1.65, marginBottom: 16, flex: 1 }}>
              No designer needed. Answer the wizard questions and AI will write your complete funnel copy — all eight pages — matched to your voice and style. Your progress is always saved, so you can work at your own pace.
            </p>
            <Link
              href="/app/wizard"
              onClick={onClose}
              style={{
                display: "block",
                textAlign: "center",
                background: Z.creamDeep,
                color: Z.charcoal,
                fontFamily: Z.font,
                fontSize: 13,
                fontWeight: 700,
                padding: "12px 20px",
                borderRadius: 10,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              Go to wizard →
            </Link>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
