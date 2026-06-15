// ─────────────────────────────────────────────────────────────────────────────
// derive-wizard — best-effort projection of parsed copy-doc content onto the
// wizard's own input fields.
//
// The copy-doc engine maps a document onto PAGE COPY (heroHeadline, audience
// items, testimonials…). Those targets don't map 1:1 onto the wizard's raw
// input fields, but several overlap closely. This module fills those overlaps
// so a user who uploads a finished copy document sees the wizard pre-populated
// and can review/edit instead of retyping. It is intentionally conservative:
// it only proposes values it can derive with reasonable confidence, and the
// caller decides whether to apply them (never overwriting existing input).
// ─────────────────────────────────────────────────────────────────────────────

import type { WizardData } from "@/lib/wizard-types";
import type { CopyDocPageKey } from "./copydoc-schema";

type Content = Record<string, unknown>;

function asString(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function asStringArray(v: unknown): string[] | undefined {
  if (Array.isArray(v)) {
    const arr = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim());
    return arr.length ? arr : undefined;
  }
  return undefined;
}

function asItems(v: unknown): Record<string, string>[] | undefined {
  if (Array.isArray(v) && v.length && typeof v[0] === "object") {
    return v as Record<string, string>[];
  }
  return undefined;
}

/** Join paragraph-style string arrays into a single editable block. */
function paragraphs(v: unknown): string | undefined {
  const arr = asStringArray(v);
  return arr ? arr.join("\n\n") : asString(v);
}

function deriveEventLanding(c: Content): Partial<WizardData> {
  const out: Partial<WizardData> = {};

  // Bio — the bio section paragraphs are the host's story in their own words.
  const bio = paragraphs(c.bioParagraphs);
  if (bio) out.hostBio = bio;

  // Tagline — the hero eyebrow is a short positioning line.
  const tagline = asString(c.heroEyebrow);
  if (tagline) out.hostTagline = tagline;

  // Testimonials — direct overlap.
  const testimonialItems = asItems(c.testimonialItems);
  if (testimonialItems) {
    const testimonials = testimonialItems
      .map((t) => ({ quote: asString(t.quote) ?? "", name: asString(t.name) ?? "", location: "" }))
      .filter((t) => t.quote);
    if (testimonials.length) out.testimonials = testimonials;
  }

  // Audience description — the audience callouts describe who it's for.
  const audience = asStringArray(c.audienceItems);
  if (audience) out.audienceDescription = audience.join("\n");

  // Transformation promise (Step 6) — the final "from → to" framing, or the
  // outcomes/value-prop heading as a fallback.
  const fromTo = asItems(c.finalVpFromTo);
  if (fromTo) {
    const lines = fromTo
      .map((p) => {
        const from = asString(p.from);
        const to = asString(p.to);
        if (from && to) return `From ${from} to ${to}.`;
        return from ?? to ?? "";
      })
      .filter(Boolean);
    if (lines.length) out.transformationPromise = lines.join("\n");
  }
  if (!out.transformationPromise) {
    const tp = asString(c.outcomesHeading) ?? asString(c.vpHeading);
    if (tp) out.transformationPromise = tp;
  }

  // Methodology / transformation in your own words (Step 1) — value-prop or
  // how-it-works narrative.
  const methodology = paragraphs(c.vpParagraphs) ?? paragraphs(c.howItWorksParagraphs);
  if (methodology) out.methodologyDescription = methodology;

  // Unique approach (Step 1) — extra value-prop narrative or the pull quote.
  const unique = paragraphs(c.extraVpParagraphs) ?? asString(c.vpPullQuote) ?? paragraphs(c.personalMessageParagraphs);
  if (unique) out.uniqueApproach = unique;

  return out;
}

function deriveProgrammeLanding(c: Content): Partial<WizardData> {
  const out: Partial<WizardData> = {};
  const bio = paragraphs(c.bioParagraphs);
  if (bio) out.hostBio = bio;
  const name = asString(c.bioName);
  if (name) out.hostName = name;
  const promise = paragraphs(c.promiseBody) ?? asString(c.promiseHeading);
  if (promise) out.transformationPromise = promise;
  return out;
}

/**
 * Map parsed copy-doc page content onto wizard input fields. Returns only the
 * fields it can confidently derive; callers should merge these without
 * overwriting values the user already entered.
 */
export function deriveWizardFieldsFromContent(
  content: Content | null | undefined,
  pageKey: CopyDocPageKey,
): Partial<WizardData> {
  if (!content || typeof content !== "object") return {};
  return pageKey === "programmeLanding" ? deriveProgrammeLanding(content) : deriveEventLanding(content);
}

/**
 * Of the derived fields, keep only those the wizard data doesn't already have a
 * meaningful value for — so we never clobber a user's own input.
 */
export function pickEmptyWizardFields(
  derived: Partial<WizardData>,
  current: WizardData,
): Partial<WizardData> {
  const out: Partial<WizardData> = {};
  for (const [key, value] of Object.entries(derived) as [keyof WizardData, unknown][]) {
    const existing = current[key];
    const hasExisting =
      (typeof existing === "string" && existing.trim().length > 0) ||
      (Array.isArray(existing) && existing.length > 0);
    if (!hasExisting && value !== undefined) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}
