import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { detectFontRolesFromCss, resolveFontRoles } from "@/lib/font-roles";

// ── Font alternatives ──────────────────────────────────────────────────────
const FONT_ALTERNATIVES: Record<string, string[]> = {
  "futura":             ["Jost", "Nunito", "Poppins"],
  "proxima nova":       ["Nunito Sans", "Inter", "DM Sans"],
  "gotham":             ["Montserrat", "Plus Jakarta Sans"],
  "brandon grotesque":  ["Raleway", "Josefin Sans"],
  "avenir":             ["Nunito", "Quicksand", "Outfit"],
  "gill sans":          ["Lato", "Source Sans 3"],
  "trade gothic":       ["Barlow", "Roboto Condensed"],
  "din":                ["Barlow Condensed", "Oswald"],
  "frutiger":           ["Open Sans", "Lato"],
  "myriad":             ["Source Sans 3", "Cabin"],
  "garamond":           ["Cormorant Garamond", "EB Garamond"],
  "caslon":             ["Libre Caslon Text", "Playfair Display"],
  "minion":             ["Lora", "Merriweather"],
  "freight":            ["Playfair Display", "Cormorant"],
  "chronicle":          ["Libre Baskerville", "Playfair Display"],
  "clarendon":          ["Zilla Slab", "Roboto Slab"],
  "rockwell":           ["Arvo", "Glegoo"],
  "canela":             ["Cormorant", "DM Serif Display"],
  "recoleta":           ["Playfair Display", "Abril Fatface"],
};

function findGoogleAlternative(name: string): string[] {
  const l = name.toLowerCase().trim();
  if (FONT_ALTERNATIVES[l]) return FONT_ALTERNATIVES[l];
  for (const [k, v] of Object.entries(FONT_ALTERNATIVES)) {
    if (l.includes(k) || k.includes(l)) return v;
  }
  return [];
}

// ── Color utilities ────────────────────────────────────────────────────────
function toHex6(raw: string): string | null {
  raw = raw.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toUpperCase();
  const rgb = raw.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) {
    return `#${Number(rgb[1]).toString(16).padStart(2,"0")}${Number(rgb[2]).toString(16).padStart(2,"0")}${Number(rgb[3]).toString(16).padStart(2,"0")}`.toUpperCase();
  }
  return null;
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  const l = (max+min)/2;
  if (max === min) return { h:0, s:0, l: l*100 };
  const d = max-min;
  const s = l > 0.5 ? d/(2-max-min) : d/(max+min);
  let h = 0;
  if (max === r) h = ((g-b)/d + (g<b?6:0))/6;
  else if (max === g) h = ((b-r)/d + 2)/6;
  else h = ((r-g)/d + 4)/6;
  return { h: h*360, s: s*100, l: l*100 };
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return 0.2126*r + 0.7152*g + 0.0722*b;
}
const isLight    = (h: string) => luminance(h) > 0.55;
const isDark     = (h: string) => luminance(h) < 0.25;
/** A colour dark enough to serve as readable text on a white/light background */
const isTextDark = (h: string) => luminance(h) < 0.55;

/** True if the color is a near-neutral (grey, black-ish, white-ish) */
function isNeutral(hex: string): boolean {
  const { s, l } = hexToHSL(hex);
  return s < 18 || l < 8 || l > 92;
}

const ABSOLUTE_NOISE = new Set([
  "#FFFFFF","#FEFEFE","#FDFDFD","#FCFCFC","#FAFAFA","#F9F9F9","#F8F8F8",
  "#000000","#010101","#020202","#0D0D0D","#TRANSPARENT","#INHERIT",
]);
const isNoise = (h: string) => ABSOLUTE_NOISE.has(h);

// ── CSS var map & resolver ────────────────────────────────────────────────

/** Collect all --name: <color-or-var> declarations.
 *  Stores both direct hex/rgb values AND var() references so resolveValue
 *  can follow chained variables (e.g. Astra: --body-color → var(--ast-global-color-3) → #4B4F58). */
function buildCssVarMap(css: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of css.matchAll(/--([a-z0-9_-]+)\s*:\s*([^;{}"'\n]+)/gi)) {
    const rawVal = m[2].trim().replace(/\s*!important\s*$/, "");
    if (!rawVal) continue;
    const key = `--${m[1].toLowerCase()}`;
    if (/^var\s*\(/.test(rawVal)) {
      // Store var() reference for chained resolution
      map.set(key, rawVal);
    } else {
      // Store only if it looks like a color literal
      const h = toHex6(rawVal);
      if (h && !isNoise(h)) map.set(key, h);
    }
  }
  return map;
}

/** Resolve a CSS value: handles var(--x) references and raw color literals.
 *  Follows up to 4 levels of chained var() references. */
function resolveValue(val: string, varMap: Map<string, string>, depth = 0): string | null {
  if (depth > 4) return null;
  val = val.trim();
  const varM = val.match(/^var\(\s*(--[a-z0-9_-]+)/i);
  if (varM) {
    const resolved = varMap.get(varM[1].toLowerCase());
    if (!resolved) return null;
    return resolveValue(resolved, varMap, depth + 1);
  }
  return toHex6(val);
}

// ── Named CSS var role mapping (Elementor / WordPress) ────────────────────

type RoleMap = Partial<Record<"primary"|"secondary"|"tertiary"|"accent"|"textLight"|"textDark", string>>;

function extractNamedRoles(varMap: Map<string, string>): RoleMap {
  const out: RoleMap = {};
  const v = (name: string) => {
    const raw = varMap.get(name);
    if (!raw) return undefined;
    // Resolve through any var() chain
    const resolved = resolveValue(raw, varMap);
    return (resolved && !isNoise(resolved)) ? resolved : undefined;
  };

  // ── Elementor ──────────────────────────────────────────────────────────────
  const ep = (k: string) => v(`--e-global-color-${k}`) ?? v(`--elementor-global-color-${k}`);
  if (ep("primary"))   out.primary   = ep("primary")!;
  if (ep("secondary")) out.secondary = ep("secondary")!;
  if (ep("accent"))    out.accent    = ep("accent")!;
  if (ep("text"))      out.textLight = ep("text")!;

  // ── WordPress Gutenberg presets ─────────────────────────────────────────────
  for (const [k, raw] of varMap) {
    const hex = resolveValue(raw, varMap);
    if (!hex || isNoise(hex)) continue;
    if (k.includes("preset--color--primary")    && !out.primary)   out.primary   = hex;
    if (k.includes("preset--color--secondary")  && !out.secondary) out.secondary = hex;
    if (k.includes("preset--color--foreground") && !out.textLight) out.textLight = hex;
  }

  // ── Shopify theme CSS vars ──────────────────────────────────────────────────
  // https://shopify.dev/docs/storefronts/themes/architecture/config/settings_schema
  const tryNames = (names: string[], role: keyof RoleMap) => {
    if (out[role]) return;
    for (const n of names) { const x = v(`--${n}`); if (x) { out[role] = x; return; } }
  };
  tryNames(["color-button","color-button-primary","shopify-button","button-primary-background"], "primary");
  tryNames(["color-accent-1","color-accent-2","shopify-accent"], "accent");
  tryNames(["color-heading","color-foreground","color-base-text"], "textLight");
  tryNames(["color-background-contrast","color-inverse-text"], "textDark");

  // ── Ghost CMS ────────────────────────────────────────────────────────────────
  tryNames(["ghost-accent-color","ghost-color-primary"], "primary");

  // ── Bootstrap 5 CSS vars (--bs-primary etc.) ────────────────────────────────
  tryNames(["bs-primary","bs-primary-bg-subtle"], "primary");
  tryNames(["bs-secondary"], "secondary");
  tryNames(["bs-link-color","bs-link-hover-color"], "accent");
  tryNames(["bs-body-color"], "textLight");

  // ── Squarespace (tweak vars) ────────────────────────────────────────────────
  // Squarespace names follow --tweak-color-<role>
  for (const [k, raw] of varMap) {
    const hex = resolveValue(raw, varMap);
    if (!hex || isNoise(hex) || !k.startsWith("--tweak-color-")) continue;
    if (/cta|button-background|primary-button/.test(k) && !out.primary)   out.primary   = hex;
    if (/heading-1|heading-color/.test(k)              && !out.secondary) out.secondary = hex;
    if (/link(?!-hover)/.test(k)                       && !out.accent)    out.accent    = hex;
    if (/body-text|paragraph-text/.test(k)             && !out.textLight) out.textLight = hex;
  }

  // ── Webflow ──────────────────────────────────────────────────────────────────
  tryNames(["color-primary","color-brand","brand-primary","theme-primary","primary-color","accent"], "primary");
  tryNames(["color-secondary","secondary-color","brand-secondary"], "secondary");

  // ── Framer token vars ────────────────────────────────────────────────────────
  tryNames(["token-primary","token-accent","token-brand","token-cta"], "primary");
  tryNames(["token-secondary","token-brand-2"], "secondary");
  tryNames(["token-link","token-accent-secondary"], "accent");
  tryNames(["token-text","token-body","token-foreground"], "textLight");
  tryNames(["token-text-inverse","token-text-dark","token-on-dark"], "textDark");

  // ── Wix Velo-style vars (--color_N palette slots) ───────────────────────────
  // Wix reserves palette slots: 1-5 = site colours, 11-15 = tints, 16-20 = shades
  // Typically slot 11 is primary, 15 is accent. Collect all non-neutral ones.
  const wixSlots = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n => v(`--color_${n}`)).filter(Boolean) as string[];
  const wixBrand = wixSlots.filter(c => !isNeutral(c));
  if (!out.primary   && wixBrand[0]) out.primary   = wixBrand[0];
  if (!out.secondary && wixBrand[1]) out.secondary = wixBrand[1];
  if (!out.accent    && wixBrand[2]) out.accent    = wixBrand[2];
  const wixText = [v("--color_2"), v("--color_3"), v("--color_4")].filter(Boolean) as string[];
  if (!out.textLight && wixText.find(c => isTextDark(c))) out.textLight = wixText.find(c => isTextDark(c));

  // ── Tailwind CSS (config-based CSS vars, common patterns) ───────────────────
  // Many Tailwind setups extend the palette as CSS vars: --tw-color-primary, --color-primary
  tryNames(["color-primary","tw-color-primary","colors-primary"], "primary");
  tryNames(["color-accent","tw-color-accent","colors-accent"], "accent");
  tryNames(["color-foreground","tw-color-foreground","text-primary","text-foreground"], "textLight");

  // ── CSS variable name pattern sweep (any platform) ───────────────────────────
  // If still missing roles, scan ALL var names for semantic keywords
  if (!out.primary || !out.secondary || !out.accent) {
    for (const [k, raw] of varMap) {
      const hex = resolveValue(raw, varMap);
      if (!hex || isNoise(hex) || isNeutral(hex)) continue;
      if (!out.primary   && /primary|brand|cta|highlight/.test(k))   out.primary   = hex;
      if (!out.secondary && /secondary|sub.?color|second/.test(k))    out.secondary = hex;
      if (!out.accent    && /accent|link|action/.test(k))             out.accent    = hex;
    }
  }

  return out;
}

// ── CSS rule parser with semantic selector scoring ────────────────────────

/** Score a CSS selector string for button-ness (0 = not a button).
 *  Covers: custom HTML, WordPress (Elementor + Gutenberg), Bootstrap, Shopify,
 *  Squarespace, Webflow, Ghost, Framer and generic patterns. */
function buttonScore(sel: string): number {
  const s = sel.toLowerCase();
  let w = 0;
  // Elementor (WordPress)
  if (/elementor-button(?![-_](wrapper|icon|text|container))/.test(s)) w += 10;
  // WordPress Gutenberg
  if (/wp-block-button__link/.test(s)) w += 9;
  // Bootstrap
  if (/\bbtn-(primary|success|warning|danger|brand|cta|action)\b/.test(s)) w += 9;
  // Platform-specific
  if (/\b(sqs-block-button-element|squarespace.*button)\b/.test(s)) w += 9; // Squarespace
  if (/\bw-button\b/.test(s)) w += 9; // Webflow
  if (/\bgh-btn\b/.test(s)) w += 9; // Ghost
  if (/\bshopify-payment-button|btn--primary|product-form__submit\b/.test(s)) w += 9; // Shopify
  // Generic semantic patterns (any hand-built site)
  if (/\b(btn|button)\b/.test(s) && !/button-group|btn-link|btn-close|navbar|toggle|menu/.test(s)) w += 6;
  if (/\b(cta|submit|call-to-action|primary-btn|hero-btn|action-btn)\b/.test(s)) w += 6;
  if (/\[type\s*=\s*["']?submit/.test(s)) w += 5;
  // Penalise hover/focus — state colours are less reliable as the "true" brand colour
  if (/:hover|:focus|:active|:visited/.test(s)) w = Math.max(0, w - 2);
  return Math.max(0, w);
}

/** Score a selector for heading-ness */
function headingScore(sel: string): number {
  const s = sel.toLowerCase();
  let w = 0;
  if (/\bh[1-3]\b/.test(s)) w += 7;
  if (/elementor-heading-title/.test(s)) w += 9;
  if (/\b(title|heading|headline|display)\b/.test(s)) w += 3;
  if (/:hover|:focus/.test(s)) w = Math.max(0, w - 2);
  return Math.max(0, w);
}

/** Score a selector for link-ness (not buttons) */
function linkScore(sel: string): number {
  const s = sel.toLowerCase();
  if (/elementor-button|\.btn\b|\.button\b/.test(s)) return 0;
  let w = 0;
  // Bare `a` or `a:link` selectors
  if (/(?:^|[\s,>+~])a(?:$|[\s,:{[>+~])/.test(s)) w += 8;
  if (/\ba:link\b/.test(s)) w += 6;
  if (/\ba:hover\b/.test(s)) w += 3;
  if (/\b(link|anchor)\b/.test(s) && !/button|btn/.test(s)) w += 2;
  return Math.max(0, w);
}

/** Score a selector for body/paragraph text */
function bodyScore(sel: string): number {
  const s = sel.toLowerCase();
  let w = 0;
  if (/(?:^|[\s,])body(?:$|[\s,:{])/.test(s)) w += 8;
  if (/(?:^|[\s,])p(?:$|[\s,:{])/.test(s)) w += 5;
  if (/\.(body|content|copy|paragraph)(-text|-copy|-content)?(?:$|[\s,:{])/.test(s)) w += 3;
  return Math.max(0, w);
}

/**
 * Parse every `selector { declarations }` rule in a CSS string and collect
 * the best color for each semantic role based on selector score × occurrence.
 *
 * Works for any site — not just WordPress/Elementor.
 */
function extractFromCss(
  css: string,
  scorer: (sel: string) => number,
  propPattern: RegExp,
  varMap: Map<string, string>,
  skipNeutral = true,
): string | undefined {
  const candidates = new Map<string, number>(); // hex → accumulated score

  // Strip @keyframes and @font-face blocks to avoid false matches
  const cleaned = css
    .replace(/@(?:keyframes|font-face)[^{]*\{[^}]*\}/gi, "")
    .replace(/@(?:keyframes|font-face)[^{]*\{[\s\S]*?\}/gi, "");

  // Match selector { declarations }
  for (const m of cleaned.matchAll(/([^{}@\n][^{}]*)\{([^{}]+)\}/g)) {
    const selBlock = m[1].trim();
    const declarations = m[2];

    // Score the worst-case comma-separated selector (use max)
    const weight = selBlock.split(",").reduce((max, s) => Math.max(max, scorer(s.trim())), 0);
    if (weight <= 0) continue;

    for (const pm of declarations.matchAll(propPattern)) {
      const resolved = resolveValue(pm[1].trim(), varMap);
      if (!resolved || isNoise(resolved)) continue;
      if (skipNeutral && isNeutral(resolved)) continue;
      candidates.set(resolved, (candidates.get(resolved) ?? 0) + weight);
    }
  }

  let best: string | undefined;
  let bestScore = 0;
  for (const [color, score] of candidates) {
    if (score > bestScore) { best = color; bestScore = score; }
  }
  return best;
}

// ── Inline HTML style= fallback ───────────────────────────────────────────

/** Pull a CSS property from an inline style string, resolving var() */
function inlineProperty(style: string, prop: RegExp, varMap: Map<string, string>, skipNeutral = true): string | null {
  const m = style.match(prop);
  if (!m) return null;
  const resolved = resolveValue(m[1], varMap);
  if (!resolved || isNoise(resolved)) return null;
  if (skipNeutral && isNeutral(resolved)) return null;
  return resolved;
}

function htmlCtaColors(html: string, varMap: Map<string, string>): string[] {
  const colors: string[] = [];
  const bgProp = /background(?:-color)?\s*:\s*([^;]+)/i;
  const patterns = [
    /<a[^>]+class="[^"]*elementor-button[^"]*"[^>]*style="([^"]+)"/gi,
    /<a[^>]+style="([^"]+)"[^>]+class="[^"]*elementor-button[^"]*"/gi,
    /<(?:a|button)[^>]+class="[^"]*\b(?:btn|button|cta)\b[^"]*"[^>]*style="([^"]+)"/gi,
    /<(?:a|button)[^>]+style="([^"]+)"[^>]+class="[^"]*\b(?:btn|button|cta)\b[^"]*"/gi,
  ];
  for (const re of patterns)
    for (const m of html.matchAll(re)) {
      const col = inlineProperty(m[1], bgProp, varMap);
      if (col) colors.push(col);
    }
  return colors;
}

function htmlHeadingColors(html: string, varMap: Map<string, string>): string[] {
  const colors: string[] = [];
  const colProp = /\bcolor\s*:\s*([^;]+)/i;
  for (const m of html.matchAll(/<h[1-3][^>]*style="([^"]+)"/gi)) {
    const col = inlineProperty(m[1], colProp, varMap);
    if (col) colors.push(col);
  }
  for (const m of html.matchAll(/<[^>]+class="[^"]*elementor-heading-title[^"]*"[^>]*style="([^"]+)"/gi)) {
    const col = inlineProperty(m[1], colProp, varMap);
    if (col) colors.push(col);
  }
  return colors;
}

function htmlLinkColors(html: string, varMap: Map<string, string>): string[] {
  const colors: string[] = [];
  const colProp = /\bcolor\s*:\s*([^;]+)/i;
  for (const m of html.matchAll(/<a[^>]+style="([^"]+)"/gi)) {
    if (/elementor-button|btn|button|cta/i.test(m[0])) continue;
    const col = inlineProperty(m[1], colProp, varMap);
    if (col) colors.push(col);
  }
  return colors;
}

/**
 * Last-resort sweep: scan entire HTML source for any hex color that appears
 * in a context suggesting it's a brand/accent colour (not just noise).
 * Returns colors in rough order of "brand-ness" (most saturated first).
 */
function htmlColorSweep(html: string): string[] {
  const freq = new Map<string, number>();

  // Inline style attributes on any element
  for (const m of html.matchAll(/style="([^"]+)"/gi)) {
    for (const cm of m[1].matchAll(/#[0-9a-fA-F]{6}\b/g)) {
      const h = toHex6(cm[0]);
      if (h && !isNoise(h)) freq.set(h, (freq.get(h) ?? 0) + 1);
    }
    for (const cm of m[1].matchAll(/rgba?\([^)]+\)/g)) {
      const h = toHex6(cm[0]);
      if (h && !isNoise(h)) freq.set(h, (freq.get(h) ?? 0) + 1);
    }
  }
  // SVG fill / stroke attributes
  for (const m of html.matchAll(/(?:fill|stroke)="(#[0-9a-fA-F]{3,6})"/gi)) {
    const h = toHex6(m[1]);
    if (h && !isNoise(h) && !isNeutral(h)) freq.set(h, (freq.get(h) ?? 0) + 2);
  }

  // Sort: non-neutral colors (brand hues) by frequency, then by saturation
  return [...freq.entries()]
    .filter(([h]) => !isNeutral(h))
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return hexToHSL(b[0]).s - hexToHSL(a[0]).s;
    })
    .map(([h]) => h);
}

// ── Font detection ────────────────────────────────────────────────────────

/**
 * Well-known Google Fonts by name.
 * Used to identify self-hosted Google Fonts (served via @font-face without a googleapis.com
 * link — common when WP caching plugins like OMGF / Autoptimize self-host them).
 */
const GOOGLE_FONTS_SET = new Set([
  // Sans-serif
  "Open Sans","Lato","Roboto","Montserrat","Source Sans 3","Source Sans Pro",
  "Oswald","Raleway","Poppins","Ubuntu","Merriweather Sans","Nunito",
  "PT Sans","Noto Sans","Exo 2","Josefin Sans","Titillium Web",
  "Fira Sans","Barlow","Inter","DM Sans","Plus Jakarta Sans","Outfit",
  "Karla","Mulish","Quicksand","Work Sans","Cabin","Jost","Nunito Sans",
  "Lexend","Be Vietnam Pro","Manrope","Sora","Figtree","Onest",
  "Barlow Condensed","Barlow Semi Condensed","Roboto Condensed","Roboto Flex",
  "Exo","Asap","Hind","Arimo","Encode Sans","Sarabun","Libre Franklin",
  "Heebo","IBM Plex Sans","IBM Plex Mono","Space Grotesk","Space Mono",
  "Albert Sans","Bricolage Grotesque","Rubik","Rajdhani","Khand","Kanit",
  "Teko","Catamaran","Dosis","Assistant","Questrial","Signika",
  "Varela Round","Hanken Grotesk","Geologica","Urbanist","Spline Sans",
  "Spline Sans Mono","Instrument Sans",
  // Serif
  "Playfair Display","Lora","Merriweather","PT Serif","Libre Baskerville",
  "Crimson Text","Crimson Pro","EB Garamond","Cormorant Garamond","Cormorant",
  "Domine","Libre Caslon Text","Libre Caslon Display","Zilla Slab",
  "DM Serif Display","DM Serif Text","Quattrocento","Cardo","Spectral",
  "Alegreya","Alegreya Sans","Alfa Slab One","Arvo","Bitter",
  "Roboto Slab","Source Serif 4","Source Serif Pro","Noto Serif",
  "IBM Plex Serif","Vollkorn","Noticia Text","Old Standard TT",
  "Unna","Lusitana","Tinos","Frank Ruhl Libre","Yeseva One","Cinzel",
  "Forum","Marcellus","Martel","Neuton","GFS Didot","Noto Serif Display",
  "Instrument Serif","Cormorant Infant","Faustina",
  // Display / decorative
  "Abril Fatface","Righteous","Pacifico","Lobster","Fredoka One",
  "Boogaloo","Comfortaa","Secular One","Audiowide","Bebas Neue",
  "Anton","Big Shoulders Display","Big Shoulders Text","Squada One",
  "Bree Serif","Fjalla One","Oleo Script","Dancing Script",
  "Permanent Marker","Sacramento","Great Vibes","Caveat","Kalam",
  "Patrick Hand","Satisfy","Parisienne","Allura","Alex Brush",
  "Architects Daughter","Rock Salt","Shadows Into Light","Indie Flower",
  "Amatic SC","Special Elite","Bangers","Ultra","Black Ops One",
  "Rubik Mono One","Francois One","Yanone Kaffeesatz","Archivo Narrow",
  "PT Sans Narrow","Oswald","Cuprum","Philosopher",
  // Monospace
  "Source Code Pro","Inconsolata","Fira Code","Fira Mono",
  "Roboto Mono","Courier Prime","Anonymous Pro","JetBrains Mono",
  "Share Tech Mono","PT Mono",
  // Commonly used misc
  "Red Hat Display","Red Hat Text","Red Hat Mono",
  "Acme","Julius Sans One","Tenor Sans","Cantarell",
  "Varela","Exo","Muli",
].map(n => n.toLowerCase()));

/**
 * Known commercial (paid-licence) font families.
 * Only fonts in this set show the "Likely licensed" warning badge.
 */
const COMMERCIAL_FONTS_SET = new Set([
  "proxima nova","proxima nova condensed","proxima nova extra condensed",
  "brandon grotesque","brandon text",
  "freight sans","freight text","freight display","freight big","freight micro",
  "futura","futura pt","futura now",
  "gotham","gotham narrow","gotham rounded","gotham condensed",
  "avenir","avenir next","avenir next condensed",
  "gill sans","gill sans nova","gill sans mt",
  "trade gothic","trade gothic next","trade gothic bold condensed",
  "din","din 2014","din pro","din next",
  "helvetica","helvetica neue","helvetica now",
  "frutiger","frutiger next",
  "myriad","myriad pro",
  "garamond","adobe garamond","adobe garamond pro",
  "caslon","adobe caslon","big caslon","itc caslon",
  "minion","minion pro",
  "chronicle","chronicle display","chronicle text",
  "canela","canela condensed","canela deck",
  "recoleta",
  "circular","circular std","circular pro",
  "calibre","calibre light",
  "national","national 2",
  "acumin",
  "skolar","skolar sans",
  "tiempos","tiempos headline","tiempos text",
  "graphik","graphik condensed","graphik wide",
  "neue haas grotesk","neue haas unica",
  "apercu","apercu mono","apercu condensed",
  "aktiv grotesk","aktiv grotesk condensed","aktiv grotesk extended",
  "sofia pro","sofia",
  "museo","museo sans","museo slab",
  "clarendon",
  "rockwell",
  "brown","brown ll",
  "pangram","pangram sans","pangram serif",
  "larsseit",
  "p22 underground","itc avant garde","itc franklin gothic",
  "univers",
]);

/**
 * Icon / UI symbol fonts — @font-face declarations for these should be ignored entirely.
 * They are not brand typefaces.
 */
const ICON_FONT_NAMES = new Set([
  "woocommerce","woocommerce-smallscreen","woocommerce-font",
  "dashicons","genericons","genericons neue",
  "fontawesome","font awesome 4","font awesome 5 free","font awesome 5 brands",
  "font awesome 6 free","font awesome 6 brands","font awesome 6 pro",
  "fa","fas","far","fab","fal","fad",
  "material icons","material icons outlined","material icons round",
  "material icons sharp","material icons two tone",
  "material symbols outlined","material symbols rounded","material symbols sharp",
  "ionicons","feather","remixicon","remix icon",
  "linearicons","lineicons","simple-line-icons","icomoon","icomoonfree",
  "etline","entypo","themify","themify icons",
  "bootstrap icons","bi","pe-icon-7-stroke",
  "revicons","swiper-icons","flaticon","elegant-icons",
  "stroke-gap-icons","nucleo","tabler-icons",
  "wpforms icons","eicon","eicons","e-font-icon-svg",
  "jost icons","jet-blog","jet-elements","jet-tabs","premium-addons",
  "noto color emoji","noto emoji","twemoji",
]);

/** Returns true if the name looks like a real typeface, not an icon font or plugin slug. */
function isTypographicFont(name: string): boolean {
  const lower = name.toLowerCase().trim();

  // Known icon / symbol fonts
  if (ICON_FONT_NAMES.has(lower)) return false;

  // Slug-like names: all-lowercase with 2+ hyphen segments, often containing digits
  // e.g. "dw-dev-doh1-parallel-lines", "ziva-collection-quotes-1"
  if (/^[a-z][a-z0-9]*(-[a-z0-9]+){2,}$/.test(name.trim())) return false;

  // Names ending in a digit suffix after a hyphen: "something-1", "quotes-1"
  if (/^[a-z][a-z-]+-\d+$/.test(name.trim())) return false;

  // Very short (likely aliases or internal IDs)
  if (name.trim().length <= 2) return false;

  return true;
}

/** Returns true only if the font name is a known commercial typeface that needs a licence. */
function isLikelyPaidFont(name: string): boolean {
  const lower = name.toLowerCase().trim();
  if (COMMERCIAL_FONTS_SET.has(lower)) return true;
  // Partial-match for families like "Proxima Nova Alt", "Gotham Book" etc.
  for (const k of COMMERCIAL_FONTS_SET) {
    if (lower.startsWith(k + " ") || lower.startsWith(k + "-")) return true;
  }
  return false;
}

function extractGoogleFonts(html: string): string[] {
  const fonts: string[] = [];
  for (const m of html.matchAll(/fonts\.googleapis\.com\/css[^"']*[?&]family=([^&"']+)/gi)) {
    for (const f of decodeURIComponent(m[1]).split("|")) {
      const name = f.split(":")[0].replace(/\+/g, " ").trim();
      if (name && !fonts.includes(name)) fonts.push(name);
    }
  }
  // Also check @import in CSS
  for (const m of html.matchAll(/@import\s+url\(['"]?https:\/\/fonts\.googleapis\.com\/css[^'")\s]*family=([^&'")\s]+)/gi)) {
    const name = decodeURIComponent(m[1]).split(":")[0].replace(/\+/g, " ").trim();
    if (name && !fonts.includes(name)) fonts.push(name);
  }
  return fonts;
}

/** Extract @font-face declarations, capturing both the font-family name and src URL fragment. */
function extractCustomFonts(html: string): Array<{ name: string; srcHint: string }> {
  const seen = new Set<string>();
  const results: Array<{ name: string; srcHint: string }> = [];

  for (const m of html.matchAll(/@font-face\s*\{([^}]+)\}/gi)) {
    const block = m[1];
    const familyM = block.match(/font-family:\s*["']?([^;"'\n}]+)/i);
    if (!familyM) continue;
    const name = familyM[1].replace(/["']/g, "").trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());

    const srcM = block.match(/src\s*:\s*([^;]+)/i);
    const srcHint = srcM ? srcM[1].slice(0, 300) : "";
    results.push({ name, srcHint });
  }
  return results;
}

// ── Fetch helpers ──────────────────────────────────────────────────────────
async function tryFetch(url: string, timeout = 6000): Promise<string> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BrandAnalyzer/1.0)" },
    });
    return res.ok ? res.text() : "";
  } catch { return ""; }
}

/** Score a CSS file URL so brand-relevant files are fetched first.
 *  Works for WordPress/Elementor AND Shopify, Webflow, custom sites. */
function cssPriority(url: string): number {
  const u = url.toLowerCase();

  // ── WordPress / Elementor specifics ──────────────────────────────────────
  if (/elementor\/css\/post-\d+/.test(u)) return 100; // page-specific element colours
  if (/elementor\/css\/(custom|global)/.test(u)) return 80;
  if (/\/themes\//.test(u)) return 70; // WordPress theme CSS

  // ── Shopify, Webflow, generic CDN asset CSS ───────────────────────────────
  if (/cdn\.shopify\.com.*\.css/.test(u)) return 70;
  if (/assets-global\.website-files\.com.*\.css/.test(u)) return 70; // Webflow
  if (/\/assets\/.*(?:theme|main|app|style|bundle|application).*\.css/.test(u)) return 65;

  // ── Known irrelevant libraries — skip ─────────────────────────────────────
  if (/\/(woocommerce|paypal|photoswipe|swiper|fontawesome|font-awesome|dashicons|jquery|bootstrap|normalize|reset|print)/.test(u)) return 0;
  if (/plugins\/(add-search|fluent|cartflows|sticky|essential-addons)/.test(u)) return 0;

  // ── Everything else — fetch it (might be a custom site's only CSS) ─────────
  return 40;
}

async function fetchExternalCss(html: string, baseUrl: string): Promise<string> {
  // Parse every <link> tag regardless of attribute order
  const linkTags = [...html.matchAll(/<link([^>]+)>/gi)];
  const candidates: { url: string; priority: number }[] = [];

  for (const lt of linkTags) {
    const attrs = lt[1];
    if (!/rel=["']stylesheet["']/i.test(attrs)) continue;
    const hrefM = attrs.match(/href=["']([^"']+)["']/i);
    if (!hrefM) continue;
    try {
      const resolved = new URL(hrefM[1], baseUrl).href;
      const priority = cssPriority(resolved);
      if (priority > 0) candidates.push({ url: resolved, priority });
    } catch { /* skip malformed URLs */ }
  }

  // Sort by priority descending, pick top 8
  candidates.sort((a, b) => b.priority - a.priority);
  const top = candidates.slice(0, 8);

  const blocks = await Promise.all(top.map(c => tryFetch(c.url, 8000)));
  return blocks.join("\n");
}


// ── Main ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { websiteUrl } = await req.json();
  if (!websiteUrl) return NextResponse.json({ error: "websiteUrl required" }, { status: 400 });

  const normalised = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;

  const res = await tryFetch(normalised, 12000);
  if (!res) return NextResponse.json({ error: "Could not fetch website" }, { status: 422 });

  const html = res;
  const inlineStyles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join("\n");
  const externalCss  = await fetchExternalCss(html, normalised);
  const allCss = inlineStyles + "\n" + externalCss;

  // ── Fonts
  const googleFonts = extractGoogleFonts(html + allCss);
  const googleFontsLower = new Set(googleFonts.map(g => g.toLowerCase()));

  // Process @font-face declarations:
  //   1. Ignore icon fonts and plugin slugs entirely
  //   2. Self-hosted Google Fonts (detected by name match or Google CDN src) → googleFonts
  //   3. Remaining typographic fonts → customFonts with accurate isLikelyPaid flag
  const customFonts: { detected: string; isLikelyPaid: boolean; googleAlternatives: string[] }[] = [];

  for (const { name, srcHint } of extractCustomFonts(html + allCss)) {
    // Skip if already in googleFonts
    if (googleFontsLower.has(name.toLowerCase())) continue;

    // Skip non-typographic fonts (icon sets, plugin kit slugs)
    if (!isTypographicFont(name)) continue;

    const lower = name.toLowerCase();

    // Classify as Google Font if:
    //   a) name matches our Google Fonts reference list, OR
    //   b) the @font-face src URL points to Google CDN (self-hosted via caching plugin)
    const srcPointsToGoogle = /fonts\.gstatic\.com|googleapis\.com/.test(srcHint);
    const nameMatchesGoogle = GOOGLE_FONTS_SET.has(lower);

    if (nameMatchesGoogle || srcPointsToGoogle) {
      googleFonts.push(name);
      googleFontsLower.add(lower);
      continue;
    }

    // Custom / potentially paid font
    customFonts.push({
      detected: name,
      isLikelyPaid: isLikelyPaidFont(name),
      googleAlternatives: findGoogleAlternative(name),
    });
  }

  // ── meta[name="theme-color"] — reliable primary hint for PWAs & mobile-optimised sites
  let metaThemeColor: string | undefined;
  const metaMatch = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i);
  if (metaMatch) {
    const h = toHex6(metaMatch[1]);
    if (h && !isNoise(h) && !isNeutral(h)) metaThemeColor = h;
  }

  // ── Layer 1: build CSS var map (used for var() resolution throughout)
  const varMap = buildCssVarMap(allCss);

  // ── Layer 2: named Elementor / WP roles from var names  (most reliable)
  const namedRoles = extractNamedRoles(varMap);

  // ── Layer 3: CSS selector scoring  (catch-all — works for any site)
  // Fresh regex each call to avoid lastIndex state issues
  // Scan both background AND border-color on button selectors:
  // Many modern Elementor/page-builder CTAs use transparent backgrounds + a coloured border,
  // so border-color is a first-class signal for the primary brand CTA colour.
  const ctaBgFromCss     = extractFromCss(allCss, buttonScore,  /background(?:-color)?\s*:\s*([^;]+)/gi,                            varMap, true);
  const ctaBorderFromCss = extractFromCss(allCss, buttonScore,  /border(?:-(?:top|right|bottom|left))?-color\s*:\s*([^;]+)/gi,       varMap, true);
  const headingFromCss   = extractFromCss(allCss, headingScore, /\bcolor\s*:\s*([^;]+)/gi,                                          varMap, true);
  const linkFromCss      = extractFromCss(allCss, linkScore,    /\bcolor\s*:\s*([^;]+)/gi,                                          varMap, true);
  const bodyFromCss      = extractFromCss(allCss, bodyScore,    /\bcolor\s*:\s*([^;]+)/gi,                                          varMap, false);

  // Alias for backwards-compat with assembly below
  const ctaFromCss = ctaBgFromCss;

  // ── Layer 4: inline HTML style= attributes (Elementor supplement)
  const ctaFromHtml     = htmlCtaColors(html, varMap);
  const headingFromHtml = htmlHeadingColors(html, varMap);
  const linkFromHtml    = htmlLinkColors(html, varMap);

  // ── Layer 5 (sweep): saturated colors from any inline/SVG context
  const sweepColors = htmlColorSweep(html);

  // ── Layer 6: text-on-dark detection
  // Strategy A: CSS rules where same block has a dark bg AND a light color
  let textDark: string | undefined;
  for (const m of allCss.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
    const block = m[2];
    const bgM  = block.match(/background(?:-color)?\s*:\s*([^;{}"'\n]+)/i);
    const colM = block.match(/\bcolor\s*:\s*([^;{}"'\n]+)/i);
    if (!bgM || !colM) continue;
    const bg  = resolveValue(bgM[1], varMap);
    const col = resolveValue(colM[1], varMap);
    if (bg && col && isDark(bg) && isLight(col) && !isNoise(col)) { textDark = col; break; }
  }
  // Strategy B: find the most-used light color in `color:` CSS properties
  // (on Elementor/most sites, text on dark sections is #FFF set on many inner elements)
  if (!textDark) {
    const lightColorFreq = new Map<string, number>();
    for (const m of allCss.matchAll(/\bcolor\s*:\s*([^;{}"'\n]+)/gi)) {
      const resolved = resolveValue(m[1].trim(), varMap);
      if (resolved && isLight(resolved) && !isNoise(resolved)) {
        lightColorFreq.set(resolved, (lightColorFreq.get(resolved) ?? 0) + 1);
      }
    }
    // Pick the most frequent light color — at least 3 occurrences to avoid false positives
    let bestCount = 2;
    for (const [col, count] of lightColorFreq) {
      if (count > bestCount) { textDark = col; bestCount = count; }
    }
  }

  // ── Assemble roles: first non-null candidate wins, no repeats
  const reserved = new Set<string>();
  const pick = (...candidates: (string | null | undefined)[]): string | undefined => {
    for (const c of candidates) {
      if (c && !isNoise(c) && !reserved.has(c)) { reserved.add(c); return c; }
    }
    return undefined;
  };

  // ── Assemble: priority rationale
  //
  // PRIMARY — the main CTA action colour.
  //   1. Inline CTA background (most specific evidence)
  //   2. CSS button background (general rule-based evidence)
  //   3. CSS button border-color — many modern Elementor/builder CTAs use transparent
  //      backgrounds + a coloured border, making this a first-class CTA signal
  //   4. Named accent var — Elementor/WP "accent" is more often the CTA colour than
  //      the misleadingly-named "primary" slot (which designers frequently repurpose
  //      for headings or supporting brand colours)
  //   5. Heading colours and sweep as progressively weaker fallbacks
  //   6. Named "primary" var LAST — unreliable; sites routinely store heading/bg
  //      colours there rather than the real action colour
  //
  // SECONDARY — supporting brand colour (often a heading or section background hue).
  //   namedRoles.primary is tried here because on Elementor sites the designer often
  //   puts a brand supporting colour in the "primary" slot.
  //
  // ACCENT — link / highlight colour.
  //   namedRoles.accent is the fallback; may already be consumed by primary above.

  const primary   = pick(
    ctaFromHtml[0],
    ctaFromCss,
    ctaBorderFromCss,      // transparent-bg CTA buttons signal their brand colour via border
    namedRoles.accent,     // named accent is usually more "CTA-like" than named primary
    headingFromHtml[0], headingFromCss,
    sweepColors[0], metaThemeColor,
    namedRoles.primary,    // last resort: named primary is often a heading/supporting colour
  );
  const accent    = pick(linkFromHtml[0], linkFromCss, ctaFromHtml[1], sweepColors.find(h => !reserved.has(h)), namedRoles.accent);
  const secondary = pick(
    headingFromHtml.find(h => !reserved.has(h)),
    headingFromCss !== primary ? headingFromCss : undefined,
    namedRoles.primary,    // try named primary here — often belongs in the supporting role
    namedRoles.secondary,
    ctaFromHtml.find(h => !reserved.has(h)),
    sweepColors.find(h => !reserved.has(h)),
  );
  const tertiary  = pick(
    [...headingFromHtml, ...ctaFromHtml, ...linkFromHtml].find(h => !reserved.has(h)),
    sweepColors.find(h => !reserved.has(h)),
    namedRoles.secondary,  // named secondary as last resort
    namedRoles.tertiary,
  );
  const textLight = pick(bodyFromCss, namedRoles.textLight);

  const brandColors = {
    primary,
    secondary,
    tertiary,
    // luminance < 0.55 covers all realistic body-text grays (#333, #4B4F58, #666 etc.)
    textLight: textLight && !isNoise(textLight) && isTextDark(textLight) ? textLight : undefined,
    // textDark must be a genuinely light colour (white / near-white text on dark bg)
    textDark:  textDark  && !isNoise(textDark)  && isLight(textDark)    ? textDark  : undefined,
    accent,
  };

  const cssFontHints = detectFontRolesFromCss(allCss);
  const roles = resolveFontRoles(googleFonts, cssFontHints);

  return NextResponse.json({
    googleFonts,
    customFonts,
    brandColors,
    fontDisplay: roles.display,
    fontBody: roles.body,
  });
}
