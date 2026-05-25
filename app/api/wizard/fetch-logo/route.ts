import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function extractDomain(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

/**
 * Reads the PNG IHDR color type byte to detect alpha channel.
 * PNG layout: 8-byte sig | 4 IHDR-len | 4 "IHDR" | 4 width | 4 height | 1 bitDepth | 1 colorType
 * Color type 4 = Grayscale+Alpha, 6 = RGBA → has transparency.
 */
function pngHasAlpha(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 26) return false;
  const colorType = bytes[25];
  return colorType === 4 || colorType === 6;
}

/**
 * Check an SVG string for white or near-white fill/stroke with no explicit background rect —
 * a strong signal the logo is designed for dark backgrounds.
 */
function svgIsLikelyWhiteOnTransparent(buffer: ArrayBuffer): boolean {
  const text = new TextDecoder().decode(buffer);
  const hasWhite = /(fill|stroke)=["']#(?:fff|ffffff|FFF|FFFFFF)["']/i.test(text)
    || /fill:\s*(?:#fff|white)/i.test(text);
  const hasDarkBg = /<rect[^>]+fill=["']#(?!fff)[0-9a-f]{3,6}/i.test(text);
  return hasWhite && !hasDarkBg;
}

async function fetchImageBuffer(url: string): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LogoFetcher/1.0)" },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/png";
    // Only accept PNG, SVG, or WebP
    const allowed = ["image/png", "image/webp", "image/svg+xml"];
    if (!allowed.some((t) => contentType.includes(t))) return null;
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 200) return null;
    return { buffer, contentType: contentType.split(";")[0].trim() };
  } catch {
    return null;
  }
}

interface ScrapedUrls {
  logoImgSrcs: string[];
  appleTouchIcon: string | null;
  svgIcon: string | null;
  pngIcon: string | null;
  ogImage: string | null;
}

async function scrapeLogoUrls(siteUrl: string): Promise<ScrapedUrls> {
  const result: ScrapedUrls = {
    logoImgSrcs: [],
    appleTouchIcon: null,
    svgIcon: null,
    pngIcon: null,
    ogImage: null,
  };

  try {
    const res = await fetch(siteUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LogoFetcher/1.0)" },
    });
    if (!res.ok) return result;
    const html = await res.text();

    // Apple touch icon (usually 180x180, clean logo)
    const appleMatch = html.match(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i)
      ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*apple-touch-icon[^"']*["']/i);
    if (appleMatch?.[1]) result.appleTouchIcon = resolveUrl(siteUrl, appleMatch[1]);

    // SVG icon (vector, perfect for logos)
    const svgMatch = html.match(/<link[^>]+type=["']image\/svg\+xml["'][^>]+href=["']([^"']+)["']/i)
      ?? html.match(/<link[^>]+href=["']([^"']+\.svg)["'][^>]+rel=["'][^"']*icon[^"']*["']/i);
    if (svgMatch?.[1]) result.svgIcon = resolveUrl(siteUrl, svgMatch[1]);

    // High-res PNG/WebP favicon (prefer 192+ px)
    const iconMatches = [...html.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+(?:sizes=["'](\d+)x\d+["'][^>]+)?href=["']([^"']+)["']/gi)];
    let bestSize = 0;
    for (const m of iconMatches) {
      const size = parseInt(m[1] ?? "0");
      const href = m[2];
      if (href && size >= bestSize) { bestSize = size; result.pngIcon = resolveUrl(siteUrl, href); }
    }

    // <img> tags with "logo" in src, class, id, or alt
    const imgMatches = [...html.matchAll(/<img[^>]+>/gi)];
    for (const m of imgMatches) {
      const tag = m[0];
      const isLogo = /logo/i.test(tag);
      if (!isLogo) continue;
      const srcMatch = tag.match(/src=["']([^"']+)["']/i);
      if (srcMatch?.[1] && !srcMatch[1].startsWith("data:")) {
        result.logoImgSrcs.push(resolveUrl(siteUrl, srcMatch[1]));
        if (result.logoImgSrcs.length >= 3) break; // cap at 3 candidates
      }
    }

    // og:image (last resort — often a hero image, not a logo)
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch?.[1]) result.ogImage = ogMatch[1];

  } catch { /* ignore */ }

  return result;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { websiteUrl, name } = await req.json();
  if (!websiteUrl) return NextResponse.json({ error: "websiteUrl required" }, { status: 400 });

  const normalised = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
  const domain = extractDomain(websiteUrl);
  const slug = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "-") : domain.replace(/\./g, "-");

  // Scrape HTML in parallel with Clearbit attempt
  const [scraped] = await Promise.all([scrapeLogoUrls(normalised)]);

  // Candidate priority (PNG, SVG, WebP):
  // 1. SVG favicon — vector, always crisp
  // 2. <img> tags with "logo" in attributes — highest semantic signal
  // 3. Apple touch icon — clean, high-res, designed for display
  // 4. Clearbit logo API — good for major brands
  // 5. High-res PNG/WebP favicon
  // 6. Google 256px favicon — reliable last resort
  // 7. og:image — only if nothing better exists
  const candidates: string[] = [
    ...(scraped.svgIcon ? [scraped.svgIcon] : []),
    ...scraped.logoImgSrcs,
    ...(scraped.appleTouchIcon ? [scraped.appleTouchIcon] : []),
    `https://logo.clearbit.com/${domain}`,
    ...(scraped.pngIcon ? [scraped.pngIcon] : []),
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    ...(scraped.ogImage ? [scraped.ogImage] : []),
  ];

  let imageData: { buffer: ArrayBuffer; contentType: string } | null = null;
  for (const candidate of candidates) {
    if (!candidate) continue;
    imageData = await fetchImageBuffer(candidate);
    if (imageData) break;
  }

  if (!imageData) {
    // No logo found anywhere — signal a text fallback rather than failing
    return NextResponse.json({ logoUrl: null, textFallback: true });
  }

  const ext = imageData.contentType.includes("svg") ? "svg"
    : imageData.contentType.includes("webp") ? "webp"
    : "png";
  const path = `${session.userId}/press-logos/${slug}-${nanoid(6)}.${ext}`;

  const supabase = getServiceClient();
  const { error } = await supabase.storage
    .from("wizard-uploads")
    .upload(path, imageData.buffer, { contentType: imageData.contentType, upsert: false });

  if (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from("wizard-uploads").getPublicUrl(path);

  // Detect likely transparent / white-on-transparent logos
  const transparentBg =
    (imageData.contentType === "image/png" && pngHasAlpha(imageData.buffer)) ||
    (imageData.contentType === "image/svg+xml" && svgIsLikelyWhiteOnTransparent(imageData.buffer));

  return NextResponse.json({ logoUrl: publicUrl, transparentBg });
}
