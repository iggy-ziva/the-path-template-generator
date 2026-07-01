import type { BrandProfile } from "@/lib/brand-profile";
import type { CoverageReport } from "@/lib/copydoc/validate";

/** How a funnel's page copy is produced. */
export type GenerationMode = "ai_copy" | "copy_doc" | "hybrid";

/** Client-side reference to an uploaded + parsed copy document. */
export interface CopyDocRef {
  documentId: string;
  fileName?: string;
  version: number;
  report: CoverageReport;
}

/** A co-facilitator / additional presenter featured alongside the primary host. */
export interface Facilitator {
  name?: string;
  title?: string;
  bio?: string;
  headshotUrl?: string;
}

export interface WizardData {
  // Step 1 — About You
  hostName?: string;
  hostTitle?: string;
  hostTagline?: string;
  hostBio?: string;
  /** The primary host's headshot. */
  hostHeadshotUrl?: string;
  /** @deprecated superseded by hostHeadshotUrl + facilitators[] */
  hostHeadshotUrls?: string[];
  /** Additional presenters featured alongside the host, each with their own bio + headshot. */
  facilitators?: Facilitator[];
  /** @deprecated no longer collected */
  hostSignatureUrl?: string;

  // Step 2 — Your Brand
  businessName?: string;
  /** Default / primary brand logo. Used as the fallback when no light/dark variant fits. */
  logoUrl?: string;
  /** Light-coloured logo variant — used on DARK and accent backgrounds (headers, footers). */
  logoLightUrl?: string;
  /** Dark-coloured logo variant — used on LIGHT backgrounds. */
  logoDarkUrl?: string;
  /** Set when logo uploaded with transparent background validation */
  logoTransparent?: boolean;
  contactEmail?: string;
  legalEntityName?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  termsOfUseUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;

  // Step 3 — Live Event
  eventName?: string;
  eventTagline?: string;
  eventDate?: string;
  eventTime?: string;
  eventTimezone?: string;
  eventDuration?: string;
  eventPlatform?: string;
  eventPricingModel?: "pay-what-you-want" | "fixed";
  eventPriceMin?: number;
  eventPriceMax?: number;
  eventPriceFixed?: number;
  eventRecordingPolicy?: string;
  eventVideoUrl?: string;

  // Step 4 — Upsell Offer
  upsellOfferName?: string;
  upsellHeadline?: string;
  upsellDescription?: string;
  upsellIncludedItems?: { title: string; description: string }[];
  upsellQuotes?: { quote: string; attribution: string }[];
  /** @deprecated use upsellQuotes */
  upsellQuote?: string;
  /** @deprecated use upsellQuotes */
  upsellQuoteAttribution?: string;
  upsellRegularValue?: number;
  upsellOfferPrice?: number;
  upsellPriceNote?: string;
  upsellCtaText?: string;
  upsellCtaSubText?: string;
  upsellDeclineText?: string;

  // Step 5 — Program
  programName?: string;
  programTagline?: string;
  programStartDate?: string;
  programSchedule?: string;
  programDuration?: string;
  programPriceFull?: number;
  programPaymentPlans?: { installments: number; cadence: string; amountPerInstallment: number }[];
  // legacy — kept for backward compat
  programPricePlan1?: string;
  programPricePlan2?: string;
  programGuarantee?: string;
  programPortalUrl?: string;     // member portal / course login URL shown on programme thank-you

  // Step 5 — Curriculum
  audienceDescription?: string;
  transformationPromise?: string;
  whatIsIncluded?: string;
  curriculumWeeks?: { week: string; title: string; description: string }[];
  bonuses?: { title: string; description: string; value: string }[];

  // Step 1 — Your Story (merged into the About You tab)
  existingMaterialUrls?: string[];
  existingFileUrls?: string[];
  methodologyDescription?: string;
  uniqueApproach?: string;

  // Step 7 — Testimonials
  testimonials?: { quote: string; name: string; location: string; context?: string }[];
  videoTestimonialUrls?: string[];
  pressLogos?: { name: string; websiteUrl: string; logoUrl?: string; textFallback?: boolean; transparentBg?: boolean }[];

  // Step 8 — Images
  heroImageUrls?: string[];
  lifestyleImageUrls?: string[];
  additionalImageUrls?: string[];

  // Step 9 — Tone & Voice
  toneDescriptors?: string[];
  referenceTheme?: string;
  /** Who picked referenceTheme — ai auto-suggest vs manual override */
  referenceThemeSource?: "ai" | "user";
  /** Computed at generation time; stored in snapshot for preview consistency */
  brandProfile?: BrandProfile;
  copyLoveUrl?: string;
  copyHateDescription?: string;

  // Style guide (auto-detected from website)
  styleGuide?: {
    brandAnalysisUrl?: string;
    /** Figma file/frame URL last analysed for brand colours + fonts. */
    figmaFileUrl?: string;
    brandColors?: {
      primary?: string;
      secondary?: string;
      tertiary?: string;
      textLight?: string;
      textDark?: string;
      accent?: string;
    };
    googleFonts: string[];
    /** Explicit headline font — from CSS detection or user override */
    fontDisplay?: string;
    /** Explicit body font — from CSS detection or user override */
    fontBody?: string;
    customFonts: { detected: string; isLikelyPaid: boolean; googleAlternatives: string[] }[];
    uploadedFontUrls?: string[];
  };

  // Generation mode — "ai_copy" (default) writes copy with Claude; "copy_doc"
  // uses an uploaded, parsed copy document as the source of truth for page copy.
  generationMode?: GenerationMode;
  copyDoc?: CopyDocRef;

  // Meta
  completedSteps?: number[];
  /** Steps the user explicitly opted out of — excluded from completeness denominator. */
  skippedSections?: {
    upsell?: boolean;
    programme?: boolean;
  };
}

export const WIZARD_STEPS = [
  { id: 1,  title: "About You",           subtitle: "Choose how we write your copy, then tell us about the host" },
  { id: 2,  title: "Your Brand",           subtitle: "Business name, logo and contact details" },
  { id: 3,  title: "Live Event",           subtitle: "Date, time, pricing and platform" },
  { id: 4,  title: "Upsell Offer",         subtitle: "The one-time product offered to event registrants" },
  { id: 5,  title: "Programme",            subtitle: "Your high-ticket upsell offer" },
  { id: 6,  title: "Curriculum & Content", subtitle: "What's included and the transformation" },
  { id: 7,  title: "Testimonials",         subtitle: "Social proof for all funnel pages" },
  { id: 8,  title: "Images",               subtitle: "Hero photos and lifestyle imagery" },
  { id: 9,  title: "Tone & Voice",         subtitle: "How you want your copy to sound" },
  { id: 10, title: "Review & Generate",    subtitle: "Confirm everything and launch AI generation" },
] as const;

export type WizardStep = typeof WIZARD_STEPS[number]["id"];
