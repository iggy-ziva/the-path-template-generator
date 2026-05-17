import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";

const UPSELL_COPY: Record<string, { bundleName: string; bundleItems: { title: string; description: string }[]; urgency: string; wasPrice: number; nowPrice: number; savings: number }> = {
  sacred: {
    bundleName: "The Akashic Deep-Dive Bundle",
    bundleItems: [
      { title: "Extended Soul Reading Session", description: "A private 60-minute recorded Akashic reading with Selene to explore your specific soul contracts in depth." },
      { title: "The Soul Contracts Workbook", description: "Selene's complete written guide to identifying and dissolving your three most limiting karmic agreements." },
      { title: "Lifetime Ceremony Replay Access", description: "All-access archive of Selene's past ceremonies — over 20 hours of Akashic transmissions." },
    ],
    urgency: "Available only until the ceremony begins",
    wasPrice: 397,
    nowPrice: 127,
    savings: 270,
  },
  executive: {
    bundleName: "The Executive Accelerator Bundle",
    bundleItems: [
      { title: "Private Strategy Call with Marcus", description: "A 45-minute recorded strategy session to apply the Influence Architecture directly to your specific leadership situation." },
      { title: "The Presence Signal Assessment", description: "Marcus's proprietary diagnostic — a 30-minute tool that measures your seven presence signals with precision." },
      { title: "12 Months of Monthly Strategy Briefings", description: "Marcus's monthly executive intelligence briefing covering presence, influence, and leadership in the current environment." },
    ],
    urgency: "Available only before the session begins",
    wasPrice: 497,
    nowPrice: 147,
    savings: 350,
  },
  wellness: {
    bundleName: "The Embodiment Deepening Bundle",
    bundleItems: [
      { title: "Private Somatic Session with Aria", description: "A 60-minute recorded one-on-one somatic session to work with your specific nervous system patterns in depth." },
      { title: "The Somatic Foundations Course", description: "Aria's self-paced programme with eight weeks of daily somatic practices for sustained nervous system regulation." },
      { title: "The Sensitivity Toolkit", description: "Aria's complete resource guide for high-sensitivity people — tools, practices, and frameworks for everyday life." },
    ],
    urgency: "Available only until the intensive begins",
    wasPrice: 347,
    nowPrice: 97,
    savings: 250,
  },
  highperf: {
    bundleName: "The Peak Protocol Accelerator",
    bundleItems: [
      { title: "Personal Cognitive Audit Call with Kai", description: "A 45-minute recorded session where Kai analyses your specific cognitive bottlenecks and prescribes your personalised protocol stack." },
      { title: "The Protocol Library", description: "Kai's complete database of 40+ evidence-based performance protocols with implementation guides for each." },
      { title: "The 30-Day Implementation Tracker", description: "Kai's proprietary tracking system for measuring your cognitive performance metrics in real time during implementation." },
    ],
    urgency: "Available only before the session starts",
    wasPrice: 397,
    nowPrice: 127,
    savings: 270,
  },
  abundance: {
    bundleName: "The Abundance Activation Bundle",
    bundleItems: [
      { title: "Private Field Clearing Session with Zoe", description: "A 60-minute recorded one-on-one quantum field clearing session targeted at your specific abundance blocks." },
      { title: "The Aligned Marketing Masterclass", description: "Zoe's complete training on attracting premium clients through energetic alignment rather than exhausting hustle strategies." },
      { title: "The Receivership Ritual Kit", description: "Zoe's complete daily practice system for sustaining an open, receptive energetic field for abundance in all forms." },
    ],
    urgency: "Available only until the activation begins",
    wasPrice: 447,
    nowPrice: 127,
    savings: 320,
  },
  earth: {
    bundleName: "The Medicine Bundle",
    bundleItems: [
      { title: "Private Ancestral Session with River", description: "A 75-minute recorded one-on-one ancestral healing session to work specifically with your lineage and its gifts." },
      { title: "The Earth Medicine Practice Library", description: "River's complete archive of seasonal ceremonies, earth connection practices, and ancestral healing rituals." },
      { title: "The Ancestral Wisdom Journal", description: "River's guided journalling practice — 33 prompts to deepen your relationship with your lineage and the earth." },
    ],
    urgency: "Available only before the circle opens",
    wasPrice: 377,
    nowPrice: 97,
    savings: 280,
  },
};

function s(theme: ThemeConfig) {
  return {
    page: { background: theme.colors.canvas, color: theme.colors.text, fontFamily: theme.fonts.bodyFamily } as React.CSSProperties,
    displayFont: { fontFamily: theme.fonts.displayFamily } as React.CSSProperties,
    darkBg: { background: theme.colors.dark, color: "#fff" } as React.CSSProperties,
  };
}

export default async function UpsellPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const styles = s(theme);
  const copy = UPSELL_COPY[themeSlug];
  const thankYouHref = `/themes/${themeSlug}/thank-you`;

  return (
    <main style={styles.page}>
      {/* PROGRESS */}
      <div style={{ ...styles.darkBg, padding: "16px 40px", display: "flex", justifyContent: "center", gap: "32px", fontSize: "13px" }}>
        {["Registration", "Special offer", "Confirmation"].map((step, i) => (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: "8px", opacity: i === 1 ? 1 : 0.5 }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: i === 0 ? theme.colors.highlight : i === 1 ? theme.colors.accent : "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {i === 0 ? "✓" : i + 1}
            </div>
            {step}
          </div>
        ))}
      </div>

      {/* CONFIRMATION BANNER */}
      <div
        style={{
          background: theme.colors.success,
          color: "#fff",
          padding: "16px 40px",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        ✓ You're registered for {theme.event.name}! Check your email for confirmation.
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "60px 40px" }}>
        {/* EYEBROW */}
        <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.colors.accent, textAlign: "center", marginBottom: "16px" }}>
          Wait — one-time offer
        </p>

        <h1
          style={{
            ...styles.displayFont,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "16px",
          }}
        >
          {copy.bundleName}
        </h1>

        <p style={{ textAlign: "center", opacity: 0.7, marginBottom: "48px", lineHeight: 1.6 }}>
          Before you go, here is a one-time offer available only to people who have just registered for {theme.event.name}. It will not be available at this price anywhere else.
        </p>

        {/* BUNDLE ITEMS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
          {copy.bundleItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "20px",
                padding: "24px",
                background: `${theme.colors.accent}08`,
                borderRadius: "14px",
                border: `1px solid ${theme.colors.accent}20`,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: theme.colors.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  flexShrink: 0,
                  fontSize: "14px",
                }}
              >
                {i + 1}
              </div>
              <div>
                <h3 style={{ ...styles.displayFont, fontWeight: 700, marginBottom: "6px", fontSize: "1.05rem" }}>{item.title}</h3>
                <p style={{ margin: 0, opacity: 0.7, fontSize: "0.9rem", lineHeight: 1.55 }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* PRICING */}
        <div
          style={{
            background: "#fff",
            border: `2px solid ${theme.colors.accent}`,
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            marginBottom: "24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ fontSize: "13px", opacity: 0.5, marginBottom: "8px", textDecoration: "line-through" }}>
            Regular price: ${copy.wasPrice}
          </p>
          <div style={{ fontSize: "3rem", fontWeight: 800, color: theme.colors.accent, fontFamily: theme.fonts.displayFamily, lineHeight: 1 }}>
            ${copy.nowPrice}
          </div>
          <p style={{ color: theme.colors.success, fontWeight: 700, marginBottom: "8px" }}>
            You save ${copy.savings}
          </p>
          <p style={{ fontSize: "12px", opacity: 0.55 }}>{copy.urgency}</p>
        </div>

        {/* CTAs */}
        <Link
          href={thankYouHref}
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
          Yes — add the bundle for ${copy.nowPrice} →
        </Link>
        <Link
          href={thankYouHref}
          style={{
            display: "block",
            textAlign: "center",
            fontSize: "13px",
            color: theme.colors.text,
            textDecoration: "none",
            opacity: 0.5,
            padding: "12px",
          }}
        >
          No thanks, I'll skip this offer
        </Link>
      </div>

      <footer style={{ ...styles.darkBg, padding: "24px 40px", textAlign: "center", fontSize: "12px", opacity: 0.4 }}>
        © {new Date().getFullYear()} {theme.host.legalEntity}
      </footer>
    </main>
  );
}
