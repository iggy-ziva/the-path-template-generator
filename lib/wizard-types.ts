export interface WizardData {
  // Step 1 — About You
  hostName?: string;
  hostTitle?: string;
  hostTagline?: string;
  hostBio?: string;
  hostHeadshotUrl?: string;
  hostSignatureUrl?: string;

  // Step 2 — Your Brand
  businessName?: string;
  logoUrl?: string;
  contactEmail?: string;
  legalEntityName?: string;
  websiteUrl?: string;
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
  upsellQuote?: string;
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

  // Step 6 — Your Story
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
  copyLoveUrl?: string;
  copyHateDescription?: string;

  // Style guide (auto-detected from website)
  styleGuide?: {
    brandAnalysisUrl?: string;
    brandColors?: {
      primary?: string;
      secondary?: string;
      tertiary?: string;
      textLight?: string;
      textDark?: string;
      accent?: string;
    };
    googleFonts: string[];
    customFonts: { detected: string; isLikelyPaid: boolean; googleAlternatives: string[] }[];
    uploadedFontUrls?: string[];
  };

  // Meta
  completedSteps?: number[];
}

export const WIZARD_STEPS = [
  { id: 1,  title: "About You",           subtitle: "Tell us about the host/facilitator" },
  { id: 2,  title: "Your Brand",           subtitle: "Business name, logo and contact details" },
  { id: 3,  title: "Live Event",           subtitle: "Date, time, pricing and platform" },
  { id: 4,  title: "Upsell Offer",         subtitle: "The one-time product offered to event registrants" },
  { id: 5,  title: "Programme",            subtitle: "Your high-ticket upsell offer" },
  { id: 6,  title: "Curriculum & Content", subtitle: "What's included and the transformation" },
  { id: 7,  title: "Your Story",           subtitle: "Existing materials for AI to analyse" },
  { id: 8,  title: "Testimonials",         subtitle: "Social proof for all funnel pages" },
  { id: 9,  title: "Images",               subtitle: "Hero photos and lifestyle imagery" },
  { id: 10, title: "Tone & Voice",         subtitle: "How you want your copy to sound" },
  { id: 11, title: "Review & Generate",    subtitle: "Confirm everything and launch AI generation" },
] as const;

export type WizardStep = typeof WIZARD_STEPS[number]["id"];
