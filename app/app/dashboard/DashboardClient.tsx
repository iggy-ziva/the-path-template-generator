"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PAGE_LABELS: Record<string, string> = {
  landing: "Event Landing Page",
  checkout: "Event Checkout",
  upsell: "Post-Checkout Upsell",
  thankYou: "Event Thank-You",
  replay: "Replay Page",
  program: "Programme Landing Page",
  programCheckout: "Programme Checkout",
  programThankYou: "Programme Thank-You",
};

interface FunnelData {
  id: string;
  content: Record<string, Record<string, unknown>>;
  theme_slug: string | null;
  created_at: string;
}

interface Props {
  funnelData: FunnelData | null;
  allFunnels: { id: string; created_at: string; theme_slug: string | null }[];
  userEmail: string;
}

function PagePreview({ pageKey, content }: { pageKey: string; content: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ background: "#1a1917", borderRadius: "14px", padding: "28px", border: "1px solid #2a2926" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontWeight: 700, fontSize: "1rem" }}>{PAGE_LABELS[pageKey] ?? pageKey}</h2>
        <button
          onClick={copyJson}
          style={{ padding: "6px 14px", background: "none", border: "1px solid #2a2926", borderRadius: "8px", color: copied ? "#4ade80" : "#888", cursor: "pointer", fontSize: "12px" }}
        >
          {copied ? "✓ Copied" : "Copy JSON"}
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {Object.entries(content).map(([key, value]) => {
          if (Array.isArray(value)) {
            return (
              <div key={key}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", marginBottom: "8px" }}>{key}</div>
                {(value as unknown[]).map((item, i) => (
                  <div key={i} style={{ background: "#0f0e0c", borderRadius: "8px", padding: "10px 14px", marginBottom: "6px", fontSize: "13px", lineHeight: 1.55, color: "#aaa" }}>
                    {typeof item === "object" ? JSON.stringify(item) : String(item)}
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div key={key}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", marginBottom: "6px" }}>{key}</div>
              <div style={{ background: "#0f0e0c", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", lineHeight: 1.6, color: "#f5f1ea" }}>
                {typeof value === "number" ? `$${value}` : String(value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardClient({ funnelData, allFunnels, userEmail }: Props) {
  const [activePageKey, setActivePageKey] = useState<string>("landing");
  const [regenerating, setRegenerating] = useState(false);
  const router = useRouter();

  const pageKeys = funnelData ? Object.keys(funnelData.content) : [];
  const activeContent = funnelData?.content[activePageKey];

  function copyAllJson() {
    if (!funnelData) return;
    navigator.clipboard.writeText(JSON.stringify(funnelData.content, null, 2));
  }

  if (!funnelData && allFunnels.length === 0) {
    return (
      <div style={{ padding: "80px 40px", textAlign: "center", maxWidth: "520px", margin: "0 auto" }}>
        <div style={{ fontSize: "48px", marginBottom: "24px" }}>✨</div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "12px" }}>No funnels yet</h1>
        <p style={{ color: "#888", marginBottom: "32px", lineHeight: 1.6 }}>
          Complete the customisation wizard to generate your first AI-written funnel.
        </p>
        <Link
          href="/app/wizard"
          style={{ display: "inline-block", background: "#D4A878", color: "#0f0e0c", padding: "14px 32px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "15px" }}
        >
          Open the wizard →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "calc(100vh - 56px)" }}>
      {/* SIDEBAR */}
      <aside style={{ borderRight: "1px solid #1a1917", padding: "32px 20px", overflowY: "auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", marginBottom: "12px" }}>
            Your funnels
          </p>
          {allFunnels.map((f, i) => (
            <Link
              key={f.id}
              href={`/app/dashboard?funnel=${f.id}`}
              style={{
                display: "block",
                padding: "10px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                background: f.id === funnelData?.id ? "#1a1917" : "transparent",
                color: f.id === funnelData?.id ? "#f5f1ea" : "#666",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              <div style={{ fontWeight: 600 }}>Funnel {allFunnels.length - i}</div>
              <div style={{ fontSize: "11px", marginTop: "2px" }}>
                {new Date(f.created_at).toLocaleDateString()}
                {f.theme_slug && ` · ${f.theme_slug}`}
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/app/wizard"
          style={{ display: "block", padding: "10px 14px", borderRadius: "8px", background: "#D4A87820", color: "#D4A878", textDecoration: "none", fontSize: "13px", fontWeight: 700, textAlign: "center" }}
        >
          + Generate new funnel
        </Link>

        {funnelData && (
          <>
            <div style={{ height: "1px", background: "#1a1917", margin: "24px 0" }} />
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", marginBottom: "12px" }}>
              Pages
            </p>
            {pageKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActivePageKey(key)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: key === activePageKey ? "#D4A87820" : "transparent",
                  color: key === activePageKey ? "#D4A878" : "#666",
                  fontSize: "13px",
                  cursor: "pointer",
                  marginBottom: "2px",
                  fontWeight: key === activePageKey ? 700 : 400,
                }}
              >
                {PAGE_LABELS[key] ?? key}
              </button>
            ))}
          </>
        )}
      </aside>

      {/* MAIN */}
      <main style={{ padding: "40px", overflowY: "auto" }}>
        {funnelData && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "4px" }}>
                  {PAGE_LABELS[activePageKey] ?? activePageKey}
                </h1>
                <p style={{ fontSize: "13px", color: "#555" }}>
                  Generated {new Date(funnelData.created_at).toLocaleString()}
                  {funnelData.theme_slug && ` · Reference style: ${funnelData.theme_slug}`}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={copyAllJson}
                  style={{ padding: "10px 18px", background: "none", border: "1px solid #2a2926", borderRadius: "10px", color: "#888", cursor: "pointer", fontSize: "13px" }}
                >
                  Copy all JSON
                </button>
                <Link
                  href="/app/wizard"
                  style={{ padding: "10px 18px", background: "#D4A878", color: "#0f0e0c", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "13px" }}
                >
                  Edit & regenerate
                </Link>
              </div>
            </div>

            {activeContent && (
              <PagePreview pageKey={activePageKey} content={activeContent as Record<string, unknown>} />
            )}

            {/* NEXT STEPS CARD */}
            <div style={{ marginTop: "32px", background: "#1a1917", borderRadius: "14px", padding: "28px", border: "1px solid #D4A87830" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4A878", marginBottom: "16px" }}>
                What to do with this
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                {[
                  { n: "1", title: "Copy the JSON", desc: "Use the 'Copy all JSON' button to grab the complete output for your developer or page builder." },
                  { n: "2", title: "Reference a theme", desc: "Browse the themed demos to choose fonts, colours, and layout as a visual starting point." },
                  { n: "3", title: "Regenerate pages", desc: "Not happy with a specific page? Go back to the wizard, adjust your inputs, and regenerate." },
                ].map((s) => (
                  <div key={s.n} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#D4A878", color: "#0f0e0c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px", flexShrink: 0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: "4px", fontSize: "14px" }}>{s.title}</div>
                      <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
