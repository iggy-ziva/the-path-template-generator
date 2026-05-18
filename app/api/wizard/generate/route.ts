import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";

async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { wizardData, submissionId } = await req.json();
    const supabase = await getServiceClient();
    const userId = await getOrCreateUserId(session, supabase);
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = buildPrompt(wizardData);

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/```json\n?([\s\S]*?)\n?```/) ?? raw.match(/(\{[\s\S]*\})/);
    const content = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(raw);

    // Store generated funnel
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

    // Mark submission as complete
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

function buildPrompt(d: Record<string, unknown>): string {
  return `You are writing persuasive, high-converting funnel copy for a live event and high-ticket coaching programme. Write in the voice described. Return ONLY a JSON object — no prose, no markdown fences outside the JSON.

ABOUT THE HOST
Name: ${d.hostName ?? ""}
Title: ${d.hostTitle ?? ""}
Business: ${d.businessName ?? ""}
Bio: ${d.hostBio ?? ""}
Contact email: ${d.contactEmail ?? ""}

LIVE EVENT
Name: ${d.eventName ?? ""}
Date: ${d.eventDate ?? ""} at ${d.eventTime ?? ""} ${d.eventTimezone ?? ""}
Platform: ${d.eventPlatform ?? "online"}
Pricing: ${formatPricing(d)}
Transformation promise: ${d.transformationPromise ?? ""}

PROGRAMME (upsell)
Name: ${d.programName ?? ""}
Duration: ${d.programDuration ?? ""}
Full price: $${d.programPriceFull ?? ""}
Payment plan: ${d.programPaymentPlan ?? ""}
Curriculum: ${JSON.stringify(d.curriculumWeeks ?? [])}
Bonuses: ${JSON.stringify(d.bonuses ?? [])}

TESTIMONIALS
${JSON.stringify(d.testimonials ?? [])}

TONE & VOICE
Descriptors: ${(d.toneDescriptors as string[] ?? []).join(", ")}
Additional notes: ${d.toneNotes ?? ""}

Write compelling copy for all 8 funnel pages. Each section should have punchy, benefit-driven headlines and body copy that matches the tone descriptors. Be specific, use the real names and dates. Never use filler phrases like "Imagine if..." or "What if I told you...". 

Return this exact JSON structure:
{
  "eventLanding": {
    "headline": "",
    "subheadline": "",
    "heroBodyCopy": "",
    "benefitBullets": ["", "", "", "", ""],
    "ctaText": "",
    "urgencyLine": "",
    "aboutHostSnippet": ""
  },
  "eventCheckout": {
    "headline": "",
    "valueSummary": "",
    "guaranteeText": ""
  },
  "upsell": {
    "headline": "",
    "subheadline": "",
    "programmeIntro": "",
    "benefitBullets": ["", "", "", ""],
    "ctaText": "",
    "priceAnchorLine": ""
  },
  "eventThankYou": {
    "headline": "",
    "confirmationBody": "",
    "whatHappensNext": ["", "", ""]
  },
  "replay": {
    "headline": "",
    "introBody": "",
    "ctaText": ""
  },
  "programmeLanding": {
    "headline": "",
    "subheadline": "",
    "programmeIntro": "",
    "benefitBullets": ["", "", "", "", ""],
    "curriculumIntro": "",
    "ctaText": "",
    "priceStatement": ""
  },
  "programmeCheckout": {
    "headline": "",
    "valueSummary": "",
    "guaranteeText": ""
  },
  "programmeThankYou": {
    "headline": "",
    "confirmationBody": "",
    "whatHappensNext": ["", "", ""]
  }
}`;
}

function formatPricing(d: Record<string, unknown>): string {
  if (d.eventPricingModel === "free") return "Free";
  if (d.eventPricingModel === "fixed") return `$${d.eventPriceFixed}`;
  if (d.eventPricingModel === "sliding") return `$${d.eventPriceMin} – $${d.eventPriceMax}`;
  return "Paid";
}
