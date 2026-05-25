import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";

const ALLOWED_MIME = new Set([
  "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif",
  "application/pdf",
]);

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

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

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let file: File | null = null;
  try {
    const formData = await req.formData();
    file = formData.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const mimeType = file.type.toLowerCase().split(";")[0].trim();
  if (!ALLOWED_MIME.has(mimeType)) {
    return NextResponse.json(
      { error: `Unsupported file type "${mimeType}". Please upload PNG, JPG, WebP, GIF, or PDF.` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB). Maximum is 8 MB.` },
      { status: 400 }
    );
  }

  const base64 = buffer.toString("base64");
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Build the content block — images use "image" type, PDFs use "document" type
  const isPdf = mimeType === "application/pdf";
  const mediaType = isPdf
    ? ("application/pdf" as const)
    : (mimeType as "image/png" | "image/jpeg" | "image/webp" | "image/gif");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileBlock: any = isPdf
    ? { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } }
    : { type: "image",    source: { type: "base64", media_type: mediaType, data: base64 } };

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
