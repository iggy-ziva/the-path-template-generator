import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAnthropic, AI_MODEL } from "@/lib/ai";
import type { WizardData } from "@/lib/wizard-types";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Scrape a URL and return its text content (best-effort) */
async function scrapeUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PathTemplateGenerator/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    // Strip HTML tags, collapse whitespace
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 8000); // cap per URL
  } catch {
    return "";
  }
}

/** Build the master prompt from all wizard data */
function buildPrompt(data: WizardData, scrapedContent: string): string {
  const pricing = data.eventPricingModel === "fixed"
    ? `Fixed: $${data.eventPriceFixed}`
    : `Pay-what-you-want: $${data.eventPriceMin ?? 0}–$${data.eventPriceMax}`;

  const weeks = (data.curriculumWeeks ?? [])
    .map((w) => `  ${w.week}: ${w.title} — ${w.description}`)
    .join("\n");

  const bonuses = (data.bonuses ?? [])
    .map((b) => `  - ${b.title} (value: $${b.value}): ${b.description}`)
    .join("\n");

  const testimonials = (data.testimonials ?? [])
    .map((t) => `  "${t.quote}" — ${t.name}, ${t.location}${t.context ? ` (${t.context})` : ""}`)
    .join("\n");

  return `You are an expert funnel copywriter specialising in coaches, facilitators, and practitioners. You are about to write the complete copy for all eight pages of a live-event sales funnel.

## ABOUT THE HOST
Name: ${data.hostName}
Title: ${data.hostTitle ?? ""}
Tagline: ${data.hostTagline ?? ""}
Business: ${data.businessName ?? ""}
Email: ${data.contactEmail ?? ""}
Legal entity: ${data.legalEntityName ?? ""}
Bio: ${data.hostBio ?? ""}

## LIVE EVENT
Name: ${data.eventName}
Tagline: ${data.eventTagline ?? ""}
Date: ${data.eventDate}
Time: ${data.eventTime} ${data.eventTimezone}
Duration: ${data.eventDuration ?? ""}
Platform: ${data.eventPlatform ?? "Zoom"}
Pricing: ${pricing}
Recording policy: ${data.eventRecordingPolicy ?? "Full recording sent within 24 hours."}

## PROGRAMME (UPSELL)
Name: ${data.programName}
Tagline: ${data.programTagline ?? ""}
Duration: ${data.programDuration ?? ""}
Start date: ${data.programStartDate ?? ""}
Schedule: ${data.programSchedule ?? ""}
Full price: $${data.programPriceFull ?? 0}
Payment plan 1: ${data.programPricePlan1 ?? ""}
Payment plan 2: ${data.programPricePlan2 ?? ""}
Guarantee: ${data.programGuarantee ?? ""}

## CURRICULUM
${weeks || "(not provided)"}

## BONUSES
${bonuses || "(none)"}

## AUDIENCE & TRANSFORMATION
Who it's for: ${data.audienceDescription ?? ""}
Transformation promise: ${data.transformationPromise ?? ""}
What's included: ${data.whatIsIncluded ?? ""}

## THE HOST'S METHODOLOGY
${data.methodologyDescription ?? ""}
${data.uniqueApproach ?? ""}

## TESTIMONIALS
${testimonials || "(none provided — write 3 plausible placeholder testimonials)"}

## PRESS / MEDIA MENTIONS
${(data.pressLogos ?? []).join(", ") || "(none)"}

## TONE & VOICE
Descriptors: ${(data.toneDescriptors ?? []).join(", ") || "warm, direct, authentic"}
Reference style: ${data.referenceTheme ?? "wellness/somatic"}
Copy style to emulate: ${data.copyLoveUrl ? `See URL: ${data.copyLoveUrl}` : "(not specified)"}
Copy style to avoid: ${data.copyHateDescription ?? "(not specified)"}

## SCRAPED CONTENT FROM HOST'S MATERIALS
${scrapedContent || "(none available)"}

---

## YOUR TASK

Write all copy for the following 8 funnel pages. Return ONLY a valid JSON object with this exact structure (no markdown, no commentary, no code fences):

{
  "landing": {
    "heroEyebrow": "...",
    "heroHeadline": "...",
    "heroSubheadline": "...",
    "heroCredibilityQuote": "...",
    "audienceHeadline": "...",
    "audienceBullets": ["...", "...", "...", "...", "..."],
    "valueHeadline": "...",
    "valueParagraph": "...",
    "outcomes": ["...", "...", "...", "...", "..."],
    "testimonials": [
      {"quote": "...", "name": "...", "location": "..."},
      {"quote": "...", "name": "...", "location": "..."},
      {"quote": "...", "name": "...", "location": "..."}
    ],
    "howItWorks": [
      {"step": "1", "title": "...", "description": "..."},
      {"step": "2", "title": "...", "description": "..."},
      {"step": "3", "title": "...", "description": "..."}
    ],
    "faq": [
      {"q": "...", "a": "..."},
      {"q": "...", "a": "..."},
      {"q": "...", "a": "..."},
      {"q": "...", "a": "..."}
    ],
    "bioClosingQuote": "...",
    "stickyBarCopy": "...",
    "finalCtaHeadline": "...",
    "ftcDisclaimer": "..."
  },
  "checkout": {
    "pageHeadline": "...",
    "pageSubheadline": "...",
    "priceSelectorLabel": "...",
    "priceHelperText": "...",
    "orderSummaryTitle": "...",
    "benefitBullets": ["...", "...", "...", "..."],
    "submitButtonLabel": "...",
    "trustLine": "..."
  },
  "upsell": {
    "eyebrow": "...",
    "headline": "...",
    "description": "...",
    "bundleName": "...",
    "bundleItems": [
      {"title": "...", "description": "..."},
      {"title": "...", "description": "..."},
      {"title": "...", "description": "..."}
    ],
    "testimonialQuote": "...",
    "testimonialName": "...",
    "testimonialLocation": "...",
    "urgency": "...",
    "wasPrice": 297,
    "nowPrice": 97,
    "yesCtaLabel": "...",
    "noCtaLabel": "..."
  },
  "thankYou": {
    "headline": "...",
    "subheadline": "...",
    "nextSteps": [
      {"step": "1", "title": "...", "description": "..."},
      {"step": "2", "title": "...", "description": "..."},
      {"step": "3", "title": "...", "description": "..."}
    ],
    "personalNote": "...",
    "programTeaserHeadline": "...",
    "programTeaserBody": "..."
  },
  "replay": {
    "headline": "...",
    "intro": "...",
    "resources": [
      {"name": "...", "type": "..."},
      {"name": "...", "type": "..."},
      {"name": "...", "type": "..."}
    ],
    "part1Title": "...",
    "part1Description": "...",
    "part1ChatQuotes": ["...", "...", "..."],
    "part2Title": "...",
    "part2Description": "...",
    "part2ChatQuotes": ["...", "...", "..."],
    "programTeaserCopy": "..."
  },
  "program": {
    "heroHeadline": "...",
    "heroSubheadline": "...",
    "promise": "...",
    "promiseBody": "...",
    "includes": [
      {"title": "...", "description": "..."},
      {"title": "...", "description": "..."},
      {"title": "...", "description": "..."},
      {"title": "...", "description": "..."},
      {"title": "...", "description": "..."}
    ],
    "weeks": [
      {"week": "...", "title": "...", "bullets": ["...", "...", "..."]}
    ],
    "outcomes": ["...", "...", "...", "...", "..."],
    "testimonials": [
      {"quote": "...", "name": "...", "location": "...", "context": "..."},
      {"quote": "...", "name": "...", "location": "...", "context": "..."},
      {"quote": "...", "name": "...", "location": "...", "context": "..."}
    ],
    "bonuses": [
      {"title": "...", "description": "...", "value": 0}
    ],
    "faq": [
      {"q": "...", "a": "..."},
      {"q": "...", "a": "..."},
      {"q": "...", "a": "..."},
      {"q": "...", "a": "..."}
    ],
    "guarantee": "..."
  },
  "programCheckout": {
    "pageHeadline": "...",
    "pageSubheadline": "...",
    "planFullLabel": "...",
    "planFullNote": "...",
    "planPlanLabel": "...",
    "planPlanNote": "...",
    "benefitBullets": ["...", "...", "...", "...", "..."],
    "guaranteeSummary": "..."
  },
  "programThankYou": {
    "headline": "...",
    "subheadline": "...",
    "nextSteps": [
      {"step": "1", "title": "...", "description": "..."},
      {"step": "2", "title": "...", "description": "..."},
      {"step": "3", "title": "...", "description": "..."},
      {"step": "4", "title": "...", "description": "..."}
    ],
    "schedule": [
      {"label": "...", "title": "..."}
    ],
    "commitments": ["...", "...", "...", "..."],
    "personalNote": "...",
    "accessDetails": [
      {"label": "Sessions", "value": "..."},
      {"label": "Platform", "value": "..."},
      {"label": "Support", "value": "..."}
    ]
  }
}

CRITICAL INSTRUCTIONS:
1. Write in the voice described by the tone descriptors: ${(data.toneDescriptors ?? []).join(", ")}
2. Every headline, paragraph, and bullet must sound authentically like ${data.hostName} — not generic coaching copy
3. Draw on the host's bio, methodology, and scraped content to inject specific language, metaphors, and perspective
4. Testimonials must feel specific and believable — use names from the provided testimonials if available, otherwise invent plausible ones
5. The programme curriculum weeks must use the exact module titles provided in the wizard, expanded with the right voice
6. Do NOT use placeholder text like "Insert copy here" — every field must contain final, production-ready copy
7. Return ONLY the JSON object, nothing else`;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { wizardData, submissionId } = await req.json() as {
      wizardData: WizardData;
      submissionId?: string;
    };

    // 1. Scrape any provided URLs
    const urlsToScrape = [
      ...(wizardData.existingMaterialUrls ?? []),
      ...(wizardData.copyLoveUrl ? [wizardData.copyLoveUrl] : []),
    ].slice(0, 5); // cap at 5 URLs

    const scrapedParts = await Promise.all(urlsToScrape.map(scrapeUrl));
    const scrapedContent = scrapedParts.filter(Boolean).join("\n\n---\n\n").slice(0, 24000);

    // 2. Build prompt
    const prompt = buildPrompt(wizardData, scrapedContent);

    // 3. Call Claude
    const message = await getAnthropic().messages.create({
      model: AI_MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const rawContent = message.content[0].type === "text" ? message.content[0].text : "";

    // 4. Parse JSON response
    let generatedContent: Record<string, unknown>;
    try {
      // Extract JSON from response (in case Claude adds any wrapping text)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      generatedContent = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      console.error("Failed to parse Claude response:", rawContent.slice(0, 500));
      return NextResponse.json({ error: "AI returned invalid JSON — please try again" }, { status: 500 });
    }

    // 5. Store in Supabase
    const supabase = getServiceClient();

    if (submissionId) {
      await supabase
        .from("wizard_submissions")
        .update({ status: "complete", updated_at: new Date().toISOString() })
        .eq("id", submissionId);
    }

    const { data: funnel, error: insertError } = await supabase
      .from("generated_funnels")
      .insert({
        user_id: session.userId,
        submission_id: submissionId ?? null,
        content: generatedContent,
        theme_slug: wizardData.referenceTheme ?? null,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ funnelId: funnel.id, content: generatedContent });
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
