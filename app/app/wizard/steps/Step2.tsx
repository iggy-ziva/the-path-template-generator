"use client";
import { useState, useRef, useEffect } from "react";
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

function AnalysisProgress({ mode }: { mode: "url" | "file" | "figma" }) {
  const messages = mode === "url"
    ? [
        "Fetching your website…",
        "Scanning the page styles…",
        "Detecting your colour palette…",
        "Identifying your fonts…",
        "Putting it all together…",
      ]
    : mode === "figma"
    ? [
        "Opening your Figma file…",
        "Reading colour styles and fills…",
        "Detecting your colour palette…",
        "Identifying your fonts…",
        "Putting it all together…",
      ]
    : [
        "Uploading your file…",
        "Reading your style guide…",
        "Detecting your colour palette…",
        "Identifying your fonts…",
        "Putting it all together…",
      ];

  const [msgIndex, setMsgIndex] = useState(0);
  useEffect(() => {
    setMsgIndex(0);
    const id = setInterval(() => {
      // Advance through messages but hold on the final one until analysis ends.
      setMsgIndex((i) => Math.min(i + 1, messages.length - 1));
    }, 1800);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 18px", marginTop: 16,
        background: Z.creamMid,
        border: `1.5px solid ${Z.creamDeep}`,
        borderRadius: 12,
        animation: "brandFadeIn 280ms ease-out",
      }}
    >
      {/* Dual-ring spinner */}
      <span
        aria-hidden
        style={{
          position: "relative", flexShrink: 0,
          width: 28, height: 28,
        }}
      >
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `3px solid ${Z.creamDeep}`,
        }} />
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: Z.pink,
          borderRightColor: Z.coral,
          animation: "brandSpin 0.7s linear infinite",
        }} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          key={msgIndex}
          style={{
            fontFamily: Z.font, fontSize: 14, fontWeight: 700, color: Z.charcoal,
            margin: 0, animation: "brandFadeIn 320ms ease-out",
          }}
        >
          {messages[msgIndex]}
        </p>
        {/* Indeterminate progress shimmer */}
        <div style={{
          position: "relative", height: 4, marginTop: 8,
          background: Z.creamDeep, borderRadius: 4, overflow: "hidden",
        }}>
          <span style={{
            position: "absolute", top: 0, bottom: 0, width: "40%",
            background: `linear-gradient(90deg, ${Z.pink}, ${Z.coral})`,
            borderRadius: 4,
            animation: "brandSlide 1.3s ease-in-out infinite",
          }} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes brandSpin { to { transform: rotate(360deg); } }
        @keyframes brandFadeIn {
          from { opacity: 0; transform: translateY(-3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes brandSlide {
          0%   { left: -40%; }
          50%  { left: 60%; }
          100% { left: 100%; }
        }
      `}</style>
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

  // ── Figma connection state ──────────────────────────────────────────────
  const [figmaConfigured, setFigmaConfigured] = useState(true);
  const [figmaConnected, setFigmaConnected] = useState(false);
  const [figmaHandle, setFigmaHandle] = useState<string | null>(null);
  const [figmaUrl, setFigmaUrl] = useState(data.styleGuide?.figmaFileUrl ?? "");
  const [figmaAnalysing, setFigmaAnalysing] = useState(false);
  const [figmaNotice, setFigmaNotice] = useState("");

  async function refreshFigmaStatus() {
    try {
      const res = await fetch("/api/figma/status");
      const json = await res.json();
      setFigmaConfigured(Boolean(json.configured));
      setFigmaConnected(Boolean(json.connected));
      setFigmaHandle(json.figmaHandle ?? null);
    } catch {
      /* ignore — treat as not connected */
    }
  }

  useEffect(() => {
    refreshFigmaStatus();
    // Surface the OAuth round-trip result, then clean the URL.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const figma = params.get("figma");
      if (figma === "connected") setFigmaNotice("Figma connected — paste a file link below to analyse it.");
      else if (figma === "error") setFigmaNotice("Couldn't connect Figma. Please try again.");
      else if (figma === "unconfigured") setFigmaNotice("Figma integration isn't configured on this environment.");
      if (figma) {
        params.delete("figma");
        const qs = params.toString();
        window.history.replaceState({}, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
      }
    }
  }, []);

  async function handleAnalyseFigma() {
    const url = figmaUrl.trim();
    if (!url) return;
    setFigmaAnalysing(true);
    setAnalyseError("");
    try {
      const res = await fetch("/api/wizard/analyze-figma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: url }),
      });
      const json = await res.json();
      if (res.status === 428) {
        setFigmaConnected(false);
        throw new Error(json.message ?? "Connect your Figma account first.");
      }
      if (!res.ok) throw new Error(json.error ?? "Figma analysis failed");
      onChange({ styleGuide: { googleFonts: [], customFonts: [], ...data.styleGuide, ...json, figmaFileUrl: url } });
    } catch (err) {
      setAnalyseError(err instanceof Error ? err.message : "Figma analysis failed");
    } finally {
      setFigmaAnalysing(false);
    }
  }

  async function handleDisconnectFigma() {
    try {
      await fetch("/api/figma/status", { method: "DELETE" });
    } finally {
      setFigmaConnected(false);
      setFigmaHandle(null);
    }
  }

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
      // 1. Get a signed upload URL (tiny request — never hits any body-size limit).
      const ext = file.name.split(".").pop() ?? "bin";
      const signRes = await fetch("/api/wizard/signed-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ext }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error ?? "Could not start upload");

      // 2. Upload the file DIRECTLY to Supabase storage, bypassing serverless body limits.
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from(sign.bucket)
        .uploadToSignedUrl(sign.path, sign.token, file);
      if (upErr) throw new Error(upErr.message);

      // 3. Analyse by URL — the server fetches + compresses the file itself.
      const res = await fetch("/api/wizard/analyze-brand-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: sign.publicUrl }),
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
          <Field label="Support / contact email" required hint="Used as a mailto link in footers and the programme access card across all funnel pages">
            <TextInput type="email" value={data.contactEmail ?? ""} onChange={(v) => onChange({ contactEmail: v })} placeholder="hello@yourdomain.com" />
          </Field>
        </Grid>
        <Field label="Legal entity name" hint="Used in FTC disclaimers and footers — e.g. 'Aria Bloom Wellness Ltd'">
          <TextInput value={data.legalEntityName ?? ""} onChange={(v) => onChange({ legalEntityName: v })} placeholder="Your LLC, Ltd or trading name" />
        </Field>
      </Section>

      <Section title="Logo">
        <p style={{ fontSize: 13, color: "#888", marginBottom: 16, marginTop: -8, lineHeight: 1.6 }}>
          Upload a <strong>light</strong> and a <strong>dark</strong> version of your logo. The builder
          automatically uses the light version on dark sections (headers, footers) and the dark version on
          light sections — so your logo always stays legible. If you only have one version, upload it as the
          light logo and it will be used everywhere.
        </p>
        <Grid>
          <Field label="Light logo — for dark backgrounds" hint="A light/white logo that reads on dark headers and footers. PNG, SVG, or WebP with a transparent background required.">
            <FileUpload
              label="Upload light logo"
              accept="image/png,image/webp,image/svg+xml"
              requireTransparency
              currentUrl={data.logoLightUrl}
              onUpload={(url) => onChange({ logoLightUrl: url, logoTransparent: true, logoUrl: url })}
            />
          </Field>
          <Field label="Dark logo — for light backgrounds" hint="A dark logo that reads on light/cream sections. PNG, SVG, or WebP with a transparent background required.">
            <FileUpload
              label="Upload dark logo"
              accept="image/png,image/webp,image/svg+xml"
              requireTransparency
              currentUrl={data.logoDarkUrl}
              onUpload={(url) => onChange({ logoDarkUrl: url, logoTransparent: true, logoUrl: data.logoUrl ?? url })}
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Legal pages">
        <p style={{ fontSize: 13, color: "#888", marginBottom: 16, marginTop: -8 }}>
          These links appear in the footer of every funnel page. If you don&apos;t have these pages yet, leave blank — ZIVA will set them up for you.
        </p>
        <Grid>
          <Field label="Privacy Policy URL (optional)">
            <TextInput type="url" value={data.privacyPolicyUrl ?? ""} onChange={(v) => onChange({ privacyPolicyUrl: v })} placeholder="https://yoursite.com/privacy" />
          </Field>
          <Field label="Terms of Use URL (optional)">
            <TextInput type="url" value={data.termsOfUseUrl ?? ""} onChange={(v) => onChange({ termsOfUseUrl: v })} placeholder="https://yoursite.com/terms" />
          </Field>
        </Grid>
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
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            {analysing
              ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.5)", borderTopColor: Z.white, borderRadius: "50%", animation: "brandSpin 0.7s linear infinite" }} />Analysing…</>
              : "✦ Analyse brand"}
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
            PNG, JPG, WebP (up to 50 MB) or PDF (up to 30 MB) · large, high-res files are fine — our AI reads the colours and fonts directly from the file
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
              ? <><span style={{ display: "inline-block", width: 14, height: 14, border: `2px solid ${Z.pink}`, borderTopColor: "transparent", borderRadius: "50%", animation: "brandSpin 0.7s linear infinite" }} />Analysing file…</>
              : <><span style={{ fontSize: 16 }}>📎</span> Upload style guide / screenshot</>
            }
          </button>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: Z.creamDeep }} />
          <span style={{ fontFamily: Z.font, fontSize: 11, color: Z.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>or</span>
          <div style={{ flex: 1, height: 1, background: Z.creamDeep }} />
        </div>

        {/* ── Analyse a Figma file ────────────────────────────────────────── */}
        <div>
          <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 6 }}>Analyse a Figma file</p>
          <p style={{ fontFamily: Z.font, fontSize: 12, color: Z.muted, marginBottom: 10, lineHeight: 1.5 }}>
            Connect your Figma account, then paste a link to a file or frame — we&apos;ll read your colour styles and fonts directly from the design.
          </p>

          {!figmaConfigured ? (
            <p style={{ fontFamily: Z.font, fontSize: 12, color: Z.faint, margin: 0 }}>
              Figma isn&apos;t available on this environment yet.
            </p>
          ) : !figmaConnected ? (
            <a
              href="/api/figma/oauth/start"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 20px", borderRadius: 10,
                background: Z.charcoal, border: `1.5px solid ${Z.charcoal}`,
                color: Z.white, fontFamily: Z.font, fontSize: 13, fontWeight: 700,
                textDecoration: "none", cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 15 }}>✦</span> Connect Figma
            </a>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: Z.font, fontSize: 12, fontWeight: 600, color: "#2D6A35", background: "#E6F4EA", border: "1px solid #A8D5B0", borderRadius: 100, padding: "4px 12px" }}>
                  ✓ Figma connected{figmaHandle ? ` · ${figmaHandle}` : ""}
                </span>
                <button
                  type="button"
                  onClick={handleDisconnectFigma}
                  style={{ background: "none", border: "none", color: Z.faint, fontFamily: Z.font, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
                >
                  Disconnect
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="url"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    placeholder="https://www.figma.com/design/…"
                    style={{ width: "100%", padding: "12px 16px", background: Z.white, border: `1.5px solid ${Z.creamDeep}`, borderRadius: 10, color: Z.charcoal, fontSize: 14, fontFamily: Z.font, outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => { e.target.style.borderColor = Z.pink; }}
                    onBlur={(e) => { e.target.style.borderColor = Z.creamDeep; }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAnalyseFigma}
                  disabled={figmaAnalysing || !figmaUrl.trim()}
                  style={{
                    flexShrink: 0, padding: "12px 22px", borderRadius: 10,
                    background: `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`,
                    border: "none", color: Z.white, fontFamily: Z.font, fontSize: 13, fontWeight: 700,
                    cursor: figmaAnalysing || !figmaUrl.trim() ? "not-allowed" : "pointer",
                    opacity: figmaAnalysing || !figmaUrl.trim() ? 0.7 : 1,
                    boxShadow: "0 2px 12px rgba(255,0,126,0.2)", whiteSpace: "nowrap",
                    display: "inline-flex", alignItems: "center", gap: 8,
                  }}
                >
                  {figmaAnalysing
                    ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.5)", borderTopColor: Z.white, borderRadius: "50%", animation: "brandSpin 0.7s linear infinite" }} />Analysing…</>
                    : "✦ Analyse Figma"}
                </button>
              </div>
            </>
          )}

          {figmaNotice && <p style={{ fontFamily: Z.font, fontSize: 12, color: Z.muted, marginTop: 10, marginBottom: 0 }}>{figmaNotice}</p>}
        </div>

        {/* ── Live analysis progress ──────────────────────────────────────── */}
        {(analysing || uploadAnalysing || figmaAnalysing) && (
          <AnalysisProgress mode={analysing ? "url" : figmaAnalysing ? "figma" : "file"} />
        )}

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
                {(sg!.fontDisplay || sg!.fontBody) && (
                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {sg!.fontDisplay && (
                      <p style={{ fontFamily: Z.font, fontSize: 12, color: Z.charcoal, margin: 0 }}>
                        <strong>Headlines:</strong> {sg!.fontDisplay}
                      </p>
                    )}
                    {sg!.fontBody && (
                      <p style={{ fontFamily: Z.font, fontSize: 12, color: Z.charcoal, margin: 0 }}>
                        <strong>Body:</strong> {sg!.fontBody}
                      </p>
                    )}
                  </div>
                )}
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
