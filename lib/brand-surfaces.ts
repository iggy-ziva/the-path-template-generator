/** Brand-aware surface token derivation and section theme defaults. */

export type SectionTheme = "dark" | "accent" | "light";

export interface BrandSurfaceInput {
  primary?: string;
  secondary?: string;
  tertiary?: string;
}

export interface BrandSurfaces {
  surfaceCanvas: string;
  surfaceSunken: string;
  surfaceRaised: string;
  surfaceAccent: string;
  surfaceInverse: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  borderSubtle: string;
  warmBrand: boolean;
}

export function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function hexHue(hex: string): number {
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

export function lightenHex(hex: string, ratio: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * ratio));
  const lg = Math.min(255, Math.round(g + (255 - g) * ratio));
  const lb = Math.min(255, Math.round(b + (255 - b) * ratio));
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

export function darkenHex(hex: string, ratio: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const dr = Math.round(r * (1 - ratio));
  const dg = Math.round(g * (1 - ratio));
  const db = Math.round(b * (1 - ratio));
  return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
}

export function isWarmHue(hex: string): boolean {
  const h = hexHue(hex);
  return h >= 330 || h <= 50;
}

/** Warm luminous brands (coral, gold, peach) get deep branded slate — not near-black. */
export function isWarmLuminousBrand(primary: string): boolean {
  return hexLuminance(primary) > 0.40 && isWarmHue(primary);
}

/** How far to darken secondary toward black for surface-inverse. */
export function inverseDarkenRatio(primary: string): number {
  const lum = hexLuminance(primary);
  if (lum < 0.25) return 0.93;
  if (isWarmLuminousBrand(primary)) return 0.55;
  if (lum < 0.40) return 0.80;
  if (lum > 0.50) return 0.70;
  return 0.75;
}

export function computeBrandSurfaces(input: BrandSurfaceInput): BrandSurfaces {
  const primary   = input.primary   ?? "#2B4EAA";
  const secondary = input.secondary ?? "#445566";
  const primaryLum = hexLuminance(primary);
  const warmBrand  = primaryLum > 0.40;

  return {
    surfaceCanvas:  warmBrand ? lightenHex(primary, 0.93) : lightenHex(secondary, 0.95),
    surfaceSunken:  warmBrand ? lightenHex(primary, 0.87) : lightenHex(secondary, 0.89),
    surfaceRaised:  warmBrand ? lightenHex(primary, 0.97) : lightenHex(secondary, 0.98),
    surfaceInverse: darkenHex(secondary, inverseDarkenRatio(primary)),
    surfaceAccent:  darkenHex(secondary, 0.28),
    textPrimary:    darkenHex(secondary, 0.80),
    textSecondary:  darkenHex(secondary, 0.60),
    textTertiary:   darkenHex(secondary, 0.42),
    textInverse:    lightenHex(secondary, 0.94),
    borderSubtle:   lightenHex(primary, 0.82),
    warmBrand,
  };
}

export function defaultHeroTheme(primary?: string): SectionTheme {
  if (!primary) return "dark";
  return isWarmLuminousBrand(primary) ? "accent" : "dark";
}

export function defaultRegisterTheme(primary?: string): SectionTheme {
  if (!primary) return "dark";
  return isWarmLuminousBrand(primary) ? "accent" : "dark";
}

export function defaultFinalVpTheme(_primary?: string): SectionTheme {
  return "dark";
}

/** CSS classes for hero / final-vp / register structural sections. */
export function structuralSectionClass(
  base: "hero" | "final-vp" | "encourage",
  theme: SectionTheme,
): string {
  if (base === "hero") {
    if (theme === "accent") return "hero accent-bg on-dark";
    if (theme === "light") return "hero sunken-bg";
    return "hero on-dark";
  }
  if (base === "final-vp") {
    if (theme === "accent") return "final-vp accent-bg on-dark";
    if (theme === "light") return "final-vp sunken-bg";
    return "final-vp on-dark";
  }
  // encourage (register band)
  if (theme === "dark") return "encourage dark-bg on-dark";
  if (theme === "accent") return "encourage accent-bg on-dark";
  return "encourage sunken-bg";
}

/** CSS variables block for export / standalone HTML. */
export function buildSurfaceCSSVars(input: BrandSurfaceInput): string {
  const s = computeBrandSurfaces(input);
  const primary = input.primary ?? "#2B4EAA";
  return `
  --surface-canvas:  ${s.surfaceCanvas};
  --surface-sunken:  ${s.surfaceSunken};
  --surface-raised:  ${s.surfaceRaised};
  --surface-accent:  ${s.surfaceAccent};
  --surface-inverse: ${s.surfaceInverse};
  --text-primary:    ${s.textPrimary};
  --text-secondary:  ${s.textSecondary};
  --text-tertiary:   ${s.textTertiary};
  --text-inverse:    ${s.textInverse};
  --border-subtle:   ${s.borderSubtle};
  --brand-primary:   ${primary};
`.trim();
}
