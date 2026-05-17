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

  // Step 4 — Program
  programName?: string;
  programTagline?: string;
  programStartDate?: string;
  programSchedule?: string;
  programDuration?: string;
  programPriceFull?: number;
  programPricePlan1?: string;
  programPricePlan2?: string;
  programGuarantee?: string;

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
  pressLogos?: string[];

  // Step 8 — Images
  heroImageUrls?: string[];
  lifestyleImageUrls?: string[];
  additionalImageUrls?: string[];

  // Step 9 — Tone & Voice
  toneDescriptors?: string[];
  referenceTheme?: string;
  copyLoveUrl?: string;
  copyHateDescription?: string;

  // Meta
  completedSteps?: number[];
}

export const WIZARD_STEPS = [
  { id: 1, title: "About You", subtitle: "Tell us about the host/facilitator" },
  { id: 2, title: "Your Brand", subtitle: "Business name, logo and contact details" },
  { id: 3, title: "Live Event", subtitle: "Date, time, pricing and platform" },
  { id: 4, title: "Programme", subtitle: "Your high-ticket upsell offer" },
  { id: 5, title: "Curriculum & Content", subtitle: "What's included and the transformation" },
  { id: 6, title: "Your Story", subtitle: "Existing materials for AI to analyse" },
  { id: 7, title: "Testimonials", subtitle: "Social proof for all funnel pages" },
  { id: 8, title: "Images", subtitle: "Hero photos and lifestyle imagery" },
  { id: 9, title: "Tone & Voice", subtitle: "How you want your copy to sound" },
  { id: 10, title: "Review & Generate", subtitle: "Confirm everything and launch AI generation" },
] as const;

export type WizardStep = typeof WIZARD_STEPS[number]["id"];
