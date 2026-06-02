import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";
import { getSession } from "@/lib/session";

const ALLOWED_MIME = new Set([
  "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif",
  "application/pdf",
]);

// Generous cap on what we accept from the client. Large source files are fine —
// images are downscaled/recompressed server-side before they reach Claude, so
// upload size and analysis cost are not a concern here.
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

// Anthropic's hard limits for the Messages API.
const MAX_PDF_BYTES = 30 * 1024 * 1024;   // PDFs are forwarded as-is (≈32 MB API cap)
const MAX_IMAGE_BYTES = 4.5 * 1024 * 1024; // target after compression (≈5 MB API cap)

// Claude downscales any image whose long edge exceeds ~1568px and hard-rejects
// images where EITHER dimension exceeds 8000px. Fitting inside a 1568×1568 box
// (long-edge constraint on BOTH width and height) satisfies both rules with no
// loss of analytical detail — even for very tall full-page screenshots.
const MAX_EDGE_PX = 1568;

/**
 * Downscale + JPEG-encode so the image fits comfortably within Anthropic's API
 * limits. Only ever scales down. Returns the processed buffer + media type.
 */
async function prepareImage(
  input: Buffer
): Promise<{ data: Buffer; mediaType: "image/jpeg" }> {
  const resize = {
    width: MAX_EDGE_PX,
    height: MAX_EDGE_PX,
    fit: "inside" as const,
    withoutEnlargement: true,
  };

  let quality = 88;
  let out = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(resize)
    .jpeg({ quality })
    .toBuffer();
  // Belt-and-braces: if the source was enormous, step the quality down until we
  // are comfortably under the per-image API size limit.
  while (out.byteLength > MAX_IMAGE_BYTES && quality > 50) {
    quality -= 12;
    out = await sharp(input, { failOn: "none" })
      .rotate()
      .resize(resize)
      .jpeg({ quality })
      .toBuffer();
  }
  return { data: out, mediaType: "image/jpeg" };
}

const PROMPT = `You are a brand design analyst. Study this brand style guide, website screenshot, or design asset carefully and extract the brand identity information.

Return ONLY a single valid JSON object — no markdown, no explanation — with this exact structure:

{
  "brandColors": {
    "primary":   "#hexcode or null",
    "secondary": "#hexcode or null",
    "tertiary":  "#hexcode or null",
    "textLight": "#hexcode or null",
    "textDark":  "#hexcode or null",
    "accent":    "#hexcode or null"
  },
  "googleFonts": ["Font Name"],
  "customFonts": [
    { "detected": "Font Name", "isLikelyPaid": true, "googleAlternatives": [] }
  ]
}

Colour role guidelines:
- primary:   The dominant brand colour — look for it on CTA buttons, hero backgrounds, or the logo mark
- secondary: A supporting colour used on sub-headings, icons, dividers, or secondary buttons
- tertiary:  A third colour if clearly present; null if you can only identify two brand colours
- accent:    Colour used for hyperlinks, underlines, or interactive highlights (may equal primary)
- textLight: Body text colour on white or light backgrounds — usually a dark grey, not pure #000000
- textDark:  Text colour used on dark or coloured sections — usually white or a very light tint

Rules:
- Use exact 6-digit hex codes (#RRGGBB), uppercase
- Set to null for any role you cannot confidently identify
- For fonts: list typeface names you can identify from the text in the image
- If this is a PDF with multiple pages, focus on the first page that shows brand colours`;

/** Best-effort mime inference from a file extension when storage returns a generic type. */
function mimeFromUrl(url: string): string | null {
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return null;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  let rawBuffer: Buffer;
  let mimeType: string;

  if (contentType.includes("application/json")) {
    // Preferred path: file was uploaded directly to storage; we only receive its URL.
    let fileUrl = "";
    try {
      const body = await req.json();
      fileUrl = typeof body?.fileUrl === "string" ? body.fileUrl : "";
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    if (!fileUrl) return NextResponse.json({ error: "No file URL provided" }, { status: 400 });

    try {
      const res = await fetch(fileUrl, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`status ${res.status}`);
      rawBuffer = Buffer.from(await res.arrayBuffer());
      const headerType = (res.headers.get("content-type") ?? "").toLowerCase().split(";")[0].trim();
      mimeType = ALLOWED_MIME.has(headerType) ? headerType : (mimeFromUrl(fileUrl) ?? headerType);
    } catch (err) {
      console.error("analyze-brand-image: could not fetch file URL", err);
      return NextResponse.json({ error: "Could not fetch the uploaded file" }, { status: 400 });
    }
  } else {
    // Legacy path: small file sent as multipart form data.
    let file: File | null = null;
    try {
      const formData = await req.formData();
      file = formData.get("file") as File | null;
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    mimeType = file.type.toLowerCase().split(";")[0].trim();
    rawBuffer = Buffer.from(await file.arrayBuffer());
  }

  if (!ALLOWED_MIME.has(mimeType)) {
    return NextResponse.json(
      { error: `Unsupported file type "${mimeType}". Please upload PNG, JPG, WebP, GIF, or PDF.` },
      { status: 400 }
    );
  }

  if (rawBuffer.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File too large (${(rawBuffer.byteLength / 1024 / 1024).toFixed(1)} MB). Maximum is 50 MB.` },
      { status: 400 }
    );
  }

  const isPdf = mimeType === "application/pdf";

  // PDFs can't be recompressed here — Anthropic accepts them directly up to ~32 MB.
  if (isPdf && rawBuffer.byteLength > MAX_PDF_BYTES) {
    return NextResponse.json(
      {
        error: `PDF too large (${(rawBuffer.byteLength / 1024 / 1024).toFixed(1)} MB). Maximum is 30 MB for PDFs — export a lighter PDF or upload a screenshot of the key brand pages instead.`,
      },
      { status: 400 }
    );
  }

  // For images, downscale/recompress so even very large screenshots fit comfortably
  // within the API limits with no loss of analytical detail.
  let mediaType: "application/pdf" | "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  let data: string;
  if (isPdf) {
    mediaType = "application/pdf";
    data = rawBuffer.toString("base64");
  } else {
    try {
      const prepared = await prepareImage(rawBuffer);
      mediaType = prepared.mediaType;
      data = prepared.data.toString("base64");
    } catch (err) {
      console.error("analyze-brand-image: image processing failed", err);
      return NextResponse.json(
        { error: "Could not process that image. Please try a PNG, JPG or WebP." },
        { status: 400 }
      );
    }
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Build the content block — images use "image" type, PDFs use "document" type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileBlock: any = isPdf
    ? { type: "document", source: { type: "base64", media_type: mediaType, data } }
    : { type: "image",    source: { type: "base64", media_type: mediaType, data } };

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [fileBlock, { type: "text", text: PROMPT }],
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip markdown code fences if Claude wraps in them
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]+\}/);
    if (!jsonMatch) {
      console.error("analyze-brand-image: no JSON in response", raw.slice(0, 300));
      return NextResponse.json({ error: "Could not parse brand analysis from file" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      brandColors: parsed.brandColors ?? {},
      googleFonts:  Array.isArray(parsed.googleFonts) ? parsed.googleFonts : [],
      customFonts:  Array.isArray(parsed.customFonts)  ? parsed.customFonts  : [],
    });
  } catch (err) {
    console.error("analyze-brand-image error:", err);
    return NextResponse.json({ error: "Brand analysis failed" }, { status: 500 });
  }
}
