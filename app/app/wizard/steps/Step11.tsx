"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { WizardData } from "@/lib/wizard-types";
import type { BrandProfile } from "@/lib/brand-profile";
import { computeBrandProfile } from "@/lib/brand-profile";
import { missingRequiredForMode } from "@/lib/wizard-completeness";
import { THEME_LIST_FOR_WIZARD } from "../wizard-constants";

interface ThemeSuggestion {
  slug: string;
  label: string;
  swatch: string;
  descriptor: string;
  reason: string;
  brandProfile?: BrandProfile;
}

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; submissionId?: string | null; }

const Z = {
  gold: "#D4A878",
  dark: "#1a1917",
  darker: "#0f0e0c",
  border: "#2a2926",
  muted: "#9a9390",
  text: "#f5f1ea",
};

/** A clickable generation-mode option shown on the Review step. */
function GenModeOption({
  active,
  disabled,
  title,
  body,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        flex: 1,
        minWidth: 200,
        textAlign: "left",
        padding: "14px 16px",
        borderRadius: 12,
        border: active ? `2px solid ${Z.gold}` : `1px solid ${Z.border}`,
        background: active ? `${Z.gold}14` : Z.darker,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            width: 15,
            height: 15,
            borderRadius: "50%",
            border: `2px solid ${active ? Z.gold : Z.muted}`,
            background: active ? Z.gold : "transparent",
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 700, fontSize: 13.5, color: active ? Z.gold : Z.text }}>{title}</span>
      </div>
      <div style={{ fontSize: 12, color: Z.muted, lineHeight: 1.5 }}>{body}</div>
    </button>
  );
}

/** Returns a UI-visible accent colour for a swatch used as TEXT/border on the
 *  near-black wizard surface. Dark swatches are lightened toward white until
 *  they're legible (fixes low-contrast labels like the Sacred theme's deep
 *  purple). The actual swatch dot still renders the true colour. */
function visibleSwatch(hex: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance < 0.45) {
    // Lighten more aggressively the darker the colour is, so the label keeps a
    // comfortable contrast ratio against the ~#0f0e0c background.
    const amount = luminance < 0.2 ? 0.7 : luminance < 0.32 ? 0.6 : 0.5;
    const mix = (c: number) => Math.round(c + (255 - c) * amount);
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
  }
  return hex;
}

/** Labels for the full brand palette, in display order. */
const BRAND_COLOR_DEFS: { key: string; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "tertiary", label: "Tertiary" },
  { key: "accent", label: "Accent" },
  { key: "textDark", label: "Text dark" },
  { key: "textLight", label: "Text light" },
];

function BrandProfileCard({ profile, colors }: { profile: BrandProfile; colors: { label: string; value: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {colors.length > 0 && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {colors.map((c) => (
            <div key={c.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ width: 28, height: 28, borderRadius: 6, background: c.value, border: `1px solid ${Z.border}`, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: Z.text }}>{c.label}</span>
              <span style={{ fontSize: 9, color: Z.muted, fontFamily: "monospace" }}>{c.value}</span>
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize: 13, color: Z.text, lineHeight: 1.65, margin: 0 }}>{profile.visualMood}</p>
      <p style={{ fontSize: 12, color: Z.muted, lineHeight: 1.6, margin: 0 }}>
        <strong style={{ color: Z.gold }}>Section rhythm:</strong> {profile.sectionRhythm}
      </p>
      <p style={{ fontSize: 12, color: Z.muted, lineHeight: 1.6, margin: 0 }}>
        <strong style={{ color: Z.gold }}>Copy voice:</strong> {profile.copyVoice}
      </p>
    </div>
  );
}

interface ThemeCardProps {
  activeTheme: ThemeSuggestion | { slug: string; label: string; swatch: string; descriptor: string; reason?: string };
  themeSuggestion: ThemeSuggestion | null;
  showOverride: boolean;
  setShowOverride: (v: boolean | ((prev: boolean) => boolean)) => void;
  activeReferenceSlug: string | undefined;
  referenceThemeSource?: "ai" | "user";
  onSelect: (slug: string) => void;
}

function ThemeCard({ activeTheme, themeSuggestion, showOverride, setShowOverride, activeReferenceSlug, referenceThemeSource, onSelect }: ThemeCardProps) {
  const uiColor = visibleSwatch(activeTheme.swatch);
  return (
    <>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        background: Z.darker,
        borderRadius: "12px",
        border: `1px solid ${uiColor}50`,
        marginBottom: showOverride ? "16px" : "0",
      }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: activeTheme.swatch, border: `1px solid ${Z.border}`, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: uiColor, fontSize: "15px" }}>{activeTheme.label}</div>
          <div style={{ fontSize: "12px", color: Z.muted, marginTop: "2px" }}>{activeTheme.descriptor}</div>
        </div>
        {themeSuggestion && !showOverride && referenceThemeSource !== "user" && (
          <div style={{ fontSize: "11px", color: Z.gold, background: `${Z.gold}18`, padding: "4px 10px", borderRadius: "100px", flexShrink: 0 }}>
            AI matched
          </div>
        )}
        {referenceThemeSource === "user" && !showOverride && (
          <div style={{ fontSize: "11px", color: Z.muted, background: `${Z.border}`, padding: "4px 10px", borderRadius: "100px", flexShrink: 0 }}>
            Manual override
          </div>
        )}
      </div>

      {themeSuggestion?.reason && !showOverride && (
        <p style={{ fontSize: "12px", color: Z.muted, lineHeight: 1.6, margin: "10px 0 0" }}>
          {themeSuggestion.reason}
        </p>
      )}

      {showOverride && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {THEME_LIST_FOR_WIZARD.map((t) => {
            const isActive = (activeReferenceSlug ?? themeSuggestion?.slug) === t.slug;
            const pillColor = visibleSwatch(t.swatch);
            return (
              <button
                key={t.slug}
                onClick={() => { onSelect(t.slug); setShowOverride(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  borderRadius: "100px",
                  border: isActive ? `2px solid ${pillColor}` : `1px solid ${Z.border}`,
                  background: isActive ? `${pillColor}22` : Z.darker,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? pillColor : Z.muted,
                  transition: "all 0.1s",
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.swatch, border: `1px solid ${Z.border}`, flexShrink: 0, display: "inline-block" }} />
                {t.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

function ReviewRow({ label, value, missing }: { label: string; value?: string | number | boolean | unknown[]; missing?: boolean }) {
  const isEmpty = value === undefined || value === null || value === "" ||
    (Array.isArray(value) && value.length === 0);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid #2a2926", gap: "16px" }}>
      <span style={{ fontSize: "13px", color: "#a09890", flexShrink: 0, width: "180px" }}>{label}</span>
      {isEmpty ? (
        <span style={{ fontSize: "13px", color: missing ? "#ff8a8a" : "#7a7570", fontStyle: "italic" }}>
          {missing ? "⚠ Required — go back to add" : "Not provided (optional)"}
        </span>
      ) : (
        <span style={{ fontSize: "13px", color: "#f5f1ea", textAlign: "right", maxWidth: "400px", lineHeight: 1.4 }}>
          {Array.isArray(value) ? `${(value as unknown[]).length} item${(value as unknown[]).length !== 1 ? "s" : ""}` : String(value)}
        </span>
      )}
    </div>
  );
}

// Generation steps shown during the animated progress bar
const GEN_STEPS = [
  { label: "Reading your wizard inputs…",                 weight: 4  },
  { label: "Analysing brand colours and typography…",     weight: 5  },
  { label: "Processing uploaded images…",                 weight: 6  },
  { label: "Scanning your existing materials…",           weight: 7  },
  { label: "Building brand context for Claude…",          weight: 6  },
  { label: "Writing event landing page copy…",            weight: 10 },
  { label: "Writing event checkout page…",                weight: 7  },
  { label: "Writing post-checkout upsell page…",          weight: 8  },
  { label: "Writing event thank-you and replay pages…",   weight: 8  },
  { label: "Writing programme landing page…",             weight: 12 },
  { label: "Writing programme checkout…",                 weight: 7  },
  { label: "Writing programme thank-you page…",           weight: 7  },
  { label: "Applying your brand to all 8 pages…",         weight: 6  },
  { label: "Running final quality checks…",               weight: 5  },
  { label: "Packaging your funnel…",                      weight: 6  },
];

// Convert weights to cumulative progress percentages
const STEP_THRESHOLDS = (() => {
  const total = GEN_STEPS.reduce((s, g) => s + g.weight, 0);
  let cum = 0;
  return GEN_STEPS.map((g) => { cum += g.weight; return Math.round((cum / total) * 100); });
})();

const ESTIMATED_SECONDS = 240;

export default function Step11({ data, onChange, submissionId }: Props) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress]     = useState(0);
  const [stepIdx, setStepIdx]       = useState(0);
  const [timeLeft, setTimeLeft]     = useState(ESTIMATED_SECONDS);
  const [error, setError]           = useState("");
  const [themeSuggestion, setThemeSuggestion] = useState<ThemeSuggestion | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [themeLoading, setThemeLoading]       = useState(false);
  const [showOverride, setShowOverride]       = useState(false);
  const progressRef = useRef(0);
  const startRef    = useRef(0);
  const rafRef      = useRef<number | null>(null);
  const router = useRouter();

  const localProfile = useMemo(() => computeBrandProfile(data), [data]);
  const displayProfile = brandProfile ?? data.brandProfile ?? localProfile;

  // Full brand palette (up to 6) — prefer the detected style guide, fall back
  // to the 3 colours carried on the brand profile.
  const brandColorSwatches = useMemo(() => {
    const sg = data.styleGuide?.brandColors as Record<string, string | undefined> | undefined;
    const fallback: Record<string, string | undefined> = {
      primary: displayProfile.brandColors.primary,
      secondary: displayProfile.brandColors.secondary,
      tertiary: displayProfile.brandColors.tertiary,
    };
    const src = sg ?? fallback;
    return BRAND_COLOR_DEFS
      .map((c) => ({ label: c.label, value: src[c.key] }))
      .filter((c): c is { label: string; value: string } => !!c.value);
  }, [data.styleGuide, displayProfile]);

  const generationMode = data.generationMode ?? "ai_copy";
  const hasCopyDoc = !!data.copyDoc;
  // A document is always run through the full AI pipeline (verbatim copy + AI
  // gap-filling + all 8 pages + fresh image reprocessing). The only opt-out is
  // explicitly choosing "Let AI write the copy" to ignore the document.
  const useDocPlusAi = hasCopyDoc && generationMode !== "ai_copy";
  const missing = missingRequiredForMode(data);

  const activeTheme = THEME_LIST_FOR_WIZARD.find((t) => t.slug === data.referenceTheme) ?? themeSuggestion;

  const fetchThemeSuggestion = useCallback(async (force = false) => {
    if (!force && data.referenceThemeSource === "user") {
      setBrandProfile(localProfile);
      return;
    }
    setThemeLoading(true);
    try {
      const res = await fetch("/api/wizard/suggest-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toneDescriptors:        data.toneDescriptors,
          methodologyDescription: data.methodologyDescription,
          uniqueApproach:         data.uniqueApproach,
          transformationPromise:  data.transformationPromise,
          audienceDescription:    data.audienceDescription,
          hostTitle:              data.hostTitle,
          eventName:              data.eventName,
          programName:            data.programName,
          businessName:           data.businessName,
          styleGuide:             data.styleGuide,
          referenceTheme:         data.referenceTheme,
          referenceThemeSource:   data.referenceThemeSource,
        }),
      });
      const suggestion = await res.json() as ThemeSuggestion;
      setThemeSuggestion(suggestion);
      if (suggestion.brandProfile) setBrandProfile(suggestion.brandProfile);
      const profile = suggestion.brandProfile ?? localProfile;
      if (force) {
        onChange({
          referenceTheme: suggestion.slug,
          referenceThemeSource: "ai",
          brandProfile: profile,
        });
      } else if (data.referenceThemeSource !== "user") {
        onChange({
          referenceTheme: suggestion.slug,
          referenceThemeSource: "ai",
          brandProfile: profile,
        });
      }
    } catch {
      setBrandProfile(localProfile);
      if (data.referenceThemeSource !== "user") {
        onChange({
          referenceTheme: localProfile.suggestedThemeSlug,
          referenceThemeSource: "ai",
          brandProfile: localProfile,
        });
      }
    } finally {
      setThemeLoading(false);
    }
  }, [data, localProfile, onChange]);

  useEffect(() => {
    fetchThemeSuggestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate progress up to ~95% while waiting for the real API response
  useEffect(() => {
    if (!generating) return;
    startRef.current = Date.now();

    function tick() {
      const elapsed = (Date.now() - startRef.current) / 1000;
      // Ease towards 95 — never reaches 100 until the API responds
      const target = 95 * (1 - Math.exp(-elapsed / (ESTIMATED_SECONDS * 0.6)));
      const next = Math.min(95, target);
      progressRef.current = next;
      setProgress(Math.round(next));
      setTimeLeft(Math.max(0, Math.round(ESTIMATED_SECONDS - elapsed)));

      // Advance step label when progress crosses the next threshold
      setStepIdx((idx) => {
        let i = idx;
        while (i < STEP_THRESHOLDS.length - 1 && next >= STEP_THRESHOLDS[i]) i++;
        return i;
      });

      if (next < 95) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [generating]);

  async function handleGenerate() {
    if (missing.length > 0) {
      setError(`Please fill in required fields before generating: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setGenerating(true);
    setProgress(0);
    setStepIdx(0);
    setTimeLeft(ESTIMATED_SECONDS);
    setError("");
    try {
      // Always run the full AI pipeline so every generation reprocesses all
      // wizard data (images included). When a document is in play, the server
      // overlays its copy verbatim and AI fills any gaps.
      const res = await fetch("/api/wizard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wizardData: data,
          submissionId,
          ...(useDocPlusAi
            ? { generationMode: "hybrid", copyDocumentId: data.copyDoc?.documentId }
            : {}),
        }),
      });
      if (!res.ok) {
        let message = "Generation failed — please try again";
        try {
          const body = await res.text();
          const json = JSON.parse(body);
          message = json.error ?? message;
        } catch { /* non-JSON error body — keep fallback message */ }
        throw new Error(message);
      }
      const { funnelId } = await res.json();
      // Flash to 100% before navigating
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setProgress(100);
      setStepIdx(GEN_STEPS.length - 1);
      setTimeout(() => router.push(`/app/preview/${funnelId}`), 600);
    } catch (err) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setError(err instanceof Error ? err.message : "Generation failed — please try again");
      setGenerating(false);
      setProgress(0);
    }
  }

  return (
    <div>
      {/* COMPLETION STATUS */}
      <div style={{
        background: missing.length === 0 ? "#0f2818" : "#2a1a0a",
        border: `1px solid ${missing.length === 0 ? "#2a5a38" : "#5a3a0a"}`,
        borderRadius: "12px",
        padding: "20px 24px",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}>
        <span style={{ fontSize: "24px" }}>{missing.length === 0 ? "✅" : "⚠️"}</span>
        <div>
          <div style={{ fontWeight: 700, marginBottom: "4px", color: missing.length === 0 ? "#4ade80" : "#f59e0b" }}>
            {missing.length === 0 ? "Ready to generate" : `${missing.length} required field${missing.length > 1 ? "s" : ""} missing`}
          </div>
          {missing.length > 0 && (
            <div style={{ fontSize: "13px", color: "#b0a898" }}>
              {missing.map((f) => f.label).join(" · ")}
            </div>
          )}
        </div>
      </div>

      {/* GENERATION MODE — choose right here so a regen never silently uses the
          wrong path. Always visible; the doc-based options are disabled until a
          copy document has been uploaded on Step 1. */}
      <div style={{ background: Z.dark, border: `1px solid ${Z.border}`, borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: Z.gold, margin: "0 0 6px" }}>
          How to generate
        </h3>
        <p style={{ fontSize: 12, color: Z.muted, margin: "0 0 16px", lineHeight: 1.5 }}>
          {hasCopyDoc
            ? "You uploaded a copy document. Choose how it's used."
            : "Upload a copy document on Step 1 to unlock the document-based options."}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <GenModeOption
            active={useDocPlusAi}
            disabled={!hasCopyDoc}
            title="Use my copy document + AI"
            body="Your document is the source of truth — its copy is placed verbatim. AI fills any gaps, assigns your latest images, and writes all 8 pages. Reprocesses everything each run. ~1–5 min."
            onClick={() => onChange({ generationMode: "hybrid" })}
          />
          <GenModeOption
            active={!useDocPlusAi}
            disabled={false}
            title="Let AI write the copy"
            body="Ignore the document — Claude writes all 8 pages from your wizard inputs. ~1–5 min."
            onClick={() => onChange({ generationMode: "ai_copy" })}
          />
        </div>
      </div>

      {/* SUMMARY */}
      <div style={{ background: "#1a1917", borderRadius: "16px", padding: "28px", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4A878", marginBottom: "20px" }}>
          Your inputs at a glance
        </h3>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D4A878", marginBottom: "8px" }}>About You</div>
          <ReviewRow label="Name" value={data.hostName} missing={!data.hostName} />
          <ReviewRow label="Title" value={data.hostTitle} />
          <ReviewRow label="Business" value={data.businessName} />
          <ReviewRow label="Headshot" value={data.hostHeadshotUrl || (data.hostHeadshotUrls?.length ?? 0) > 0 ? "Uploaded" : undefined} />
          <ReviewRow label="Facilitators" value={(data.facilitators?.filter(f => f.name || f.bio || f.headshotUrl).length ?? 0) > 0 ? `${data.facilitators!.filter(f => f.name || f.bio || f.headshotUrl).length} added` : undefined} />
          <ReviewRow label="Logo" value={data.logoLightUrl || data.logoDarkUrl || data.logoUrl ? "Uploaded" : undefined} />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D4A878", marginBottom: "8px" }}>Live Event</div>
          <ReviewRow label="Event name" value={data.eventName} missing={!data.eventName} />
          <ReviewRow label="Date & time" value={data.eventDate && data.eventTime ? `${data.eventDate} · ${data.eventTime} ${data.eventTimezone}` : undefined} missing={!data.eventDate} />
          <ReviewRow label="Pricing" value={data.eventPricingModel === "fixed" ? `$${data.eventPriceFixed}` : data.eventPriceMin !== undefined ? `$${data.eventPriceMin}–$${data.eventPriceMax}` : undefined} />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D4A878", marginBottom: "8px" }}>Programme</div>
          <ReviewRow label="Programme name" value={data.programName} missing={!data.programName} />
          <ReviewRow label="Duration" value={data.programDuration} />
          <ReviewRow label="Full price" value={data.programPriceFull ? `$${data.programPriceFull}` : undefined} />
          <ReviewRow label="Curriculum modules" value={data.curriculumWeeks} />
          <ReviewRow label="Bonuses" value={data.bonuses} />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D4A878", marginBottom: "8px" }}>Content & Voice</div>
          <ReviewRow label="Testimonials" value={data.testimonials} />
          <ReviewRow label="Hero images" value={data.heroImageUrls} />
          <ReviewRow label="Uploaded materials" value={data.existingFileUrls} />
          <ReviewRow label="Material URLs" value={data.existingMaterialUrls} />
          <ReviewRow label="Tone descriptors" value={(data.toneDescriptors ?? []).join(" · ") || undefined} />
          <ReviewRow label="Copy voice theme" value={activeTheme?.label} />
        </div>
      </div>

      {/* BRAND PROFILE */}
      <div style={{ background: Z.dark, border: `1px solid ${Z.border}`, borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: Z.gold, margin: 0 }}>
            Brand Profile
          </h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {!themeLoading && (
              <button
                type="button"
                onClick={() => fetchThemeSuggestion(true)}
                style={{ fontSize: "12px", color: Z.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Refresh suggestion
              </button>
            )}
            {!themeLoading && activeTheme && (
              <button
                type="button"
                onClick={() => setShowOverride((v) => !v)}
                style={{ fontSize: "12px", color: Z.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                {showOverride ? "Hide override" : "Override copy theme"}
              </button>
            )}
          </div>
        </div>

        <p style={{ fontSize: 12, color: Z.muted, margin: "0 0 16px", lineHeight: 1.5 }}>
          Visual colours come from your Step 2 brand analysis. This profile calibrates copy voice and section rhythm for generation.
        </p>

        {themeLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: Z.muted, fontSize: "13px" }}>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
            Analysing your brand colours, tone, and context…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            <BrandProfileCard profile={displayProfile} colors={brandColorSwatches} />

            {activeTheme && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${Z.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: Z.muted, marginBottom: 12 }}>
                  Copy style anchor
                </div>
                <ThemeCard
                  activeTheme={activeTheme}
                  themeSuggestion={themeSuggestion}
                  showOverride={showOverride}
                  setShowOverride={setShowOverride}
                  activeReferenceSlug={data.referenceTheme}
                  referenceThemeSource={data.referenceThemeSource}
                  onSelect={(slug) => onChange({ referenceTheme: slug, referenceThemeSource: "user" })}
                />
              </div>
            )}
          </>
        )}
      </div>

      {useDocPlusAi && (
        <div style={{ background: "#0f2818", border: "1px solid #2a5a38", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", fontSize: 13, color: "#bfe8cc", lineHeight: 1.6 }}>
          <strong style={{ color: "#4ade80" }}>Document + AI.</strong> Your copy stays verbatim from{" "}
          <strong>{data.copyDoc?.fileName ?? "your uploaded document"}</strong>. Every run reprocesses all your wizard data — AI assigns your latest images, fills any copy gaps the document didn&apos;t cover, and writes all 8 funnel pages. Expect ~1–5 minutes.
        </div>
      )}

      {/* WHAT CLAUDE WILL WRITE */}
      <div style={{ background: "#1a1917", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4A878", marginBottom: "16px" }}>
          Claude will generate
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          {[
            "Event landing page",
            "Event checkout",
            "Post-checkout upsell",
            "Event thank-you page",
            "Replay page",
            "Programme landing page",
            "Programme checkout",
            "Programme thank-you",
          ].map((page, i) => (
            <div key={page} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#0f0e0c", borderRadius: "8px" }}>
              <span style={{ color: "#D4A878", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>0{i + 1}</span>
              <span style={{ fontSize: "13px", color: "#c8c0b4" }}>{page}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#9a9390", marginTop: "16px", lineHeight: 1.5 }}>
          Generation typically takes 60–90 seconds. Claude reads your bio, materials, testimonials, and tone preferences before writing — the output will sound like you, not a generic template.
        </p>
      </div>

      {error && (
        <div style={{ background: "#3a1a1a", border: "1px solid #5a2a2a", borderRadius: "10px", padding: "16px", marginBottom: "20px", fontSize: "13px", color: "#ff8a8a", lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      {/* ── Generate button / progress bar ── */}
      {generating ? (
        <div style={{
          width: "100%",
          background: "#1a1917",
          border: "1px solid #2a2926",
          borderRadius: "14px",
          padding: "24px 28px",
          overflow: "hidden",
        }}>
          {/* Step label + time */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#f5f1ea",
              transition: "opacity 0.4s",
            }}>
              {GEN_STEPS[Math.min(stepIdx, GEN_STEPS.length - 1)].label}
            </span>
            <span style={{ fontSize: "12px", color: "#9a9390", flexShrink: 0, marginLeft: 16 }}>
              {progress < 100
                ? `~${timeLeft}s left`
                : "Done ✓"}
            </span>
          </div>

          {/* Progress track */}
          <div style={{ height: 10, background: "#0f0e0c", borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              borderRadius: 6,
              background: "linear-gradient(90deg, #FF007E, #FA2A45, #FF8C00)",
              backgroundSize: "200% 100%",
              animation: "gradientSlide 2s linear infinite",
              transition: "width 0.8s ease-out",
            }} />
          </div>

          {/* Percentage */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#7a7570", fontStyle: "italic" }}>
              Do not close this window
            </span>
            <span style={{
              fontSize: "13px",
              fontWeight: 700,
              background: "linear-gradient(90deg, #FF007E, #FA2A45)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {progress}%
            </span>
          </div>

          {/* Keyframe animation injected inline */}
          <style>{`
            @keyframes gradientSlide {
              0%   { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
          `}</style>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={missing.length > 0}
          style={{
            width: "100%",
            padding: "20px",
            background: missing.length > 0
              ? "#2a2926"
              : "linear-gradient(135deg, #FF007E 0%, #FA2A45 50%, #FF8C00 100%)",
            color: missing.length > 0 ? "#555" : "#fff",
            border: "none",
            borderRadius: "14px",
            fontWeight: 700,
            fontSize: "16px",
            cursor: missing.length > 0 ? "not-allowed" : "pointer",
            letterSpacing: "0.01em",
            boxShadow: missing.length > 0 ? "none" : "0 4px 24px rgba(255, 0, 126, 0.35)",
            transition: "all 0.2s",
          }}
        >
          ✨&nbsp;&nbsp;{useDocPlusAi ? "Build my funnel from the document + AI →" : "Generate my complete funnel →"}
        </button>
      )}

      <p style={{ textAlign: "center", fontSize: "12px", color: "#7a7570", marginTop: "12px" }}>
        {generating ? "" : "You can regenerate any page after reviewing the results"}
      </p>
    </div>
  );
}
