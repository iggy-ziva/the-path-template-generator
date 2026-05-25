"use client";
import { useState } from "react";
import type { WizardData } from "@/lib/wizard-types";
import { Section, UrlListInput } from "../WizardField";

const Z = {
  cream: "#FCFAF6", creamMid: "#FCF8EF", creamDeep: "#F5EEE0",
  charcoal: "#2E2E2E", muted: "#8A7A6A", faint: "#C8B8A4",
  pink: "#FF007E", coral: "#FA2A45", white: "#FFFFFF",
  font: 'var(--font-barlow), -apple-system, sans-serif',
};

const fieldStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", background: Z.white,
  border: `1.5px solid ${Z.creamDeep}`, borderRadius: 8,
  color: Z.charcoal, fontSize: 13, fontFamily: Z.font,
  outline: "none", boxSizing: "border-box",
};

type PressEntry = { name: string; websiteUrl: string; logoUrl?: string; textFallback?: boolean; transparentBg?: boolean };

function extractDomain(url: string): string {
  try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

function PressLogoRow({
  entry,
  index,
  onUpdate,
  onRemove,
}: {
  entry: PressEntry;
  index: number;
  onUpdate: (patch: Partial<PressEntry>) => void;
  onRemove: () => void;
}) {
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [darkPreview, setDarkPreview] = useState(false);

  async function handleFetch() {
    if (!entry.websiteUrl) return;
    setFetching(true);
    setFetchError("");
    try {
      const res = await fetch("/api/wizard/fetch-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: entry.websiteUrl, name: entry.name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch logo");
      onUpdate({ logoUrl: json.logoUrl ?? "", textFallback: json.textFallback ?? false, transparentBg: json.transparentBg ?? false });
      if (json.transparentBg) setDarkPreview(true);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch logo");
    } finally {
      setFetching(false);
    }
  }

  return (
    <div style={{
      background: Z.creamMid, border: `1.5px solid ${Z.creamDeep}`,
      borderRadius: 12, padding: "14px 16px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: Z.muted }}>
          Mention {index + 1}{entry.name ? ` · ${entry.name}` : ""}
        </span>
        <button type="button" onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: Z.faint, fontSize: 18, lineHeight: 1, padding: "0 2px" }}>×</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <p style={{ fontFamily: Z.font, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 5 }}>Publication / outlet name</p>
          <input
            value={entry.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. mindbodygreen"
            style={fieldStyle}
            onFocus={(e) => { e.target.style.borderColor = Z.pink; }}
            onBlur={(e) => { e.target.style.borderColor = Z.creamDeep; }}
          />
        </div>
        <div>
          <p style={{ fontFamily: Z.font, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 5 }}>Website URL</p>
          <input
            type="url"
            value={entry.websiteUrl}
            onChange={(e) => onUpdate({ websiteUrl: e.target.value })}
            placeholder="https://mindbodygreen.com"
            style={fieldStyle}
            onFocus={(e) => { e.target.style.borderColor = Z.pink; }}
            onBlur={(e) => { e.target.style.borderColor = Z.creamDeep; }}
          />
        </div>
      </div>

      {/* Logo row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {entry.logoUrl ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Preview swatch with toggle */}
              <div style={{
                width: 120, height: 48, borderRadius: 8,
                background: darkPreview ? Z.charcoal : Z.white,
                border: `1px solid ${Z.creamDeep}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 8, flexShrink: 0, transition: "background 0.2s",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.logoUrl} alt={entry.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
              <button
                type="button"
                onClick={() => setDarkPreview((v) => !v)}
                style={{ fontFamily: Z.font, fontSize: 11, color: Z.muted, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
              >
                {darkPreview ? "☀ Light preview" : "☾ Dark preview"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {entry.transparentBg && (
                <div style={{ padding: "8px 12px", background: "#FFF8E6", border: "1.5px solid #F0C040", borderRadius: 8, maxWidth: 380 }}>
                  <p style={{ fontFamily: Z.font, fontSize: 12, color: "#8A6800", fontWeight: 600, marginBottom: 2 }}>
                    ⚠ This logo has a transparent background with likely white or light-coloured text.
                  </p>
                  <p style={{ fontFamily: Z.font, fontSize: 12, color: "#8A6800", lineHeight: 1.5 }}>
                    It may appear blank on light backgrounds — use the dark preview to confirm. Don&apos;t worry: the AI will recolourise it to match your brand palette when generating your funnel.
                  </p>
                </div>
              )}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button type="button" onClick={handleFetch} disabled={!entry.websiteUrl || fetching} style={{ fontFamily: Z.font, fontSize: 12, color: Z.muted, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                  {fetching ? "Fetching…" : "Re-fetch logo"}
                </button>
                <button type="button" onClick={() => onUpdate({ logoUrl: "", textFallback: false, transparentBg: false })} style={{ fontFamily: Z.font, fontSize: 12, color: Z.coral, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                  Remove logo
                </button>
              </div>
            </div>
          </>
        ) : entry.textFallback ? (
          <>
            {/* Text badge preview */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                padding: "5px 14px", borderRadius: 6,
                border: `1.5px solid ${Z.creamDeep}`, background: Z.white,
                fontFamily: Z.font, fontSize: 13, fontWeight: 700, color: Z.charcoal,
                letterSpacing: "0.02em",
              }}>
                {entry.name || extractDomain(entry.websiteUrl)}
              </span>
              <span style={{ fontFamily: Z.font, fontSize: 12, color: "#3D6B30", fontWeight: 600 }}>
                ✓ No logo found — don&apos;t worry, we&apos;ll display a styled text badge in your funnel instead.
              </span>
            </div>
            <button type="button" onClick={handleFetch} disabled={!entry.websiteUrl || fetching} style={{ fontFamily: Z.font, fontSize: 12, color: Z.muted, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              {fetching ? "Fetching…" : "Try again"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleFetch}
            disabled={!entry.websiteUrl || fetching}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8,
              background: entry.websiteUrl ? Z.white : Z.creamDeep,
              border: `1.5px solid ${entry.websiteUrl ? Z.pink : Z.faint}`,
              color: entry.websiteUrl ? Z.pink : Z.faint,
              fontFamily: Z.font, fontSize: 12, fontWeight: 600,
              cursor: entry.websiteUrl && !fetching ? "pointer" : "not-allowed",
              opacity: fetching ? 0.7 : 1,
              transition: "all 0.15s",
            }}
          >
            {fetching ? "Fetching logo…" : "↓ Auto-fetch logo"}
          </button>
        )}
        {fetchError && <span style={{ fontFamily: Z.font, fontSize: 12, color: Z.coral }}>{fetchError}</span>}
      </div>
    </div>
  );
}

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step8({ data, onChange }: Props) {
  const testimonials = data.testimonials ?? [];

  function updateTestimonial(
    index: number,
    field: "quote" | "name" | "location" | "context",
    value: string
  ) {
    const next = [...testimonials];
    next[index] = { ...next[index], [field]: value };
    onChange({ testimonials: next });
  }

  function addTestimonial() {
    onChange({ testimonials: [...testimonials, { quote: "", name: "", location: "", context: "" }] });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    background: "#0f0e0c",
    border: "1px solid #2a2926",
    borderRadius: "8px",
    color: "#f5f1ea",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "32px", lineHeight: 1.6 }}>
        Add at least 3 testimonials for the best results. These appear in the landing page, programme LP, and replay page. The AI will use the language and specific details to make testimonial sections feel authentic.
      </p>

      <Section title="Text testimonials">
        {testimonials.map((t, i) => (
          <div key={i} style={{ background: "#1a1917", border: "1px solid #2a2926", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#D4A878" }}>Testimonial {i + 1}</span>
              <button onClick={() => onChange({ testimonials: testimonials.filter((_, idx) => idx !== i) })} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              <textarea value={t.quote} onChange={(e) => updateTestimonial(i, "quote", e.target.value)} placeholder="The testimonial quote — the more specific and vivid, the better" rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input value={t.name} onChange={(e) => updateTestimonial(i, "name", e.target.value)} placeholder="First name & last initial (e.g. Sarah T.)" style={inputStyle} />
                <input value={t.location} onChange={(e) => updateTestimonial(i, "location", e.target.value)} placeholder="City, Country" style={inputStyle} />
              </div>
              <input value={t.context ?? ""} onChange={(e) => updateTestimonial(i, "context", e.target.value)} placeholder="Context (optional): e.g. 'Cohort 3, Soul Contract Mastery'" style={inputStyle} />
            </div>
          </div>
        ))}
        <button onClick={addTestimonial} style={{ padding: "12px 20px", background: "none", border: "1px dashed #2a2926", borderRadius: "10px", color: "#D4A878", cursor: "pointer", fontSize: "14px", fontWeight: 600, width: "100%" }}>
          + Add testimonial
        </button>
      </Section>

      <Section title="Video testimonials (optional)">
        <UrlListInput
          label="Video testimonial URLs"
          hint="Links to YouTube, Vimeo, or Loom — the AI will reference these in the replay page and programme LP video sections"
          value={data.videoTestimonialUrls ?? []}
          onChange={(urls) => onChange({ videoTestimonialUrls: urls })}
          placeholder="https://youtube.com/watch?v=..."
        />
      </Section>

      <Section title="Press and media mentions (optional)">
        <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, marginBottom: 16, lineHeight: 1.6 }}>
          Add each publication, podcast or media outlet. Paste their website URL and click <strong>Auto-fetch logo</strong> — we&apos;ll download it and store it for the &lsquo;As seen in&rsquo; section of your event page.
        </p>

        {(data.pressLogos ?? []).map((entry, i) => (
          <PressLogoRow
            key={i}
            entry={entry}
            index={i}
            onUpdate={(patch) => {
              const next = [...(data.pressLogos ?? [])];
              next[i] = { ...next[i], ...patch };
              onChange({ pressLogos: next });
            }}
            onRemove={() => onChange({ pressLogos: (data.pressLogos ?? []).filter((_, idx) => idx !== i) })}
          />
        ))}

        <button
          type="button"
          onClick={() => onChange({ pressLogos: [...(data.pressLogos ?? []), { name: "", websiteUrl: "", logoUrl: "" }] })}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", background: Z.white,
            border: `1.5px dashed ${Z.faint}`, borderRadius: 10,
            fontFamily: Z.font, fontSize: 13, fontWeight: 600,
            color: Z.muted, cursor: "pointer", transition: "border-color 0.15s, color 0.15s",
            marginTop: (data.pressLogos ?? []).length > 0 ? 4 : 0,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = Z.pink; (e.currentTarget as HTMLButtonElement).style.color = Z.pink; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = Z.faint; (e.currentTarget as HTMLButtonElement).style.color = Z.muted; }}
        >
          + Add press mention
        </button>
      </Section>
    </div>
  );
}
