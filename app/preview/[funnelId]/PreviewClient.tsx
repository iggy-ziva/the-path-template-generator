"use client";

import { useState } from "react";
import Link from "next/link";
import DownloadFunnelModal from "@/components/DownloadFunnelModal";

const PAGES = [
  { key: "eventLanding",      label: "Event Landing" },
  { key: "eventCheckout",     label: "Event Checkout" },
  { key: "upsell",            label: "Upsell" },
  { key: "eventThankYou",     label: "Event Thank You" },
  { key: "replay",            label: "Replay" },
  { key: "programmeLanding",  label: "Programme Landing" },
  { key: "programmeCheckout", label: "Programme Checkout" },
  { key: "programmeThankYou", label: "Programme Thank You" },
] as const;

type PageKey = (typeof PAGES)[number]["key"];

interface FunnelContent {
  eventLanding?: { headline?: string; subheadline?: string; heroBodyCopy?: string; benefitBullets?: string[]; ctaText?: string; urgencyLine?: string; aboutHostSnippet?: string };
  eventCheckout?: { headline?: string; valueSummary?: string; guaranteeText?: string };
  upsell?: { headline?: string; subheadline?: string; programmeIntro?: string; benefitBullets?: string[]; ctaText?: string; priceAnchorLine?: string };
  eventThankYou?: { headline?: string; confirmationBody?: string; whatHappensNext?: string[] };
  replay?: { headline?: string; introBody?: string; ctaText?: string };
  programmeLanding?: { headline?: string; subheadline?: string; programmeIntro?: string; benefitBullets?: string[]; curriculumIntro?: string; ctaText?: string; priceStatement?: string };
  programmeCheckout?: { headline?: string; valueSummary?: string; guaranteeText?: string };
  programmeThankYou?: { headline?: string; confirmationBody?: string; whatHappensNext?: string[] };
}

interface Props {
  funnel: { id: string; content: FunnelContent; theme_slug: string | null; created_at: string };
}

export default function PreviewClient({ funnel }: Props) {
  const [activePage, setActivePage] = useState<PageKey>("eventLanding");
  const [showDownload, setShowDownload] = useState(false);

  const content = funnel.content;

  return (
    <div style={{ minHeight: "100vh", background: "#FCFAF6", fontFamily: 'var(--font-barlow), -apple-system, sans-serif' }}>
      {/* Top bar */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#FFFFFF",
        borderBottom: "1px solid #F5EEE0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 56,
        gap: 16,
      }}>
        <Link href="/app/wizard" style={{ display: "flex", alignItems: "center", gap: 8, color: "#8A7A6A", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
          ← Back to wizard
        </Link>

        {/* Page tabs */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", flex: 1, justifyContent: "center" }}>
          {PAGES.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePage(p.key)}
              style={{
                padding: "5px 12px",
                borderRadius: 100,
                border: "none",
                background: activePage === p.key ? "linear-gradient(135deg,#FF007E,#FA2A45)" : "transparent",
                color: activePage === p.key ? "#FFFFFF" : "#2E2E2E",
                fontSize: 11,
                fontWeight: activePage === p.key ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowDownload(true)}
          style={{
            padding: "8px 20px",
            background: "linear-gradient(135deg,#FF007E,#FA2A45)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            letterSpacing: "0.02em",
            boxShadow: "0 2px 12px rgba(255,0,126,0.3)",
          }}
        >
          Download
        </button>
      </div>

      {/* Page preview */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 120px" }}>
        <PagePreview pageKey={activePage} content={content} />
      </div>

      {showDownload && (
        <DownloadFunnelModal
          funnelId={funnel.id}
          onClose={() => setShowDownload(false)}
        />
      )}
    </div>
  );
}

function PagePreview({ pageKey, content }: { pageKey: PageKey; content: FunnelContent }) {
  const C = {
    cream: "#FCFAF6",
    creamDeep: "#F5EEE0",
    charcoal: "#2E2E2E",
    muted: "#8A7A6A",
    pink: "#FF007E",
    coral: "#FA2A45",
    white: "#FFFFFF",
    font: 'var(--font-barlow), -apple-system, sans-serif',
    serif: '"kudryashev-d-contrast", serif',
  };

  function Section({ children }: { children: React.ReactNode }) {
    return <div style={{ marginBottom: 40 }}>{children}</div>;
  }

  function Heading({ text }: { text?: string }) {
    return <h1 style={{ fontFamily: C.serif, fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 400, color: C.charcoal, lineHeight: 1.1, marginBottom: 16 }}>{text ?? ""}</h1>;
  }

  function Sub({ text }: { text?: string }) {
    return <p style={{ fontFamily: C.font, fontSize: 18, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>{text ?? ""}</p>;
  }

  function Body({ text }: { text?: string }) {
    return <p style={{ fontFamily: C.font, fontSize: 15, color: C.charcoal, lineHeight: 1.7, marginBottom: 20 }}>{text ?? ""}</p>;
  }

  function Bullets({ items }: { items?: string[] }) {
    if (!items?.length) return null;
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${C.creamDeep}`, fontFamily: C.font, fontSize: 15, color: C.charcoal, lineHeight: 1.5 }}>
            <span style={{ color: C.pink, fontWeight: 700, flexShrink: 0 }}>→</span>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  function Cta({ text }: { text?: string }) {
    return (
      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <div style={{ display: "inline-block", padding: "16px 40px", background: `linear-gradient(135deg, ${C.pink}, ${C.coral})`, color: C.white, borderRadius: 14, fontFamily: C.font, fontSize: 16, fontWeight: 700, letterSpacing: "0.02em", boxShadow: "0 4px 24px rgba(255,0,126,0.25)" }}>
          {text ?? "Register now →"}
        </div>
      </div>
    );
  }

  function NextSteps({ items }: { items?: string[] }) {
    if (!items?.length) return null;
    return (
      <div style={{ background: C.creamDeep, borderRadius: 16, padding: 28, margin: "24px 0" }}>
        <p style={{ fontFamily: C.font, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 16 }}>What happens next</p>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12, fontFamily: C.font, fontSize: 14, color: C.charcoal, lineHeight: 1.5 }}>
            <span style={{ background: `linear-gradient(135deg, ${C.pink}, ${C.coral})`, color: C.white, borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            {item}
          </div>
        ))}
      </div>
    );
  }

  function Guarantee({ text }: { text?: string }) {
    if (!text) return null;
    return <div style={{ border: `1px solid ${C.creamDeep}`, borderRadius: 12, padding: "16px 20px", fontFamily: C.font, fontSize: 14, color: C.muted, lineHeight: 1.6, margin: "24px 0" }}>🛡 {text}</div>;
  }

  switch (pageKey) {
    case "eventLanding": {
      const p = content.eventLanding ?? {};
      return (<><Section><Heading text={p.headline} /><Sub text={p.subheadline} /><Body text={p.heroBodyCopy} /><Bullets items={p.benefitBullets} /><Cta text={p.ctaText} />{p.urgencyLine && <p style={{ textAlign: "center", fontFamily: C.font, fontSize: 13, color: C.muted, fontStyle: "italic" }}>{p.urgencyLine}</p>}{p.aboutHostSnippet && <div style={{ borderTop: `1px solid ${C.creamDeep}`, paddingTop: 32, marginTop: 32 }}><p style={{ fontFamily: C.font, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>About the host</p><Body text={p.aboutHostSnippet} /></div>}</Section></>);
    }
    case "eventCheckout": {
      const p = content.eventCheckout ?? {};
      return (<><Section><Heading text={p.headline} /><Body text={p.valueSummary} /><Guarantee text={p.guaranteeText} /></Section></>);
    }
    case "upsell": {
      const p = content.upsell ?? {};
      return (<><Section><Heading text={p.headline} /><Sub text={p.subheadline} /><Body text={p.programmeIntro} /><Bullets items={p.benefitBullets} />{p.priceAnchorLine && <p style={{ fontFamily: C.font, fontSize: 15, color: C.muted, fontStyle: "italic", marginBottom: 20 }}>{p.priceAnchorLine}</p>}<Cta text={p.ctaText} /></Section></>);
    }
    case "eventThankYou": {
      const p = content.eventThankYou ?? {};
      return (<><Section><Heading text={p.headline} /><Body text={p.confirmationBody} /><NextSteps items={p.whatHappensNext} /></Section></>);
    }
    case "replay": {
      const p = content.replay ?? {};
      return (<><Section><Heading text={p.headline} /><Body text={p.introBody} /><Cta text={p.ctaText} /></Section></>);
    }
    case "programmeLanding": {
      const p = content.programmeLanding ?? {};
      return (<><Section><Heading text={p.headline} /><Sub text={p.subheadline} /><Body text={p.programmeIntro} /><Bullets items={p.benefitBullets} />{p.curriculumIntro && <Body text={p.curriculumIntro} />}{p.priceStatement && <p style={{ fontFamily: C.font, fontSize: 18, fontWeight: 700, color: C.charcoal, margin: "20px 0" }}>{p.priceStatement}</p>}<Cta text={p.ctaText} /></Section></>);
    }
    case "programmeCheckout": {
      const p = content.programmeCheckout ?? {};
      return (<><Section><Heading text={p.headline} /><Body text={p.valueSummary} /><Guarantee text={p.guaranteeText} /></Section></>);
    }
    case "programmeThankYou": {
      const p = content.programmeThankYou ?? {};
      return (<><Section><Heading text={p.headline} /><Body text={p.confirmationBody} /><NextSteps items={p.whatHappensNext} /></Section></>);
    }
    default:
      return null;
  }
}
