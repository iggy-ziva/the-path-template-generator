import { resolveFontRoles, buildGoogleFontsImport, fontFamilyCss } from "@/lib/font-roles";
import { computeBrandSurfaces, darkenHex, hexLuminance, lightenHex } from "@/lib/brand-surfaces";
import { ensureContrast, inversePanelBg, mutedOnSurface, panelEmphasisStyle } from "@/lib/contrast-colors";
import type { WizardSnapshot } from "@/app/app/preview/[funnelId]/_components/funnel-types";

export interface BrandTokens {
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
  textOnAccent: string;
  accentPrimaryOnDark: string;
  accentPrimaryOnLight: string;
  textOnPrimary: string;
  accentSecondaryOnDark: string;
  accentSecondaryOnLight: string;
  textOnSecondary: string;
  accentTertiaryOnDark: string;
  accentTertiaryOnLight: string;
  textOnTertiary: string;
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

function luminance(hex: string): number {
  return hexLuminance(hex);
}

function makeOnLight(hex: string): string {
  if (luminance(hex) < 0.45) return hex;
  let result = hex;
  for (let i = 0; i < 6; i++) {
    result = darkenHex(result, 0.35);
    if (luminance(result) < 0.45) break;
  }
  return result;
}

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

export function computeBrandTokens(wizard: WizardSnapshot): BrandTokens {
  const sg = wizard.styleGuide;
  const primary   = sg?.brandColors?.primary   ?? "#2B4EAA";
  const secondary = sg?.brandColors?.secondary ?? "#445566";
  const tertiary  = sg?.brandColors?.tertiary  ?? "#6699BB";
  const linkColor = sg?.brandColors?.accent ?? primary;
  const fonts     = sg?.googleFonts ?? [];
  const { display: displayFont, body: bodyFont } = resolveFontRoles(fonts, {
    fontDisplay: sg?.fontDisplay,
    fontBody: sg?.fontBody,
  });

  const surfaces = computeBrandSurfaces({ primary, secondary, tertiary });
  const {
    surfaceCanvas, surfaceSunken, surfaceRaised, surfaceAccent, surfaceInverse,
    textPrimary, textSecondary, textTertiary, borderSubtle,
  } = surfaces;

  const textInverse = ensureContrast(lightenHex(secondary, 0.94), surfaceInverse, 4.5);
  const textMutedOnInverse = mutedOnSurface(textInverse, surfaceInverse, 4.5);

  const accentPrimaryOnDark  = ensureContrast(primary, surfaceInverse, 3.0);
  const accentPrimaryOnLight = makeOnLight(primary);
  const textOnPrimary        = luminance(primary) > 0.35 ? textPrimary : textInverse;

  const accentSecondaryOnDark  = ensureContrast(secondary, surfaceInverse, 4.5);
  const accentSecondaryOnLight = makeOnLight(secondary);
  const textOnSecondary        = luminance(secondary) > 0.35 ? textPrimary : textInverse;

  const accentTertiaryOnDark  = ensureContrast(tertiary, surfaceInverse, 3.0);
  const accentTertiaryOnLight = makeOnLight(tertiary);
  const textOnTertiary        = luminance(tertiary) > 0.35 ? textPrimary : textInverse;

  const accentLight      = accentPrimaryOnDark;
  const accentLightHover = lightenHex(accentLight, 0.15);
  const textOnAccent = luminance(accentLight) > 0.35 ? textPrimary : textInverse;

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

export function brandTokensToCssVars(tokens: BrandTokens): Record<string, string> {
  return {
    "--accent-primary": tokens.primary,
    "--accent-primary-hover": tokens.darkenedPrimary,
    "--accent-secondary": tokens.secondary,
    "--accent-tertiary": tokens.tertiary,
    "--accent-light": tokens.accentLight,
    "--accent-light-hover": tokens.accentLightHover,
    "--color-link": tokens.linkColor,
    "--text-accent": tokens.primary,
    "--logo-hue-rotate": tokens.logoHueRotate,
    "--logo-saturate": tokens.logoSaturate,
    "--font-display": tokens.fontDisplay,
    "--font-body": tokens.fontBody,
    "--text-on-accent": tokens.textOnAccent,
    "--accent-primary-on-dark": tokens.accentPrimaryOnDark,
    "--accent-primary-on-light": tokens.accentPrimaryOnLight,
    "--text-on-primary": tokens.textOnPrimary,
    "--accent-secondary-on-dark": tokens.accentSecondaryOnDark,
    "--accent-secondary-on-light": tokens.accentSecondaryOnLight,
    "--text-on-secondary": tokens.textOnSecondary,
    "--accent-tertiary-on-dark": tokens.accentTertiaryOnDark,
    "--accent-tertiary-on-light": tokens.accentTertiaryOnLight,
    "--text-on-tertiary": tokens.textOnTertiary,
    "--surface-canvas": tokens.surfaceCanvas,
    "--surface-sunken": tokens.surfaceSunken,
    "--surface-raised": tokens.surfaceRaised,
    "--surface-accent": tokens.surfaceAccent,
    "--surface-inverse": tokens.surfaceInverse,
    "--text-primary": tokens.textPrimary,
    "--text-secondary": tokens.textSecondary,
    "--text-tertiary": tokens.textTertiary,
    "--text-inverse": tokens.textInverse,
    "--text-muted-on-inverse": tokens.textMutedOnInverse,
    "--panel-urgency-fg": tokens.panelUrgencyFg,
    "--panel-urgency-bg": tokens.panelUrgencyBg,
    "--panel-urgency-border": tokens.panelUrgencyBorder,
    "--border-subtle": tokens.borderSubtle,
  };
}

export function buildBrandCSS(tokens: BrandTokens): string {
  const v = brandTokensToCssVars(tokens);
  return `${tokens.fontImport ? tokens.fontImport + "\n" : ""}/* brand.css — per-funnel brand overrides */
:root {
  --accent-primary:        ${v["--accent-primary"]};
  --accent-primary-hover:  ${v["--accent-primary-hover"]};
  --accent-secondary:      ${v["--accent-secondary"]};
  --accent-tertiary:       ${v["--accent-tertiary"]};
  --accent-light:          ${v["--accent-light"]};
  --accent-light-hover:    ${v["--accent-light-hover"]};
  --color-link:            ${v["--color-link"]};
  --text-accent:           ${v["--text-accent"]};
  --accent-primary-on-dark:    ${v["--accent-primary-on-dark"]};
  --accent-primary-on-light:   ${v["--accent-primary-on-light"]};
  --text-on-primary:           ${v["--text-on-primary"]};
  --accent-secondary-on-dark:  ${v["--accent-secondary-on-dark"]};
  --accent-secondary-on-light: ${v["--accent-secondary-on-light"]};
  --text-on-secondary:         ${v["--text-on-secondary"]};
  --accent-tertiary-on-dark:   ${v["--accent-tertiary-on-dark"]};
  --accent-tertiary-on-light:  ${v["--accent-tertiary-on-light"]};
  --text-on-tertiary:          ${v["--text-on-tertiary"]};
  --text-on-accent:        ${v["--text-on-accent"]};
  --surface-canvas:        ${v["--surface-canvas"]};
  --surface-sunken:        ${v["--surface-sunken"]};
  --surface-raised:        ${v["--surface-raised"]};
  --surface-accent:        ${v["--surface-accent"]};
  --surface-inverse:       ${v["--surface-inverse"]};
  --text-primary:          ${v["--text-primary"]};
  --text-secondary:        ${v["--text-secondary"]};
  --text-tertiary:         ${v["--text-tertiary"]};
  --text-inverse:          ${v["--text-inverse"]};
  --text-muted-on-inverse: ${v["--text-muted-on-inverse"]};
  --panel-urgency-fg:      ${v["--panel-urgency-fg"]};
  --panel-urgency-bg:      ${v["--panel-urgency-bg"]};
  --panel-urgency-border:  ${v["--panel-urgency-border"]};
  --border-subtle:         ${v["--border-subtle"]};
  --logo-hue-rotate:       ${v["--logo-hue-rotate"]};
  --logo-saturate:         ${v["--logo-saturate"]};
  --font-display: ${tokens.fontDisplay};
  --font-body:    ${tokens.fontBody};
}
body {
  background: var(--surface-canvas);
  color: var(--text-primary);
  font-family: var(--font-body);
}
`;
}

export function brandVarsStyle(tokens: BrandTokens): Record<string, string> {
  return brandTokensToCssVars(tokens);
}
