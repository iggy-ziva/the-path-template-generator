// Extract a brand palette + fonts from a Figma file using the REST API.
// We read the document JSON directly: solid fills become colour candidates
// (named colour styles win role assignment), and TEXT node styles reveal the
// heading/body typefaces. Output matches the wizard's brand-analysis shape.

const FIGMA_API = "https://api.figma.com/v1";

export interface FigmaBrandResult {
  brandColors: {
    primary?: string | null;
    secondary?: string | null;
    tertiary?: string | null;
    textLight?: string | null;
    textDark?: string | null;
    accent?: string | null;
  };
  googleFonts: string[];
  customFonts: { detected: string; isLikelyPaid: boolean; googleAlternatives: string[] }[];
  fontDisplay?: string;
  fontBody?: string;
}

export class FigmaAccessError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface FigmaColor { r: number; g: number; b: number; a?: number }
interface FigmaPaint { type: string; color?: FigmaColor; opacity?: number; visible?: boolean }
interface FigmaTypeStyle { fontFamily?: string; fontSize?: number }
interface FigmaNode {
  type: string;
  fills?: FigmaPaint[];
  style?: FigmaTypeStyle;
  styles?: Record<string, string>;
  absoluteBoundingBox?: { width: number; height: number } | null;
  children?: FigmaNode[];
}
type StyleMap = Record<string, { name?: string; styleType?: string }>;

/** Parse `fileKey` (+ optional node id) from any Figma design/file URL. */
export function parseFigmaFileRef(url: string): { fileKey: string; nodeId?: string } | null {
  try {
    const u = new URL(url.trim());
    if (!/figma\.com$/.test(u.hostname) && !u.hostname.endsWith(".figma.com")) return null;
    const m = u.pathname.match(/\/(?:file|design|board)\/([A-Za-z0-9]+)/);
    if (!m) return null;
    const fileKey = m[1];
    const rawNode = u.searchParams.get("node-id") ?? undefined;
    // URLs use "1-23"; the API expects "1:23".
    const nodeId = rawNode ? rawNode.replace(/-/g, ":") : undefined;
    return { fileKey, nodeId };
  } catch {
    return null;
  }
}

async function figmaGet(path: string, token: string): Promise<unknown> {
  const res = await fetch(`${FIGMA_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    let detail = "";
    try { detail = ((await res.json()) as { err?: string }).err ?? ""; } catch { /* ignore */ }
    if (res.status === 403) throw new FigmaAccessError(403, "No access to this Figma file — make sure you have opened it and granted file read access.");
    if (res.status === 404) throw new FigmaAccessError(404, "Figma file not found. Check the link.");
    if (res.status === 429) throw new FigmaAccessError(429, "Figma rate limit hit — please try again in a moment.");
    throw new FigmaAccessError(res.status, detail || `Figma API error (${res.status}).`);
  }
  return res.json();
}

// ── colour maths ────────────────────────────────────────────────────────────
function toHex(c: FigmaColor): string {
  const to = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0");
  return `#${to(c.r)}${to(c.g)}${to(c.b)}`.toUpperCase();
}
function rgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
function lightness(hex: string): number {
  const { r, g, b } = rgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
function saturation(hex: string): number {
  const { r, g, b } = rgb(hex);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}
function hue(hex: string): number {
  const { r, g, b } = rgb(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}
function hueDist(a: string, b: string): number {
  const d = Math.abs(hue(a) - hue(b));
  return Math.min(d, 360 - d);
}
const isNeutral = (hex: string) => saturation(hex) < 0.12;
const isNearWhite = (hex: string) => lightness(hex) > 0.92;
const isNearBlack = (hex: string) => lightness(hex) < 0.08;

interface FillEntry { hex: string; weight: number; styleName?: string; isText: boolean }
interface TextEntry { family: string; size: number }

function traverse(root: FigmaNode, styleMap: StyleMap, fills: FillEntry[], texts: TextEntry[]) {
  const stack: FigmaNode[] = [root];
  let guard = 0;
  while (stack.length && guard < 200000) {
    guard++;
    const node = stack.pop()!;
    const area = node.absoluteBoundingBox
      ? Math.max(1, (node.absoluteBoundingBox.width || 0) * (node.absoluteBoundingBox.height || 0))
      : 1;
    const isText = node.type === "TEXT";

    if (Array.isArray(node.fills)) {
      const fillStyleName = node.styles?.fill ? styleMap[node.styles.fill]?.name : undefined;
      for (const paint of node.fills) {
        if (paint.type !== "SOLID" || paint.visible === false || !paint.color) continue;
        if ((paint.color.a ?? paint.opacity ?? 1) < 0.1) continue;
        fills.push({ hex: toHex(paint.color), weight: isText ? Math.min(area, 5000) : area, styleName: fillStyleName, isText });
      }
    }
    if (isText && node.style?.fontFamily) {
      texts.push({ family: node.style.fontFamily, size: node.style.fontSize ?? 16 });
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) stack.push(child);
    }
  }
}

function tallyByHex(entries: FillEntry[]): { hex: string; weight: number }[] {
  const map = new Map<string, number>();
  for (const e of entries) map.set(e.hex, (map.get(e.hex) ?? 0) + e.weight);
  return [...map.entries()].map(([hex, weight]) => ({ hex, weight })).sort((a, b) => b.weight - a.weight);
}

function matchNamed(fills: FillEntry[], re: RegExp): string | undefined {
  const hit = fills.find((f) => f.styleName && re.test(f.styleName));
  return hit?.hex;
}

function assignColors(fills: FillEntry[]): FigmaBrandResult["brandColors"] {
  const nonText = fills.filter((f) => !f.isText);
  const textFills = fills.filter((f) => f.isText);

  const brandCandidates = tallyByHex(fills.filter((f) => !isNeutral(f.hex) && !isNearWhite(f.hex) && !isNearBlack(f.hex)))
    .map((c) => c.hex);

  const primary = matchNamed(fills, /primary|brand|main/i) ?? brandCandidates[0];
  const secondary =
    matchNamed(fills, /secondary/i) ??
    brandCandidates.find((h) => primary && h !== primary && hueDist(h, primary) > 25);
  const tertiary =
    matchNamed(fills, /tertiary|third/i) ??
    brandCandidates.find((h) => h !== primary && h !== secondary && (!primary || hueDist(h, primary) > 25) && (!secondary || hueDist(h, secondary) > 25));
  const accent = matchNamed(fills, /accent|link|highlight/i) ?? primary;

  // Schema role naming: textLight = dark text used on light backgrounds;
  // textDark = light text used on dark backgrounds.
  const darkTexts = tallyByHex(textFills.filter((f) => lightness(f.hex) < 0.5)).map((c) => c.hex);
  const lightTexts = tallyByHex(textFills.filter((f) => lightness(f.hex) > 0.6)).map((c) => c.hex);
  const textLight = matchNamed(fills, /text.*(dark|body|default|primary)|body|ink/i) ?? darkTexts[0] ?? "#2E2E2E";
  const textDark = matchNamed(fills, /text.*(light|inverse|white|on.?dark)|inverse/i) ?? lightTexts[0] ?? "#FFFFFF";

  const clean = (v?: string) => (v && /^#[0-9A-F]{6}$/i.test(v) ? v.toUpperCase() : null);
  void nonText; // (kept for clarity; brandCandidates already spans all fills)
  return {
    primary: clean(primary),
    secondary: clean(secondary),
    tertiary: clean(tertiary),
    accent: clean(accent),
    textLight: clean(textLight),
    textDark: clean(textDark),
  };
}

function assignFonts(texts: TextEntry[]): { googleFonts: string[]; fontDisplay?: string; fontBody?: string } {
  if (!texts.length) return { googleFonts: [] };
  const freq = (list: TextEntry[]) => {
    const m = new Map<string, number>();
    for (const t of list) m.set(t.family, (m.get(t.family) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([f]) => f);
  };
  const headings = texts.filter((t) => t.size >= 20);
  const body = texts.filter((t) => t.size < 20);
  const fontDisplay = (freq(headings)[0] ?? freq(texts)[0]);
  const fontBody = (freq(body)[0] ?? freq(texts).find((f) => f !== fontDisplay) ?? fontDisplay);
  const googleFonts = [...new Set(freq(texts))].slice(0, 8);
  return { googleFonts, fontDisplay, fontBody };
}

/** Fetch a Figma file (or a specific node) and derive brand colours + fonts. */
export async function extractBrandFromFigma(fileUrl: string, token: string): Promise<FigmaBrandResult> {
  const ref = parseFigmaFileRef(fileUrl);
  if (!ref) throw new FigmaAccessError(400, "That doesn't look like a Figma file link.");

  const fills: FillEntry[] = [];
  const texts: TextEntry[] = [];

  if (ref.nodeId) {
    const json = (await figmaGet(`/files/${ref.fileKey}/nodes?ids=${encodeURIComponent(ref.nodeId)}`, token)) as {
      nodes?: Record<string, { document?: FigmaNode; styles?: StyleMap }>;
    };
    const entries = Object.values(json.nodes ?? {});
    if (!entries.length) throw new FigmaAccessError(404, "That frame could not be read from the file.");
    for (const entry of entries) {
      if (entry.document) traverse(entry.document, entry.styles ?? {}, fills, texts);
    }
  } else {
    const json = (await figmaGet(`/files/${ref.fileKey}`, token)) as { document?: FigmaNode; styles?: StyleMap };
    if (!json.document) throw new FigmaAccessError(404, "That file could not be read.");
    traverse(json.document, json.styles ?? {}, fills, texts);
  }

  if (!fills.length && !texts.length) {
    throw new FigmaAccessError(422, "No colours or text styles were found in that file or frame.");
  }

  const brandColors = assignColors(fills);
  const { googleFonts, fontDisplay, fontBody } = assignFonts(texts);

  return { brandColors, googleFonts, customFonts: [], fontDisplay, fontBody };
}
