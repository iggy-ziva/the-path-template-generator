import type { WizardData } from "@/lib/wizard-types";
import { THEME_LIST, type ThemeEntry } from "@/lib/theme-constants";
import { resolveFontRoles } from "@/lib/font-roles";

export interface BrandProfile {
  visualMood: string;
  sectionRhythm: string;
  copyVoice: string;
  suggestedThemeSlug: string;
  suggestedThemeReason: string;
  confidence: "high" | "medium" | "low";
  /** Top 2 theme slugs from deterministic scoring */
  rankedThemeSlugs: string[];
  /** Primary/secondary/tertiary for UI swatches */
  brandColors: { primary?: string; secondary?: string; tertiary?: string };
}

function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexHue(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  let h = 0;
  const d = max - min;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return h * 360;
}

const HEALING_KEYWORDS = /\b(heal|healing|somatic|wellness|energy|quantum|spiritual|body|mind|holistic|transformation|frequency|meditation|ceremony|sacred|heart|abundance|therapy|therapeutic|integrative|medicine|coach)\b/i;
const EXECUTIVE_KEYWORDS = /\b(executive|leadership|CEO|founder|strategy|corporate|business|professional|operator|performance lab|data|ROI|results|authority)\b/i;
const PERFORMANCE_KEYWORDS = /\b(performance|peak|cognitive|protocol|lab|science|neuro|athlete|edge|productivity|optimize|metric)\b/i;
const EARTH_KEYWORDS = /\b(earth|ancestral|indigenous|ceremonial|grounded|nature|forest|land|roots|traditional)\b/i;

function collectContextText(d: WizardData): string {
  return [
    d.businessName,
    d.eventName,
    d.programName,
    d.hostTitle,
    d.methodologyDescription,
    d.uniqueApproach,
    d.transformationPromise,
    d.audienceDescription,
    ...(d.toneDescriptors ?? []),
  ].filter(Boolean).join(" ");
}

function scoreThemes(d: WizardData): { slug: string; score: number; reason: string }[] {
  const sg = d.styleGuide;
  const primary = sg?.brandColors?.primary ?? "#2B4EAA";
  const secondary = sg?.brandColors?.secondary ?? "#445566";
  const primaryLum = hexLuminance(primary);
  const primaryHue = hexHue(primary);
  const secondaryHue = hexHue(secondary);
  const context = collectContextText(d);
  const tones = (d.toneDescriptors ?? []).map((t) => t.toLowerCase());

  const scores: Record<string, { score: number; reasons: string[] }> = {};
  for (const t of THEME_LIST) {
    scores[t.slug] = { score: 0, reasons: [] };
  }

  // Healing / wellness signals
  if (HEALING_KEYWORDS.test(context)) {
    scores.wellness.score += 4;
    scores.wellness.reasons.push("healing/wellness language in your inputs");
    scores.abundance.score += 2;
    scores.abundance.reasons.push("heart-centred transformation context");
    scores.sacred.score += 1;
  }

  // Executive / strategic
  if (EXECUTIVE_KEYWORDS.test(context)) {
    scores.executive.score += 4;
    scores.executive.reasons.push("leadership/executive positioning");
  }

  // Peak performance (narrow — needs explicit performance/science language)
  if (PERFORMANCE_KEYWORDS.test(context)) {
    scores.highperf.score += 3;
    scores.highperf.reasons.push("performance/science terminology");
  }

  // Earth / ceremonial
  if (EARTH_KEYWORDS.test(context)) {
    scores.earth.score += 4;
    scores.earth.reasons.push("ancestral/earth-centred language");
    scores.sacred.score += 2;
  }

  // Warm primary + cool secondary (coral + slate) → wellness/threshold, NOT highperf
  const warmPrimary = primaryHue >= 0 && primaryHue <= 60 || primaryHue >= 330;
  const coolSecondary = secondaryHue >= 160 && secondaryHue <= 240;
  if (warmPrimary && primaryLum > 0.35 && coolSecondary) {
    scores.wellness.score += 3;
    scores.wellness.reasons.push("warm coral primary with cool slate secondary");
    scores.threshold.score += 2;
    scores.threshold.reasons.push("warm professional palette");
    scores.highperf.score -= 2;
  }

  // Very bright vivid primaries (magenta, cyan) → sacred or abundance
  if (primaryLum > 0.45 && (primaryHue > 280 || primaryHue < 30)) {
    scores.sacred.score += 2;
    scores.abundance.score += 2;
  }

  // Dark navy/blue primary → executive or highperf
  if (primaryLum < 0.25 && primaryHue >= 200 && primaryHue <= 260) {
    scores.executive.score += 2;
    scores.highperf.score += 1;
  }

  // Tone descriptor boosts
  for (const tone of tones) {
    if (/gentle|nurtur|warm|compassion|heart|empathetic|calm|soft/.test(tone)) {
      scores.wellness.score += 2;
      scores.abundance.score += 1;
    }
    if (/authoritative|strategic|direct|bold|professional|precise/.test(tone)) {
      scores.executive.score += 1;
      scores.threshold.score += 1;
    }
    if (/data|analytical|no-nonsense|efficient|sharp/.test(tone)) {
      scores.highperf.score += 2;
    }
    if (/mystical|spiritual|sacred|ceremonial|cosmic/.test(tone)) {
      scores.sacred.score += 3;
    }
    if (/grounded|earthy|natural|ancestral/.test(tone)) {
      scores.earth.score += 2;
    }
  }

  // Serif fonts → threshold/literary or sacred
  const fonts = sg?.googleFonts ?? [];
  const hasSerif = fonts.some((f) => /serif|garamond|times|crimson|playfair|merriweather|lora/i.test(f));
  if (hasSerif) {
    scores.threshold.score += 1;
    scores.sacred.score += 1;
  }

  // Default baseline so threshold wins ties when nothing else matches
  scores.threshold.score += 0.5;

  return THEME_LIST.map((t) => ({
    slug: t.slug,
    score: scores[t.slug].score,
    reason: scores[t.slug].reasons[0] ?? "general brand fit",
  })).sort((a, b) => b.score - a.score);
}

function buildSectionRhythm(d: WizardData): string {
  const primary = d.styleGuide?.brandColors?.primary ?? "#2B4EAA";
  const primaryLum = hexLuminance(primary);
  if (primaryLum < 0.25) {
    return "Lean into dark sections for hero, CTAs, and emotional moments. Use light sections for breathing space.";
  }
  if (primaryLum < 0.50) {
    return "Alternate dark and light sections in roughly equal measure. Reserve dark sections for high-drama CTAs.";
  }
  return "Default to light sections with warm canvas backgrounds. Use dark/accent sections sparingly for hero and final CTA contrast.";
}

function buildVisualMood(d: WizardData): string {
  const sg = d.styleGuide;
  const primary = sg?.brandColors?.primary;
  const secondary = sg?.brandColors?.secondary;
  const fonts = sg?.googleFonts ?? [];
  const primaryLum = primary ? hexLuminance(primary) : 0.5;

  const parts: string[] = [];
  if (primary && secondary) {
    const warm = hexHue(primary) >= 330 || hexHue(primary) <= 50;
    parts.push(
      warm && primaryLum > 0.35
        ? `This brand pairs a warm, inviting primary (${primary}) with a grounded secondary (${secondary}) — light peachy sections with slate/teal accent bands and coral CTAs.`
        : `This brand uses primary ${primary} and secondary ${secondary} — derive section contrast from these colours, not generic template defaults.`,
    );
  } else {
    parts.push("Brand colours were not fully detected — use professional neutral rhythm with clear section contrast.");
  }
  if (fonts.length) {
    const { display, body } = resolveFontRoles(fonts, {
      fontDisplay: sg?.fontDisplay,
      fontBody: sg?.fontBody,
    });
    parts.push(`Typography: ${display} for headlines, ${body} for body — match headline weight and sentence rhythm to these typefaces.`);
  }
  return parts.join(" ");
}

function buildCopyVoice(d: WizardData): string {
  const tones = d.toneDescriptors ?? [];
  if (tones.length) {
    return `Write in a voice that is ${tones.join(", ")}. User tone descriptors always override any theme label.`;
  }
  const context = collectContextText(d);
  if (HEALING_KEYWORDS.test(context)) {
    return "Warm, authoritative, and transformation-focused — speak to healing outcomes without generic life-coach clichés.";
  }
  if (EXECUTIVE_KEYWORDS.test(context)) {
    return "Clear, strategic, and results-oriented — respect the reader's intelligence.";
  }
  return "Professional, warm, and transformative — credible expert voice without hype.";
}

export function computeBrandProfile(d: WizardData): BrandProfile {
  const ranked = scoreThemes(d);
  const top = ranked[0];
  const second = ranked[1];
  const themeEntry = THEME_LIST.find((t) => t.slug === top.slug) ?? THEME_LIST[0];

  let confidence: BrandProfile["confidence"] = "medium";
  if (top.score >= 4 && top.score - (second?.score ?? 0) >= 2) confidence = "high";
  else if (top.score <= 1) confidence = "low";

  const reason =
    top.score > 0
      ? `${themeEntry.label} fits best because of ${top.reason}.`
      : `${themeEntry.label} is the balanced default when brand signals are mixed.`;

  return {
    visualMood: buildVisualMood(d),
    sectionRhythm: buildSectionRhythm(d),
    copyVoice: buildCopyVoice(d),
    suggestedThemeSlug: top.slug,
    suggestedThemeReason: reason,
    confidence,
    rankedThemeSlugs: ranked.slice(0, 2).map((r) => r.slug),
    brandColors: {
      primary: d.styleGuide?.brandColors?.primary,
      secondary: d.styleGuide?.brandColors?.secondary,
      tertiary: d.styleGuide?.brandColors?.tertiary,
    },
  };
}

export function themeEntryForSlug(slug: string): ThemeEntry {
  return THEME_LIST.find((t) => t.slug === slug) ?? THEME_LIST[0];
}

export function buildBrandProfilePromptBlock(
  profile: BrandProfile,
  d: WizardData,
): string {
  const overrideTheme =
    d.referenceThemeSource === "user" && d.referenceTheme
      ? themeEntryForSlug(d.referenceTheme)
      : null;
  const activeSlug = overrideTheme?.slug ?? profile.suggestedThemeSlug;
  const activeTheme = themeEntryForSlug(activeSlug);

  return `=== BRAND PROFILE (primary aesthetic + copy anchor) ===
Visual mood: ${profile.visualMood}
Section rhythm: ${profile.sectionRhythm}
Copy voice: ${profile.copyVoice}

Suggested reference style: ${activeTheme.label} — ${activeTheme.descriptor}
${overrideTheme ? `Manual theme override active — use this copy voice ONLY where compatible with the brand colours above.` : `Reason: ${profile.suggestedThemeReason}`}

IMPORTANT: Brand colours and this profile drive all visual and copy decisions. User tone descriptors always win over theme labels.`;
}
