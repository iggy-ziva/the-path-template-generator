import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";

const PROGRAM_TY_COPY: Record<string, {
  headline: string;
  subheadline: string;
  nextSteps: { step: string; title: string; description: string }[];
  schedule: { label: string; title: string }[];
  commitments: string[];
  personalNote: string;
  accessDetails: { label: string; value: string }[];
}> = {
  sacred: {
    headline: "Welcome to Soul Contract Mastery.",
    subheadline: "Your enrolment is confirmed. The Records are already preparing for you.",
    nextSteps: [
      { step: "1", title: "Check your inbox", description: "Your welcome email with the community invite and pre-work guide is arriving now. Please check your spam folder if you don't see it within five minutes." },
      { step: "2", title: "Join the community", description: "Your link to the Soul Contract Mastery private space is in your welcome email. Introduce yourself and meet your cohort." },
      { step: "3", title: "Complete the pre-work", description: "Selene has prepared a pre-programme Akashic preparation guide. Please engage with it before Week 1 — it makes a significant difference to your first session experience." },
      { step: "4", title: "Mark your calendar", description: "Sessions are every Tuesday evening. All dates and Zoom links are in your welcome email." },
    ],
    schedule: [
      { label: "Week 1", title: "The Architecture of the Akashic Field" },
      { label: "Week 2", title: "Reading Your Primary Soul Contract" },
      { label: "Week 3", title: "Karmic Patterns and Their Origins" },
      { label: "Week 4", title: "Dissolution and Release" },
      { label: "Week 5", title: "Soul Contracts in Relationships" },
      { label: "Week 6", title: "Abundance and Soul-Level Blocks" },
      { label: "Week 7", title: "Your Soul's Gifts and Purpose" },
      { label: "Week 8", title: "Authoring Your Next Chapter" },
    ],
    commitments: [
      "Attend the live sessions as often as possible",
      "Engage with the workbook practices each week",
      "Bring your whole self — your questions, your confusion, and your wonder",
      "Trust the process, even when it asks you to sit with discomfort",
    ],
    personalNote: "I am so honoured that you have said yes to this. What we will do together over the next eight weeks is rare, and real, and it will change you — in the most necessary ways. The Records have been waiting for you. I cannot wait to open them with you. — Selene",
    accessDetails: [
      { label: "Sessions", value: "Tuesdays · Time in welcome email" },
      { label: "Platform", value: "Zoom" },
      { label: "Community", value: "Private portal — link in email" },
      { label: "Recordings", value: "Available within 24 hours" },
      { label: "Support", value: "hello@selenevoss.com" },
    ],
  },
  executive: {
    headline: "Welcome to The Influence Architecture.",
    subheadline: "Your enrolment is confirmed. Your influence audit lands in your inbox shortly.",
    nextSteps: [
      { step: "1", title: "Check your inbox", description: "Your welcome email with the programme portal link and influence audit is arriving now." },
      { step: "2", title: "Complete the influence audit", description: "The 90-minute Presence Signal Assessment is your first step. Complete it before Week 1 — your personalised 12-week architecture is built from the results." },
      { step: "3", title: "Join the cohort channel", description: "Your private cohort channel link is in your welcome email. Introduce yourself — you'll be working alongside these people for twelve weeks." },
      { step: "4", title: "Block your Thursday lunchtimes", description: "Sessions are every Thursday. The specific time and Zoom link are in your welcome email." },
    ],
    schedule: [
      { label: "Weeks 1–2", title: "The Influence Audit" },
      { label: "Weeks 3–4", title: "Signals 1–2: Spatial Authority & Physical Presence" },
      { label: "Weeks 5–6", title: "Signals 3–4: Vocal Architecture & Linguistic Precision" },
      { label: "Weeks 7–8", title: "Signals 5–6: Strategic Silence & Decision Presence" },
      { label: "Weeks 9–10", title: "Signal 7: Narrative Authority" },
      { label: "Weeks 11–12", title: "Architecture Integration & Long-Game Design" },
    ],
    commitments: [
      "Attend the live sessions — the Q&A is where the most specific value is created",
      "Implement the protocols immediately — insight without implementation is just information",
      "Track your results — your cohort will hold you to measurable outcomes",
      "Bring real situations — the more specific your questions, the more precise Marcus's responses",
    ],
    personalNote: "You have made a serious investment in a serious outcome. I do not take that lightly, and I will work harder to earn your results than you work to produce them. Come ready to implement from day one. — Marcus",
    accessDetails: [
      { label: "Sessions", value: "Thursdays · Time in welcome email" },
      { label: "Platform", value: "Zoom" },
      { label: "Cohort", value: "Private channel — link in email" },
      { label: "Recordings", value: "Available within 12 hours" },
      { label: "Support", value: "office@marcusashford.com" },
    ],
  },
  wellness: {
    headline: "Welcome to The Somatic Freedom Collective.",
    subheadline: "Your enrolment is confirmed. Your body already knows something has changed.",
    nextSteps: [
      { step: "1", title: "Check your inbox", description: "Your welcome email with the community invite and first somatic practice is arriving now." },
      { step: "2", title: "Begin the arrival practice", description: "Your first somatic practice is in your welcome email. Begin it today — not because it is required, but because your system is already open." },
      { step: "3", title: "Join the collective", description: "Your private community link is in your welcome email. Come as you are. There is no performance required here." },
      { step: "4", title: "Mark your Sunday mornings", description: "Sessions are every Sunday. The specific time and Zoom link are in your welcome email." },
    ],
    schedule: [
      { label: "Week 1", title: "Meeting Your Nervous System" },
      { label: "Week 2", title: "Orienting to Safety" },
      { label: "Week 3", title: "Completing Incomplete Responses" },
      { label: "Week 4", title: "Embodied Boundaries" },
      { label: "Week 5", title: "Emotions as Sensation" },
      { label: "Week 6", title: "Somatic Presence in Relationships" },
      { label: "Week 7", title: "The Body's Intelligence in Daily Life" },
      { label: "Week 8", title: "Building Your Lifelong Practice" },
    ],
    commitments: [
      "Do the daily somatic practice — even five minutes counts",
      "Attend the live sessions with camera on if you can — the co-regulation is real",
      "Trust your body's pace — it knows what it needs",
      "Ask for support when you need it — the community is here for exactly that",
    ],
    personalNote: "I am so glad you are here. What we are going to do together over the next eight weeks is gentle, and it is profound, and it will change the way you live in your body for the rest of your life. Come exactly as you are. That is always more than enough. — Aria",
    accessDetails: [
      { label: "Sessions", value: "Sundays · Time in welcome email" },
      { label: "Platform", value: "Zoom" },
      { label: "Community", value: "Private portal — link in email" },
      { label: "Recordings", value: "Available within 24 hours" },
      { label: "Support", value: "hello@ariabloom.co" },
    ],
  },
  highperf: {
    headline: "Welcome to The Peak Protocol.",
    subheadline: "Enrolment confirmed. Your cognitive audit is in your inbox.",
    nextSteps: [
      { step: "01", title: "Check your inbox", description: "Your welcome email with the programme portal link and cognitive performance audit is arriving now. Flag it." },
      { step: "02", title: "Complete the cognitive audit", description: "The 12-minute baseline audit is your first deliverable. Complete it today — your personalised protocol stack is built from the results." },
      { step: "03", title: "Set up your tracking dashboard", description: "Your performance tracking dashboard setup guide is in the welcome email. This is how we measure your results. Set it up before Week 1." },
      { step: "04", title: "Block Wednesday sessions", description: "Sessions are every Wednesday. Protect the time completely — the Q&A is where protocols get calibrated to your situation." },
    ],
    schedule: [
      { label: "Weeks 1–2", title: "Baseline & Bottleneck Identification" },
      { label: "Weeks 3–4", title: "Deep Work Architecture" },
      { label: "Weeks 5–6", title: "Decision Quality & Cognitive Load" },
      { label: "Weeks 7–8", title: "Stress Calibration & Recovery" },
      { label: "Weeks 9–10", title: "Integration & Long-Game Architecture" },
    ],
    commitments: [
      "Track your performance metrics every day using the dashboard",
      "Implement protocols immediately — do not accumulate theory without application",
      "Bring your hardest performance challenges to the live Q&A sessions",
      "Report your results — data is how we calibrate and improve",
    ],
    personalNote: "You have invested in a measurable outcome. I hold myself to the same standard: if you do the work and the protocols don't produce results, the guarantee is real. Let's build something that makes that guarantee irrelevant. — Kai",
    accessDetails: [
      { label: "Sessions", value: "Wednesdays · Time in welcome email" },
      { label: "Platform", value: "Zoom" },
      { label: "Dashboard", value: "Setup guide in welcome email" },
      { label: "Recordings", value: "Available within 12 hours" },
      { label: "Support", value: "ops@kaimercer.io" },
    ],
  },
  abundance: {
    headline: "Welcome to Quantum Business Expansion.",
    subheadline: "Your enrolment is confirmed. The field is already responding.",
    nextSteps: [
      { step: "1", title: "Check your inbox", description: "Your welcome email with the sisterhood community invite and wealth frequency audit is arriving now." },
      { step: "2", title: "Complete the wealth frequency audit", description: "Your first step is in the welcome email. Complete it today and share your results in the community — it begins the group field." },
      { step: "3", title: "Begin the receivership practice", description: "Your daily receivership practice is also in the welcome email. Begin it tonight. The field opens fastest when you begin immediately." },
      { step: "4", title: "Mark your Friday afternoons", description: "Sessions are every Friday. The time and Zoom link are in your welcome email." },
    ],
    schedule: [
      { label: "Week 1", title: "Mapping Your Abundance Field" },
      { label: "Week 2", title: "The Clearing" },
      { label: "Week 3", title: "Worth, Pricing & Permission" },
      { label: "Week 4", title: "Aligned Marketing" },
      { label: "Week 5", title: "Sacred Sales" },
      { label: "Week 6", title: "Quantum Offer Design" },
      { label: "Week 7", title: "Sustainable Receivership" },
      { label: "Week 8", title: "Your Abundant Business Architecture" },
      { label: "Week 9", title: "Integration & Expansion" },
    ],
    commitments: [
      "Do the daily receivership practice — it is the foundation everything else builds on",
      "Be fully present at the live sessions — the group field is part of the medicine",
      "Implement the strategy as the energy opens — do not wait until you feel 'ready'",
      "Celebrate every win in the community, however small — receivership is a practice",
    ],
    personalNote: "I have seen what happens when a woman truly opens to receiving — in her business, in her body, in her life. It is extraordinary and it is available to you. I believe in what is about to happen for you with complete certainty. Welcome, love. — Zoe",
    accessDetails: [
      { label: "Sessions", value: "Fridays · Time in welcome email" },
      { label: "Platform", value: "Zoom" },
      { label: "Sisterhood", value: "Private portal — link in email" },
      { label: "Recordings", value: "Available within 24 hours" },
      { label: "Support", value: "hello@zoetanaka.com" },
    ],
  },
  earth: {
    headline: "Welcome to the Ancestral Wisdom Path.",
    subheadline: "Your enrolment is confirmed. The circle is forming.",
    nextSteps: [
      { step: "1", title: "Check your inbox", description: "Your welcome email with the sacred community invite and ceremonial preparation guide is arriving now." },
      { step: "2", title: "Set up your altar", description: "Your altar preparation guide is in the welcome email. Set up a simple altar space before Week 1 — this is your ceremonial anchor for the twelve weeks." },
      { step: "3", title: "Begin going outside", description: "Your first practice is simple: spend fifteen minutes outside, barefoot if possible, every day. Begin today. The earth is already preparing to receive you." },
      { step: "4", title: "Mark your Saturday mornings", description: "Ceremonial sessions are every Saturday morning. The time and Zoom link are in your welcome email. Protect this time completely." },
    ],
    schedule: [
      { label: "Weeks 1–2", title: "Opening the Line" },
      { label: "Weeks 3–4", title: "The Gifts in the Wound" },
      { label: "Weeks 5–6", title: "Earth Medicine" },
      { label: "Weeks 7–8", title: "The Healing Ceremony" },
      { label: "Weeks 9–10", title: "Reclaiming the Gifts" },
      { label: "Weeks 11–12", title: "The Living Practice" },
    ],
    commitments: [
      "Tend your altar daily — even a moment of acknowledgment is ceremony",
      "Spend time outside every day — the earth is your co-facilitator in this work",
      "Show up for the live ceremonies with full presence — this is sacred space",
      "Receive the medicine that comes — it will not always look like what you expected",
    ],
    personalNote: "The ancestors who loved you through the ages are already gathering for this circle. What is about to happen in your lineage — in your body, in your life — is real and it is lasting. I am honoured to walk this path with you. — River",
    accessDetails: [
      { label: "Ceremonies", value: "Saturdays · Time in welcome email" },
      { label: "Platform", value: "Zoom" },
      { label: "Sacred circle", value: "Private portal — link in email" },
      { label: "Recordings", value: "Available within 24 hours" },
      { label: "Support", value: "circle@riverstone.earth" },
    ],
  },
};

function s(theme: ThemeConfig) {
  return {
    page: { background: theme.colors.canvas, color: theme.colors.text, fontFamily: theme.fonts.bodyFamily } as React.CSSProperties,
    displayFont: { fontFamily: theme.fonts.displayFamily } as React.CSSProperties,
    darkBg: { background: theme.colors.dark, color: "#fff" } as React.CSSProperties,
  };
}

export default async function ProgramThankYouPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const styles = s(theme);
  const copy = PROGRAM_TY_COPY[themeSlug];

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={{ ...styles.darkBg, padding: "80px 40px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: theme.colors.highlight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 24px", color: theme.colors.dark }}>
          ✓
        </div>
        <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: theme.colors.highlight, marginBottom: "16px" }}>
          Enrolment confirmed
        </p>
        <h1 style={{ ...styles.displayFont, fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, marginBottom: "16px", lineHeight: 1.15 }}>
          {copy.headline}
        </h1>
        <p style={{ opacity: 0.7, fontSize: "1.1rem" }}>{copy.subheadline}</p>
      </section>

      {/* NEXT STEPS */}
      <section style={{ padding: "72px 40px", maxWidth: "760px", margin: "0 auto" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "1.8rem", fontWeight: 700, marginBottom: "40px", textAlign: "center" }}>
          What happens now
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {copy.nextSteps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: theme.colors.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0, fontFamily: theme.fonts.displayFamily }}>
                {step.step}
              </div>
              <div>
                <h3 style={{ ...styles.displayFont, fontWeight: 700, marginBottom: "6px" }}>{step.title}</h3>
                <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.65 }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SCHEDULE */}
      <section style={{ background: `${theme.colors.accent}08`, borderTop: `1px solid ${theme.colors.accent}15`, borderBottom: `1px solid ${theme.colors.accent}15`, padding: "60px 40px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ ...styles.displayFont, fontSize: "1.5rem", fontWeight: 700, marginBottom: "32px", textAlign: "center" }}>
            Programme schedule
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {copy.schedule.map((item, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: "12px", padding: "16px 20px", display: "flex", gap: "14px", alignItems: "center", border: `1px solid ${theme.colors.accent}15` }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: theme.colors.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: theme.colors.accent, fontWeight: 600, marginBottom: "2px" }}>{item.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMITMENTS */}
      <section style={{ padding: "60px 40px", maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "1.4rem", fontWeight: 700, marginBottom: "24px" }}>
          Your commitment
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
          {copy.commitments.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{ color: theme.colors.accent, fontWeight: 700, fontSize: "16px", flexShrink: 0, marginTop: "2px" }}>→</span>
              <p style={{ margin: 0, lineHeight: 1.55 }}>{c}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PERSONAL NOTE */}
      <section style={{ ...styles.darkBg, padding: "72px 40px", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: theme.colors.accent, margin: "0 auto 24px" }} />
        <blockquote style={{ ...styles.displayFont, fontSize: "1.15rem", fontStyle: "italic", lineHeight: 1.75, maxWidth: "620px", margin: "0 auto 24px", opacity: 0.9 }}>
          "{copy.personalNote}"
        </blockquote>
      </section>

      {/* ACCESS CARD */}
      <section style={{ padding: "60px 40px", maxWidth: "680px", margin: "0 auto" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "1.4rem", fontWeight: 700, marginBottom: "24px" }}>
          Your access details
        </h2>
        <div style={{ background: theme.colors.dark, color: "#fff", borderRadius: "16px", padding: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {copy.accessDetails.map((d) => (
              <div key={d.label}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.colors.highlight, marginBottom: "6px" }}>
                  {d.label}
                </div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ ...styles.darkBg, padding: "24px 40px", textAlign: "center", fontSize: "12px", opacity: 0.4 }}>
        © {new Date().getFullYear()} {theme.host.legalEntity}
      </footer>
    </main>
  );
}
