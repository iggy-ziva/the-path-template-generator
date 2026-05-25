"use client";
import { useState, useRef } from "react";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, FileUpload, Grid, Section, MultipleFileUpload } from "../WizardField";

const Z = {
  pink: "#FF007E", coral: "#FA2A45", charcoal: "#2E2E2E", muted: "#8A7A6A",
  faint: "#C8B8A4", creamMid: "#FCF8EF", creamDeep: "#F5EEE0", white: "#FFFFFF",
  font: 'var(--font-barlow), -apple-system, sans-serif',
};

type FontSuggestion = { detected: string; isLikelyPaid: boolean; googleAlternatives: string[] };
type BrandColors = { primary?: string; secondary?: string; tertiary?: string; textLight?: string; textDark?: string; accent?: string };

const COLOR_ROLES: { key: keyof BrandColors; label: string; hint: string }[] = [
  { key: "primary",   label: "Primary",              hint: "Main button & CTA colour" },
  { key: "secondary", label: "Secondary",             hint: "Supporting brand colour" },
  { key: "tertiary",  label: "Tertiary",              hint: "Third accent colour" },
  { key: "textLight", label: "Text on light BG",      hint: "Body copy on white / cream" },
  { key: "textDark",  label: "Text on dark BG",       hint: "Copy on dark sections" },
  { key: "accent",    label: "Link / accent",         hint: "Hyperlinks and highlights" },
];

function ColorSwatch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isSet = value && /^#[0-9a-fA-F]{6}$/i.test(value);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Clickable swatch */}
      <div
        onClick={() => inputRef.current?.click()}
        title="Click to pick colour"
        style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: isSet ? value : Z.creamDeep,
          border: `1.5px solid ${isSet ? "rgba(0,0,0,0.12)" : Z.faint}`,
          cursor: "pointer", position: "relative", overflow: "hidden",
        }}
      >
        {!isSet && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: Z.faint }}>+</span>}
        <input
          ref={inputRef}
          type="color"
          value={isSet ? value : "#FFFFFF"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
        />
      </div>
      {/* Hex input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder="#000000"
        maxLength={7}
        style={{
          width: 90, padding: "8px 10px", background: Z.white,
          border: `1.5px solid ${Z.creamDeep}`, borderRadius: 8,
          fontFamily: "monospace", fontSize: 13, color: Z.charcoal,
          outline: "none", boxSizing: "border-box",
        }}
        onFocus={(e) => { e.target.style.borderColor = Z.pink; }}
        onBlur={(e) => { e.target.style.borderColor = Z.creamDeep; }}
      />
      {isSet && (
        <button type="button" onClick={() => onChange("")} style={{ background: "none", border: "none", cursor: "pointer", color: Z.faint, fontSize: 16, padding: 0, lineHeight: 1 }} title="Clear">×</button>
      )}
    </div>
  );
}

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step2({ data, onChange }: Props) {
  const [analysing, setAnalysing] = useState(false);
  const [analyseError, setAnalyseError] = useState("");
  const [brandUrl, setBrandUrl] = useState(data.styleGuide?.brandAnalysisUrl ?? "");
  const [uploadAnalysing, setUploadAnalysing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAnalyseBrand() {
    const url = brandUrl.trim() || data.websiteUrl;
    if (!url) return;
    setAnalysing(true);
    setAnalyseError("");
    try {
      const res = await fetch("/api/wizard/analyze-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      onChange({ styleGuide: { googleFonts: [], customFonts: [], ...data.styleGuide, ...json, brandAnalysisUrl: url } });
    } catch (err) {
      setAnalyseError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalysing(false);
    }
  }

  async function handleFileAnalysis(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadAnalysing(true);
    setAnalyseError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/wizard/analyze-brand-image", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      onChange({ styleGuide: { googleFonts: [], customFonts: [], ...data.styleGuide, ...json } });
    } catch (err) {
      setAnalyseError(err instanceof Error ? err.message : "File analysis failed");
    } finally {
      setUploadAnalysing(false);
      // Reset so the same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function patchColor(key: keyof BrandColors, val: string) {
    onChange({ styleGuide: {
      googleFonts: [], customFonts: [], ...data.styleGuide,
      brandColors: { ...data.styleGuide?.brandColors, [key]: val },
    }});
  }

  const sg = data.styleGuide;
  const bc = sg?.brandColors ?? {} as BrandColors;
  const hasFontResults = sg && (sg.googleFonts.length || sg.customFonts.length);

  return (
    <div>
      <Section title="Business details">
        <Grid>
          <Field label="Business / practice name" required>
            <TextInput value={data.businessName ?? ""} onChange={(v) => onChange({ businessName: v })} placeholder="e.g. Aria Bloom Wellness" />
          </Field>
          <Field label="Contact email" required hint="Used in footer and support sections">
            <TextInput type="email" value={data.contactEmail ?? ""} onChange={(v) => onChange({ contactEmail: v })} placeholder="hello@yourdomain.com" />
          </Field>
        </Grid>
        <Field label="Legal entity name" hint="Used in FTC disclaimers and footers — e.g. 'Aria Bloom Wellness Ltd'">
          <TextInput value={data.legalEntityName ?? ""} onChange={(v) => onChange({ legalEntityName: v })} placeholder="Your LLC, Ltd or trading name" />
        </Field>
      </Section>

      <Section title="Logo">
        <Field label="Logo file" hint="PNG with transparent background preferred. Used in headers and footers throughout the funnel.">
          <FileUpload label="Upload logo" accept="image/jpeg,image/png,image/webp,image/svg+xml" currentUrl={data.logoUrl} onUpload={(url) => onChange({ logoUrl: url })} />
        </Field>
      </Section>

      <Section title="Online presence">
        <Grid>
          <Field label="Website URL (optional)">
            <TextInput type="url" value={data.websiteUrl ?? ""} onChange={(v) => onChange({ websiteUrl: v })} placeholder="https://yourwebsite.com" />
          </Field>
          <Field label="Instagram URL (optional)">
            <TextInput type="url" value={data.instagramUrl ?? ""} onChange={(v) => onChange({ instagramUrl: v })} placeholder="https://instagram.com/yourhandle" />
          </Field>
          <Field label="Facebook URL (optional)">
            <TextInput type="url" value={data.facebookUrl ?? ""} onChange={(v) => onChange({ facebookUrl: v })} placeholder="https://facebook.com/yourpage" />
          </Field>
          <Field label="TikTok URL (optional)">
            <TextInput type="url" value={data.tiktokUrl ?? ""} onChange={(v) => onChange({ tiktokUrl: v })} placeholder="https://tiktok.com/@yourhandle" />
          </Field>
          <Field label="YouTube URL (optional)">
            <TextInput type="url" value={data.youtubeUrl ?? ""} onChange={(v) => onChange({ youtubeUrl: v })} placeholder="https://youtube.com/@yourchannel" />
          </Field>
          <Field label="LinkedIn URL (optional)">
            <TextInput type="url" value={data.linkedinUrl ?? ""} onChange={(v) => onChange({ linkedinUrl: v })} placeholder="https://linkedin.com/in/yourprofile" />
          </Field>
        </Grid>
      </Section>

      <Section title="Brand style guide">
        <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, marginBottom: 16, lineHeight: 1.6 }}>
          Paste any page from your website and click <strong>Analyse brand</strong> — we&apos;ll detect your colour palette and fonts. You can edit every value after detection.
        </p>

        {/* ── Limitation warning ─────────────────────────────────────────── */}
        <div style={{
          display: "flex", gap: 10, padding: "12px 14px", marginBottom: 20,
          background: "#FFFBEB", border: "1.5px solid #F0C040", borderRadius: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
          <p style={{ fontFamily: Z.font, fontSize: 12, color: "#7A5C00", lineHeight: 1.6, margin: 0 }}>
            Automated colour detection works well for most sites, but results depend on how your website is coded.
            For the most accurate results, <strong>upload your brand style guide (PDF) or a screenshot</strong> showing your brand colours and fonts — our AI will read it directly.
          </p>
        </div>

        {/* ── URL analyser ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 6 }}>Analyse from website URL</p>
            <input
              type="url"
              value={brandUrl}
              onChange={(e) => setBrandUrl(e.target.value)}
              placeholder={data.websiteUrl ?? "https://yourwebsite.com"}
              style={{ width: "100%", padding: "12px 16px", background: Z.white, border: `1.5px solid ${Z.creamDeep}`, borderRadius: 10, color: Z.charcoal, fontSize: 14, fontFamily: Z.font, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => { e.target.style.borderColor = Z.pink; }}
              onBlur={(e) => { e.target.style.borderColor = Z.creamDeep; }}
            />
          </div>
          <button
            type="button"
            onClick={handleAnalyseBrand}
            disabled={analysing || (!brandUrl.trim() && !data.websiteUrl)}
            style={{
              flexShrink: 0, padding: "12px 22px", borderRadius: 10,
              background: `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`,
              border: "none", color: Z.white, fontFamily: Z.font, fontSize: 13, fontWeight: 700,
              cursor: analysing ? "not-allowed" : "pointer",
              opacity: analysing ? 0.7 : 1,
              boxShadow: "0 2px 12px rgba(255,0,126,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            {analysing ? "Analysing…" : "✦ Analyse brand"}
          </button>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: Z.creamDeep }} />
          <span style={{ fontFamily: Z.font, fontSize: 11, color: Z.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>or</span>
          <div style={{ flex: 1, height: 1, background: Z.creamDeep }} />
        </div>

        {/* ── Upload style guide / screenshot ─────────────────────────────── */}
        <div>
          <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 6 }}>Upload style guide or screenshot</p>
          <p style={{ fontFamily: Z.font, fontSize: 12, color: Z.muted, marginBottom: 10, lineHeight: 1.5 }}>
            PNG, JPG, WebP or PDF · max 8 MB · Our AI will read the colours and fonts directly from the file
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
            onChange={handleFileAnalysis}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAnalysing}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 20px", borderRadius: 10,
              background: Z.creamMid, border: `1.5px dashed ${uploadAnalysing ? Z.pink : Z.faint}`,
              color: uploadAnalysing ? Z.pink : Z.charcoal,
              fontFamily: Z.font, fontSize: 13, fontWeight: 600,
              cursor: uploadAnalysing ? "not-allowed" : "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { if (!uploadAnalysing) { (e.currentTarget as HTMLButtonElement).style.borderColor = Z.pink; (e.currentTarget as HTMLButtonElement).style.color = Z.pink; } }}
            onMouseLeave={(e) => { if (!uploadAnalysing) { (e.currentTarget as HTMLButtonElement).style.borderColor = Z.faint; (e.currentTarget as HTMLButtonElement).style.color = Z.charcoal; } }}
          >
            {uploadAnalysing
              ? <><span style={{ display: "inline-block", width: 14, height: 14, border: `2px solid ${Z.pink}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Analysing file…</>
              : <><span style={{ fontSize: 16 }}>📎</span> Upload style guide / screenshot</>
            }
          </button>
        </div>

        {analyseError && <p style={{ fontFamily: Z.font, fontSize: 12, color: Z.coral, marginTop: 10, marginBottom: 0 }}>{analyseError}</p>}

        {/* ── Colour palette ───────────────────────────────────────────────── */}
        <div style={{ marginTop: 24 }}>
          <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 14 }}>Colour palette</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {COLOR_ROLES.map(({ key, label, hint }) => (
              <div key={key} style={{ padding: "12px 14px", background: Z.creamMid, border: `1.5px solid ${Z.creamDeep}`, borderRadius: 10 }}>
                <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, color: Z.charcoal, marginBottom: 2 }}>{label}</p>
                <p style={{ fontFamily: Z.font, fontSize: 11, color: Z.faint, marginBottom: 10 }}>{hint}</p>
                <ColorSwatch
                  value={bc[key] ?? ""}
                  onChange={(v) => patchColor(key, v)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Fonts ────────────────────────────────────────────────────────── */}
        {hasFontResults && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {sg!.googleFonts.length > 0 && (
              <div>
                <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 8 }}>Google fonts detected</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {sg!.googleFonts.map((f) => (
                    <span key={f} style={{ padding: "4px 12px", background: "#E6F4EA", border: "1px solid #A8D5B0", borderRadius: 100, fontFamily: Z.font, fontSize: 12, color: "#2D6A35", fontWeight: 600 }}>✓ {f}</span>
                  ))}
                </div>
              </div>
            )}
            {sg!.customFonts.length > 0 && (
              <div>
                <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 8 }}>Custom / licensed fonts detected</p>
                {sg!.customFonts.map((f) => (
                  <div key={f.detected} style={{ padding: "12px 14px", background: Z.creamMid, border: `1.5px solid ${Z.creamDeep}`, borderRadius: 10, marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontFamily: Z.font, fontSize: 13, fontWeight: 700, color: Z.charcoal }}>{f.detected}</span>
                      {f.isLikelyPaid && <span style={{ padding: "2px 8px", background: "#FFF3CD", border: "1px solid #F0C040", borderRadius: 100, fontFamily: Z.font, fontSize: 11, color: "#8A6800", fontWeight: 600 }}>Likely licensed</span>}
                    </div>
                    {f.googleAlternatives.length > 0 && (
                      <>
                        <p style={{ fontFamily: Z.font, fontSize: 11, color: Z.muted, marginBottom: 6 }}>Suggested Google Font alternatives:</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {f.googleAlternatives.map((alt) => (
                            <span key={alt} style={{ padding: "3px 10px", background: Z.white, border: `1.5px solid ${Z.creamDeep}`, borderRadius: 100, fontFamily: Z.font, fontSize: 12, color: Z.charcoal }}>{alt}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Licensed font upload */}
        <div style={{ marginTop: 20 }}>
          <Field label="Upload licensed font files (optional)" hint="If you hold a valid web embed licence, upload .woff or .woff2 files here. The AI will use these instead of the Google Font alternatives.">
            <MultipleFileUpload
              label="Upload .woff / .woff2 font files"
              accept=".woff,.woff2,font/woff,font/woff2"
              currentUrls={sg?.uploadedFontUrls ?? []}
              onUpload={(urls) => onChange({ styleGuide: { googleFonts: [], customFonts: [], ...sg, uploadedFontUrls: urls } })}
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}
