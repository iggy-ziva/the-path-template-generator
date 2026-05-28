"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { FunnelContent, WizardSnapshot } from "./funnel-types";
import { resolveFontRoles, buildGoogleFontsImport, fontFamilyCss } from "@/lib/font-roles";
import { computeBrandSurfaces, darkenHex, hexLuminance, lightenHex } from "@/lib/brand-surfaces";
import { ensureContrast, inversePanelBg, mutedOnSurface, panelEmphasisStyle } from "@/lib/contrast-colors";
import EventLandingPage from "./pages/EventLandingPage";
import EventCheckoutPage from "./pages/EventCheckoutPage";
import UpsellPage from "./pages/UpsellPage";
import EventThankYouPage from "./pages/EventThankYouPage";
import ReplayPage from "./pages/ReplayPage";
import ProgrammeLandingPage from "./pages/ProgrammeLandingPage";
import ProgrammeCheckoutPage from "./pages/ProgrammeCheckoutPage";
import ProgrammeThankYouPage from "./pages/ProgrammeThankYouPage";

const PAGES = [
  { key: "eventLanding",       label: "Event Landing",     file: "index.html" },
  { key: "eventCheckout",      label: "Event Checkout",    file: "event-checkout.html" },
  { key: "upsell",             label: "Upsell",            file: "upsell.html" },
  { key: "eventThankYou",      label: "Event Thank-You",   file: "event-thank-you.html" },
  { key: "replay",             label: "Replay",            file: "replay.html" },
  { key: "programmeLanding",   label: "Programme LP",      file: "programme.html" },
  { key: "programmeCheckout",  label: "Prog. Checkout",    file: "programme-checkout.html" },
  { key: "programmeThankYou",  label: "Prog. Thank-You",   file: "programme-thank-you.html" },
] as const;

type PageKey = typeof PAGES[number]["key"];

interface Props {
  funnelId: string;
  content: Record<string, unknown>;
  themeSlug: string | null;
  createdAt: string;
  wizardData: Record<string, unknown>;
}

/** Perceived lightness of a hex colour (0 = black, 1 = white) */
function luminance(hex: string): number {
  return hexLuminance(hex);
}

/**
 * Darken a colour until it has enough contrast to be readable on a near-white surface.
 * Threshold: luminance < 0.45 (≈ 2.5:1 contrast ratio against white surface).
 */
function makeOnLight(hex: string): string {
  if (luminance(hex) < 0.45) return hex;
  let result = hex;
  for (let i = 0; i < 6; i++) {
    result = darkenHex(result, 0.35);
    if (luminance(result) < 0.45) break;
  }
  return result;
}

interface BrandTokens {
  primary: string;
  darkenedPrimary: string;
  secondary: string;
  tertiary: string;
  accentLight: string;
  accentLightHover: string;
  linkColor: string;
  logoHueRotate: string;
  logoSaturate: string;
  fontDisplay: string;
  fontBody: string;
  fontImport: string;
  // Contrast-safe accent variants — pre-computed so CSS never needs to guess
  textOnAccent: string;             // text colour for use ON the CTA button background (accentLight)
  // Per-accent contrast variants:
  accentPrimaryOnDark: string;      // primary lifted to be readable on dark (surface-inverse) BG
  accentPrimaryOnLight: string;     // primary darkened to be readable on light (surface-canvas) BG
  textOnPrimary: string;            // text to render ON TOP of primary as a background
  accentSecondaryOnDark: string;    // secondary lifted for dark surfaces (was accentSecondaryVivid)
  accentSecondaryOnLight: string;   // secondary darkened for light surfaces
  textOnSecondary: string;          // text to render ON TOP of secondary as a background
  accentTertiaryOnDark: string;     // tertiary lifted for dark surfaces
  accentTertiaryOnLight: string;    // tertiary darkened for light surfaces
  textOnTertiary: string;           // text to render ON TOP of tertiary as a background
  // Surface tokens — derived from brand secondary so every brand gets its own palette,
  // never the hardcoded Threshold warm-cream defaults in funnel-style.css
  surfaceCanvas: string;
  surfaceSunken: string;
  surfaceRaised: string;
  surfaceAccent: string;
  surfaceInverse: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textMutedOnInverse: string;
  panelUrgencyFg: string;
  panelUrgencyBg: string;
  panelUrgencyBorder: string;
  borderSubtle: string;
}

/** Convert hex to HSL, returns [h(0-360), s(0-100), l(0-100)] */
function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return [0, 0, 50];
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  let h = 0;
  if (max !== min) {
    if (max === r)      h = ((g - b) / (max - min) + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / (max - min) + 2) / 6;
    else                h = ((r - g) / (max - min) + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/** Compute all brand tokens from wizard style guide data */
function computeBrandTokens(wizard: WizardSnapshot): BrandTokens {
  const sg = wizard.styleGuide;
  // Neutral (non-Threshold) fallbacks used when brand analysis doesn't detect a colour
  const primary   = sg?.brandColors?.primary   ?? "#2B4EAA";
  const secondary = sg?.brandColors?.secondary ?? "#445566";
  const tertiary  = sg?.brandColors?.tertiary  ?? "#6699BB";
  // accent field = "Link / accent — Hyperlinks and highlights". It is NEVER used for CTA buttons.
  const linkColor = sg?.brandColors?.accent ?? primary;
  const fonts     = sg?.googleFonts ?? [];
  const { display: displayFont, body: bodyFont } = resolveFontRoles(fonts, {
    fontDisplay: sg?.fontDisplay,
    fontBody: sg?.fontBody,
  });

  // Surface & text tokens — brand-aware inverse (warm brands → deep slate, not near-black)
  const surfaces = computeBrandSurfaces({ primary, secondary, tertiary });
  const {
    surfaceCanvas, surfaceSunken, surfaceRaised, surfaceAccent, surfaceInverse,
    textPrimary, textSecondary, textTertiary, borderSubtle,
  } = surfaces;

  // Text on inverse surfaces — verified against actual surface-inverse (branded slate),
  // not a generic near-black threshold. Same-hue accents (e.g. blue on blue slate) get lifted.
  const textInverse = ensureContrast(lightenHex(secondary, 0.94), surfaceInverse, 4.5);
  const textMutedOnInverse = mutedOnSurface(textInverse, surfaceInverse, 4.5);

  // ── Contrast-safe accent variants ────────────────────────────────────────
  const accentPrimaryOnDark  = ensureContrast(primary, surfaceInverse, 3.0);
  const accentPrimaryOnLight = makeOnLight(primary);
  const textOnPrimary        = luminance(primary) > 0.35 ? textPrimary : textInverse;

  const accentSecondaryOnDark  = ensureContrast(secondary, surfaceInverse, 4.5);
  const accentSecondaryOnLight = makeOnLight(secondary);
  const textOnSecondary        = luminance(secondary) > 0.35 ? textPrimary : textInverse;

  const accentTertiaryOnDark  = ensureContrast(tertiary, surfaceInverse, 3.0);
  const accentTertiaryOnLight = makeOnLight(tertiary);
  const textOnTertiary        = luminance(tertiary) > 0.35 ? textPrimary : textInverse;

  // --accent-light: the CTA button colour — always guaranteed readable on dark surfaces.
  // Previously this was raw primary, which caused dark-on-dark invisibility for dark brand colours.
  const accentLight      = accentPrimaryOnDark;
  const accentLightHover = lightenHex(accentLight, 0.15);

  // Text on top of the CTA button — contrast-safe against the (possibly lifted) accentLight
  const textOnAccent = luminance(accentLight) > 0.35 ? textPrimary : textInverse;

  // Panel urgency (replay program CTA): distinct from primary button, contrast-safe on panel bg
  const panelBg = inversePanelBg(surfaceInverse, textInverse, 0.04);
  const panelUrgency = panelEmphasisStyle(
    panelBg,
    accentLight,
    [accentSecondaryOnDark, accentTertiaryOnDark, textMutedOnInverse],
    4.5,
  );

  const rP = parseInt(primary.replace("#", "").slice(0, 2), 16);
  const gP = parseInt(primary.replace("#", "").slice(2, 4), 16);
  const bP = parseInt(primary.replace("#", "").slice(4, 6), 16);
  const darkenedPrimary = `#${Math.max(0, rP - 30).toString(16).padStart(2, "0")}${Math.max(0, gP - 24).toString(16).padStart(2, "0")}${Math.max(0, bP - 16).toString(16).padStart(2, "0")}`;

  const fontDisplay = fontFamilyCss(displayFont, '"GT Sectra", Georgia, serif');
  const fontBody    = fontFamilyCss(bodyFont, "-apple-system, system-ui, sans-serif");

  const fontImport = buildGoogleFontsImport([displayFont, bodyFont, ...fonts]);

  // Logo tint filter: greyscale → sepia → hue-rotate to brand secondary hue
  // Sepia baseline is ~35°; rotate to secondary hue. Saturate proportional to secondary saturation.
  const [secHue, secSat] = hexToHsl(secondary);
  const logoHueRotate = `${secHue - 35}deg`;
  const logoSaturate  = `${Math.max(0.3, secSat / 100).toFixed(2)}`;

  return {
    primary, darkenedPrimary, secondary, tertiary,
    accentLight, accentLightHover, linkColor,
    textOnAccent,
    accentPrimaryOnDark, accentPrimaryOnLight, textOnPrimary,
    accentSecondaryOnDark, accentSecondaryOnLight, textOnSecondary,
    accentTertiaryOnDark, accentTertiaryOnLight, textOnTertiary,
    logoHueRotate, logoSaturate, fontDisplay, fontBody, fontImport,
    surfaceCanvas, surfaceSunken, surfaceRaised, surfaceAccent, surfaceInverse,
    textPrimary, textSecondary, textTertiary, textInverse, textMutedOnInverse,
    panelUrgencyFg: panelUrgency.fg,
    panelUrgencyBg: panelUrgency.bg,
    panelUrgencyBorder: panelUrgency.border,
    borderSubtle,
  };
}

/** Render brand tokens as a standalone brand.css string (used in ZIP export) */
function buildBrandCSS(tokens: BrandTokens): string {
  const {
    primary, darkenedPrimary, secondary, tertiary,
    accentLight, accentLightHover, linkColor,
    textOnAccent,
    accentPrimaryOnDark, accentPrimaryOnLight, textOnPrimary,
    accentSecondaryOnDark, accentSecondaryOnLight, textOnSecondary,
    accentTertiaryOnDark, accentTertiaryOnLight, textOnTertiary,
    fontDisplay, fontBody, fontImport,
    surfaceCanvas, surfaceSunken, surfaceRaised, surfaceAccent, surfaceInverse,
    textPrimary, textSecondary, textTertiary, textInverse, textMutedOnInverse,
    panelUrgencyFg, panelUrgencyBg, panelUrgencyBorder,
    borderSubtle,
  } = tokens;
  return `${fontImport ? fontImport + "\n" : ""}/* =====================================================================
   brand.css — per-funnel brand overrides
   Generated by The Path Template Generator
   ===================================================================== */
:root {
  /* Raw accent colours */
  --accent-primary:        ${primary};
  --accent-primary-hover:  ${darkenedPrimary};
  --accent-secondary:      ${secondary};
  --accent-tertiary:       ${tertiary};

  /* CTA button colour — primary lifted to always be visible on dark surfaces */
  --accent-light:          ${accentLight};
  --accent-light-hover:    ${accentLightHover};
  --color-link:            ${linkColor};
  --text-accent:           ${primary};

  /* Contrast-safe accent variants — use these instead of raw accents in templates */
  --accent-primary-on-dark:    ${accentPrimaryOnDark};
  --accent-primary-on-light:   ${accentPrimaryOnLight};
  --text-on-primary:           ${textOnPrimary};

  --accent-secondary-on-dark:  ${accentSecondaryOnDark};
  --accent-secondary-on-light: ${accentSecondaryOnLight};
  --text-on-secondary:         ${textOnSecondary};

  --accent-tertiary-on-dark:   ${accentTertiaryOnDark};
  --accent-tertiary-on-light:  ${accentTertiaryOnLight};
  --text-on-tertiary:          ${textOnTertiary};

  /* Text on the CTA (accent-light) button background */
  --text-on-accent:        ${textOnAccent};

  /* Surface palette — derived from brand secondary */
  --surface-canvas:        ${surfaceCanvas};
  --surface-sunken:        ${surfaceSunken};
  --surface-raised:        ${surfaceRaised};
  --surface-accent:        ${surfaceAccent};
  --surface-inverse:       ${surfaceInverse};

  /* Text colours — derived from brand secondary */
  --text-primary:          ${textPrimary};
  --text-secondary:        ${textSecondary};
  --text-tertiary:         ${textTertiary};
  --text-inverse:          ${textInverse};
  --text-muted-on-inverse: ${textMutedOnInverse};

  /* Panel urgency — distinct from primary CTA, tuned to price-block panel bg */
  --panel-urgency-fg:      ${panelUrgencyFg};
  --panel-urgency-bg:      ${panelUrgencyBg};
  --panel-urgency-border:  ${panelUrgencyBorder};

  /* Borders */
  --border-subtle:         ${borderSubtle};

  /* Logo tint */
  --logo-hue-rotate:       ${tokens.logoHueRotate};
  --logo-saturate:         ${tokens.logoSaturate};

  /* Typography */
  --font-display: ${fontDisplay};
  --font-body:    ${fontBody};
}
`;
}

export default function PreviewClient({ funnelId, content, themeSlug, createdAt, wizardData }: Props) {
  const [activePage, setActivePage] = useState<PageKey>("eventLanding");
  const [downloading, setDownloading] = useState(false);

  const fc = content as FunnelContent;
  const wizard = wizardData as WizardSnapshot;

  const tokens = computeBrandTokens(wizard);
  const {
    primary, accentLight, accentLightHover, darkenedPrimary, secondary, tertiary, linkColor,
    textOnAccent,
    accentPrimaryOnDark, accentPrimaryOnLight, textOnPrimary,
    accentSecondaryOnDark, accentSecondaryOnLight, textOnSecondary,
    accentTertiaryOnDark, accentTertiaryOnLight, textOnTertiary,
    logoHueRotate, logoSaturate, fontDisplay, fontBody, fontImport,
    surfaceCanvas, surfaceSunken, surfaceRaised, surfaceAccent, surfaceInverse,
    textPrimary, textSecondary, textTertiary, textInverse, textMutedOnInverse,
    panelUrgencyFg, panelUrgencyBg, panelUrgencyBorder,
    borderSubtle,
  } = tokens;
  // Text colour to use on top of the brand primary (ensures contrast on the active tab)
  const primaryTextColor = luminance(primary) > 0.35 ? "#0A0A0A" : "#F8F8F8";

  const brandCSS = buildBrandCSS(tokens);

  useEffect(() => {
    setActivePage("eventLanding");
  }, [funnelId]);

  // Inject per-funnel brand tokens on :root so global funnel-pages.css rules
  // (e.g. body { background: var(--surface-inverse) }) resolve to THIS funnel's
  // palette — not Threshold defaults or another generation's leftover state.
  useEffect(() => {
    const styleId = `preview-brand-${funnelId}`;
    const css = `${brandCSS}
body {
  background: var(--surface-canvas) !important;
  color: var(--text-primary) !important;
  font-family: var(--font-body) !important;
}`;

    document.querySelectorAll('style[id^="preview-brand-"]').forEach((node) => {
      if (node.id !== styleId) node.remove();
    });

    let el = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = styleId;
      document.head.appendChild(el);
    }
    el.textContent = css;

    return () => {
      el?.remove();
    };
  }, [funnelId, brandCSS]);

  // Map funnel URL paths → preview tab keys so CTA clicks navigate within the preview
  // instead of sending the browser to a 404.
  const FUNNEL_LINKS: Partial<Record<string, PageKey>> = {
    "/checkout":          "eventCheckout",
    "/upsell":            "upsell",
    "/thank-you":         "eventThankYou",
    "/replay":            "replay",
    "/program":           "programmeLanding",
    "/program-checkout":  "programmeCheckout",
    "/program-thank-you": "programmeThankYou",
  };

  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href) return;
    // Pass through external links, mailto, and same-page anchors
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) return;
    const target = FUNNEL_LINKS[href];
    if (target) {
      e.preventDefault();
      setActivePage(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/wizard/export/${funnelId}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `funnel-${funnelId.slice(0, 8)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed — please try again");
    } finally {
      setDownloading(false);
    }
  }

  function pageComponent(key: PageKey) {
    switch (key) {
      case "eventLanding":      return fc.eventLanding      ? <EventLandingPage content={fc.eventLanding} wizard={wizard} />           : <EmptyPage pageName="Event Landing" />;
      case "eventCheckout":     return fc.eventCheckout     ? <EventCheckoutPage content={fc.eventCheckout} wizard={wizard} />         : <EmptyPage pageName="Event Checkout" />;
      case "upsell":            return fc.upsell            ? <UpsellPage content={fc.upsell} wizard={wizard} />                       : <EmptyPage pageName="Upsell" />;
      case "eventThankYou":     return fc.eventThankYou     ? <EventThankYouPage content={fc.eventThankYou} wizard={wizard} />         : <EmptyPage pageName="Event Thank-You" />;
      case "replay":            return fc.replay            ? <ReplayPage content={fc.replay} wizard={wizard} />                       : <EmptyPage pageName="Replay" />;
      case "programmeLanding":  return fc.programmeLanding  ? <ProgrammeLandingPage content={fc.programmeLanding} wizard={wizard} />   : <EmptyPage pageName="Programme Landing" />;
      case "programmeCheckout": return fc.programmeCheckout ? <ProgrammeCheckoutPage content={fc.programmeCheckout} wizard={wizard} /> : <EmptyPage pageName="Programme Checkout" />;
      case "programmeThankYou": return fc.programmeThankYou ? <ProgrammeThankYouPage content={fc.programmeThankYou} wizard={wizard} /> : <EmptyPage pageName="Programme Thank-You" />;
    }
  }

  // Brand CSS custom properties applied as inline style on the page wrapper.
  // This is the most reliable cascade mechanism: inline style custom properties on an ancestor
  // element always override :root stylesheet declarations for all descendants via CSS inheritance.
  const brandVars = {
    "--accent-primary":              primary,
    "--accent-primary-hover":        darkenedPrimary,
    "--accent-secondary":            secondary,
    "--accent-tertiary":             tertiary,
    "--accent-light":                accentLight,
    "--accent-light-hover":          accentLightHover,
    "--color-link":                  linkColor,
    "--text-accent":                 primary,
    "--logo-hue-rotate":             logoHueRotate,
    "--logo-saturate":               logoSaturate,
    "--font-display":                fontDisplay,
    "--font-body":                   fontBody,
    // Contrast-safe accent variants — the smart schema uses ONLY these in templates
    "--text-on-accent":              textOnAccent,
    "--accent-primary-on-dark":      accentPrimaryOnDark,
    "--accent-primary-on-light":     accentPrimaryOnLight,
    "--text-on-primary":             textOnPrimary,
    "--accent-secondary-on-dark":    accentSecondaryOnDark,
    "--accent-secondary-on-light":   accentSecondaryOnLight,
    "--text-on-secondary":           textOnSecondary,
    "--accent-tertiary-on-dark":     accentTertiaryOnDark,
    "--accent-tertiary-on-light":    accentTertiaryOnLight,
    "--text-on-tertiary":            textOnTertiary,
    // Surface & text tokens — always brand-derived, never the Threshold hardcoded defaults
    "--surface-canvas":              surfaceCanvas,
    "--surface-sunken":              surfaceSunken,
    "--surface-raised":              surfaceRaised,
    "--surface-accent":              surfaceAccent,
    "--surface-inverse":             surfaceInverse,
    "--text-primary":                textPrimary,
    "--text-secondary":              textSecondary,
    "--text-tertiary":               textTertiary,
    "--text-inverse":                textInverse,
    "--text-muted-on-inverse":       textMutedOnInverse,
    "--panel-urgency-fg":            panelUrgencyFg,
    "--panel-urgency-bg":              panelUrgencyBg,
    "--panel-urgency-border":          panelUrgencyBorder,
    "--border-subtle":               borderSubtle,
  } as React.CSSProperties;

  return (
    <>
      {/* Design system stylesheets */}
      <link rel="stylesheet" href="/funnel-style.css" />
      <link rel="stylesheet" href="/funnel-pages.css" />
      {/* Google Fonts import */}
      {fontImport && <style dangerouslySetInnerHTML={{ __html: fontImport }} />}
      {/* Preview-only overrides — NOT included in the ZIP export */}
      <style dangerouslySetInnerHTML={{ __html: `
        #stickyBar.is-visible { top: 52px !important; }
        section.credibility.inline { padding: 40px 0 !important; border: none !important; margin-bottom: 40px !important; }
        section.credibility.inline .quote-glyph { font-size: 64px !important; line-height: 1 !important; margin-bottom: 16px !important; }
      ` }} />

      {/* Toolbar — fixed so it sits above everything including the app header */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
        background: "#141412", borderBottom: "1px solid #2a2926",
        padding: "0 20px",
        display: "flex", alignItems: "center", gap: 16,
        height: 52,
      }}>
        <Link href="/app/wizard" style={{ color: "#9a9390", textDecoration: "none", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
          ← Wizard
        </Link>

        <div style={{ flex: 1, display: "flex", gap: 3, overflowX: "auto" }}>
          {PAGES.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePage(p.key)}
              style={{
                padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: activePage === p.key ? accentSecondaryOnDark : "transparent",
                color: activePage === p.key ? textOnSecondary : "#9a9390",
                fontWeight: activePage === p.key ? 700 : 500,
                fontSize: 11, whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.12s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "#888", flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: primary }} />
            <span>{primary}</span>
          </div>
          {themeSlug && <span>Theme: {themeSlug}</span>}
          <span title={createdAt}>{new Date(createdAt).toLocaleDateString()}</span>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            padding: "6px 14px",
            background: accentSecondaryOnDark,
            border: "none", borderRadius: 6,
            color: textOnSecondary,
            cursor: downloading ? "not-allowed" : "pointer",
            fontSize: 11, fontWeight: 700,
            opacity: downloading ? 0.6 : 1,
            flexShrink: 0,
          }}
        >
          {downloading ? "…" : "↓ ZIP"}
        </button>
      </div>

      {/* Only mount the active page — all 8 pages share one document and global CSS,
          so mounting them together causes rules from upsell/programme to bleed across tabs. */}
      <div onClick={handlePreviewClick} style={{ paddingTop: 52, ...brandVars }}>
        <div
          key={activePage}
          data-page={activePage}
          style={{
            background: activePage === "programmeCheckout" ? "var(--surface-inverse)" : "var(--surface-canvas)",
            color: activePage === "programmeCheckout" ? "var(--text-inverse)" : "var(--text-primary)",
            fontFamily: "var(--font-body)",
            minHeight: "calc(100vh - 52px)",
          }}
        >
          {pageComponent(activePage)}
        </div>
      </div>
    </>
  );
}

function EmptyPage({ pageName }: { pageName: string }) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#444" }}>
      <div style={{ fontSize: 40 }}>📄</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{pageName}</div>
      <div style={{ fontSize: 13 }}>No content generated for this page yet.</div>
    </div>
  );
}
