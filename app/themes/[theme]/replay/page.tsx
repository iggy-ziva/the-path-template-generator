import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";

const REPLAY_COPY: Record<string, {
  headline: string;
  intro: string;
  resources: { name: string; type: string }[];
  parts: { title: string; duration: string; description: string; chatQuotes: string[] }[];
  programTeaser: string;
}> = {
  sacred: {
    headline: "Your ceremony recording is ready",
    intro: "Thank you for joining The Akashic Unfolding. What happened in that space was real, and it continues to work in you. The recording below carries the full energetic transmission — watch it as many times as you are called to.",
    resources: [
      { name: "Ceremony Recording — Part 1", type: "Video · 90 min" },
      { name: "Ceremony Recording — Part 2", type: "Video · 90 min" },
      { name: "Integration Practice Guide", type: "PDF · 12 pages" },
      { name: "Soul Contract Clarity Worksheet", type: "PDF · 8 pages" },
    ],
    parts: [
      { title: "Part 1 — Opening the Records", duration: "90 minutes", description: "Selene opens the Records for the group, delivers the collective transmission, and offers individual readings.", chatQuotes: ["I felt the energy shift as soon as Selene began the opening prayer", "She named things she couldn't possibly have known. I'm still processing", "My whole body started trembling during the transmission — in the best way"] },
      { title: "Part 2 — Integration & Closing", duration: "90 minutes", description: "Selene guides the group through integration practices and closes the ceremony with a blessing.", chatQuotes: ["The closing felt like being gently set back down on earth", "I have attended dozens of ceremonies. This was unlike anything I've experienced", "I keep coming back to one thing she said to me. It's changing everything"] },
    ],
    programTeaser: "Ready to go deeper into your soul contracts? Soul Contract Mastery is the eight-week live training that takes everything you touched in the ceremony and builds it into a complete, lasting practice.",
  },
  executive: {
    headline: "Your session recording is live",
    intro: "The full Executive Presence Summit recording is below. Everything discussed in the session — including the live Q&A — is included. The Influence Architecture framework is most powerful when reviewed twice: once to receive it, once to apply it.",
    resources: [
      { name: "Session Recording — Full", type: "Video · 150 min" },
      { name: "Influence Architecture Framework PDF", type: "PDF · 24 pages" },
      { name: "The Seven Presence Signals Reference Card", type: "PDF · 2 pages" },
      { name: "90-Day Implementation Workbook", type: "PDF · 18 pages" },
    ],
    parts: [
      { title: "Part 1 — The Framework", duration: "75 minutes", description: "Marcus delivers the complete Influence Architecture framework — all seven presence signals with practical application for each.", chatQuotes: ["This reframes everything I thought I knew about leadership presence", "Signal 4 hit me hard. That's exactly where I've been leaving authority on the table", "I've already implemented two protocols today. The difference is immediately visible"] },
      { title: "Part 2 — Live Q&A", duration: "75 minutes", description: "Marcus responds to participant case studies in real time, showing how the framework applies across industries and roles.", chatQuotes: ["The Q&A was where it got really practical for me", "Marcus's response to the founder question was worth the entire session", "I asked about my specific situation and got a playbook I can use tomorrow"] },
    ],
    programTeaser: "Ready to go from framework to full transformation? The Influence Architecture is the twelve-week intensive where Marcus works with a small cohort to implement every signal with precision and accountability.",
  },
  wellness: {
    headline: "Your intensive recording is ready",
    intro: "The full Embodied Presence Intensive is below. Take your time with this one — let your body lead the way. Many people find the practices land even more deeply in the replay when they can pause and be with what arises.",
    resources: [
      { name: "Intensive Recording — Part 1", type: "Video · 90 min" },
      { name: "Intensive Recording — Part 2", type: "Video · 90 min" },
      { name: "Your Personalised Somatic Practice Guide", type: "PDF · 14 pages" },
      { name: "Nervous System Regulation Reference", type: "PDF · 6 pages" },
    ],
    parts: [
      { title: "Part 1 — Arriving in the Body", duration: "90 minutes", description: "Aria guides the group through the opening somatic sequence, nervous system orientation, and the first deep practice.", chatQuotes: ["I couldn't believe how quickly I dropped in. I'm usually so stuck in my head", "Aria's voice alone is regulating. I felt my shoulders drop in the first five minutes", "I cried during the first exercise and felt completely safe. That's rare for me"] },
      { title: "Part 2 — Integration & Daily Practice", duration: "90 minutes", description: "The group deepens the somatic work and Aria guides everyone through their personalised daily practice for the weeks ahead.", chatQuotes: ["I've done years of therapy. Three hours with Aria reached places none of it touched", "The daily practice she gave me is already changing my mornings", "I felt genuinely rested for the first time in years by the end of this"] },
    ],
    programTeaser: "Ready for eight weeks of this? The Somatic Freedom Collective is a live programme that takes the nervous system work from today and builds it into a complete, sustainable embodiment practice.",
  },
  highperf: {
    headline: "Your session recording is live",
    intro: "The full Cognitive Edge Summit recording — including the Q&A — is below. Watch Part 1 to receive the framework. Watch Part 2 to identify the protocol stack most relevant to your specific situation. Then implement immediately.",
    resources: [
      { name: "Session Recording — Full", type: "Video · 120 min" },
      { name: "Cognitive Edge Framework PDF", type: "PDF · 20 pages" },
      { name: "Protocol Stack Selection Guide", type: "PDF · 8 pages" },
      { name: "30-Day Implementation Tracker", type: "Spreadsheet · Excel/Google Sheets" },
    ],
    parts: [
      { title: "Part 1 — The Framework", duration: "60 minutes", description: "Kai delivers the complete Cognitive Edge framework: all six leverage points, the underlying neuroscience, and the top three highest-ROI protocols.", chatQuotes: ["Protocol 2 alone is worth 10x the price of admission", "I implemented the morning stack before the session even finished. Different day already", "This is what peak performance training should be: evidence-based, specific, immediately applicable"] },
      { title: "Part 2 — Live Q&A + Protocol Calibration", duration: "60 minutes", description: "Kai calibrates the framework to real participant situations in real time, showing how to design a personalised protocol stack.", chatQuotes: ["The answer Kai gave to the startup founder question is exactly what I needed", "I've read every performance book. This was more practical than all of them combined", "The calibration session clarified which protocols apply to my specific bottlenecks"] },
    ],
    programTeaser: "Ready to build a complete cognitive architecture? The Peak Protocol is the ten-week performance system where Kai works with a small cohort to implement the full framework with weekly calibration.",
  },
  abundance: {
    headline: "Your activation recording is ready",
    intro: "The full Abundance Activation is below — transmission, clearing, and business strategy all included. The energetic field of the activation is fully present in the replay. Many people report the transmission hitting them even more powerfully on the second watch.",
    resources: [
      { name: "Activation Recording — Full", type: "Video · 180 min" },
      { name: "Quantum Business Blueprint PDF", type: "PDF · 22 pages" },
      { name: "The Daily Receivership Practice", type: "PDF · 10 pages" },
      { name: "Aligned Pricing Calculator", type: "Spreadsheet · Excel/Google Sheets" },
    ],
    parts: [
      { title: "Part 1 — The Energetic Clearing & Transmission", duration: "90 minutes", description: "Zoe guides the group through the quantum field clearing and delivers the wealth activation transmission.", chatQuotes: ["I felt something physically release in my chest halfway through the clearing", "I'm not someone who cries easily. I wept for fifteen minutes and felt lighter than I have in years", "Zoe's transmission reached something no mindset work has ever touched"] },
      { title: "Part 2 — Aligned Business Strategy", duration: "90 minutes", description: "Zoe delivers the Quantum Business Expansion framework and shows how to align marketing, pricing, and selling with your energetic field.", chatQuotes: ["The section on pricing from worth rather than fear completely reframed how I think about my offers", "I raised my prices the next day. First client I pitched said yes immediately", "Finally — business strategy that doesn't feel like it requires me to abandon my values"] },
    ],
    programTeaser: "Ready for nine weeks of energetic and strategic expansion? Quantum Business Expansion takes today's activation and builds it into a complete business and abundance transformation.",
  },
  earth: {
    headline: "Your ceremony recording is ready",
    intro: "The full Medicine Circle Gathering is below. The ceremonial space River opened for us remains accessible through this recording. Many participants return to it again and again as their relationship with their ancestors deepens.",
    resources: [
      { name: "Ceremony Recording — Full", type: "Video · 240 min" },
      { name: "Ancestral Reconnection Practice Guide", type: "PDF · 16 pages" },
      { name: "The Daily Earth Connection Ceremony", type: "PDF · 8 pages" },
      { name: "Seasonal Ceremony Calendar", type: "PDF · 12 pages" },
    ],
    parts: [
      { title: "Part 1 — Opening the Circle & Ancestral Transmission", duration: "120 minutes", description: "River opens sacred space with traditional protocols and guides the collective ancestral reconnection practice.", chatQuotes: ["I felt my grandmother's presence so strongly I turned to look behind me", "Something in my lineage shifted. I can feel it in my bones. I don't know how else to describe it", "River holds ceremony with a rigour and authenticity that is increasingly rare"] },
      { title: "Part 2 — Medicine Teachings & Closing", duration: "120 minutes", description: "River delivers the earth medicine teachings and closes the circle with a blessing for the participants and their lineages.", chatQuotes: ["The medicine teaching on grief and the land changed something fundamental in me", "I have been searching for this my entire life and didn't know it until River named it", "The closing ceremony was the most beautiful thing I have witnessed online or off"] },
    ],
    programTeaser: "Ready to walk the full ancestral healing path? Ancestral Wisdom Path is the twelve-week ceremonial journey where River works with a small circle to heal the lineage and reclaim its power.",
  },
};

function s(theme: ThemeConfig) {
  return {
    page: { background: theme.colors.canvas, color: theme.colors.text, fontFamily: theme.fonts.bodyFamily } as React.CSSProperties,
    displayFont: { fontFamily: theme.fonts.displayFamily } as React.CSSProperties,
    darkBg: { background: theme.colors.dark, color: "#fff" } as React.CSSProperties,
  };
}

export default async function ReplayPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const styles = s(theme);
  const copy = REPLAY_COPY[themeSlug];

  return (
    <main style={styles.page}>
      {/* OFFER BAR */}
      <div
        style={{
          background: theme.colors.accent,
          color: "#fff",
          padding: "14px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span style={{ fontFamily: theme.fonts.displayFamily, fontWeight: 600, fontSize: "14px" }}>
          {theme.program.name} — {theme.program.tagline.slice(0, 60)}...
        </span>
        <Link
          href={`/themes/${themeSlug}/program`}
          style={{
            background: theme.colors.highlight,
            color: theme.colors.dark,
            padding: "8px 20px",
            borderRadius: "100px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "13px",
            whiteSpace: "nowrap",
          }}
        >
          Learn more →
        </Link>
      </div>

      {/* HEADER */}
      <section style={{ ...styles.darkBg, padding: "60px 40px", textAlign: "center" }}>
        <h1 style={{ ...styles.displayFont, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, marginBottom: "16px" }}>
          {copy.headline}
        </h1>
        <p style={{ opacity: 0.75, maxWidth: "600px", margin: "0 auto", lineHeight: 1.65 }}>
          {copy.intro}
        </p>
      </section>

      {/* RESOURCE DOWNLOADS */}
      <section style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 40px 0" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "1.3rem", fontWeight: 700, marginBottom: "20px" }}>
          Your materials
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {copy.resources.map((r) => (
            <a
              key={r.name}
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: `${theme.colors.accent}10`,
                border: `1px solid ${theme.colors.accent}30`,
                borderRadius: "8px",
                textDecoration: "none",
                color: theme.colors.text,
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: theme.colors.accent }}>↓</span>
              <span>{r.name}</span>
              <span style={{ opacity: 0.45, fontWeight: 400 }}>· {r.type}</span>
            </a>
          ))}
        </div>
      </section>

      {/* VIDEO PARTS */}
      <section style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 40px" }}>
        {copy.parts.map((part, i) => (
          <div key={i} style={{ marginBottom: "48px" }}>
            <h2 style={{ ...styles.displayFont, fontSize: "1.4rem", fontWeight: 700, marginBottom: "6px" }}>{part.title}</h2>
            <p style={{ fontSize: "13px", opacity: 0.5, marginBottom: "20px" }}>{part.duration}</p>

            {/* VIDEO PLACEHOLDER */}
            <div
              style={{
                background: theme.colors.dark,
                borderRadius: "12px",
                aspectRatio: "16/9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: theme.colors.highlight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ▶
              </div>
            </div>

            <p style={{ lineHeight: 1.65, opacity: 0.75, marginBottom: "20px" }}>{part.description}</p>

            {/* CHAT QUOTES */}
            <div
              style={{
                background: `${theme.colors.accent}08`,
                borderRadius: "12px",
                padding: "20px",
                border: `1px solid ${theme.colors.accent}15`,
              }}
            >
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.colors.accent, marginBottom: "14px" }}>
                From the live chat
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {part.chatQuotes.map((q, j) => (
                  <div key={j} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: theme.colors.accent,
                        opacity: 0.3,
                        flexShrink: 0,
                      }}
                    />
                    <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5, fontStyle: "italic", opacity: 0.8 }}>"{q}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* PROGRAM CTA */}
      <section
        style={{
          background: theme.colors.accent,
          color: "#fff",
          padding: "72px 40px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.colors.highlight, marginBottom: "16px" }}>
          Go deeper
        </p>
        <h2 style={{ ...styles.displayFont, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, marginBottom: "16px", lineHeight: 1.2 }}>
          {theme.program.name}
        </h2>
        <p style={{ opacity: 0.85, maxWidth: "520px", margin: "0 auto 36px", lineHeight: 1.65 }}>
          {copy.programTeaser}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: theme.fonts.displayFamily }}>${theme.program.price.toLocaleString()}</div>
            <div style={{ fontSize: "13px", opacity: 0.7 }}>or {theme.program.paymentPlan}</div>
          </div>
          <Link
            href={`/themes/${themeSlug}/program`}
            style={{
              background: theme.colors.highlight,
              color: theme.colors.dark,
              padding: "16px 36px",
              borderRadius: "100px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            Learn about the programme →
          </Link>
        </div>
        <p style={{ fontSize: "12px", opacity: 0.5 }}>
          Enrolment closes when the programme begins
        </p>
      </section>

      <footer style={{ ...styles.darkBg, padding: "24px 40px", textAlign: "center", fontSize: "12px", opacity: 0.4 }}>
        © {new Date().getFullYear()} {theme.host.legalEntity}
      </footer>
    </main>
  );
}
