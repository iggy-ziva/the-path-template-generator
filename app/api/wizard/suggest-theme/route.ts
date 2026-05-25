import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";
import { THEME_LIST } from "@/lib/theme-constants";

interface SuggestPayload {
  toneDescriptors?: string[];
  methodologyDescription?: string;
  uniqueApproach?: string;
  transformationPromise?: string;
  audienceDescription?: string;
  hostTitle?: string;
  eventName?: string;
  programName?: string;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as SuggestPayload;

    const themeOptions = THEME_LIST.map(
      (t) => `  • ${t.slug}: ${t.label} — "${t.descriptor}"`
    ).join("\n");

    const context = [
      body.toneDescriptors?.length ? `Tone descriptors: ${body.toneDescriptors.join(", ")}` : "",
      body.hostTitle          ? `Host title/role: ${body.hostTitle}` : "",
      body.eventName          ? `Event name: ${body.eventName}` : "",
      body.programName        ? `Programme name: ${body.programName}` : "",
      body.audienceDescription    ? `Target audience: ${body.audienceDescription}` : "",
      body.transformationPromise  ? `Transformation promise: ${body.transformationPromise}` : "",
      body.methodologyDescription ? `Methodology: ${body.methodologyDescription}` : "",
      body.uniqueApproach         ? `Unique approach: ${body.uniqueApproach}` : "",
    ].filter(Boolean).join("\n");

    const prompt = `You are helping match a coach/facilitator to the best visual and copy style theme for their sales funnel.

Here is what we know about this person:
${context || "No specific information provided yet."}

Here are the available themes:
${themeOptions}

Choose the single best-matching theme slug from the list above. Respond in exactly this format with nothing else:
SLUG|One sentence explaining why this theme fits, referencing something specific from their inputs.

Example response format:
executive|Your strategic tone descriptors and leadership development focus align naturally with this theme's authoritative, results-driven aesthetic.`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    const [slug, ...reasonParts] = raw.split("|");
    const cleanSlug = slug?.trim().toLowerCase();
    const reason = reasonParts.join("|").trim();

    const matched = THEME_LIST.find((t) => t.slug === cleanSlug);

    if (!matched) {
      // Fallback to threshold if Claude returns something unexpected
      const fallback = THEME_LIST[0];
      return NextResponse.json({
        slug: fallback.slug,
        label: fallback.label,
        swatch: fallback.swatch,
        descriptor: fallback.descriptor,
        reason: "Based on your inputs, we recommend starting with our default theme.",
      });
    }

    return NextResponse.json({
      slug: matched.slug,
      label: matched.label,
      swatch: matched.swatch,
      descriptor: matched.descriptor,
      reason,
    });
  } catch (err) {
    console.error("suggest-theme error:", err);
    const fallback = THEME_LIST[0];
    return NextResponse.json({
      slug: fallback.slug,
      label: fallback.label,
      swatch: fallback.swatch,
      descriptor: fallback.descriptor,
      reason: "We defaulted to the Threshold theme — you can change this below.",
    });
  }
}
