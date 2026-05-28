import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Message, MessageParam, ContentBlockParam, ImageBlockParam, TextBlockParam, TextBlock } from "@anthropic-ai/sdk/resources/messages/messages";
import { getSession } from "@/lib/session";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";
import type { WizardData } from "@/lib/wizard-types";
import { withWizardSnapshot } from "@/lib/funnel-snapshot";
import { computeBrandProfile, buildBrandProfilePromptBlock } from "@/lib/brand-profile";

export const maxDuration = 300;

const GENERATION_MODEL =
  process.env.ANTHROPIC_GENERATION_MODEL ?? "claude-sonnet-4-5";
const GENERATION_MAX_TOKENS = 16_000;
const CLAUDE_TIMEOUT_MS = 15 * 60 * 1000;
const MAX_CLAUDE_RETRIES = 4;
const VISION_MAX_IMAGES = 4;
const VISION_MAX_EDGE_PX = 1092;
const VISION_JPEG_QUALITY = 82;

const EVENT_PAGE_KEYS = ["eventLanding", "eventCheckout", "upsell", "eventThankYou", "replay"] as const;
const PROGRAMME_PAGE_KEYS = ["programmeLanding", "programmeCheckout", "programmeThankYou"] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableClaudeError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; cause?: { code?: string }; message?: string };
  const code = e.code ?? e.cause?.code ?? "";
  if (code === "ECONNRESET" || code === "ETIMEDOUT" || code === "ECONNABORTED") return true;
  const msg = e.message ?? "";
  return /connection error|socket hang up|timed out|timeout/i.test(msg);
}

async function createGenerationMessage(
  anthropic: Anthropic,
  messages: MessageParam[],
): Promise<Message> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_CLAUDE_RETRIES; attempt++) {
    try {
      // Streaming keeps the HTTP connection alive during long generations,
      // which avoids proxy/socket idle timeouts on multi-minute requests.
      const stream = anthropic.messages.stream({
        model: GENERATION_MODEL,
        max_tokens: GENERATION_MAX_TOKENS,
        messages,
      });
      return await stream.finalMessage();
    } catch (err) {
      lastError = err;
      if (!isRetryableClaudeError(err) || attempt === MAX_CLAUDE_RETRIES) break;
      await sleep(3000 * attempt);
    }
  }

  throw lastError;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

async function getServiceClient(): Promise<AnySupabase> {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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

// ── Build vision blocks so Claude can actually SEE key uploaded visuals ──
// Returns interleaved [text-label, image, …] blocks.
// Images are resized/compressed before upload — raw hero files can be 10MB+ each
// and will cause connection resets if sent as full base64 payloads.
async function compressImageForVision(
  buffer: ArrayBuffer,
  contentType: string,
): Promise<{ data: string; media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif" } | null> {
  try {
    const sharp = (await import("sharp")).default;
    const input = Buffer.from(buffer);
    const resize = {
      width: VISION_MAX_EDGE_PX,
      height: VISION_MAX_EDGE_PX,
      fit: "inside" as const,
      withoutEnlargement: true,
    };

    const ct = contentType.toLowerCase();
    if (ct.includes("png") || ct.includes("gif") || ct.includes("webp")) {
      const png = await sharp(input).rotate().resize(resize).png({ compressionLevel: 8 }).toBuffer();
      if (png.length <= 750_000) {
        return { data: png.toString("base64"), media_type: "image/png" };
      }
    }

    const jpeg = await sharp(input)
      .rotate()
      .resize(resize)
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: VISION_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    return { data: jpeg.toString("base64"), media_type: "image/jpeg" };
  } catch {
    return null;
  }
}

async function buildVisionBlocks(d: WizardData): Promise<ContentBlockParam[]> {
  const blocks: ContentBlockParam[] = [];

  const heroItems = (d.heroImageUrls ?? []).map((url, i) => ({
    url,
    label: `[hero-${i + 1}] HERO/BACKGROUND IMAGE ${i + 1} — reference its mood, atmosphere, and subject when writing hero sections`,
  }));
  const lifestyleItems = (d.lifestyleImageUrls ?? []).slice(0, 1).map((url, i) => ({
    url,
    label: `[lifestyle-${i + 1}] LIFESTYLE IMAGE ${i + 1} — use what you observe to write specific, grounded copy`,
  }));
  const headshotItem = d.hostHeadshotUrl
    ? [{ url: d.hostHeadshotUrl, label: "[headshot] HOST HEADSHOT — use the person's appearance and energy to inform how you write about them" }]
    : [];
  const logoItem = d.logoUrl
    ? [{ url: d.logoUrl, label: "[logo] BRAND LOGO — note colour and typographic clues about the brand's identity" }]
    : [];

  const toInclude = [...heroItems.slice(0, 2), ...headshotItem, ...logoItem, ...lifestyleItems].slice(0, VISION_MAX_IMAGES);

  for (const item of toInclude) {
    try {
      const res = await fetch(item.url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      if (contentType.includes("svg")) continue;

      const buf = await res.arrayBuffer();
      const compressed = await compressImageForVision(buf, contentType);
      if (!compressed) continue;

      blocks.push({ type: "text", text: item.label } as TextBlockParam);
      blocks.push({
        type: "image",
        source: { type: "base64", media_type: compressed.media_type, data: compressed.data },
      } as ImageBlockParam);
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

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: CLAUDE_TIMEOUT_MS,
      maxRetries: 0,
    });

    // ── Fetch documents and vision blocks in parallel ──
    const [docBlocks, visionBlocks] = await Promise.all([
      fetchDocumentBlocks(wizardData.existingFileUrls ?? []),
      buildVisionBlocks(wizardData),   // returns ContentBlockParam[] (label+image pairs)
    ]);

    // ── Build shared brand context ──
    const brandProfile = computeBrandProfile(wizardData);
    const wizardForGen: WizardData = {
      ...wizardData,
      brandProfile,
      referenceTheme: wizardData.referenceTheme ?? brandProfile.suggestedThemeSlug,
    };
    const brandContext = buildBrandContext(wizardForGen);

    // Run sequentially — two large vision+prompt calls in parallel often hit connection timeouts.
    const eventResult = await generateEventPages(anthropic, wizardForGen, brandContext, docBlocks, visionBlocks);
    // Programme copy uses image URLs from brand context — skip vision blocks to halve payload size.
    const programmeResult = await generateProgrammePages(anthropic, wizardForGen, brandContext, docBlocks, []);

    const pageContent = { ...eventResult, ...programmeResult };
    assertFunnelContent(pageContent);
    // Freeze wizard brand/fonts/images with this generation so previews never pick up
    // live edits from another funnel entry or a later wizard session.
    const content = withWizardSnapshot(pageContent, wizardForGen as Record<string, unknown>);

    // ── Store ──
    const { data: funnel, error } = await supabase
      .from("generated_funnels")
      .insert({
        user_id: userId,
        submission_id: submissionId ?? null,
        content,
        theme_slug: wizardForGen.referenceTheme ?? brandProfile.suggestedThemeSlug,
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
    const msg = err instanceof Error ? err.message : "";
    const userMessage =
      /failed to parse|incomplete|empty response|no page content/i.test(msg)
        ? `Generation failed: ${msg}`
        : /connection error|socket hang up|timed out|timeout|ECONNRESET/i.test(msg)
          ? "Generation timed out while contacting the AI service — please try again. If this keeps happening, try with fewer uploaded images."
          : msg
            ? `Generation failed: ${msg}`
            : "Generation failed — please try again";
    return NextResponse.json({ error: userMessage }, { status: 500 });
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

/** Build a human-readable colour brightness profile that informs Claude's section-theme decisions */
function buildColorProfile(d: WizardData): string {
  const sg = d.styleGuide;
  const primary   = sg?.brandColors?.primary   ?? "#2B4EAA";
  const secondary = sg?.brandColors?.secondary ?? "#445566";
  const tertiary  = sg?.brandColors?.tertiary  ?? "#6699BB";

  function tag(hex: string): string {
    const lum = hexLuminance(hex);
    if (lum < 0.18) return "VERY DARK (near-black, dramatic)";
    if (lum < 0.35) return "DARK (moody, grounding)";
    if (lum < 0.60) return "MID (balanced, versatile)";
    if (lum < 0.80) return "BRIGHT (lifted, energetic)";
    return "VERY BRIGHT (luminous, attention-grabbing)";
  }

  const primaryTag   = tag(primary);
  const secondaryTag = tag(secondary);
  const tertiaryTag  = tag(tertiary);

  // Derive an overall brand mood from the primary colour
  const primaryLum = hexLuminance(primary);
  let brandMood: string;
  let darkSectionRecommendation: string;
  if (primaryLum < 0.25) {
    brandMood = "GROUNDED & EARTHED — this brand reads as serious, premium, and weighty. Dark sections will feel coherent with the identity. Light sections create breathing room.";
    darkSectionRecommendation = "Lean into dark sections for hero, CTAs, and emotional moments. Use light sections for breathing space and content density.";
  } else if (primaryLum < 0.50) {
    brandMood = "WARM & PROFESSIONAL — this brand reads as established and considered. Balanced section rhythm works best.";
    darkSectionRecommendation = "Alternate dark and light sections in roughly equal measure. Reserve dark sections for high-drama CTAs and final closes.";
  } else {
    brandMood = "LUMINOUS & ENERGETIC — this brand reads as bright, hopeful, expansive. Light-heavy sections will feel native. Dark sections become the dramatic contrast.";
    darkSectionRecommendation = "Default to light sections with warm canvas backgrounds. Use accent for hero and register bands; use dark (deep branded slate) sparingly for final VP and one mid-page moment.";
  }

  return `=== BRAND COLOUR PROFILE ===
The wizard captured (or auto-detected) three brand colours. Their RELATIVE BRIGHTNESS
informs every section-theme decision you make below.

Primary   — ${primary} → ${primaryTag}
Secondary — ${secondary} → ${secondaryTag}
Tertiary  — ${tertiary} → ${tertiaryTag}

BRAND MOOD: ${brandMood}

SECTION-THEME GUIDANCE (for fields like encourageNTheme, alreadyTriedTheme, finalCtaTheme):
${darkSectionRecommendation}

WHY THIS MATTERS FOR YOUR COPY:
- Match the emotional weight of the section theme to your word choice
- DARK sections: short sentences, bold nouns, dramatic verbs. Read like a manifesto.
- ACCENT sections: medium energy, declarative, slightly more colour in the language.
- LIGHT sections: warmer, more conversational, sentence variety, room for nuance.

NOTE ON CONTRAST: The template's CSS already pre-computes contrast-safe variants of every
brand colour for both dark and light backgrounds — you do NOT need to think about specific
hex values or CSS variables. Focus entirely on writing copy that matches the BRAND MOOD
above. The visual system handles the colour application automatically.`;
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
    : "Not auto-detected — neutral fallbacks will be applied";

  const pressLogos = (d.pressLogos ?? []);
  const pressText = pressLogos.length
    ? pressLogos.map(l => l.logoUrl ? `${l.name} (logo file uploaded)` : `${l.name || l.websiteUrl} (text-only mention)`).join(", ")
    : "None provided — leave press logo section empty; do not invent press mentions";

  const testimonialText = (d.testimonials ?? []).length
    ? (d.testimonials ?? []).map((t, i) => `[${i + 1}] "${t.quote}" — ${t.name}${t.location ? `, ${t.location}` : ""}${t.context ? ` (${t.context})` : ""}`).join("\n")
    : "NONE PROVIDED — for credibility quote fields (credibilityQuote1/2/3, credibilityQuote, vpPullQuote), output null. Do NOT fabricate fake testimonials with made-up names.";

  const videoTestimonialsText = (d.videoTestimonialUrls ?? []).length
    ? `${(d.videoTestimonialUrls ?? []).length} video testimonial URLs provided — the ProgrammeLanding video-testimonials section will render these.`
    : "None — the video testimonials section will fall back to text quotes from the testimonials list above.";

  const paymentPlansText = (d.programPaymentPlans ?? []).length
    ? (d.programPaymentPlans ?? []).map(p => `${p.installments}× $${p.amountPerInstallment} ${p.cadence} (total $${p.installments * p.amountPerInstallment})`).join("; ")
    : "No payment plans set — pay-in-full only";

  const toneDescriptors = d.toneDescriptors ?? [];
  const toneGuidance = toneDescriptors.length
    ? toneDescriptors.map(t => `  • ${t} → ${toneToWritingGuidance(t)}`).join("\n")
    : "  • No tone descriptors set — default to professional, warm, transformative copy";

  // ── Wizard data completeness — flag what's missing so Claude knows what to be careful about ──
  const missing: string[] = [];
  if (!d.audienceDescription)     missing.push("audience description (audienceItems/visionItems must be inferred from event/programme name and tone)");
  if (!d.transformationPromise)   missing.push("transformation promise (outcomes copy will need to be derived from methodology/uniqueApproach)");
  if (!d.methodologyDescription)  missing.push("methodology description (vpParagraphs and personalMessage will need to be generic-but-credible)");
  if (!d.curriculumWeeks?.length) missing.push("curriculum weeks (sessionWeeks must be inferred from programme tagline and duration)");
  if (!d.bonuses?.length)         missing.push("bonuses (generate 2–3 plausible bonuses that complement the offer)");
  if (!d.testimonials?.length)    missing.push("testimonials (set ALL credibility/quote fields to null — do not fabricate)");
  if (!d.hostBio)                 missing.push("host bio (write a credible 3-paragraph bio from the host name + title + tagline)");

  const completenessNote = missing.length
    ? `INCOMPLETE WIZARD DATA — the following inputs were not provided. Follow the per-field guidance to handle each:\n${missing.map(m => `  ⚠ ${m}`).join("\n")}`
    : "✓ All critical wizard fields populated. Use the real data verbatim — never substitute generic copy.";

  return `=== HOST & BRAND IDENTITY ===
Host name: ${d.hostName ?? "NOT PROVIDED"}
Host title / credentials: ${d.hostTitle ?? "NOT PROVIDED"}
Host tagline (one-line essence): ${d.hostTagline ?? "NOT PROVIDED"}
Host bio (full): ${d.hostBio ?? "NOT PROVIDED — derive a credible bio from host name, title, and tagline"}
Host headshot: ${d.hostHeadshotUrl ? "Uploaded — visible in vision block above. Use its energy and presentation to inform how you write about this person." : "Not uploaded"}
Host signature: ${d.hostSignatureUrl ? "Uploaded" : "Not uploaded"}

Business name: ${d.businessName ?? "NOT PROVIDED — fall back to host name in brand references"}
Legal entity name (for FTC disclaimers and copyright): ${d.legalEntityName ?? d.businessName ?? d.hostName ?? "NOT PROVIDED"}
Contact / support email: ${d.contactEmail ?? "NOT PROVIDED"}
Website: ${d.websiteUrl ?? "NOT PROVIDED"}
Privacy Policy URL: ${d.privacyPolicyUrl ?? "Not set — ZIVA-hosted fallback will be used"}
Terms of Use URL: ${d.termsOfUseUrl ?? "Not set — ZIVA-hosted fallback will be used"}
Social — Instagram: ${d.instagramUrl ?? "—"} | LinkedIn: ${d.linkedinUrl ?? "—"} | Facebook: ${d.facebookUrl ?? "—"} | TikTok: ${d.tiktokUrl ?? "—"} | YouTube: ${d.youtubeUrl ?? "—"}

=== BRAND STYLE ===
Auto-detected colours: ${colorInfo}
Typography: ${fontInfo || "Not detected — system serif/sans fallbacks will apply"}

${buildColorProfile(d)}

=== LIVE EVENT ===
Name: ${d.eventName ?? "NOT PROVIDED"}
Tagline (sub-headline source material): ${d.eventTagline ?? "NOT PROVIDED — derive from transformation promise"}
Date: ${d.eventDate ?? "NOT PROVIDED"} at ${d.eventTime ?? "NOT PROVIDED"} ${d.eventTimezone ?? ""}
Duration: ${d.eventDuration ?? "Not provided — say '3 hours' as a sensible default"}
Platform: ${d.eventPlatform ?? "Online / Zoom"}
Pricing: ${formatPricing(d)}
Recording policy: ${d.eventRecordingPolicy ?? "Assume recording included for 30 days"}
Promo video URL: ${d.eventVideoUrl ?? "NOT PROVIDED"}

=== UPSELL OFFER (one-time post-event offer — wizard fields are SOURCE MATERIAL; rewrite for page) ===
Product name (renders as page title — do not repeat in headline/description): ${d.upsellOfferName ?? "NOT PROVIDED — generate a plausible name aligned with the event topic"}
Tagline source (rewrite to max 15 words): ${d.upsellHeadline ?? "NOT PROVIDED"}
Description source (distill to max 2 sentences): ${d.upsellDescription ?? "NOT PROVIDED"}
Included items:
${(d.upsellIncludedItems ?? []).map(it => `  • ${it.title}: ${it.description}`).join("\n") || "  Not provided — generate 3 compelling items that genuinely complement the live event topic. No generic 'bonus PDFs'."}
Upsell testimonials:
${formatUpsellQuotes(d)}
Regular value: ${d.upsellRegularValue ? `$${d.upsellRegularValue}` : "Not set — derive a believable anchor (~3× offer price)"}
Offer price: ${d.upsellOfferPrice ? `$${d.upsellOfferPrice}` : "Not set — calculate ~40% off full price or cheapest payment plan total"}
Price note: ${d.upsellPriceNote ?? "—"}
CTA text: ${d.upsellCtaText ?? "—"}
CTA sub-text: ${d.upsellCtaSubText ?? "—"}
Decline text: ${d.upsellDeclineText ?? "—"}

=== PROGRAMME (high-ticket post-event offer) ===
Name: ${d.programName ?? "NOT PROVIDED"}
Tagline: ${d.programTagline ?? "NOT PROVIDED"}
Start date: ${d.programStartDate ?? "NOT PROVIDED — say 'enrolment open' or omit start date copy"}
Duration: ${d.programDuration ?? "NOT PROVIDED"}
Schedule (when/cadence sessions run): ${d.programSchedule ?? "NOT PROVIDED"}
Full price: ${d.programPriceFull ? `$${d.programPriceFull}` : "NOT PROVIDED — use $1997 as a sensible high-ticket default"}
Payment plans: ${paymentPlansText}
Member portal URL: ${d.programPortalUrl ?? "NOT PROVIDED — tell students to check their welcome email for portal access"}
Guarantee: ${d.programGuarantee ?? "NOT PROVIDED — write a confidence-based guarantee appropriate to the offer (typically 7-14 day satisfaction)"}

=== CURRICULUM & CONTENT ===
Target audience description: ${d.audienceDescription ?? "NOT PROVIDED — derive from event/programme name, tone, and methodology"}
Transformation promise: ${d.transformationPromise ?? "NOT PROVIDED — derive from event/programme name and methodology"}
What's included: ${d.whatIsIncluded ?? "NOT PROVIDED"}
Week-by-week curriculum:
${(d.curriculumWeeks ?? []).map(w => `  Week ${w.week} — ${w.title}: ${w.description}`).join("\n") || "  Not provided — generate based on transformation promise, programme name, and duration. Each week must have a clear focus that builds on the previous."}
Bonuses:
${(d.bonuses ?? []).map(b => `  • ${b.title} (value: ${b.value || "unspecified"}): ${b.description}`).join("\n") || "  Not provided — generate 2–3 compelling bonuses that genuinely complement the curriculum. Assign realistic values."}

=== METHODOLOGY & STORY ===
Methodology: ${d.methodologyDescription ?? "NOT PROVIDED"}
Unique approach: ${d.uniqueApproach ?? "NOT PROVIDED"}
Existing material URLs (text/links the host wants you to reference): ${(d.existingMaterialUrls ?? []).join(", ") || "None"}

=== SOCIAL PROOF ===
Press logos: ${pressText}
Testimonials:
${testimonialText}
Video testimonials: ${videoTestimonialsText}

=== TONE & VOICE ===
Descriptors: ${toneDescriptors.join(", ") || "professional, warm, transformative (defaults)"}
Concrete writing translations:
${toneGuidance}
Reference URL (copy style they love): ${d.copyLoveUrl ?? "None provided"}
Copy patterns they dislike: ${d.copyHateDescription ?? "Avoid: generic life-coach clichés, 'unlock your potential', 'manifest your dreams', any spiritual buzzword soup."}

${buildBrandProfilePromptBlock(d.brandProfile ?? computeBrandProfile(d), d)}

=== VISUAL ASSETS ===
Images sent to you above as labelled vision blocks. Study each carefully.
When assigning image URL fields, copy-paste the EXACT URL from this inventory.
Set any image field to null if no suitable image exists — and add a useful suggestion to imageSuggestions.

HERO IMAGES:
${(d.heroImageUrls ?? []).length > 0
  ? (d.heroImageUrls ?? []).map((url, i) => `  hero-${i + 1}: ${url}`).join("\n")
  : "  None uploaded"}

LIFESTYLE IMAGES:
${(d.lifestyleImageUrls ?? []).length > 0
  ? (d.lifestyleImageUrls ?? []).map((url, i) => `  lifestyle-${i + 1}: ${url}`).join("\n")
  : "  None uploaded"}

ADDITIONAL IMAGES:
${(d.additionalImageUrls ?? []).length > 0
  ? (d.additionalImageUrls ?? []).map((url, i) => `  additional-${i + 1}: ${url}`).join("\n")
  : "  None uploaded"}

HOST HEADSHOT: ${d.hostHeadshotUrl ?? "Not uploaded"}
BRAND LOGO: ${d.logoUrl ?? "Not uploaded"}

Image usage guidance:
- HERO images: rich, atmospheric, with depth. Use as backgrounds with dark overlay. Reflect their mood in opening headlines.
- LIFESTYLE images: show the practitioner/community in context. Use for sidebars, value-prop blocks, mid-page features.
- ADDITIONAL images: secondary use — bonus features, upsell products, ambient backgrounds.
- HOST HEADSHOT: bio sections, personal-message sections, signature blocks.
- LOGO: header / footer / progress bars only. Never used as decoration.

If you set an image field to null, the corresponding imageSuggestions entry must be ACTIONABLE — describe the specific photograph the client should shoot or commission. Not "a nice photo" but "A warm three-quarter portrait of ${d.hostName ?? "the host"} in natural light, mid-explanation, holding a book — shot at golden hour against a soft neutral background."

=== DATA COMPLETENESS NOTE ===
${completenessNote}

=== UNIVERSAL RULES ===

ANTI-HALLUCINATION — CRITICAL:
- NEVER invent testimonial quotes, attendee names, locations, or contexts. If the wizard provided no testimonials, set credibility quote fields to null.
- NEVER invent press features, awards, "as seen in" mentions. Use only what's in pressLogos above.
- NEVER invent prices, dates, durations, or numerical claims. Use only what's in this brand context.
- NEVER invent the host's specific credentials, qualifications, or career history. Use only the bio above; if bio is missing, write generic-but-credible role-based copy (e.g. "with over a decade of practice" only if implied by hostBio).
- NEVER invent specific outcomes ("85% of students report…"). Speak in qualitative language without false statistics.

BRACKET PLACEHOLDERS — BANNED:
Every one of these MUST be replaced with the actual value from the brand context above:
[host], [host name], [name], [your name], [first name],
[event name], [event], [programme name], [program name],
[date], [time], [timezone], [duration], [platform],
[price], [amount], [contribution], [tier],
[domain], [website], [email], [support email], [sender address],
[guide name], [facilitator], [your business], [brand], [bonus value], [enrolment date],
[city], [location], [studio name], [organisation],
[year], [month], [season], [practice], [modality]
If the actual value is missing, OMIT the sentence or rephrase to flow without it. NEVER leave brackets.

MATHEMATICAL ACCURACY:
- Payment plan totals MUST equal (installments × amountPerInstallment). Never describe payment plans where the math doesn't add up.
- Bonus totals MUST be the sum of individual bonus values. If a bonus value is "$497" and another is "$197", the total is "$694" — never "around $700" or "$1000+".
- Tiered pricing: if event is pay-what-you-want with min $11 and max $111, the price tiers MUST fall within this range.

VOICE CONSISTENCY:
- The same host speaks across all 8 funnel pages. Their voice MUST be identical from event landing → checkout → upsell → thank-you → replay → programme landing → programme checkout → programme thank-you.
- If the host bio uses "I" (first person), every personal note across pages uses "I".
- Vocabulary should be consistent: if the methodology is called "the Aligned Living framework" on the landing page, it remains that name across all pages.

TYPOGRAPHY RULES (affect every text field):
- Never combine two prices in one field. Use dedicated sub-fields for secondary prices (programCtaPlanText, hero-price-plan, etc.).
- Price fields rendered at 42px+ contain ONE price only. No "or", no "from", no alternatives.
- ORPHAN WORDS — CRITICAL: a sentence MUST NEVER break so that only one or two words fall on the final line. This is the most common visible failure. Specifically applies to all DISPLAY-class fields:
    • heroHeadline, heroSubheadline, subheadline (event/programme thank-you), headline (replay), label, ty-event-name copy
    • offer-tagline (upsell), finalCtaHeadline, finalVpHeading, extraVpHeading, vpHeading, outcomesHeading
    • prog-hero-title, prog-hero-sub, replay-event-title, accessCardTitle
  These render at clamp(22px, 3vw, 30px) up to clamp(48px, 7vw, 88px) — large enough that 4–10 words is the entire visible line. RULE: rewrite copy so total word count is divisible cleanly across roughly even lines. If "Your seat is confirmed. Here's what happens next." would break as 8 words + "next.", REWRITE to "Your seat is confirmed — here's what happens next" (no period) or "Your seat is confirmed. Here is what comes next." so words distribute evenly. Aim for either ONE-LINE-FITS or BALANCED-MULTILINE. Never single-orphan.
- Short labels (eyebrows, badges, pill text): under 6 words, single line, ALL-CAPS-able.
- Headlines under 12 words. Subheadlines under 20 words.
- "·" (middle dot) is the only allowed inline separator. Never use "|" or em-dashes inside metadata strings.
- Avoid trailing periods on short display copy under 8 words — they create awkward orphan endings and visual full-stops aren't needed at large sizes.

GRID LAYOUT RULES (affect array length decisions):
- outcomesItems / outcomes2Items: exactly 3 OR exactly 6. NEVER 4 or 5.
- includesItems: exactly 6 (2-column grid; odd counts orphan).
- audienceItems, challengeItems, alreadyTriedTags, visionItems, promiseBullets: 4–8 items, content-driven (no orphan-row constraint).
- bonusesItems: 2–4 items. Each MUST have a believable monetary value.
- nextSteps (thank-you pages): exactly 3 (event) or exactly 4 (programme).
- detailRows / accessRows: 4–7 rows max.

PAYMENT PLAN RULES (programmeCheckout.plans + plans modal):
- "Pay in full" (id: "full") is ALWAYS the first plan and ALWAYS has isFeatured: true.
- No installment plan may ever have isFeatured: true.
- Only ONE plan in the array may have isFeatured: true.
- Never label multiple plans as "Most popular" — only one plan can be featured, and it's always Pay in full.

SECTION THEME RULES (heroTheme, encourageNTheme, finalVpTheme, registerTheme, alreadyTriedTheme, finalCtaTheme):
- Values MUST be exactly one of: "dark" | "accent" | "light"
- "dark" = deep branded slate (NOT generic black) — high-drama moments
- "accent" = mid slate/teal brand band — ideal for warm healing brands
- "light" = peachy/cream canvas — default for luminous warm brands on content-heavy sections
- Vary the rhythm: don't pick "dark" for every section — alternate per BRAND PROFILE section rhythm above
- Warm luminous brands (bright coral/gold primary): heroTheme "accent", registerTheme "accent", finalVpTheme "dark", encourage bands mix accent + light
- Dark literary brands (very dark primary): heroTheme "dark", registerTheme "dark", encourage bands alternate dark + light

UPSELL PAGE COPY (upsell.headline + upsell.description):
- Wizard upsell fields are SOURCE MATERIAL — rewrite for the page; do not paste verbatim.
- Product name (upsellOfferName) is NOT output in JSON — it renders from wizard. Never repeat it in headline or description.
- upsell.headline = TAGLINE ONLY: max 15 words, emotional promise beneath the product title. Rewrite wizard upsellHeadline tighter. No pricing, no bundle lists.
- upsell.description = MAX 2 sentences: distill wizard upsellDescription to what the offer adds after the live event. NEVER include prices, "save $X", payment terms, or bullet lists — those live in price block and includedItems.
- If wizard description is a long sales paste, extract the core promise into 2 sentences; move deliverable details into includedItems (if wizard items exist, keep titles/descriptions verbatim).
- includedItems + upsellQuotes: use wizard upsellIncludedItems and upsellQuotes EXACTLY when provided (don't rephrase quotes or item titles).

COLOR HIERARCHY RULES (visual rhythm — templates enforce automatically, but copy must not assume primary styling everywhere):
- Never stack two primary-coloured emphasis elements in immediate succession. Specifically: urgency badges, deadline pills, and meta labels that sit directly above a primary CTA button MUST NOT use the primary/accent-light colour — templates assign secondary/tertiary emphasis dynamically based on panel background contrast.
- programCtaUrgency (replay): copy only — enrolment deadline text. Do NOT imply it will render in primary colour. Keep under 8 words.
- offerBarUrgency (replay sticky bar): muted meta text only — not a second primary CTA. Keep short.
- Primary colour is reserved for ONE conversion action per visible block: the main button (program-cta-btn, offer-bar-cta, hero CTA, etc.).
- When describing urgency in copy, use deadline language ("Enrolment closes Thursday…") — never duplicate the CTA verb ("Enrol now" in urgency + button).

IMAGE-LED COPY:
- Hero copy must echo the mood of the hero image (rich/intimate/expansive/serene — observe and reflect).
- If no hero image: write copy that doesn't reference visuals or imply atmosphere.
- Image suggestions must be actionable for a client to photograph or commission.`;
}

/** Translate a tone descriptor into concrete writing guidance for Claude.
 *  Covers every descriptor in TONE_DESCRIPTORS (wizard-constants.ts) plus common variants.
 */
function toneToWritingGuidance(descriptor: string): string {
  const t = descriptor.toLowerCase().trim();
  const map: Record<string, string> = {
    // === Core wizard options (TONE_DESCRIPTORS) ===
    "warm":             "Second-person address ('you'), gentle pacing, sensory specificity. Reader is met, not pitched to.",
    "nurturing":        "Acknowledge struggle before solution. 'You don't need to know how yet.' Permission-giving language.",
    "direct":           "Lead with the outcome. No throat-clearing. Verbs in the first three words. Cut hedging.",
    "authoritative":    "Declarative sentences, evidence-based phrasing, no hedging. 'I believe' → 'I know'. Calm command.",
    "playful":          "Sentence-fragment punchlines. Conversational asides. Earned humour — never jokes for their own sake.",
    "irreverent":       "Subvert reader expectations. Punch the cliché. Say the thing other coaches won't. Never crass.",
    "mystical":         "Threshold language ('arrive', 'cross', 'remember'). Avoid metaphysical jargon ('manifest', 'vibration', 'frequency') — show the depth without the slang.",
    "grounded":         "Concrete nouns over abstract ones. 'Your kitchen table' not 'your environment'. Specific, embodied.",
    "cosmic":           "Large-scale framing — generations, lineages, archetypes. Match the scale to the offer, never bloat it.",
    "strategic":        "Frame in moves, leverage, sequence. The reader is building something. Lead with mechanism.",
    "analytical":       "Mechanism-led phrasing. Cite the why. Specific verbs over vague ones. Show structure.",
    "empowering":       "Reader as agent, never recipient. 'You build', 'you choose', 'you decide'. No saviour positioning.",
    "ceremonial":       "Weighted phrasing. Honour the threshold. Use 'mark', 'witness', 'gather'. Restraint over fanfare.",
    "conversational":   "Sound like the host is across the table. Contractions. Sentence fragments where it lands. No corporate voice.",
    "poetic":           "Rhythm, alliteration, white space in pacing. Don't sacrifice clarity for prettiness.",
    "clinical":         "Precise, evidence-led, sparing with emotion. Like reading a careful clinician's note. No filler.",
    "energetic":        "Forward-leaning verbs, short sentences, momentum. End each section with a pull, not a sigh.",
    "calm":             "Long even cadence. Soft consonants. Permission to slow down. No exclamation marks.",
    "celebratory":      "Acknowledge what the reader has crossed already. 'You've arrived'. Warm without saccharine.",
    "reverent":         "Treat the work, the teacher, and the reader with weight. No casual asides. Choose every word.",
    "urgent":           "Specific deadlines, concrete consequences of inaction. Never manufactured urgency.",
    "measured":         "Steady cadence. Every claim earned. Avoid superlatives. Trust the reader.",
    "provocative":      "Name what's avoided. Ask the question the reader won't. Always loving, never cruel.",
    "gentle":           "Soften certainty with 'as much as feels right', 'when you're ready'. Lower the volume.",
    // === Common synonyms / alternative phrasings ===
    "professional":     "Confident, precise verbs. Avoid filler. No exclamation marks.",
    "transformative":   "Frame the journey as a threshold or shift, not a transaction. Use 'become', 'arrive', 'cross'.",
    "intimate":         "First-person host voice, short paragraphs, conversational rhythm.",
    "spiritual":        "Embodied language ('felt sense', 'lived'), avoid metaphysical jargon ('manifest', 'vibration').",
    "scientific":       "Mechanism-led phrasing. Cite the why. Specific verbs over vague ones.",
    "minimalist":       "Short sentences. Active voice. One idea per paragraph. Cut adverbs.",
    "no-fluff":         "Cut every word that doesn't earn its place. If a sentence could be deleted, delete it.",
    "data-driven":      "Quantify where you can (without inventing numbers). Lead with the measurable shift.",
    "achievement-focused": "Frame in milestones, completion, mastery. 'By week 3, you will…'",
    "heart-centred":    "Feeling-led language. The reader is met before they are sold to.",
    "body-centred":     "Embodied verbs: feel, settle, return, land. Avoid head-only language.",
    "premium":          "Restraint over abundance. Less is more. Cut superlatives.",
    "atmospheric":      "Set scene before claim. Sensory adjectives over abstract ones.",
    "cinematic":        "Visual pacing — short paragraph, then long, then short. Build like a scene.",
    "considered":       "No throwaway phrases. Every line feels chosen.",
  };
  return map[t] ?? `Write with the spirit of "${descriptor}" — interpret faithfully and apply consistently across all pages.`;
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
  const response = await createGenerationMessage(anthropic, messages);

  return parseGenerationResponse(response, "Event pages", EVENT_PAGE_KEYS);
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
  const response = await createGenerationMessage(anthropic, messages);

  return parseGenerationResponse(response, "Programme pages", PROGRAMME_PAGE_KEYS);
}

// ── Event pages prompt + schema ──────────────────────────────────────────
function buildEventPrompt(brandContext: string, hasVideo: boolean, d: WizardData): string {
  // Pre-compute price tier numbers from wizard min/max so Claude sees concrete integers in the example
  const pMin = d.eventPriceMin ?? 11;
  const pMax = d.eventPriceMax ?? 111;
  const range = pMax - pMin;
  const t2 = Math.round(pMin + range * 0.25);
  const t3 = Math.round(pMin + range * 0.5);
  const t4 = Math.round(pMin + range * 0.75);
  const pDefault = t3;

  return `You are an expert conversion copywriter specialising in live events, retreats, and transformational online experiences. You write copy that is specific, emotionally resonant, and avoids all clichés.

${brandContext}

Your task: Write compelling, personalised copy for the five EVENT pages of a sales funnel — Event Landing, Event Checkout, Upsell, Event Thank-You, Replay.

OUTPUT DISCIPLINE — violating any of these makes the output unusable:
- Return ONLY a valid JSON object. No prose. No markdown fences. No commentary. No leading/trailing whitespace beyond the JSON itself.
- The JSON structure below shows EXAMPLE values inside string fields. You MUST replace each example with real, specific copy. NEVER copy the instruction string itself as output (e.g. "audience item 2 — a different characteristic..." must become real copy).
- Every quoted-string value with an "e.g. '...'" example: use the SHAPE of the example, never the literal text. Substitute real data from the brand context.
- For image URL fields: copy-paste the EXACT URL from the IMAGES AVAILABLE section above. Do NOT invent, guess, shorten, or modify any URL. Set to null if no suitable image exists and add an entry to imageSuggestions describing what to photograph.
- Section theme fields must contain ONLY the string "dark", "accent", or "light" — nothing else.
- All number fields (priceMin, priceMax, priceDefault, tier amounts) must be JSON numbers, not strings.

(Reminder: the UNIVERSAL RULES from the brand context above — anti-hallucination, no bracket placeholders, math accuracy, grid sizes, payment plan order, typography rules, voice consistency — ALL apply here. Re-read them before generating.)

The JSON must have exactly this structure:

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
    "heroTheme": "MUST be exactly one of: \"dark\", \"accent\", or \"light\". Warm luminous brands: prefer \"accent\" (slate/teal hero). Dark literary brands: prefer \"dark\".",
    "credibilityQuote1": "opening testimonial — short and powerful, under 30 words",
    "credibilityAttribution1": "Full Name · Location",
    "videoSectionEyebrow": "eyebrow for video section e.g. 'A note from ${d.hostName ?? "the host"}'",
    "videoSectionHeading": "video section headline (display-section size)",
    "videoCaption": ${hasVideo ? `"caption text below video e.g. 'A two-minute invitation from ${d.hostName ?? "the host"}'"` : "null"},
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
    "encourage1Theme": "MUST be exactly one of: \"dark\", \"accent\", or \"light\". Warm brands: prefer \"light\" or \"accent\". Dark brands: \"dark\" for urgency. Must contrast with heroTheme.",
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
    "outcomesSubheading": "body-lg subtitle e.g. 'Your life after ${d.eventName ?? "this event"} — not in a year, but starting next week.'",
    "outcomesItems": [
      { "title": "outcome title (2–4 words)", "body": "1–2 specific sentences about this outcome" },
      { "title": "outcome title (2–4 words)", "body": "1–2 specific sentences about this outcome" },
      { "title": "outcome title (2–4 words)", "body": "1–2 specific sentences about this outcome" }
    ],
    // GRID RULE: outcomesItems MUST contain exactly 3 items (1 row of 3) OR exactly 6 items (2 rows of 3).
    // NEVER generate 4 or 5 items — 4 breaks the grid layout and 5 creates an uneven orphan row.
    "outcomesClosingText": "italic closing below outcome grid e.g. 'This is not a list of someday-results.'",
    "outcomesMicrocopy": "small timing/urgency note below closing text",
    "personalMessageHeading": "e.g. 'A note from ${d.hostName ?? "the host"}'",
    "personalMessageParagraphs": [
      "paragraph 1 — write in the host's voice, specific and personal",
      "paragraph 2",
      "paragraph 3"
    ],
    "personalMessageSignature": "e.g. '— ${d.hostName ?? "the host"}' — use the actual host name from brand context",
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
    "bioHeading": "e.g. 'About ${d.hostName ?? "the host"}'",
    "bioParagraphs": [
      "paragraph 1 — first paragraph gets drop-cap styling; write first-person",
      "paragraph 2",
      "paragraph 3"
    ],
    "bioSignature": "e.g. 'I would be glad to spend ${d.eventDuration ?? "this time"} with you${d.eventDate ? ` on ${d.eventDate}` : ""}. — ${d.hostName ?? "the host"}'",
    "finalVpHeading": "final VP heading above FAQ (display size, centered)",
    "finalVpIntro": "opening paragraph of final VP section",
    "finalVpFromTo": [
      { "from": "where they are now", "to": "where they'll be" },
      { "from": "from 2", "to": "to 2" },
      { "from": "from 3", "to": "to 3" }
    ],
    "finalVpClosing": "closing paragraph of final VP",
    "finalVpCtaMicrocopy": "italic line above final CTA button",
    "finalVpTheme": "MUST be exactly one of: \"dark\", \"accent\", or \"light\". Default \"dark\" (deep branded slate) for the from/to transformation block.",
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
    "registerTheme": "MUST be exactly one of: \"dark\", \"accent\", or \"light\". Warm luminous brands: prefer \"accent\". Dark brands: prefer \"dark\".",
    "ftcDisclaimer": "FTC-compliant results disclaimer — 2–3 professional sentences"
  },
  "eventCheckout": {
    "logoUrl": "copy the exact BRAND LOGO URL from IMAGES AVAILABLE, or null if no logo was uploaded",
    "checkoutSidebarImageUrl": "copy the exact URL of the most inviting lifestyle or hero image for the sales sidebar. Prefer lifestyle-1. Set to null if none available.",
    "priceRangeCopy": "short persuasive copy about the price range e.g. 'Pay what is genuinely accessible and meaningful for you.'",
    "priceMin": ${pMin},
    "priceMax": ${pMax},
    "priceDefault": ${pDefault},
    "priceTiers": [
      { "tier": 1, "amount": ${pMin},  "label": "$${pMin}" },
      { "tier": 2, "amount": ${t2},    "label": "$${t2}" },
      { "tier": 3, "amount": ${t3},    "label": "$${t3}" },
      { "tier": 4, "amount": ${t4},    "label": "$${t4}" },
      { "tier": 5, "amount": ${pMax},  "label": "$${pMax}" }
    ],
    // RULE: priceTiers are pre-calculated for you above based on the wizard min ($${pMin}) and max ($${pMax}). Output them VERBATIM — do not adjust amounts, change labels, or invent new tiers. Every "amount" MUST be a JSON number (not a string).
    "benefits": [
      "Full live session — the actual duration from brand context",
      "Lifetime recording access — available within 24 hours",
      "Any downloadable resource mentioned in the event (practice card, prompts, etc.)",
      "Any integration or follow-up call included",
      "Any ongoing access or correspondence promised by the host — use real details from brand context, no placeholder text"
    ],
    "ctaText": "Complete registration — short, decisive, action-led. Do NOT include a price (the UI injects the selected tier amount automatically).",
    "guaranteeText": "Your contribution is processed securely. If you cannot attend live, the recording will be available within 24 hours.",
    "ftcDisclaimer": "FTC disclaimer for checkout"
  },
  "upsell": {
    "productImageUrl": "copy the exact URL of an image that visually represents the upsell add-on product or experience — something that feels like a premium bonus, not the main event. Priority order: (1) any additional-N image (these are product/bonus shots), (2) lifestyle-2 if it shows a different context from lifestyle-1, (3) lifestyle-1 as last resort only if nothing else exists. DO NOT use a hero image. Set to null if no additional or lifestyle images were uploaded.",
    "confirmationBannerText": "short confirmation banner e.g. 'Your spot for ${d.eventName ?? "the event"} is confirmed — one more thing before you go.' — use the actual event name",
    "eyebrow": "e.g. 'One-time offer · Step 2 of 2'",
    "headline": "TAGLINE ONLY (maps to .offer-tagline) — max 15 words. Rewrite wizard upsellHeadline as a tight emotional promise. Do NOT repeat upsellOfferName. No prices or bullet lists.",
    "description": "MAX 2 sentences for .offer-desc — distill wizard upsellDescription to what this adds after the event. Never include pricing, savings, or deliverable bullets (those belong in price block + includedItems).",
    "includedTitle": "e.g. 'What's in the bundle'",
    "includedItems": [
      { "title": "item title — use wizard upsellIncludedItems verbatim if provided", "description": "item description — use wizard upsellIncludedItems verbatim if provided" }
    ],
    // RULE: includedItems should contain 3–5 items. If wizard provided upsellIncludedItems, use those EXACTLY (don't rephrase). Each item must be a real, specific deliverable — no generic "bonus PDF" entries.
    "testimonialQuotes": [
      { "quote": "testimonial supporting the upsell — use wizard upsellQuotes verbatim if provided", "attribution": "Full Name · Location · Event, Month Year" }
    ],
    // RULE: testimonialQuotes — if wizard provided upsellQuotes, output those EXACTLY (don't rephrase). Include every wizard quote in order. If none provided, generate 1–2 short upsell-specific testimonials. Also mirror the first entry in testimonialQuote / testimonialAttribution below for backward compatibility.
    "testimonialQuote": "first testimonialQuotes[0].quote",
    "testimonialAttribution": "first testimonialQuotes[0].attribution",
    "regularPrice": "regular value e.g. '$297' — use wizard upsellRegularValue if provided",
    "offerPrice": "discounted price e.g. '$97' — use wizard upsellOfferPrice if provided",
    "savingAmount": "savings callout e.g. 'Save $200 — today only' — the $ amount MUST equal (regularPrice − offerPrice). Do the math; never approximate.",
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
    "subheadline": "1-sentence confirmation. CRITICAL: this renders at clamp(22px, 3vw, 30px) on a single line. Keep it to 5–9 words AND make sure the words distribute across lines without orphans — no single word ever ends up alone on line 2. Avoid trailing periods. Example shape: 'Your seat is confirmed — here is what comes next' (10 words, balances cleanly). Bad example: 'Your seat is confirmed. Here's what happens next.' (9 words BUT will likely orphan 'next.' on its own line at most viewports).",
    "emailNote": "e.g. 'Confirmation sent to your inbox from ${d.contactEmail ?? "our team"}' — use the actual contact email from brand context, never a bracket placeholder",
    "nextStepsHeading": "e.g. 'Three things to do right now'",
    "nextSteps": [
      { "step": "01", "title": "Check your email", "body": "your confirmation and event link are on their way" },
      { "step": "02", "title": "Add to your calendar", "body": "so you don't forget" },
      { "step": "03", "title": "Prepare your question", "body": "what is the real question you are bringing?" }
    ],
    "calendarHeading": "e.g. 'Add ${d.eventName ?? "the event"} to your calendar' — use actual event name",
    "calendarSub": "short instruction e.g. 'Choose your calendar app'",
    "timezoneNote": "e.g. 'All times shown in ${d.eventTimezone ?? "your local timezone"}. Adjust for your location.' — use actual timezone",
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
    "personalNoteHeadline": "e.g. 'A note from ${d.hostName ?? "the host"}' — use actual host name",
    "personalNoteParagraphs": [
      "paragraph 1 — warm, personal note to the new registrant",
      "paragraph 2"
    ],
    "personalNoteSignature": "e.g. '— ${d.hostName ?? "the host"}' — use actual host name"
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
      { "name": "Practice Card PDF — replace with a real resource name derived from the event content", "fileType": "PDF", "fileSize": "1.2 MB" },
      { "name": "Written Prompts — replace with a second real resource name derived from the event methodology", "fileType": "PDF", "fileSize": "0.4 MB" }
    ],
    // RULE: resources MUST have exactly 2 items unless the event clearly has more deliverables. Real materials only — never invent specific PDF names not implied by the event.
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
      { "bubble": "Short live-chat reaction — specific to the event content, 8–15 words", "name": "Real first name from testimonials list if available, else omit comment" },
      { "bubble": "A second distinct live-chat reaction", "name": "Different real first name from testimonials" },
      { "bubble": "A third comment", "name": "Different real first name from testimonials" },
      { "bubble": "A fourth comment", "name": "Different real first name from testimonials" },
      { "bubble": "A fifth comment", "name": "Different real first name from testimonials" },
      { "bubble": "A sixth comment", "name": "Different real first name from testimonials" }
    ],
    // RULE: comments must use REAL first names from the testimonials list in brand context. If fewer than 6 testimonials are provided, generate only as many comments as you have real names. NEVER fabricate names like "Sarah" or "Mike" out of thin air.
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
    "programCtaUrgency": "urgency note using actual enrolment close date if available — max 8 words, deadline language only (no CTA verbs). Renders as secondary emphasis above the primary Enrol button — never write copy that assumes primary colour styling",
    "programCtaEnrolText": "CTA button text",
    "ftcHeading": "Disclaimer section heading — REQUIRED. Short label, 2–5 words, e.g. 'Important disclaimer', 'Earnings & results disclaimer', or 'Legal notice'. Always output this field.",
    "ftcText": "FTC disclaimer body for replay page — 2–3 professional sentences covering results vary, not medical/financial advice as appropriate, personal use of recordings, and legal entity name"
  },
  "imageSuggestions": {
    "FIELD_NAME_WHERE_NULL": "One sentence describing the SPECIFIC image to photograph or commission for this slot. Be actionable — describe subject, lighting, framing, mood. e.g. 'A warm three-quarter portrait of ${d.hostName ?? "the host"} in natural window light, mid-explanation, captured at golden hour against a soft neutral background.' Only include entries for fields you set to null."
  }
}`;
}

// ── Programme pages prompt + schema ─────────────────────────────────────
function buildProgrammePrompt(brandContext: string, d: WizardData): string {
  const portalUrl = d.programPortalUrl ?? "NOT PROVIDED";

  // Pre-build the plans array for programmeCheckout. Pay-in-full is ALWAYS first and featured.
  // Installment plans follow in order from the wizard and are never featured.
  const fullPrice = d.programPriceFull ?? 1997;
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const installmentPlans = d.programPaymentPlans ?? [
    { installments: 3,  cadence: "monthly", amountPerInstallment: Math.ceil(fullPrice * 1.13 / 3)  },
    { installments: 12, cadence: "monthly", amountPerInstallment: Math.ceil(fullPrice * 1.20 / 12) },
  ];
  const plansSchema = [
    `      { "id": "full", "name": "Pay in full", "amount": "${fmt(fullPrice)}", "schedule": "One payment\\nBest value", "isFeatured": true }`,
    ...installmentPlans.map((p, i) => {
      const total = p.installments * p.amountPerInstallment;
      return `      { "id": "plan-${i}", "name": "${p.installments} payments", "amount": "${fmt(p.amountPerInstallment)}", "schedule": "× ${p.installments} ${p.cadence}\\nTotal ${fmt(total)}", "isFeatured": false }`;
    }),
  ].join(",\n");

  return `You are an expert conversion copywriter specialising in coaching programmes, retreats, and transformational high-ticket offers. You write copy that is specific, emotionally resonant, and avoids all clichés.

${brandContext}

Your task: Write compelling, personalised copy for the three PROGRAMME pages — Programme Landing, Programme Checkout, Programme Thank-You.

OUTPUT DISCIPLINE — violating any of these makes the output unusable:
- Return ONLY a valid JSON object. No prose. No markdown fences. No commentary.
- The JSON structure below shows EXAMPLE values inside string fields. You MUST replace each example with real, specific copy. NEVER copy the instruction string itself as output.
- The plans array in programmeCheckout is PRE-COMPUTED for you. Output it verbatim — do not adjust, reorder, or add plans.
- For image URL fields: copy-paste the EXACT URL from the IMAGES AVAILABLE section above. Do NOT invent, guess, shorten, or modify any URL. Set to null if no suitable image exists and add an entry to imageSuggestions.
- Section theme fields must contain ONLY the string "dark", "accent", or "light" — nothing else.
- Curriculum weeks (sessionWeeks) MUST use the actual data from curriculumWeeks in brand context. The count MUST equal the count of weeks provided.
- Bonus values MUST be specific dollar amounts. The bonusesTotal MUST equal the exact arithmetic sum of individual bonus values.

(Reminder: the UNIVERSAL RULES from the brand context above — anti-hallucination, no bracket placeholders, math accuracy, grid sizes, payment plan order, typography rules, voice consistency — ALL apply here. Re-read them before generating.)

The JSON must have exactly this structure:

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
    "includesHeading": "e.g. 'Everything inside ${d.programName ?? "the programme"}' — use actual programme name",
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
    "sessionHeading": "e.g. '${(d.curriculumWeeks?.length ?? 8)} weeks of guided transformation' — use the actual week count from curriculum data in brand context",
    "sessionWeeks": [
      { "num": "01", "title": "use actual Week 1 title from curriculumWeeks in brand context", "dates": "specific dates if known from programme start date and cadence, else omit", "points": ["specific point from curriculum description", "second specific point"] }
    ],
    // RULE: sessionWeeks length MUST equal the number of curriculumWeeks provided in brand context. If wizard provided 8 weeks, generate exactly 8 entries. If wizard provided no curriculum, generate a sensible week-by-week structure (4, 6, 8, or 12 weeks) based on programDuration.
    "videoTestimonialsEyebrow": "e.g. 'Hear from past students'",
    "videoTestimonialsHeading": "video testimonials section heading",
    "credibilityQuote": "mid-page pull quote from a testimonial — use real testimonial data from brand context",
    "credibilityAttribution": "Full Name · Location",
    "bonusesEyebrow": "e.g. 'Also included'",
    "bonusesHeading": "e.g. 'Bonuses with every enrolment'",
    "bonusesItems": [
      { "num": "01", "title": "actual bonus title from brand context (or sensible new one)", "description": "what this bonus is and why it matters — specific, not generic", "value": "$xxx — must be a specific dollar amount, no 'priceless' or 'invaluable'" }
    ],
    "bonusesTotal": "e.g. 'Total bonus value: $xxx' — MUST equal the exact sum of individual bonus values above. Do the math.",
    // RULE: bonusesItems length is 2–4. Each value MUST be a specific $ amount. bonusesTotal MUST equal the arithmetic sum of those values.
    "midPriceLabel": "e.g. 'Join ${d.programName ?? "the programme"}' — use actual programme name",
    "midPriceCtaText": "mid-page CTA button text",
    "midPriceUrgency": "urgency note for mid-page price",
    "outcomesEyebrow": "e.g. 'The transformation'",
    "outcomesHeading": "outcomes section heading",
    "outcomesBody": "1–2 sentence intro to outcomes section",
    "outcomesItems": [
      { "before": "where they are before — specific, named, recognisable", "after": "where they'll be after — concrete, observable, derived from transformation promise" }
    ],
    // RULE: outcomesItems MUST contain exactly 3 items (1 row) OR exactly 6 items (2 rows of 3). NEVER 4 or 5.
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
    "finalCtaTheme": "MUST be exactly one of: \"dark\", \"accent\", or \"light\". Programme landing final CTA — warm brands: \"accent\" or \"dark\" (deep slate). Avoid assuming near-black; dark means branded slate.",
    "ftcDisclaimer": "FTC-compliant results disclaimer"
  },
  "programmeCheckout": {
    "logoUrl": "copy the exact BRAND LOGO URL from IMAGES AVAILABLE, or null if no logo was uploaded",
    "programmeImageUrl": "copy the exact URL of a lifestyle or hero image for the order summary sidebar. Prefer lifestyle-1 or additional-1. Set to null if none available.",
    "programEyebrow": "e.g. 'You are enrolling in'",
    "programName": "actual programme name from brand context — no bracket placeholders",
    "programChips": ["actual programme duration from brand context", "Live online", "actual start date from brand context"],
    "plans": [
${plansSchema}
    ],
    // RULE: plans are pre-computed for you above from the wizard's programPriceFull (${fmt(fullPrice)}) and programPaymentPlans. Output this array VERBATIM — do not add new plans, remove plans, change amounts, or shift the featured flag. "Pay in full" is ALWAYS first and ALWAYS the only featured plan.
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
    "subheadline": "1-sentence enrolment confirmation. CRITICAL: renders at clamp(22px, 3vw, 30px) — keep to 5–9 words, no orphans on the final line, no trailing period. Apply the same orphan-avoidance rule from TYPOGRAPHY RULES above.",
    "chips": ["Starts actual date from brand context", "actual programme duration", "session count if known or omit"],
    "emailNote": "e.g. 'Your welcome email is on its way from ${d.contactEmail ?? "our team"}' — use the actual contact email from brand context, never a bracket placeholder",
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
    "noteEyebrow": "e.g. 'A note from ${d.hostName ?? "the host"}' — use actual host name",
    "noteParagraphs": ["personal note paragraph 1", "paragraph 2"],
    "noteSignature": "e.g. '— ${d.hostName ?? "the host"}${d.hostTitle ? `, ${d.hostTitle}` : ""}' — use actual host name and title from brand context",
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
    "FIELD_NAME_WHERE_NULL": "One sentence describing the SPECIFIC image to photograph or commission for this slot. Be actionable — describe subject, lighting, framing, mood. e.g. 'A wide environmental shot of ${d.hostName ?? "the host"} working at a desk with natural light, surrounded by methodology notes, captured in soft morning light.' Only include entries for fields you set to null."
  }
}`;
}

// ── Helpers ──────────────────────────────────────────────────────────────
function extractResponseText(response: Message): string {
  return response.content
    .filter((b): b is TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

function extractJsonObject(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in AI response");

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return candidate.slice(start, i + 1);
    }
  }
  return candidate.slice(start);
}

function repairTruncatedJson(json: string): string {
  let repaired = json.replace(/,\s*([}\]])/g, "$1");
  let open = 0;
  for (const ch of json) {
    if (ch === "{") open++;
    else if (ch === "}") open--;
  }
  while (open > 0) { repaired += "}"; open--; }
  return repaired;
}

function parseJsonResponse(raw: string, label: string): Record<string, unknown> {
  const jsonStr = extractJsonObject(raw);
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Response is not a JSON object");
    }
    return parsed as Record<string, unknown>;
  } catch {
    try {
      const repaired = repairTruncatedJson(jsonStr);
      const parsed = JSON.parse(repaired);
      console.warn(`${label}: recovered truncated JSON via repair`);
      return parsed as Record<string, unknown>;
    } catch {
      console.error(`${label} JSON parse error — first 800 chars:`, raw.slice(0, 800));
      throw new Error(`${label}: failed to parse AI response as JSON`);
    }
  }
}

function assertPageKeys(content: Record<string, unknown>, keys: readonly string[], label: string) {
  const present = keys.filter((k) => content[k] && typeof content[k] === "object");
  if (present.length === 0) {
    throw new Error(`${label} generation returned no page content (expected at least one of: ${keys.join(", ")})`);
  }
}

function parseGenerationResponse(
  response: Message,
  label: string,
  expectedKeys: readonly string[],
): Record<string, unknown> {
  const raw = extractResponseText(response);
  if (!raw.trim()) throw new Error(`${label}: AI returned an empty response`);

  if (response.stop_reason === "max_tokens") {
    console.warn(`${label}: hit max_tokens — output may be truncated`);
  }

  const parsed = parseJsonResponse(raw, label);
  assertPageKeys(parsed, expectedKeys, label);
  return parsed;
}

function assertFunnelContent(content: Record<string, unknown>) {
  if (!content.eventLanding || typeof content.eventLanding !== "object") {
    throw new Error("Generation incomplete — event landing page content is missing");
  }
  if (!content.programmeLanding || typeof content.programmeLanding !== "object") {
    throw new Error("Generation incomplete — programme landing page content is missing");
  }
}

function formatUpsellQuotes(d: WizardData): string {
  const quotes = d.upsellQuotes?.filter((q) => q.quote?.trim()) ?? [];
  if (quotes.length > 0) {
    return quotes
      .map((q, i) => `  ${i + 1}. "${q.quote}" — ${q.attribution?.trim() || "no attribution"}`)
      .join("\n");
  }
  if (d.upsellQuote?.trim()) {
    return `  1. "${d.upsellQuote}" — ${d.upsellQuoteAttribution?.trim() || "no attribution"}`;
  }
  return "  Not provided — generate 1–2 short testimonials specific to the upsell product if Step 8 testimonials don't fit.";
}

function formatPricing(d: WizardData): string {
  if (d.eventPricingModel === "pay-what-you-want") return `Pay-what-you-want $${d.eventPriceMin ?? 0} – $${d.eventPriceMax ?? 0}`;
  if (d.eventPricingModel === "fixed") return `Fixed price $${d.eventPriceFixed}`;
  return "Pricing not specified";
}

