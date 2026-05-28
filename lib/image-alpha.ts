/**
 * Detect whether an image has transparency (alpha channel or transparent SVG).
 * Used for brand logo uploads that must not have opaque backgrounds.
 */

/** PNG IHDR color type 4 = grayscale+alpha, 6 = RGBA */
export function pngHasAlpha(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 26) return false;
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50) return false;
  const colorType = bytes[25];
  return colorType === 4 || colorType === 6;
}

/** WebP VP8X chunk: byte 20 bit 4 = alpha present */
export function webpHasAlpha(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 21) return false;
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff !== "RIFF" || webp !== "WEBP") return false;
  const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  if (chunk === "VP8X" && bytes.length >= 21) {
    return (bytes[20] & 0x10) !== 0;
  }
  // Lossy VP8 / lossless VP8L without VP8X — no alpha
  return false;
}

/**
 * SVG is treated as transparent-capable unless it has an opaque full-canvas background rect.
 */
export function svgHasTransparency(buffer: ArrayBuffer): boolean {
  const text = new TextDecoder().decode(buffer);
  const opaqueBgRect =
    /<rect[^>]*\bwidth=["'](?:100%|\d)[^"']*["'][^>]*\bfill=["'](?!none|transparent)[^"']+["']/i.test(text)
    || /<rect[^>]*\bfill=["'](?!none|transparent)[^"']+["'][^>]*\bwidth=["'](?:100%|\d)/i.test(text);
  const styleOpaqueBg = /background\s*:\s*(?!none|transparent)[^;}"']+/i.test(text);
  return !opaqueBgRect && !styleOpaqueBg;
}

export function bufferHasTransparency(buffer: ArrayBuffer, mimeType: string): boolean {
  const type = mimeType.toLowerCase();
  if (type === "image/jpeg" || type === "image/jpg") return false;
  if (type === "image/gif") return false;
  if (type === "image/png") return pngHasAlpha(buffer);
  if (type === "image/webp") return webpHasAlpha(buffer);
  if (type === "image/svg+xml") return svgHasTransparency(buffer);
  return false;
}

export async function fileHasTransparency(file: File): Promise<boolean> {
  const buffer = await file.arrayBuffer();
  return bufferHasTransparency(buffer, file.type || guessMimeFromName(file.name));
}

function guessMimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "svg") return "image/svg+xml";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "gif") return "image/gif";
  return "";
}

export const LOGO_TRANSPARENCY_ERROR =
  "Logo must have a transparent background. Export as PNG or SVG with transparency — JPEG and opaque images are not allowed.";
