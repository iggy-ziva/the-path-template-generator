import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ContentBlockParam, ImageBlockParam, TextBlockParam } from "@anthropic-ai/sdk/resources/messages/messages";
import { getSession } from "@/lib/session";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";
import type { WizardData } from "@/lib/wizard-types";
import { THEME_LIST } from "@/lib/theme-constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

async function getServiceClient(): Promise<AnySupabase> {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Rate-limit check ────────────────────────────────────────────────────
const GENERATION_LIMIT = 10;

async function checkRateLimit(supabase: AnySupabase, userId: string): Promise<boolean> {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { count } = await supabase
    .from("generated_funnels")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());
  return (count ?? 0) < GENERATION_LIMIT;
}

// ── Fetch uploaded documents and convert for Claude ─────────────────────
interface DocumentBlock {
  type: "document";
  source: { type: "base64"; media_type: string; data: string };
  title?: string;
}

async function fetchDocumentBlocks(urls: string[]): Promise<(DocumentBlock | TextBlockParam)[]> {
  const blocks: (DocumentBlock | TextBlockParam)[] = [];
  for (const url of urls.slice(0, 5)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") ?? "";
      const fileName = url.split("/").pop() ?? "document";

      if (contentType.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
        const buf = await res.arrayBuffer();
        const base64 = Buffer.from(buf).toString("base64");
        blocks.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
          title: fileName,
        } as DocumentBlock);
      } else if (contentType.includes("text") || url.toLowerCase().match(/\.(txt|md|docx?)$/)) {
        const text = await res.text();
        blocks.push({
          type: "text",
          text: `--- UPLOADED DOCUMENT: ${fileName} ---\n${text.slice(0, 8000)}\n---`,
        } as TextBlockParam);
      }
    } catch {
      // skip unreachable documents silently
    }
  }
  return blocks;
}

// ── Build vision blocks so Claude can actually SEE all uploaded visuals ──
// Returns interleaved [text-label, image, text-label, image, …] blocks
// Cap at 8 total to keep token cost reasonable; prioritise hero > lifestyle > additional > headshot > logo
async function buildVisionBlocks(d: WizardData): Promise<ContentBlockParam[]> {
  const blocks: ContentBlockParam[] = [];

  const heroItems    = (d.heroImageUrls ?? []).map((url, i) => ({ url, label: `[hero-${i + 1}] HERO/BACKGROUND IMAGE ${i + 1} — reference its mood, atmosphere, and subject when writing hero sections` }));
  const lifestyleItems = (d.lifestyleImageUrls ?? []).map((url, i) => ({ url, label: `[lifestyle-${i + 1}] LIFESTYLE IMAGE ${i + 1} — use what you observe to write specific, grounded copy about the experience or transformation` }));
  const additionalItems = (d.additionalImageUrls ?? []).map((url, i) => ({ url, label: `[additional-${i + 1}] ADDITIONAL IMAGE ${i + 1}` }));
  const headshotItem  = d.hostHeadshotUrl ? [{ url: d.hostHeadshotUrl, label: "[headshot] HOST HEADSHOT — use the person's appearance and energy to inform how you write about them" }] : [];
  const logoItem      = d.logoUrl         ? [{ url: d.logoUrl,         label: "[logo] BRAND LOGO — note symbolic, colour, and typographic clues about the brand's identity" }]           : [];

  const toInclude = [...heroItems, ...lifestyleItems, ...additionalItems, ...headshotItem, ...logoItem].slice(0, 8);

  for (const item of toInclude) {
    try {
      const res = await fetch(item.url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      const buf = await res.arrayBuffer();
      const base64 = Buffer.from(buf).toString("base64");
      const mediaType = (contentType.startsWith("image/") ? contentType.split(";")[0] : "image/jpeg") as ImageBlockParam["source"]["media_type"];
      // Label then image — so Claude associates each description with the correct visual
      blocks.push({ type: "text", text: `[${item.label}]` } as TextBlockParam);
      blocks.push({ type: "image", source: { type: "base64", media_type: mediaType, data: base64 } } as ImageBlockParam);
    } catch {
      // skip unreachable images silently
    }
  }
  return blocks;
}

// ── Main POST ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { wizardData, submissionId } = await req.json() as { wizardData: WizardData; submissionId?: string };
    const supabase = await getServiceClient();
    const userId = await getOrCreateUserId(session, supabase);
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const withinLimit = await checkRateLimit(supabase, userId);
    if (!withinLimit) {
      return NextResponse.json({ error: "Generation limit reached. Please contact support." }, { status: 429 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // ── Fetch documents and vision blocks in parallel ──
    const [docBlocks, visionBlocks] = await Promise.all([
      fetchDocumentBlocks(wizardData.existingFileUrls ?? []),
      buildVisionBlocks(wizardData),   // returns ContentBlockParam[] (label+image pairs)
    ]);

    // ── Build shared brand context ──
    const brandContext = buildBrandContext(wizardData);

    // ── Run both generation calls in parallel ──
    const [eventResult, programmeResult] = await Promise.all([
      generateEventPages(anthropic, wizardData, brandContext, docBlocks, visionBlocks),
      generateProgrammePages(anthropic, wizardData, brandContext, docBlocks, visionBlocks),
    ]);

    const content = { ...eventResult, ...programmeResult };

    // ── Store ──
    const { data: funnel, error } = await supabase
      .from("generated_funnels")
      .insert({
        user_id: userId,
        submission_id: submissionId ?? null,
        content,
        theme_slug: wizardData.referenceTheme ?? "threshold",
      })
      .select("id")
      .single();

    if (error || !funnel) throw error ?? new Error("Failed to store funnel");

    if (submissionId) {
      await supabase
        .from("wizard_submissions")
        .update({ status: "complete", updated_at: new Date().toISOString() })
        .eq("id", submissionId)
        .eq("user_id", userId);
    }

    return NextResponse.json({ funnelId: funnel.id });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Generation failed — please try again" }, { status: 500 });
  }
}

// ── Colour contrast utilities (mirrors PreviewClient logic) ─────────────

function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function colorBrightness(hex: string): "BRIGHT" | "DARK" {
  return hexLuminance(hex) > 0.18 ? "BRIGHT" : "DARK";
}

/** Build a human-readable colour contrast profile for Claude */
function buildColorProfile(d: WizardData): string {
  const sg = d.styleGuide;
  const primary   = sg?.brandColors?.primary   ?? "#2B4EAA";
  const secondary = sg?.brandColors?.secondary ?? "#445566";
  const tertiary  = sg?.brandColors?.tertiary  ?? "#6699BB";

  function profile(name: string, hex: string): string {
    const brightness = colorBrightness(hex);
    const lum = hexLuminance(hex).toFixed(3);
    const useSurface = brightness === "BRIGHT" ? "dark surfaces (surface-inverse, hero sections, dark bars)" : "light surfaces (surface-canvas, surface-raised, card backgrounds)";
    const avoidSurface = brightness === "BRIGHT" ? "light backgrounds — it will appear washed out" : "dark backgrounds — it will be invisible";
    const textOnTop = hexLuminance(hex) > 0.35 ? "dark text (--text-primary)" : "light text (--text-inverse)";
    const cssOnDark = `--accent-${name.toLowerCase()}-on-dark`;
    const cssOnLight = `--accent-${name.toLowerCase()}-on-light`;
    const cssTextOn = `--text-on-${name.toLowerCase()}`;
    return `${name} (${hex}) — luminance: ${lum} → ${brightness}
  Best on: ${useSurface}
  Avoid on: ${avoidSurface}
  Text on top of ${name} as BG: ${textOnTop}
  CSS tokens to use:
    On dark surfaces: var(${cssOnDark})
    On light surfaces: var(${cssOnLight})
    Text on ${name} BG: var(${cssTextOn})`;
  }

  return `=== COLOUR CONTRAST PROFILE ===
Every colour from the wizard has been analysed for luminance. Use this profile to
make ALL colour decisions in your generated content. NEVER guess — always use the
appropriate CSS token from this profile.

${profile("primary", primary)}

${profile("secondary", secondary)}

${profile("tertiary", tertiary)}

RULE — ALWAYS use contrast-safe tokens:
- For text/icons/borders on dark sections (hero, bars, footers): use var(--accent-X-on-dark)
- For text/icons/borders on light sections (cards, forms, content): use var(--accent-X-on-light)
- For text ON TOP of a coloured background: use var(--text-on-X)
- For CTA buttons (always on dark BG): use var(--accent-light) — it is pre-lifted for contrast
- For text ON the CTA button: use var(--text-on-accent)
- NEVER use the raw var(--accent-primary/secondary/tertiary) directly in a coloured element

SURFACE BRIGHTNESS REFERENCE:
- DARK surfaces: --surface-inverse → use -on-dark variants and --text-inverse for body text
- LIGHT surfaces: --surface-canvas, --surface-raised → use -on-light variants and --text-primary for body text`;
}

// ── Shared brand context block ───────────────────────────────────────────
function buildBrandContext(d: WizardData): string {
  const sg = d.styleGuide;
  const fontInfo = [
    sg?.googleFonts?.length ? `Google Fonts: ${sg.googleFonts.join(", ")}` : "",
    sg?.customFonts?.filter(f => f.googleAlternatives?.length).map(f => `${f.detected} → use ${f.googleAlternatives[0]} instead`).join("; ") ?? "",
  ].filter(Boolean).join(" | ");

  const colorInfo = sg?.brandColors
    ? Object.entries(sg.brandColors).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ")
    : "Not analysed — infer from tone and industry";

  const pressLogos = (d.pressLogos ?? []);
  const pressText = pressLogos.length
    ? pressLogos.map(l => l.logoUrl ? `${l.name} (has logo)` : `${l.name || l.websiteUrl} (text-only)`).join(", ")
    : "None provided";

  const testimonialText = (d.testimonials ?? []).length
    ? (d.testimonials ?? []).map((t, i) => `[${i + 1}] "${t.quote}" — ${t.name}${t.location ? `, ${t.location}` : ""}${t.context ? ` (${t.context})` : ""}`).join("\n")
    : "None provided — generate believable composite testimonials that reflect the transformation promise.";

  const paymentPlans = (d.programPaymentPlans ?? []).length
    ? (d.programPaymentPlans ?? []).map(p => `${p.installments}× $${p.amountPerInstallment} ${p.cadence}`).join("; ")
    : d.programPricePlan1 ?? "No payment plans set";

  const themeEntry = THEME_LIST.find(t => t.slug === (d.referenceTheme ?? "threshold")) ?? THEME_LIST[0];

  return `=== BRAND & BUSINESS ===
Host name: ${d.hostName ?? ""}
Host title / credentials: ${d.hostTitle ?? ""}
Host tagline: ${d.hostTagline ?? ""}
Host bio: ${d.hostBio ?? ""}
Business name: ${d.businessName ?? ""}
Contact / support email: ${d.contactEmail ?? ""}
Website: ${d.websiteUrl ?? ""}
Privacy Policy URL: ${d.privacyPolicyUrl ?? "NOT PROVIDED"}
Terms of Use URL: ${d.termsOfUseUrl ?? "NOT PROVIDED"}
Instagram: ${d.instagramUrl ?? ""} | LinkedIn: ${d.linkedinUrl ?? ""} | Facebook: ${d.facebookUrl ?? ""} | TikTok: ${d.tiktokUrl ?? ""} | YouTube: ${d.youtubeUrl ?? ""}

=== BRAND STYLE ===
Colours: ${colorInfo}
Typography: ${fontInfo || "Not set"}

=== LIVE EVENT ===
Name: ${d.eventName ?? ""}
Tagline: ${d.eventTagline ?? ""}
Date: ${d.eventDate ?? ""} at ${d.eventTime ?? ""} ${d.eventTimezone ?? ""}
Duration: ${d.eventDuration ?? "4 hours"}
Platform: ${d.eventPlatform ?? "online"}
Pricing: ${formatPricing(d)}
Recording policy: ${d.eventRecordingPolicy ?? "Recording included"}
Promo video URL: ${d.eventVideoUrl ?? "NOT PROVIDED"}

=== UPSELL OFFER (one-time post-event offer) ===
Product name: ${d.upsellOfferName ?? ""}
Headline: ${d.upsellHeadline ?? ""}
Description: ${d.upsellDescription ?? ""}
Included items:
${(d.upsellIncludedItems ?? []).map(it => `  • ${it.title}: ${it.description}`).join("\n") || "  Not provided — generate 3 compelling items that complement the live event"}
Testimonial quote: ${d.upsellQuote ?? ""}
Testimonial attribution: ${d.upsellQuoteAttribution ?? ""}
Regular value: ${d.upsellRegularValue ? `$${d.upsellRegularValue}` : "Not set"}
Offer price: ${d.upsellOfferPrice ? `$${d.upsellOfferPrice}` : "Not set — calculate ~40% off full price or cheapest payment plan total"}
Price note: ${d.upsellPriceNote ?? ""}
CTA text: ${d.upsellCtaText ?? ""}
CTA sub-text: ${d.upsellCtaSubText ?? ""}
Decline text: ${d.upsellDeclineText ?? ""}

=== PROGRAMME (high-ticket upsell) ===
Name: ${d.programName ?? ""}
Tagline: ${d.programTagline ?? ""}
Start date: ${d.programStartDate ?? ""}
Duration: ${d.programDuration ?? ""}
Schedule: ${d.programSchedule ?? ""}
Full price: $${d.programPriceFull ?? ""}
Payment plans: ${paymentPlans}
Member portal URL: ${d.programPortalUrl ?? "NOT PROVIDED — tell students to check their email"}
Guarantee: ${d.programGuarantee ?? ""}

=== CURRICULUM & CONTENT ===
Target audience: ${d.audienceDescription ?? ""}
Transformation promise: ${d.transformationPromise ?? ""}
What's included: ${d.whatIsIncluded ?? ""}
Week-by-week curriculum:
${(d.curriculumWeeks ?? []).map(w => `  Week ${w.week} — ${w.title}: ${w.description}`).join("\n") || "  Not provided — generate based on transformation promise and programme name"}
Bonuses:
${(d.bonuses ?? []).map(b => `  • ${b.title} (value: ${b.value || "unspecified"}): ${b.description}`).join("\n") || "  Not provided — generate 2–3 compelling bonuses that complement the curriculum"}

=== METHODOLOGY & STORY ===
Methodology: ${d.methodologyDescription ?? ""}
Unique approach: ${d.uniqueApproach ?? ""}
Existing material URLs (text/links): ${(d.existingMaterialUrls ?? []).join(", ") || "None"}

=== SOCIAL PROOF ===
Press logos: ${pressText}
Testimonials:
${testimonialText}

=== TONE & VOICE ===
Descriptors: ${(d.toneDescriptors ?? []).join(", ") || "professional, warm, transformative"}
Reference site (copy they love): ${d.copyLoveUrl ?? ""}
Copy they dislike: ${d.copyHateDescription ?? ""}

=== REFERENCE THEME ===
Slug: ${themeEntry.slug}
Label: ${themeEntry.label}
Copy style descriptors: ${themeEntry.descriptor}
Use this as an aesthetic and tonal anchor for copy style — not a template to copy from, but a reference point for voice, rhythm, and word choice. If the user's tone descriptors above conflict with this theme, the tone descriptors take priority.

=== IMAGES AVAILABLE ===
These images have been sent to you above as labelled vision blocks — study each one carefully.
When assigning image URL fields in your JSON output, you MUST copy-paste the EXACT URL from this inventory.
Set any image field to null if no suitable image exists. NEVER invent, modify, or truncate URLs.

HERO/BACKGROUND IMAGES:
${(d.heroImageUrls ?? []).length > 0
  ? (d.heroImageUrls ?? []).map((url, i) => `  hero-${i + 1}: ${url}`).join("\n")
  : "  None uploaded"}

LIFESTYLE/SUPPORTING IMAGES:
${(d.lifestyleImageUrls ?? []).length > 0
  ? (d.lifestyleImageUrls ?? []).map((url, i) => `  lifestyle-${i + 1}: ${url}`).join("\n")
  : "  None uploaded"}

ADDITIONAL IMAGES:
${(d.additionalImageUrls ?? []).length > 0
  ? (d.additionalImageUrls ?? []).map((url, i) => `  additional-${i + 1}: ${url}`).join("\n")
  : "  None uploaded"}

HOST HEADSHOT: ${d.hostHeadshotUrl ?? "Not uploaded"}
BRAND LOGO: ${d.logoUrl ?? "Not uploaded"}

Image writing guidance:
- Hero images set the visual mood — reflect their atmosphere and subject in headline and section opening copy
- Lifestyle images show the practitioner in context — write copy that authentically describes what those images suggest
- Where you output null for an image field, include a concise suggestion in the imageSuggestions object

=== DESIGN SYSTEM & COLOUR ARCHITECTURE ===
These pages use a structured CSS token system. Your copy and image choices must respect it.

COLOUR ROLES — never swap these:
- accent-primary (var(--accent-light) for CTAs): the primary action colour. Used EXCLUSIVELY for CTA buttons and primary purchase actions. The template system pre-lifts this to always be visible on dark surfaces.
- accent-secondary: the atmospheric/supporting brand colour — live badges, calendar section tints, share buttons, icon accents.
- accent-tertiary: muted brand touches — label text, subtle accents, secondary icons.

${buildColorProfile(d)}

TYPOGRAPHY RULES — apply to every text field you generate:
- Never combine two prices or payment options in a single field. Use the dedicated sub-field (e.g. programCtaPlanText, offerBarPrice plan) for the secondary option.
- Price fields that render at large font sizes (42px+) must contain only one price so they fit on a single line.
- Avoid orphan words: if a short sentence or label would break so that only one word falls on the final line, rephrase to distribute words more evenly across lines.
- Short labels (eyebrows, badges, pill text) must always fit on a single line — keep them under 6 words.

GRID LAYOUT RULES — apply to any array that renders as a grid:
- outcomesItems and outcomes2Items: generate exactly 3 items (1 row) or exactly 6 items (2 rows of 3). NEVER 4 or 5.
- includesItems: ALWAYS generate exactly 6 items. The grid is 2 columns so odd counts create an orphan row. NEVER generate 3, 5, 7 or any other odd number.
- Plan cards: always start with pay-in-full (see PAYMENT PLAN RULES below).

PAYMENT PLAN RULES — apply to the plans array in programmeCheckout:
- "Pay in full" (id: "full") is ALWAYS the first plan and ALWAYS has isFeatured: true.
- No payment plan (installment option) may ever have isFeatured: true.
- Only ONE plan in the entire array may have isFeatured: true.
- Never label multiple plans as "Most popular" or equivalent — only one plan can be featured and that is always "Pay in full".

DARK vs LIGHT SECTIONS — copy tone must match the surface:
- Dark sections (hero, event details, dark bars, footer): dramatic, high-impact, declarative. Short sentences. Bold nouns.
- Light sections (calendar, share, personal note, form boxes): warmer, more conversational, action-oriented.

IMAGE CHOICES for dark sections: prefer images with strong contrast, rich shadows, or atmospheric depth — they composite well over the dark overlay. Flat, overexposed, or pastel images disappear into dark backgrounds.`;
}

// ── Generate event funnel pages ──────────────────────────────────────────
async function generateEventPages(
  anthropic: Anthropic,
  d: WizardData,
  brandContext: string,
  docBlocks: (DocumentBlock | TextBlockParam)[],
  visionBlocks: ContentBlockParam[],
): Promise<Record<string, unknown>> {
  const hasVideo = !!d.eventVideoUrl;
  const topContent: ContentBlockParam[] = [];

  if (visionBlocks.length > 0) {
    topContent.push({ type: "text", text: "VISUAL ASSETS — study each image carefully. Each is labelled. Use what you observe to write specific, grounded copy that reflects the actual visual identity of this brand:" } as TextBlockParam);
    topContent.push(...visionBlocks);
  }
  if (docBlocks.length > 0) {
    topContent.push({ type: "text", text: "UPLOADED BRAND DOCUMENTS (methodology, existing materials, etc.):" } as TextBlockParam);
    topContent.push(...(docBlocks as ContentBlockParam[]));
  }
  topContent.push({ type: "text", text: buildEventPrompt(brandContext, hasVideo, d) } as TextBlockParam);

  const messages: MessageParam[] = [{ role: "user", content: topContent }];
  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 8000,
    messages,
  });

  return parseJsonResponse(response.content[0].type === "text" ? response.content[0].text : "{}");
}

// ── Generate programme funnel pages ─────────────────────────────────────
async function generateProgrammePages(
  anthropic: Anthropic,
  d: WizardData,
  brandContext: string,
  docBlocks: (DocumentBlock | TextBlockParam)[],
  visionBlocks: ContentBlockParam[],
): Promise<Record<string, unknown>> {
  const topContent: ContentBlockParam[] = [];

  if (visionBlocks.length > 0) {
    topContent.push({ type: "text", text: "VISUAL ASSETS — study each image carefully. Each is labelled. Use what you observe to write specific, grounded copy that reflects the actual visual identity of this brand:" } as TextBlockParam);
    topContent.push(...visionBlocks);
  }
  if (docBlocks.length > 0) {
    topContent.push({ type: "text", text: "UPLOADED BRAND DOCUMENTS (methodology, existing materials, etc.):" } as TextBlockParam);
    topContent.push(...(docBlocks as ContentBlockParam[]));
  }
  topContent.push({ type: "text", text: buildProgrammePrompt(brandContext, d) } as TextBlockParam);

  const messages: MessageParam[] = [{ role: "user", content: topContent }];
  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 8000,
    messages,
  });

  return parseJsonResponse(response.content[0].type === "text" ? response.content[0].text : "{}");
}

// ── Event pages prompt + schema ──────────────────────────────────────────
function buildEventPrompt(brandContext: string, hasVideo: boolean, d: WizardData): string {
  return `You are an expert conversion copywriter specialising in live events, retreats, and transformational online experiences. You write copy that is specific, emotionally resonant, and avoids all clichés.

${brandContext}

Your task: Write compelling, personalised copy for the five EVENT pages of a sales funnel. Every field must be filled in using the real data above. Be specific. Use the host's real name, real dates, real prices.

ABSOLUTE RULES — violating any of these makes the output unusable:
- NEVER output placeholder text like [date], [host], [name], [event name], [amount], [domain], [timezone]. Replace every single bracket placeholder with the actual value from the brand context above.
- NEVER copy the instructional description strings from the schema as output (e.g. "audience item 2 — a different characteristic..." must become real copy, not that instruction string).
- NEVER use "Imagine if…" openers or generic life-coach clichés.
- Section theme fields must contain ONLY the string "dark", "accent", or "light" — nothing else.
- Every array must contain real, specific, unique content — no "item 2", "item 3", "comment 2", "quote 2" or similar dummy values.
- Use the host's real name, event's real name, real dates, real prices everywhere.
- For ALL image URL fields: copy-paste the EXACT URL from the IMAGES AVAILABLE section above. Do NOT invent, guess, shorten, or modify any URL. Set to null if no suitable image exists and add an entry to imageSuggestions describing what to photograph.

Copy rules:
- Match the tone descriptors exactly
- Benefit-driven, not feature-driven
- Punchy headlines (under 12 words)
- Body copy reads like a perceptive human wrote it — specific, grounded, no buzzwords
- CTAs that create urgency without being pushy
- For arrays of paragraphs: each element is one complete paragraph (no bullet points inside a paragraph)

Return ONLY a valid JSON object — no prose, no markdown fences, no explanation. The JSON must have exactly this structure:

{
  "eventLanding": {
    "heroBackgroundImageUrl": "REQUIRED if hero images exist — copy the exact URL of the most atmospheric hero image from the IMAGES AVAILABLE list (e.g. the hero-1 URL). Set to null only if no hero images were uploaded.",
    "valuePropImageUrl": "copy the exact URL of the best lifestyle or supporting image for the value prop section. Prefer lifestyle-1, else lifestyle-2, else additional-1. Set to null if none exist.",
    "outcomesImageUrl": "copy the exact URL of a supporting image for the outcomes section. Prefer a different image from valuePropImageUrl — try lifestyle-2 or additional-1. Set to null if none available.",
    "encourage1BackgroundUrl": "null — leave as null unless you have an unused atmospheric image that would work well as a subtle section background",
    "encourage2BackgroundUrl": "null",
    "encourage3BackgroundUrl": "null",
    "heroEyebrow": "LIVE ONLINE",
    "heroHeadline": "main event headline — the event name, rendered powerfully",
    "heroSubheadline": "one-sentence subtitle capturing the core transformation",
    "heroPriceLabel": "e.g. 'Choose your price' or 'Contribution' or 'From'",
    "heroPriceValue": "e.g. '$11 — $111' or '$97' or 'Free'",
    "heroCtaText": "CTA button text e.g. 'Register Now'",
    "heroMetaLine": "short reassurance below CTA e.g. 'No prerequisites · Recording included'",
    "credibilityQuote1": "opening testimonial — short and powerful, under 30 words",
    "credibilityAttribution1": "Full Name · Location",
    "videoSectionEyebrow": "eyebrow for video section e.g. 'A note from [host]'",
    "videoSectionHeading": "video section headline (display-section size)",
    "videoCaption": ${hasVideo ? `"caption text below video e.g. 'A two-minute invitation from [host]'"` : "null"},
    "videoUrl": ${hasVideo ? `"use the promo video URL from the brand context above"` : "null"},
    "audienceEyebrow": "e.g. 'For whom this is built'",
    "audienceHeading": "e.g. 'This is for you if…'",
    "audienceItems": [
      "Audience item 1 — complete sentence, <strong>bold the defining characteristic</strong>. Who they are or what they're experiencing.",
      "Audience item 2 — a different characteristic of the same target audience, specific to this event",
      "Audience item 3 — address a pain point or desire specific to this person",
      "Audience item 4 — describe a behaviour pattern or frustration they'd recognise in themselves",
      "Audience item 5 — name something they've tried or believed that hasn't resolved the tension",
      "Audience item 6 — the identity-level truth that makes them right for this event. All 6 must be distinct, real, derived from the brand context above."
    ],
    "audienceClosingText": "closing italic line below the audience list e.g. 'Now is your time to step over the line.'",
    "audienceMicrocopy": "small line above CTA e.g. 'Some thresholds are crossed alone. This one isn't.'",
    "encourageText1": "CTA section text (encourage section) — punchy italic line",
    "encourage1Theme": "MUST be exactly one of: \"dark\", \"accent\", or \"light\". Choose \"dark\" for high-drama urgency, \"accent\" for mid-energy variety, \"light\" for softer moments. Text colour is handled automatically.",
    "ctaText": "CTA button text used in all mid-page encourage sections",
    "vpEyebrow": "value prop section eyebrow e.g. 'The premise'",
    "vpHeading": "value prop heading (display-section class) — under 8 words",
    "vpParagraphs": [
      "paragraph 1 — use <strong>bold</strong> for key phrases",
      "paragraph 2",
      "paragraph 3"
    ],
    "vpPullQuote": "pull-quote inside the value prop section — italic, 1 powerful sentence",
    "credibilityQuote2": "second testimonial quote (different person from quote 1)",
    "credibilityAttribution2": "Full Name · Location",
    "outcomesEyebrow": "e.g. 'Outcomes'",
    "outcomesHeading": "e.g. 'What you'll experience'",
    "outcomesSubheading": "body-lg subtitle e.g. 'Your life after [event name] — not in a year, but starting on Thursday.'",
    "outcomesItems": [
      { "title": "outcome title (2–4 words)", "body": "1–2 specific sentences about this outcome" },
      { "title": "outcome title (2–4 words)", "body": "1–2 specific sentences about this outcome" },
      { "title": "outcome title (2–4 words)", "body": "1–2 specific sentences about this outcome" }
    ],
    // GRID RULE: outcomesItems MUST contain exactly 3 items (1 row of 3) OR exactly 6 items (2 rows of 3).
    // NEVER generate 4 or 5 items — 4 breaks the grid layout and 5 creates an uneven orphan row.
    "outcomesClosingText": "italic closing below outcome grid e.g. 'This is not a list of someday-results.'",
    "outcomesMicrocopy": "small timing/urgency note below closing text",
    "personalMessageHeading": "e.g. 'A note from [host name]'",
    "personalMessageParagraphs": [
      "paragraph 1 — write in the host's voice, specific and personal",
      "paragraph 2",
      "paragraph 3"
    ],
    "personalMessageSignature": "e.g. '— [Host Name]'",
    "testimonialsEyebrow": "e.g. 'In their words'",
    "testimonialsHeading": "testimonials section heading (display-section class)",
    "encourageText2": "second CTA section text — different line from encourageText1",
    "encourage2Theme": "MUST be exactly one of: \"dark\", \"accent\", or \"light\". Must visually contrast with encourage1Theme — if encourage1Theme was \"dark\", use \"accent\" or \"light\" here.",
    "howItWorksHeading": "e.g. 'How the four hours unfold'",
    "howItWorksParagraphs": [
      "paragraph describing opening segment — use <strong>bold</strong> for key time/segment names",
      "paragraph describing middle segment",
      "paragraph describing closing segment"
    ],
    "howItWorksClosing": "italic closing sentence e.g. 'The structure is simple. The structure is what makes the depth possible.'",
    "eventOverviewHeading": "e.g. 'Event overview'",
    "recordingNote": "italic note about recording availability",
    "experienceItems": [
      { "title": "experience element title", "body": "what this means for attendees" }
    ],
    "challengeItems": [
      "A specific situation or challenge this event addresses — short phrase, 4–8 words",
      "A different situation — a different pain point or life circumstance",
      "A third challenge — could be a decision, transition, or inner conflict",
      "A fourth challenge — perhaps a professional or relational one",
      "A fifth challenge — something more subtle or internal",
      "A sixth challenge — a pattern of avoidance or stalling",
      "A seventh challenge — tied to identity or values",
      "An eighth challenge — the one that keeps resurfacing. All 8 must be real, specific to this audience, derived from the brand context."
    ],
    "credibilityQuote3": "third testimonial quote (different again — ideally a researcher or professional)",
    "credibilityAttribution3": "Full Name or Dr. Name · Location",
    "extraVpHeading": "extra value prop heading (display-section class)",
    "extraVpParagraphs": [
      "paragraph 1 — addresses their internal knowing",
      "paragraph 2",
      "paragraph 3 — use <strong>bold</strong> for key phrases"
    ],
    "extraVpClosing": "italic closing for extra-vp section",
    "encourageText3": "third CTA section text — different from 1 and 2",
    "encourage3Theme": "MUST be exactly one of: \"dark\", \"accent\", or \"light\". Should differ from both encourage1Theme and encourage2Theme for visual rhythm.",
    "outcomes2Eyebrow": "e.g. 'What you take home'",
    "outcomes2Heading": "second outcomes section heading",
    "outcomes2Items": [
      { "title": "deliverable title", "body": "what this is and why it matters" },
      { "title": "deliverable title", "body": "what this is and why it matters" },
      { "title": "deliverable title", "body": "what this is and why it matters" }
    ],
    // GRID RULE: outcomes2Items MUST contain exactly 3 items (preferred) OR exactly 6 items.
    // NEVER generate 4 or 5 items — the grid only renders cleanly at 3 or 6.
    "bioEyebrow": "e.g. 'About the host'",
    "bioHeading": "e.g. 'About [host name]'",
    "bioParagraphs": [
      "paragraph 1 — first paragraph gets drop-cap styling; write first-person",
      "paragraph 2",
      "paragraph 3"
    ],
    "bioSignature": "e.g. 'I would be glad to spend four hours with you on [date]. — [Host Name]'",
    "finalVpHeading": "final VP heading above FAQ (display size, centered)",
    "finalVpIntro": "opening paragraph of final VP section",
    "finalVpFromTo": [
      { "from": "where they are now", "to": "where they'll be" },
      { "from": "from 2", "to": "to 2" },
      { "from": "from 3", "to": "to 3" }
    ],
    "finalVpClosing": "closing paragraph of final VP",
    "finalVpCtaMicrocopy": "italic line above final CTA button",
    "faqEyebrow": "e.g. 'Questions'",
    "faqItems": [
      { "question": "What if I can't attend live?", "answer": "Answer using the actual recording policy from brand context — be specific about timing and access." },
      { "question": "Do I need any prior experience or practice?", "answer": "Answer specific to this event's prerequisites (or lack thereof), using the actual event name and methodology." },
      { "question": "How is this different from [other modality or therapy]?", "answer": "Answer that distinguishes this event specifically — reference the actual methodology and unique approach." },
      ${d.eventPricingModel === "pay-what-you-want"
        ? '{ "question": "What does \'choose your price\' mean exactly?", "answer": "Explain the pay-what-you-want model using the actual price range ($' + (d.eventPriceMin ?? 0) + '\u2013$' + (d.eventPriceMax ?? 0) + '), the philosophy behind it, and that the experience is identical regardless of contribution." },'
        : '{ "question": "Is there a refund or guarantee?", "answer": "Provide a clear, reassuring answer about the refund or satisfaction policy for this event." },'
      }
      { "question": "What technology or setup do I need?", "answer": "Answer using the actual platform from brand context, plus any specific technical requirements for this type of event." },
      { "question": "I've done a lot of this kind of work before. Will this still be valuable?", "answer": "Answer that speaks to experienced practitioners specifically — reference what makes this methodology different and what even advanced students tend to discover." }
    ],
    "finalCtaLine": "one-line summary using the actual event name, date and time from brand context — no bracket placeholders",
    "finalCtaText": "final CTA button text",
    "ftcDisclaimer": "FTC-compliant results disclaimer — 2–3 professional sentences"
  },
  "eventCheckout": {
    "logoUrl": "copy the exact BRAND LOGO URL from IMAGES AVAILABLE, or null if no logo was uploaded",
    "checkoutSidebarImageUrl": "copy the exact URL of the most inviting lifestyle or hero image for the sales sidebar. Prefer lifestyle-1. Set to null if none available.",
    "priceRangeCopy": "short persuasive copy about the price range e.g. 'Pay what is genuinely accessible and meaningful for you.'",
    "priceMin": 11,
    "priceMax": 111,
    "priceDefault": 77,
    "priceTiers": [
      { "tier": 1, "amount": 11, "label": "$11" },
      { "tier": 2, "amount": 33, "label": "$33" },
      { "tier": 3, "amount": 55, "label": "$55" },
      { "tier": 4, "amount": 77, "label": "$77" },
      { "tier": 5, "amount": 111, "label": "$111" }
    ],
    "benefits": [
      "Full live session — the actual duration from brand context",
      "Lifetime recording access — available within 24 hours",
      "Any downloadable resource mentioned in the event (practice card, prompts, etc.)",
      "Any integration or follow-up call included",
      "Any ongoing access or correspondence promised by the host — use real details from brand context, no placeholder text"
    ],
    "ctaText": "Complete registration · $[amount]",
    "guaranteeText": "Your contribution is processed securely. If you cannot attend live, the recording will be available within 24 hours.",
    "ftcDisclaimer": "FTC disclaimer for checkout"
  },
  "upsell": {
    "productImageUrl": "copy the exact URL of an image that visually represents the upsell add-on product or experience — something that feels like a premium bonus, not the main event. Priority order: (1) any additional-N image (these are product/bonus shots), (2) lifestyle-2 if it shows a different context from lifestyle-1, (3) lifestyle-1 as last resort only if nothing else exists. DO NOT use a hero image. Set to null if no additional or lifestyle images were uploaded.",
    "confirmationBannerText": "short confirmation banner e.g. 'Your spot for [event] is confirmed — one more thing before you go.'",
    "eyebrow": "e.g. 'One-time offer · Step 2 of 2'",
    "headline": "upsell offer headline — use wizard upsellHeadline if provided",
    "description": "1–2 sentences describing the product in context — use wizard upsellDescription if provided",
    "includedTitle": "e.g. 'What's in the bundle'",
    "includedItems": [
      { "title": "item title — use wizard data if provided", "description": "item description — use wizard data if provided" }
    ],
    "testimonialQuote": "testimonial supporting the upsell — use wizard upsellQuote if provided",
    "testimonialAttribution": "Full Name · Location · Event, Month Year — use wizard upsellQuoteAttribution if provided",
    "regularPrice": "regular value e.g. '$297' — use wizard upsellRegularValue if provided",
    "offerPrice": "discounted price e.g. '$97' — use wizard upsellOfferPrice if provided",
    "savingAmount": "savings callout e.g. 'Save $200 — today only'",
    "urgencyNote": "urgency copy e.g. 'This offer is available once, right now. <strong>Added to your existing payment method — no second checkout.</strong>' — use wizard upsellPriceNote if provided",
    "yesCtaText": "yes CTA text — use wizard upsellCtaText if provided",
    "yesCtaSubText": "small line below yes CTA — use wizard upsellCtaSubText if provided",
    "declineText": "decline link text — use wizard upsellDeclineText if provided"
  },
  "eventThankYou": {
    "logoUrl": "copy the exact BRAND LOGO URL from IMAGES AVAILABLE, or null if no logo was uploaded",
    "backgroundImageUrl": "copy the exact URL of the most atmospheric hero or lifestyle image for the thank-you hero background. Prefer hero-1. Set to null if none available.",
    "label": "e.g. 'You're in.'",
    "headline": "thank-you headline — event name",
    "subheadline": "1-sentence confirmation",
    "emailNote": "e.g. 'Confirmation sent to your inbox from ${d.contactEmail ?? "our team"}' — use the actual contact email from brand context, never a bracket placeholder",
    "nextStepsHeading": "e.g. 'Three things to do right now'",
    "nextSteps": [
      { "step": "01", "title": "Check your email", "body": "your confirmation and event link are on their way" },
      { "step": "02", "title": "Add to your calendar", "body": "so you don't forget" },
      { "step": "03", "title": "Prepare your question", "body": "what is the real question you are bringing?" }
    ],
    "calendarHeading": "e.g. 'Add [event name] to your calendar'",
    "calendarSub": "short instruction e.g. 'Choose your calendar app'",
    "timezoneNote": "e.g. 'All times shown in [timezone]. Adjust for your location.'",
    "detailRows": [
      { "label": "Format", "value": "Live online", "isLive": true },
      { "label": "Date", "value": "use the actual event date from brand context" },
      { "label": "Time", "value": "use the actual event time and timezone from brand context" },
      { "label": "Duration", "value": "use the actual event duration from brand context" },
      { "label": "Platform", "value": "use the actual platform from brand context" },
      { "label": "Recording", "value": "use the actual recording policy from brand context" },
      { "label": "Host", "value": "use the actual host name from brand context" }
    ],
    "zoomNote": "e.g. 'Zoom link sent by email immediately. Check your spam folder if not received within 5 minutes.'",
    "shareHeading": "e.g. 'Tell someone who needs this'",
    "shareSub": "e.g. 'If someone in your life is at a threshold, pass it on.'",
    "shareUrl": "${d.websiteUrl ?? d.eventVideoUrl?.split('/').slice(0, 3).join('/') ?? ''}",
    "personalNoteHeadline": "e.g. 'A note from [host]'",
    "personalNoteParagraphs": [
      "paragraph 1 — warm, personal note to the new registrant",
      "paragraph 2"
    ],
    "personalNoteSignature": "e.g. '— [Host Name]'"
  },
  "replay": {
    "heroBackgroundImageUrl": "copy the exact URL of the most fitting hero image for the replay page header background. Prefer hero-2 if available (to differ from event landing), else hero-1. Set to null if none.",
    "logoUrl": "copy the exact BRAND LOGO URL from IMAGES AVAILABLE, or null if no logo was uploaded",
    "offerBarLabel": "e.g. 'Ready to go deeper?'",
    "offerBarTitle": "actual programme name from brand context",
    "offerBarUrgency": "e.g. 'Enrolment closes soon' — use actual date if available from brand context",
    "offerBarPrice": "PRIMARY price only — e.g. '$1,997'. One price, never combined with 'or' alternatives.",
    "eyebrow": "e.g. 'Your recordings'",
    "headline": "actual event name from brand context — the replay",
    "subtitle": "1-sentence instruction e.g. 'Watch in one session or return to each protocol separately.'",
    "metaRecordings": "e.g. '2 recordings'",
    "metaAccess": "e.g. '30-day access'",
    "resourcesLabel": "e.g. 'Your materials'",
    "resources": [
      { "name": "Practice Card PDF", "fileType": "PDF", "fileSize": "1.2 MB" },
      { "name": "Written Prompts", "fileType": "PDF", "fileSize": "0.4 MB" }
    ],
    "videos": [
      {
        "partLabel": "Part 1",
        "title": "Opening segment title — derived from how-it-works content",
        "description": "1–2 sentences describing what happens in this part of the recording",
        "duration": "estimated duration based on event duration split",
        "quotes": [
          { "text": "Short attendee quote about this part of the session — use real testimonial data if available", "author": "Real name from testimonials · Location" },
          { "text": "A second distinct attendee reaction to this part", "author": "Real name · Location" },
          { "text": "A third short reaction quote", "author": "Real name · Location" }
        ]
      },
      {
        "partLabel": "Part 2",
        "title": "Closing segment title — derived from how-it-works content",
        "description": "1–2 sentences describing what happens in this part",
        "duration": "estimated remaining duration",
        "quotes": [
          { "text": "Attendee reaction quote for this segment — specific to the content", "author": "Real name · Location" },
          { "text": "A second distinct reaction to this part", "author": "Real name · Location" },
          { "text": "A third short quote", "author": "Real name · Location" }
        ]
      }
    ],
    "commentsEyebrow": "e.g. 'What the room said'",
    "commentsTitle": "live comments section heading",
    "comments": [
      { "bubble": "Short live-chat reaction from an attendee — specific to the event content, 8–15 words", "name": "First name from testimonials or a plausible first name" },
      { "bubble": "A second distinct live-chat reaction — captures a moment of breakthrough or resonance", "name": "Different first name" },
      { "bubble": "A third comment — expresses something shifting or clarifying", "name": "Different first name" },
      { "bubble": "A fourth comment — practical or emotional response to the content", "name": "Different first name" },
      { "bubble": "A fifth comment — names a specific outcome or realisation", "name": "Different first name" },
      { "bubble": "A sixth comment — endorsement or gratitude, concise and genuine", "name": "Different first name" }
    ],
    "programCtaLabel": "e.g. 'Ready to go deeper?'",
    "programCtaHeadline": "actual programme name from brand context — compelling CTA headline",
    "programCtaDescription": "2–3 sentences about the programme",
    "programCtaBenefits": [
      "Key benefit of the programme — specific to curriculum or outcome",
      "A second distinct benefit — different from the first",
      "A third benefit — tangible or practical",
      "A fourth benefit — the transformational or long-term payoff"
    ],
    "programCtaPrice": "PRIMARY price ONLY — e.g. '$1,997'. Never combine two prices in this field. One price, no 'or', no alternatives. This renders at 42px and must fit on one line.",
    "programCtaPlanText": "Payment plan alternative if available — e.g. 'or 3 × $749/month'. Keep short. Never duplicate the primary price from programCtaPrice here.",
    "programCtaUrgency": "urgency note using actual enrolment close date if available — no bracket placeholders",
    "programCtaEnrolText": "CTA button text",
    "ftcText": "FTC disclaimer for replay page"
  },
  "imageSuggestions": {
    "FIELD_NAME_WHERE_NULL": "One sentence describing the ideal image to photograph or upload for this slot — e.g. 'A warm close-up portrait of [host name] in a natural setting'. Only include entries for fields you set to null."
  }
}`;
}

// ── Programme pages prompt + schema ─────────────────────────────────────
function buildProgrammePrompt(brandContext: string, d: WizardData): string {
  const portalUrl = d.programPortalUrl ?? "NOT PROVIDED";
  const upsellPrice = d.upsellOfferPrice
    ? `$${d.upsellOfferPrice}`
    : d.programPriceFull
      ? `$${Math.round(d.programPriceFull * 0.4)}` // 40% off default
      : "discounted price";
  const upsellRegularValue = d.upsellRegularValue ? `$${d.upsellRegularValue}` : "regular value not set";

  return `You are an expert conversion copywriter specialising in coaching programmes, retreats, and transformational high-ticket offers. You write copy that is specific, emotionally resonant, and avoids all clichés.

${brandContext}

Your task: Write compelling, personalised copy for the three PROGRAMME pages. Every field must use the real data above. Use the actual curriculum weeks, bonuses, and payment plans from the brand context.

ABSOLUTE RULES — violating any of these makes the output unusable:
- NEVER output placeholder text like [date], [host], [name], [programme name], [amount]. Replace every single bracket placeholder with the actual value from the brand context above.
- NEVER copy the instructional description strings from the schema as output (e.g. "Vision item 2 — a different dimension..." must become real copy, not that instruction string).
- Section theme fields must contain ONLY the string "dark", "accent", or "light" — nothing else.
- Every array must contain real, specific, unique content — no "item 2", "item 3", "benefit 2", or similar dummy values.
- Use the host's real name, programme's real name, real dates, real prices everywhere — never "[host name]" or "[guide name]".
- The curriculum weeks and bonuses sections MUST use the actual data provided — generate from context only if not provided.
- For ALL image URL fields: copy-paste the EXACT URL from the IMAGES AVAILABLE section above. Do NOT invent, guess, shorten, or modify any URL. Set to null if no suitable image exists and add an entry to imageSuggestions.

Copy rules:
- Match the tone descriptors exactly
- Address the audience's real pain points with specificity
- Curriculum details must reflect the actual week-by-week structure provided
- Bonus descriptions must be specific and highlight tangible value
- For arrays of paragraphs: each element is one complete paragraph

Return ONLY a valid JSON object — no prose, no markdown fences, no explanation.

{
  "programmeLanding": {
    "heroBackgroundImageUrl": "REQUIRED if hero images exist — copy the exact URL of the most powerful hero image from IMAGES AVAILABLE (prefer hero-1). Set to null only if no hero images were uploaded.",
    "programmeFeatureImageUrl": "copy the exact URL of the best lifestyle or supporting image to use alongside programme content sections. Prefer lifestyle-1 or lifestyle-2. Set to null if none available.",
    "finalCtaBackgroundUrl": "copy the exact URL of an atmospheric image for the final CTA section background, or null if no suitable unused image exists",
    "heroEyebrow": "e.g. 'Live online programme · Now open'",
    "heroHeadline": "programme hero headline — the programme name, rendered compellingly",
    "heroSubheadline": "one-sentence core transformation promise",
    "heroMeta": ["actual programme duration from brand context", "Live online", "actual start date from brand context — no bracket placeholders"],
    "heroPriceFrom": "e.g. 'From $197/month'",
    "heroUrgency": "urgency note — use actual enrolment close date if available, otherwise omit or write a generic scarcity note",
    // NOTE: heroCtaText is intentionally omitted — the hero CTA button is not shown on the Programme Landing page.
    "visionEyebrow": "e.g. 'Picture this'",
    "visionHeading": "vision section heading",
    "visionItems": [
      "Vision item 1 — a specific future state the student will inhabit. First-person or second-person. Derived from transformation promise.",
      "Vision item 2 — a different dimension of the transformation (professional, relational, internal, etc.)",
      "Vision item 3 — something tangible they will have built or achieved",
      "Vision item 4 — a shift in how they see themselves or their situation",
      "Vision item 5 — a capability or skill they will have mastered",
      "Vision item 6 — the cumulative effect; how their life is different. All 6 must be distinct, specific, and derived from the brand context."
    ],
    "visionCtaText": "e.g. 'I want this'",
    "visionCtaNote": "small note e.g. 'Scroll to see everything inside.'",
    "alreadyTriedEyebrow": "e.g. 'Sound familiar?'",
    "alreadyTriedHeading": "e.g. 'You've already tried…'",
    "alreadyTriedBody": ["paragraph 1 about what they've tried", "paragraph 2 about why it hasn't worked"],
    "alreadyTriedTags": [
      "Short phrase for something they've tried — 2–4 words, no quotes",
      "Another thing they've tried — a course, modality, or approach",
      "A third attempted solution — different category",
      "A fourth failed approach",
      "A fifth attempt — perhaps a mindset or habit",
      "A sixth — something they keep returning to that doesn't stick. All 6 derived from the target audience's actual context."
    ],
    "alreadyTriedTheme": "MUST be exactly one of: \"dark\", \"accent\", or \"light\". Empathy/problem sections often work best with \"dark\".",
    "promiseHeading": "promise section heading",
    "promiseBody": ["paragraph 1 about the promise", "paragraph 2"],
    "promiseBullets": [
      "Promise bullet 1 — a specific transformation this programme delivers. Use <strong>bold</strong> for the key outcome.",
      "Promise bullet 2 — a different dimension of the transformation",
      "Promise bullet 3 — addresses a specific pain point from the audience description",
      "Promise bullet 4 — the cumulative or identity-level change. All 4 derived from transformation promise and methodology."
    ],
    "includesEyebrow": "e.g. 'What you get'",
    "includesHeading": "e.g. 'Everything inside [programme name]'",
    "includesItems": [
      { "num": "01", "title": "include item 1 title", "description": "what this gives them specifically", "tag": "optional tag e.g. 'Core curriculum'" },
      { "num": "02", "title": "include item 2 title", "description": "what this gives them specifically", "tag": "optional tag" },
      { "num": "03", "title": "include item 3 title", "description": "what this gives them specifically", "tag": "optional tag" },
      { "num": "04", "title": "include item 4 title", "description": "what this gives them specifically", "tag": "optional tag" },
      { "num": "05", "title": "include item 5 title", "description": "what this gives them specifically", "tag": "optional tag" },
      { "num": "06", "title": "include item 6 title", "description": "what this gives them specifically", "tag": "optional tag" }
    ],
    // RULE: includesItems MUST contain exactly 6 items. The grid is 2 columns — odd counts create an orphan. NEVER generate fewer or more than 6.
    "sessionEyebrow": "e.g. 'The curriculum'",
    "sessionHeading": "e.g. 'Eight weeks of guided transformation'",
    "sessionWeeks": [
      { "num": "01", "title": "week title — use actual curriculum data", "dates": "dates placeholder", "points": ["what happens in this week", "point 2"] }
    ],
    "videoTestimonialsEyebrow": "e.g. 'Hear from past students'",
    "videoTestimonialsHeading": "video testimonials section heading",
    "credibilityQuote": "mid-page pull quote from a testimonial — use real testimonial data from brand context",
    "credibilityAttribution": "Full Name · Location",
    "bonusesEyebrow": "e.g. 'Also included'",
    "bonusesHeading": "e.g. 'Bonuses with every enrolment'",
    "bonusesItems": [
      { "num": "01", "title": "bonus title", "description": "what this bonus is and why it matters", "value": "$xxx" }
    ],
    "bonusesTotal": "e.g. 'Total bonus value: $xxx'",
    "midPriceLabel": "e.g. 'Join [programme name]'",
    "midPriceCtaText": "mid-page CTA button text",
    "midPriceUrgency": "urgency note for mid-page price",
    "outcomesEyebrow": "e.g. 'The transformation'",
    "outcomesHeading": "outcomes section heading",
    "outcomesBody": "1–2 sentence intro to outcomes section",
    "outcomesItems": [
      { "before": "where they are before", "after": "where they'll be after" }
    ],
    "outcomesCtaText": "CTA after outcomes",
    "testimonialsEyebrow": "e.g. 'In their words'",
    "testimonialsHeading": "testimonials section heading",
    "pricingEyebrow": "e.g. 'Enrolment'",
    "pricingHeading": "pricing section headline",
    "pricingSubheading": "pricing section subheadline",
    "pricingUrgency": "urgency note — use actual enrolment close date if available from brand context — no bracket placeholders",
    "pricingCtaText": "pricing CTA button text",
    "bioEyebrow": "e.g. 'About the guide'",
    "bioName": "host name",
    "bioParagraphs": ["paragraph 1 — first-person bio", "paragraph 2", "paragraph 3"],
    "bioCredentials": ["credential 1", "credential 2", "credential 3"],
    "faqEyebrow": "e.g. 'Questions'",
    "faqItems": [
      { "question": "When does the programme start and what is the weekly commitment?", "answer": "Answer using actual start date, duration, and schedule from brand context. Be specific about time commitment per week." },
      { "question": "What happens if I miss a live session?", "answer": "Answer about recordings, replay access, and catch-up process — use the actual portal URL or access method if available." },
      { "question": "Is this right for me if I'm a complete beginner?", "answer": "Answer specific to the programme's prerequisite level, addressing the target audience described in the brand context." },
      { "question": "What support do I get between sessions?", "answer": "Answer about community, direct access, Q&A, or any between-session support described in the brand context." },
      { "question": "What are the payment plan options?", "answer": "List the actual payment plans from brand context. Be specific about amounts and cadence." },
      { "question": "Is there a guarantee or refund policy?", "answer": "Answer using the actual guarantee from brand context if provided, or write a confidence-based policy appropriate to this offer." }
    ],
    "finalCtaHeadline": "final CTA section headline — no bracket placeholders",
    "finalCtaBody": "1–2 sentences",
    "finalCtaText": "final CTA button text",
    "finalCtaDeadline": "actual enrolment close date if available — no bracket placeholders; omit if not known",
    "finalCtaTheme": "MUST be exactly one of: \"dark\", \"accent\", or \"light\". Default to \"dark\" — final CTAs convert best on near-black backgrounds.",
    "ftcDisclaimer": "FTC-compliant results disclaimer"
  },
  "programmeCheckout": {
    "logoUrl": "copy the exact BRAND LOGO URL from IMAGES AVAILABLE, or null if no logo was uploaded",
    "programmeImageUrl": "copy the exact URL of a lifestyle or hero image for the order summary sidebar. Prefer lifestyle-1 or additional-1. Set to null if none available.",
    "programEyebrow": "e.g. 'You are enrolling in'",
    "programName": "actual programme name from brand context — no bracket placeholders",
    "programChips": ["actual programme duration from brand context", "Live online", "actual start date from brand context"],
    "plans": [
      { "id": "full", "name": "Pay in full", "amount": "$${d.programPriceFull ?? 1997}", "schedule": "One payment\nBest value", "isFeatured": true },
      { "id": "spread", "name": "${d.programPaymentPlans?.[0]?.installments ?? 3} payments", "amount": "$${d.programPaymentPlans?.[0]?.amountPerInstallment ?? 749}", "schedule": "× ${d.programPaymentPlans?.[0]?.installments ?? 3} monthly\nTotal $${(d.programPaymentPlans?.[0]?.installments ?? 3) * (d.programPaymentPlans?.[0]?.amountPerInstallment ?? 749)}", "isFeatured": false },
      { "id": "extended", "name": "${d.programPaymentPlans?.[1]?.installments ?? 12} payments", "amount": "$${d.programPaymentPlans?.[1]?.amountPerInstallment ?? 197}", "schedule": "× ${d.programPaymentPlans?.[1]?.installments ?? 12} monthly\nTotal $${(d.programPaymentPlans?.[1]?.installments ?? 12) * (d.programPaymentPlans?.[1]?.amountPerInstallment ?? 197)}", "isFeatured": false }
    ],
    "benefits": [
      "First specific benefit of the programme — derived from curriculum or transformation promise",
      "Second benefit — different dimension (practical, emotional, tangible)",
      "Third benefit — a specific deliverable or resource included",
      "Fourth benefit — addresses a key pain point from the target audience",
      "Fifth benefit — the long-term or identity-level outcome"
    ],
    "guaranteeTitle": "guarantee headline — use actual guarantee if provided, else write a confidence-based guarantee",
    "guaranteeText": "guarantee paragraph — specific to the programme, no placeholder text",
    "ctaText": "Enrol now — or similar CTA without bracket placeholders",
    "ftcDisclaimer": "FTC disclaimer for programme checkout"
  },
  "programmeThankYou": {
    "logoUrl": "copy the exact BRAND LOGO URL from IMAGES AVAILABLE, or null if no logo was uploaded",
    "backgroundImageUrl": "copy the exact URL of the most atmospheric hero or lifestyle image for the thank-you hero background. Prefer a different image from the programme landing hero. Set to null if none available.",
    "label": "e.g. 'You're enrolled.'",
    "headline": "actual programme name from brand context — no bracket placeholders",
    "subheadline": "1-sentence enrolment confirmation",
    "chips": ["Starts actual date from brand context", "actual programme duration", "session count if known or omit"],
    "emailNote": "e.g. 'Your welcome email is on its way from [host email]'",
    "nextHeadline": "e.g. 'Your next four steps'",
    "steps": [
      { "num": "01", "title": "Check your inbox", "body": "your welcome email and everything you need to get started is on its way", "tag": "Do this now" },
      { "num": "02", "title": "Complete your intake form", "body": "so the host can prepare specifically for your situation — use the host's real name from brand context", "tag": "Before Week 1" },
      { "num": "03", "title": "Join the community or portal", "body": "use real portal/community info from brand context if provided, else say to check welcome email", "tag": "Optional" },
      { "num": "04", "title": "Block your calendar", "body": "add all sessions now so the time is protected — use real start date and schedule from brand context", "tag": "Before Week 1" }
    ],
    "scheduleIntro": "intro sentence about the schedule",
    "scheduleRows": [
      { "week": "Week 1", "focus": "actual Week 1 title from curriculum data", "dates": "actual dates if known, else 'TBC'" },
      { "week": "Week 2", "focus": "actual Week 2 title from curriculum data", "dates": "actual dates if known, else 'TBC'" }
    ],
    "noteEyebrow": "e.g. 'A note from [host]'",
    "noteParagraphs": ["personal note paragraph 1", "paragraph 2"],
    "noteSignature": "e.g. '— [Host Name], [Host Title]'",
    "commitmentLabel": "e.g. 'What you've just chosen'",
    "commitmentHeadline": "commitment section headline",
    "commitmentItems": [
      "First commitment outcome — specific to the programme's transformation promise",
      "Second commitment outcome — a different dimension of what they've chosen",
      "Third commitment outcome — the identity or capability shift they've invested in"
    ],
    "accessCardTitle": "actual programme name from brand context — no bracket placeholders",
    "accessRows": [
      { "label": "Format", "value": "Live online" },
      { "label": "Schedule", "value": "actual schedule from brand context — start date and cadence" },
      { "label": "Duration", "value": "actual programme duration from brand context" },
      { "label": "Access", "value": "${portalUrl !== "NOT PROVIDED" ? portalUrl : "Check your welcome email"}" }
    ],
    // RULE: NEVER add a "Questions" or contact email row to accessRows — this is always injected automatically from the wizard contact email field.
    "accessNote": "e.g. 'Having trouble? Your welcome email has everything you need — check your spam folder if not received within 5 minutes.'"
    // RULE: Never use bracket placeholders like [support email] in accessNote — the contact email is always injected automatically from the wizard.
  },
  "imageSuggestions": {
    "FIELD_NAME_WHERE_NULL": "One sentence describing the ideal image to photograph or upload for this slot. Only include entries for fields you set to null."
  }
}`;
}

// ── Helpers ──────────────────────────────────────────────────────────────
function parseJsonResponse(raw: string): Record<string, unknown> {
  try {
    const jsonMatch = raw.match(/```json\n?([\s\S]*?)\n?```/) ?? raw.match(/(\{[\s\S]*\})/);
    return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(raw);
  } catch {
    console.error("JSON parse error — raw response:", raw.slice(0, 500));
    return {};
  }
}

function formatPricing(d: WizardData): string {
  if (d.eventPricingModel === "pay-what-you-want") return `Pay-what-you-want $${d.eventPriceMin ?? 0} – $${d.eventPriceMax ?? 0}`;
  if (d.eventPricingModel === "fixed") return `Fixed price $${d.eventPriceFixed}`;
  return "Pricing not specified";
}

