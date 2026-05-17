import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";

const THANK_YOU_COPY: Record<string, { nextSteps: { step: string; title: string; description: string }[]; personalNote: string }> = {
  sacred: {
    nextSteps: [
      { step: "1", title: "Check your inbox", description: "Your confirmation and Zoom link are on their way to you now. Please check your spam folder if you don't see them within five minutes." },
      { step: "2", title: "Read the preparation guide", description: "Your pre-ceremony guide is attached to your confirmation email. Please read it before the ceremony — it will help you arrive in the right energetic state." },
      { step: "3", title: "Set your intention", description: "In the days before the ceremony, hold a gentle question: 'What does my soul most want me to know right now?' Notice what arises." },
    ],
    personalNote: "I am so glad you said yes to this. The Records have a way of calling the people who are truly ready — and you are clearly one of them. I cannot wait to hold space for you on the day. See you in the field. — Selene",
  },
  executive: {
    nextSteps: [
      { step: "1", title: "Check your inbox", description: "Your confirmation email with the session link and pre-work materials is arriving now. Check your spam folder if it doesn't appear within five minutes." },
      { step: "2", title: "Complete the influence audit", description: "The 12-minute Influence Audit is in your confirmation email. Completing it before the session significantly increases the value you receive." },
      { step: "3", title: "Block your calendar", description: "Protect the session time completely. The highest-ROI insights tend to come in the Q&A — stay for the full duration." },
    ],
    personalNote: "I built this session around one question: what do the best leaders in the world actually do differently? I spent years finding the answer, and I'm going to give it to you in two hours. Come ready to implement. — Marcus",
  },
  wellness: {
    nextSteps: [
      { step: "1", title: "Check your inbox", description: "Your confirmation email and Zoom link are arriving now. If you don't see them within five minutes, please check your spam folder." },
      { step: "2", title: "Download your preparation guide", description: "Your arrival practices are attached to your confirmation email. They are short, gentle, and will make a real difference to how you arrive on the day." },
      { step: "3", title: "Create your space", description: "You'll want a comfortable, private space where you can move if you feel called to. A cushion, a blanket, and a glass of water are all you need." },
    ],
    personalNote: "I'm so glad you're coming. So many people push through without ever being given permission to simply rest — and that is what I hope this intensive can offer you. Arrive exactly as you are. That is always enough. — Aria",
  },
  highperf: {
    nextSteps: [
      { step: "01", title: "Check your inbox", description: "Your session link and pre-work materials are arriving now. Flag the email so it doesn't get buried." },
      { step: "02", title: "Complete the cognitive audit", description: "The 12-minute audit is in your confirmation email. Your results will be referenced during the session — complete it at least 24 hours before." },
      { step: "03", title: "Come ready to implement", description: "This is not a theoretical session. Bring a real performance challenge you want to solve. The more specific, the more useful the session becomes." },
    ],
    personalNote: "The people who get the most from this session are the ones who arrive with a specific problem to solve. Think about what's currently capping your performance. I'll help you design a protocol for it in real time. — Kai",
  },
  abundance: {
    nextSteps: [
      { step: "1", title: "Check your inbox", description: "Your confirmation and Zoom link are arriving now. Check your spam folder if they don't appear within five minutes." },
      { step: "2", title: "Do your arrival meditation", description: "Your pre-session wealth frequency meditation is in your confirmation email. Use it the morning of the activation to prepare your field." },
      { step: "3", title: "Complete your wealth frequency audit", description: "The brief abundance audit is also in your confirmation email. Your answers will inform how Zoe calibrates the group transmission." },
    ],
    personalNote: "I believe you are here because you are genuinely ready for something to shift — not just in your strategy, but in your relationship with receiving. I hold that possibility for you with complete certainty. See you in the field. — Zoe",
  },
  earth: {
    nextSteps: [
      { step: "1", title: "Check your inbox", description: "Your confirmation and Zoom link are arriving now. Please check your spam folder if you don't see them within five minutes." },
      { step: "2", title: "Read your preparation guide", description: "Your ceremonial preparation guide is attached to your confirmation email. It includes how to create your altar space and the ancestral invocation." },
      { step: "3", title: "Spend time outside", description: "In the days before the circle, spend at least fifteen minutes outdoors each day. Touch the earth with your bare feet if you can. This is your preparation." },
    ],
    personalNote: "The ancestors who loved you through the ages are already preparing for this circle. All you need to do is show up, open, and receive. I will hold the space. They will do the rest. — River",
  },
};

function s(theme: ThemeConfig) {
  return {
    page: { background: theme.colors.canvas, color: theme.colors.text, fontFamily: theme.fonts.bodyFamily } as React.CSSProperties,
    displayFont: { fontFamily: theme.fonts.displayFamily } as React.CSSProperties,
    darkBg: { background: theme.colors.dark, color: "#fff" } as React.CSSProperties,
  };
}

export default async function ThankYouPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const styles = s(theme);
  const copy = THANK_YOU_COPY[themeSlug];

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section
        style={{
          ...styles.darkBg,
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: theme.colors.success,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 24px",
          }}
        >
          ✓
        </div>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: theme.colors.highlight,
            marginBottom: "16px",
          }}
        >
          Registration complete
        </p>
        <h1
          style={{
            ...styles.displayFont,
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          You're in. See you at {theme.event.name}.
        </h1>
        <p style={{ opacity: 0.7, fontSize: "1.1rem" }}>
          {theme.event.date} · {theme.event.time} {theme.event.timezone}
        </p>
      </section>

      {/* NEXT STEPS */}
      <section style={{ padding: "72px 40px", maxWidth: "760px", margin: "0 auto" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "1.8rem", fontWeight: 700, marginBottom: "40px", textAlign: "center" }}>
          What happens next
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {copy.nextSteps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: theme.colors.accent,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  flexShrink: 0,
                  fontFamily: theme.fonts.displayFamily,
                }}
              >
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

      {/* EVENT DETAILS */}
      <section
        style={{
          background: `${theme.colors.accent}10`,
          border: `1px solid ${theme.colors.accent}20`,
          padding: "48px 40px",
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ ...styles.displayFont, fontSize: "1.4rem", fontWeight: 700, marginBottom: "28px" }}>
            Event details
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px" }}>
            {[
              { label: "Date", value: theme.event.date },
              { label: "Time", value: `${theme.event.time} ${theme.event.timezone}` },
              { label: "Duration", value: theme.event.duration },
              { label: "Platform", value: theme.event.platform },
              { label: "Host", value: theme.host.name },
              { label: "Support", value: theme.host.email },
            ].map((d) => (
              <div key={d.label}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.colors.accent, marginBottom: "6px" }}>
                  {d.label}
                </div>
                <div style={{ fontWeight: 600 }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERSONAL NOTE */}
      <section style={{ padding: "72px 40px", maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: theme.colors.accent,
            margin: "0 auto 24px",
          }}
        />
        <blockquote
          style={{
            ...styles.displayFont,
            fontSize: "1.15rem",
            fontStyle: "italic",
            lineHeight: 1.7,
            opacity: 0.85,
            marginBottom: "24px",
          }}
        >
          "{copy.personalNote}"
        </blockquote>

        {/* Add to calendar placeholder */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "32px" }}>
          {["Google Calendar", "Apple Calendar", "Outlook"].map((cal) => (
            <a
              key={cal}
              href="#"
              style={{
                padding: "10px 18px",
                border: `1px solid ${theme.colors.accent}40`,
                borderRadius: "8px",
                textDecoration: "none",
                color: theme.colors.accent,
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              + {cal}
            </a>
          ))}
        </div>
      </section>

      {/* PROGRAM TEASER */}
      <section style={{ ...styles.darkBg, padding: "60px 40px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.colors.highlight, marginBottom: "12px" }}>
          While you wait
        </p>
        <h2 style={{ ...styles.displayFont, fontSize: "1.8rem", fontWeight: 700, marginBottom: "12px" }}>
          Ready to go deeper?
        </h2>
        <p style={{ opacity: 0.7, marginBottom: "28px", maxWidth: "480px", margin: "0 auto 28px" }}>
          {theme.program.name} — {theme.program.tagline}
        </p>
        <Link
          href={`/themes/${themeSlug}/program`}
          style={{
            display: "inline-block",
            background: theme.colors.highlight,
            color: theme.colors.dark,
            padding: "14px 32px",
            borderRadius: "100px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          Learn about {theme.program.name} →
        </Link>
      </section>

      <footer style={{ ...styles.darkBg, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px 40px", textAlign: "center", fontSize: "12px", opacity: 0.4 }}>
        © {new Date().getFullYear()} {theme.host.legalEntity}
      </footer>
    </main>
  );
}
