import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";
import { THEME_LIST } from "@/lib/theme-constants";
import type { WizardData } from "@/lib/wizard-types";
import { computeBrandProfile, themeEntryForSlug } from "@/lib/brand-profile";

type SuggestPayload = Pick<
  WizardData,
  | "toneDescriptors"
  | "methodologyDescription"
  | "uniqueApproach"
  | "transformationPromise"
  | "audienceDescription"
  | "hostTitle"
  | "eventName"
  | "programName"
  | "businessName"
  | "styleGuide"
  | "referenceTheme"
  | "referenceThemeSource"
>;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: SuggestPayload = {};
  try {
    body = await req.json() as SuggestPayload;
    const wizardSlice = body as WizardData;
    const brandProfile = computeBrandProfile(wizardSlice);

    const themeOptions = THEME_LIST.map(
      (t) => `  • ${t.slug}: ${t.label} — "${t.descriptor}"`,
    ).join("\n");

    const rankedHints = brandProfile.rankedThemeSlugs
      .map((slug) => {
        const t = themeEntryForSlug(slug);
        return `${t.slug} (${t.label})`;
      })
      .join(", ");

    const sg = body.styleGuide;
    const colorLine = sg?.brandColors
      ? `Brand colours: primary ${sg.brandColors.primary ?? "—"}, secondary ${sg.brandColors.secondary ?? "—"}, tertiary ${sg.brandColors.tertiary ?? "—"}`
      : "Brand colours: not detected";

    const context = [
      body.businessName         ? `Business: ${body.businessName}` : "",
      colorLine,
      sg?.googleFonts?.length  ? `Fonts: ${sg.googleFonts.join(", ")}` : "",
      body.toneDescriptors?.length ? `Tone descriptors: ${body.toneDescriptors.join(", ")}` : "",
      body.hostTitle          ? `Host title/role: ${body.hostTitle}` : "",
      body.eventName          ? `Event name: ${body.eventName}` : "",
      body.programName        ? `Programme name: ${body.programName}` : "",
      body.audienceDescription    ? `Target audience: ${body.audienceDescription}` : "",
      body.transformationPromise  ? `Transformation promise: ${body.transformationPromise}` : "",
      body.methodologyDescription ? `Methodology: ${body.methodologyDescription}` : "",
      body.uniqueApproach         ? `Unique approach: ${body.uniqueApproach}` : "",
      `Deterministic top matches (prefer unless strongly contradicted): ${rankedHints}`,
      `Visual mood: ${brandProfile.visualMood}`,
    ].filter(Boolean).join("\n");

    const prompt = `You are helping match a coach/facilitator to the best visual and copy style theme for their sales funnel.

Here is what we know about this person:
${context || "No specific information provided yet."}

Here are the available themes:
${themeOptions}

Choose the single best-matching theme slug. Strongly prefer the deterministic top matches unless the copy context clearly contradicts them (e.g. do NOT pick Peak Performance for healing/wellness brands with warm coral + slate palettes).

Respond in exactly this format with nothing else:
SLUG|One sentence explaining why this theme fits, referencing brand colours or specific inputs.

Example:
wellness|Your warm coral and slate-blue palette plus healing-focused programme copy align with Somatic's nurturing, body-centred aesthetic.`;

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

    let matched = THEME_LIST.find((t) => t.slug === cleanSlug);
    if (!matched) {
      matched = themeEntryForSlug(brandProfile.suggestedThemeSlug);
    }

    return NextResponse.json({
      slug: matched.slug,
      label: matched.label,
      swatch: matched.swatch,
      descriptor: matched.descriptor,
      reason: reason || brandProfile.suggestedThemeReason,
      brandProfile,
    });
  } catch (err) {
    console.error("suggest-theme error:", err);
    const brandProfile = computeBrandProfile(body as WizardData);
    const fallback = themeEntryForSlug(brandProfile.suggestedThemeSlug);
    return NextResponse.json({
      slug: fallback.slug,
      label: fallback.label,
      swatch: fallback.swatch,
      descriptor: fallback.descriptor,
      reason: brandProfile.suggestedThemeReason,
      brandProfile,
    });
  }
}
