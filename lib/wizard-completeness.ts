import type { WizardData } from "@/lib/wizard-types";

// ─────────────────────────────────────────────────────────────────────────
// Wizard completeness model
//
// A single source of truth for "how filled in is this wizard?". The progress
// bar, step pills, and Review/Generate gate all derive from this module.
//
// Each check belongs to a step (1–10) and has a weight (importance toward the
// overall percentage). Some checks are also flagged `required` — meaning they
// are non-negotiable for the AI to produce a usable funnel.
//
// Overall completeness = (weight of passed checks) / (weight of all checks) × 100.
// Generate threshold   = 80 (configurable via GENERATE_THRESHOLD below).
// ─────────────────────────────────────────────────────────────────────────

export const GENERATE_THRESHOLD = 80;

export interface CompletenessCheck {
  /** Stable id used as React key */
  id: string;
  /** Wizard step the field lives in (1–10). Step 11 is Review/Generate. */
  step: number;
  /** Human-readable label shown in the missing-fields list */
  label: string;
  /** Importance weight contributing to overall percentage */
  weight: number;
  /** True if this is a hard requirement before generation can run */
  required: boolean;
  /** Returns true when the wizard data satisfies this check */
  test: (d: WizardData) => boolean;
}

function nonEmptyString(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

function nonEmptyArray(v: unknown, min = 1): boolean {
  return Array.isArray(v) && v.length >= min;
}

function nonNegativeNumber(v: unknown): boolean {
  return typeof v === "number" && !isNaN(v) && v >= 0;
}

// ─────────────────────────────────────────────────────────────────────────
// Checks — listed in wizard order. Weights roughly reflect how much each
// field actually drives the quality of the generated funnel.
// ─────────────────────────────────────────────────────────────────────────
export const CHECKS: CompletenessCheck[] = [
  // ── Step 1: About You ──
  { id: "hostName",         step: 1, label: "Host name",                 weight: 3, required: true,  test: d => nonEmptyString(d.hostName) },
  { id: "hostTitle",        step: 1, label: "Host title",                weight: 1, required: false, test: d => nonEmptyString(d.hostTitle) },
  { id: "hostTagline",      step: 1, label: "Host tagline",              weight: 1, required: false, test: d => nonEmptyString(d.hostTagline) },
  { id: "hostBio",          step: 1, label: "Host bio",                  weight: 3, required: true,  test: d => nonEmptyString(d.hostBio) },
  { id: "hostHeadshotUrl",  step: 1, label: "Headshot",                  weight: 2, required: false, test: d => nonEmptyString(d.hostHeadshotUrl) },

  // ── Step 2: Your Brand ──
  { id: "businessName",     step: 2, label: "Business name",             weight: 2, required: false, test: d => nonEmptyString(d.businessName) },
  { id: "logoUrl",          step: 2, label: "Brand logo",                weight: 2, required: false, test: d => nonEmptyString(d.logoUrl) },
  { id: "contactEmail",     step: 2, label: "Support / contact email",   weight: 2, required: true,  test: d => nonEmptyString(d.contactEmail) },
  { id: "websiteUrl",       step: 2, label: "Website URL",               weight: 1, required: false, test: d => nonEmptyString(d.websiteUrl) },
  { id: "privacyPolicyUrl", step: 2, label: "Privacy policy URL",        weight: 1, required: false, test: d => nonEmptyString(d.privacyPolicyUrl) },
  { id: "termsOfUseUrl",    step: 2, label: "Terms of use URL",          weight: 1, required: false, test: d => nonEmptyString(d.termsOfUseUrl) },

  // ── Step 3: Live Event ──
  { id: "eventName",        step: 3, label: "Event name",                weight: 3, required: true,  test: d => nonEmptyString(d.eventName) },
  { id: "eventTagline",     step: 3, label: "Event tagline",             weight: 1, required: false, test: d => nonEmptyString(d.eventTagline) },
  { id: "eventDate",        step: 3, label: "Event date",                weight: 2, required: true,  test: d => nonEmptyString(d.eventDate) },
  { id: "eventTime",        step: 3, label: "Event time",                weight: 2, required: true,  test: d => nonEmptyString(d.eventTime) },
  { id: "eventTimezone",    step: 3, label: "Event timezone",            weight: 1, required: true,  test: d => nonEmptyString(d.eventTimezone) },
  { id: "eventDuration",    step: 3, label: "Event duration",            weight: 1, required: false, test: d => nonEmptyString(d.eventDuration) },
  { id: "eventPlatform",    step: 3, label: "Event platform",            weight: 1, required: false, test: d => nonEmptyString(d.eventPlatform) },
  { id: "eventPricing",     step: 3, label: "Event pricing",             weight: 2, required: false, test: d =>
      d.eventPricingModel === "fixed"
        ? nonNegativeNumber(d.eventPriceFixed)
        : d.eventPricingModel === "pay-what-you-want"
          ? nonNegativeNumber(d.eventPriceMin) && nonNegativeNumber(d.eventPriceMax)
          : false,
  },

  // ── Step 4: Upsell Offer ──
  { id: "upsellOfferName",      step: 4, label: "Upsell offer name",        weight: 2, required: false, test: d => nonEmptyString(d.upsellOfferName) },
  { id: "upsellDescription",    step: 4, label: "Upsell description",       weight: 1, required: false, test: d => nonEmptyString(d.upsellDescription) },
  { id: "upsellIncludedItems",  step: 4, label: "Upsell included items",    weight: 1, required: false, test: d => nonEmptyArray(d.upsellIncludedItems) },
  { id: "upsellOfferPrice",     step: 4, label: "Upsell offer price",       weight: 1, required: false, test: d => nonNegativeNumber(d.upsellOfferPrice) },

  // ── Step 5: Programme ──
  { id: "programName",          step: 5, label: "Programme name",           weight: 3, required: true,  test: d => nonEmptyString(d.programName) },
  { id: "programTagline",       step: 5, label: "Programme tagline",        weight: 1, required: false, test: d => nonEmptyString(d.programTagline) },
  { id: "programStartDate",     step: 5, label: "Programme start date",     weight: 1, required: false, test: d => nonEmptyString(d.programStartDate) },
  { id: "programDuration",      step: 5, label: "Programme duration",       weight: 1, required: false, test: d => nonEmptyString(d.programDuration) },
  { id: "programPriceFull",     step: 5, label: "Programme full price",     weight: 2, required: false, test: d => nonNegativeNumber(d.programPriceFull) },
  { id: "programPaymentPlans",  step: 5, label: "Programme payment plans",  weight: 1, required: false, test: d => nonEmptyArray(d.programPaymentPlans) },
  { id: "programGuarantee",     step: 5, label: "Programme guarantee",      weight: 1, required: false, test: d => nonEmptyString(d.programGuarantee) },

  // ── Step 6: Curriculum & Content ──
  { id: "audienceDescription",    step: 6, label: "Target audience",          weight: 2, required: false, test: d => nonEmptyString(d.audienceDescription) },
  { id: "transformationPromise",  step: 6, label: "Transformation promise",   weight: 3, required: true,  test: d => nonEmptyString(d.transformationPromise) },
  { id: "whatIsIncluded",         step: 6, label: "What's included",          weight: 1, required: false, test: d => nonEmptyString(d.whatIsIncluded) },
  { id: "curriculumWeeks",        step: 6, label: "Curriculum weeks",         weight: 2, required: false, test: d => nonEmptyArray(d.curriculumWeeks) },
  { id: "bonuses",                step: 6, label: "Bonuses",                  weight: 1, required: false, test: d => nonEmptyArray(d.bonuses) },

  // ── Step 7: Your Story ──
  { id: "methodologyDescription", step: 7, label: "Methodology",              weight: 2, required: false, test: d => nonEmptyString(d.methodologyDescription) },
  { id: "uniqueApproach",         step: 7, label: "Unique approach",          weight: 2, required: false, test: d => nonEmptyString(d.uniqueApproach) },
  { id: "existingMaterials",      step: 7, label: "Existing materials",       weight: 1, required: false, test: d => nonEmptyArray(d.existingMaterialUrls) || nonEmptyArray(d.existingFileUrls) },

  // ── Step 8: Testimonials ──
  { id: "testimonials",           step: 8, label: "Testimonials (≥1)",        weight: 3, required: false, test: d => nonEmptyArray(d.testimonials) },
  { id: "pressLogos",             step: 8, label: "Press logos",              weight: 1, required: false, test: d => nonEmptyArray(d.pressLogos) },

  // ── Step 9: Images ──
  { id: "heroImageUrls",          step: 9, label: "Hero images (≥1)",         weight: 2, required: false, test: d => nonEmptyArray(d.heroImageUrls) },
  { id: "lifestyleImageUrls",     step: 9, label: "Lifestyle images",         weight: 1, required: false, test: d => nonEmptyArray(d.lifestyleImageUrls) },
  { id: "additionalImageUrls",    step: 9, label: "Additional images",        weight: 1, required: false, test: d => nonEmptyArray(d.additionalImageUrls) },

  // ── Step 10: Tone & Voice ──
  { id: "toneDescriptors",        step: 10, label: "Tone descriptors (3)",    weight: 2, required: false, test: d => nonEmptyArray(d.toneDescriptors, 1) },
  { id: "referenceTheme",         step: 10, label: "Reference theme",         weight: 1, required: false, test: d => nonEmptyString(d.referenceTheme) },
];

const TOTAL_WEIGHT = CHECKS.reduce((sum, c) => sum + c.weight, 0);

/** Overall wizard completeness 0–100 (rounded). */
export function overallCompleteness(d: WizardData): number {
  const earned = CHECKS.reduce((sum, c) => sum + (c.test(d) ? c.weight : 0), 0);
  return Math.round((earned / TOTAL_WEIGHT) * 100);
}

/** Completeness for a single step 0–100 (rounded). Returns 100 for unknown steps (e.g. Step 11). */
export function stepCompleteness(d: WizardData, step: number): number {
  const stepChecks = CHECKS.filter(c => c.step === step);
  if (stepChecks.length === 0) return 100;
  const stepTotal  = stepChecks.reduce((sum, c) => sum + c.weight, 0);
  const stepEarned = stepChecks.reduce((sum, c) => sum + (c.test(d) ? c.weight : 0), 0);
  return Math.round((stepEarned / stepTotal) * 100);
}

/** Returns the list of REQUIRED fields that are currently missing (non-empty). */
export function missingRequired(d: WizardData): CompletenessCheck[] {
  return CHECKS.filter(c => c.required && !c.test(d));
}

/** Returns the list of ALL checks that are currently failing, for the review panel. */
export function missingAll(d: WizardData): CompletenessCheck[] {
  return CHECKS.filter(c => !c.test(d));
}

/** True when generation is permitted: overall ≥ threshold AND every required field filled. */
export function canGenerate(d: WizardData): boolean {
  return overallCompleteness(d) >= GENERATE_THRESHOLD && missingRequired(d).length === 0;
}
