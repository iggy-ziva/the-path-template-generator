import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";
import { getSession } from "@/lib/session";

const ALLOWED_MIME = new Set([
  "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif",
  "application/pdf",
]);

const MAX_PDF_BYTES = 30 * 1024 * 1024;
const MAX_IMAGE_BYTES = 4.5 * 1024 * 1024;
const MAX_EDGE_PX = 1568;
const MAX_TEXT_CHARS = 60000;

async function prepareImage(input: Buffer): Promise<{ data: Buffer; mediaType: "image/jpeg" }> {
  const resize = { width: MAX_EDGE_PX, height: MAX_EDGE_PX, fit: "inside" as const, withoutEnlargement: true };
  let quality = 88;
  let out = await sharp(input, { failOn: "none" }).rotate().resize(resize).jpeg({ quality }).toBuffer();
  while (out.byteLength > MAX_IMAGE_BYTES && quality > 50) {
    quality -= 12;
    out = await sharp(input, { failOn: "none" }).rotate().resize(resize).jpeg({ quality }).toBuffer();
  }
  return { data: out, mediaType: "image/jpeg" };
}

const PROMPT = `You are extracting customer testimonials from the supplied content (pasted text and/or a document).

Return ONLY a single valid JSON object — no markdown, no explanation — with this exact structure:

{
  "testimonials": [
    { "quote": "the full testimonial text", "name": "person's name", "location": "city/country or empty string", "context": "extra context like cohort/role or empty string" }
  ]
}

Rules:
- Extract EVERY distinct testimonial you can find. Do not merge separate testimonials.
- "quote" is required — clean it up (fix obvious typos, strip surrounding quotation marks) but DO NOT invent or embellish wording.
- "name": use the attributed person's name if present, otherwise an empty string. NEVER invent names.
- "location" and "context": only fill if clearly present; otherwise use an empty string. NEVER invent them.
- If there are no testimonials, return { "testimonials": [] }.`;

function mimeFromUrl(url: string): string | null {
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return null;
}

interface ParsedTestimonial {
  quote: string;
  name: string;
  location: string;
  context: string;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let pastedText = "";
  let fileUrl = "";
  try {
    const body = await req.json();
    pastedText = typeof body?.text === "string" ? body.text.slice(0, MAX_TEXT_CHARS) : "";
    fileUrl = typeof body?.fileUrl === "string" ? body.fileUrl : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!pastedText.trim() && !fileUrl) {
    return NextResponse.json({ error: "Provide pasted text or a document to parse" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = [];

  // Optional document/image.
  if (fileUrl) {
    let rawBuffer: Buffer;
    let mimeType: string;
    try {
      const res = await fetch(fileUrl, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`status ${res.status}`);
      rawBuffer = Buffer.from(await res.arrayBuffer());
      const headerType = (res.headers.get("content-type") ?? "").toLowerCase().split(";")[0].trim();
      mimeType = ALLOWED_MIME.has(headerType) ? headerType : (mimeFromUrl(fileUrl) ?? headerType);
    } catch (err) {
      console.error("parse-testimonials: could not fetch file URL", err);
      return NextResponse.json({ error: "Could not fetch the uploaded file" }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported file type "${mimeType}". Please upload PNG, JPG, WebP, GIF, or PDF.` },
        { status: 400 },
      );
    }

    const isPdf = mimeType === "application/pdf";
    if (isPdf && rawBuffer.byteLength > MAX_PDF_BYTES) {
      return NextResponse.json(
        { error: `PDF too large (${(rawBuffer.byteLength / 1024 / 1024).toFixed(1)} MB). Maximum is 30 MB.` },
        { status: 400 },
      );
    }

    try {
      if (isPdf) {
        content.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: rawBuffer.toString("base64") },
        });
      } else {
        const prepared = await prepareImage(rawBuffer);
        content.push({
          type: "image",
          source: { type: "base64", media_type: prepared.mediaType, data: prepared.data.toString("base64") },
        });
      }
    } catch (err) {
      console.error("parse-testimonials: file processing failed", err);
      return NextResponse.json({ error: "Could not process that file." }, { status: 400 });
    }
  }

  if (pastedText.trim()) {
    content.push({ type: "text", text: `PASTED TESTIMONIALS:\n\n${pastedText}` });
  }
  content.push({ type: "text", text: PROMPT });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content }],
    });

    const raw = message.content[0]?.type === "text" ? message.content[0].text : "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]+\}/);
    if (!jsonMatch) {
      console.error("parse-testimonials: no JSON in response", raw.slice(0, 300));
      return NextResponse.json({ error: "Could not extract testimonials" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const list: unknown = parsed.testimonials;
    const testimonials: ParsedTestimonial[] = Array.isArray(list)
      ? list
          .map((t): ParsedTestimonial => ({
            quote: typeof t?.quote === "string" ? t.quote.trim() : "",
            name: typeof t?.name === "string" ? t.name.trim() : "",
            location: typeof t?.location === "string" ? t.location.trim() : "",
            context: typeof t?.context === "string" ? t.context.trim() : "",
          }))
          .filter((t) => t.quote.length > 0)
      : [];

    return NextResponse.json({ testimonials });
  } catch (err) {
    console.error("parse-testimonials error:", err);
    return NextResponse.json({ error: "Testimonial parsing failed" }, { status: 500 });
  }
}
