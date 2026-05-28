import { darkenHex, hexHue, lightenHex } from "./brand-surfaces";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return [128, 128, 128];
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** WCAG relative luminance (0–1). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function mixHex(a: string, b: string, ratio: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return toHex(ar + (br - ar) * ratio, ag + (bg - ag) * ratio, ab + (bb - ab) * ratio);
}

/**
 * Adjust fg until it meets minRatio against a specific background.
 * Unlike a fixed luminance threshold, this works for branded slate surfaces
 * that share hue with the accent palette.
 */
export function ensureContrast(fg: string, bg: string, minRatio = 4.5): string {
  if (contrastRatio(fg, bg) >= minRatio) return fg;
  const towardLight = relativeLuminance(bg) < 0.5;
  let result = fg;
  for (let i = 0; i < 14; i++) {
    result = towardLight ? lightenHex(result, 0.08) : darkenHex(result, 0.08);
    if (contrastRatio(result, bg) >= minRatio) return result;
  }
  return towardLight ? "#FFFFFF" : "#0A0A0A";
}

/**
 * Most muted colour that still meets minRatio — replaces opacity hacks that
 * fail when gradients lighten the perceived background.
 */
export function mutedOnSurface(fg: string, bg: string, minRatio = 4.5): string {
  const base = ensureContrast(fg, bg, minRatio);
  let best = base;
  for (let step = 1; step <= 12; step++) {
    const candidate = mixHex(base, bg, step * 0.06);
    if (contrastRatio(candidate, bg) >= minRatio) best = candidate;
    else break;
  }
  return best;
}

/** Shortest arc between two hues (0–180°). */
export function hueDistance(a: string, b: string): number {
  const diff = Math.abs(hexHue(a) - hexHue(b));
  return Math.min(diff, 360 - diff);
}

/** True when fg shares the same hue band as an adjacent primary CTA (stacked primary emphasis). */
export function isSameEmphasisFamily(fg: string, ctaColor: string): boolean {
  return hueDistance(fg, ctaColor) < 28;
}

/**
 * Pick a readable emphasis colour for badges/urgency that is visually distinct
 * from a primary CTA sitting directly below it on the same panel.
 */
export function pickDistinctEmphasis(
  panelBg: string,
  ctaColor: string,
  candidates: string[],
  minRatio = 4.5,
): string {
  for (const raw of candidates) {
    const fg = ensureContrast(raw, panelBg, minRatio);
    if (!isSameEmphasisFamily(fg, ctaColor)) return fg;
  }
  const neutral = ensureContrast(mixHex(panelBg, "#FFFFFF", 0.72), panelBg, minRatio);
  if (!isSameEmphasisFamily(neutral, ctaColor)) return neutral;
  return ensureContrast("#FFFFFF", panelBg, minRatio);
}

/** Badge colours for urgency/meta emphasis on a tinted panel above a primary CTA. */
export function panelEmphasisStyle(
  panelBg: string,
  ctaColor: string,
  candidates: string[],
  minRatio = 4.5,
): { fg: string; bg: string; border: string } {
  const fg = pickDistinctEmphasis(panelBg, ctaColor, candidates, minRatio);
  return {
    fg,
    bg: mixHex(fg, panelBg, 0.88),
    border: mixHex(fg, panelBg, 0.55),
  };
}

/** Approximate CSS color-mix(text-inverse N%, transparent) over surface-inverse. */
export function inversePanelBg(surfaceInverse: string, textInverse: string, tint = 0.04): string {
  return mixHex(surfaceInverse, textInverse, tint);
}