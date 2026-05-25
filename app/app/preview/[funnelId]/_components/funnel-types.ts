/** Returns the URL only if it looks like a real URL (not an instruction string Claude may have output) */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http://") || url.startsWith("https://") ? url : null;
}

// Section background theme — Claude decides; components apply the right CSS classes.
// "dark"   → surface-inverse background  (near-black)  use on-dark for light text
// "accent" → surface-accent background   (dark teal)   use on-dark for light text
// "light"  → surface-canvas background   (warm cream)  default dark text
export type SectionTheme = "dark" | "accent" | "light";

// ─────────────────────────────────────────────────────────────────────────────
// Wizard snapshot (user-entered data passed from the wizard form)
// ─────────────────────────────────────────────────────────────────────────────
export interface WizardSnapshot {
  // Brand / host
  hostName?: string;
  hostTitle?: string;
  hostBio?: string;
  hostHeadshotUrl?: string;
  businessName?: string;
  logoUrl?: string;
  contactEmail?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  // Event
  eventName?: string;
  eventTagline?: string;
  eventDate?: string;
  eventTime?: string;
  eventTimezone?: string;
  eventDuration?: string;
  eventPlatform?: string;
  eventPricingModel?: string;
  eventPriceMin?: number;
  eventPriceMax?: number;
  eventPriceFixed?: number;
  eventVideoUrl?: string;
  // Upsell
  upsellOfferName?: string;
  upsellHeadline?: string;
  upsellDescription?: string;
  upsellIncludedItems?: { title: string; description: string }[];
  upsellQuote?: string;
  upsellQuoteAttribution?: string;
  upsellRegularValue?: string;
  upsellOfferPrice?: string;
  upsellPriceNote?: string;
  upsellCtaText?: string;
  upsellCtaSubText?: string;
  upsellDeclineText?: string;
  // Programme
  programName?: string;
  programTagline?: string;
  programStartDate?: string;
  programDuration?: string;
  programPriceFull?: number;
  programPaymentPlans?: { installments: number; cadence: string; amountPerInstallment: number }[];
  programGuarantee?: string;
  programPortalUrl?: string;
  curriculumWeeks?: { week: string; title: string; description: string }[];
  bonuses?: { title: string; description: string; value: string }[];
  testimonials?: { quote: string; name: string; location: string; context?: string }[];
  videoTestimonialUrls?: string[];
  pressLogos?: { name: string; websiteUrl: string; logoUrl?: string; textFallback?: boolean }[];
  // Images
  heroImageUrls?: string[];
  lifestyleImageUrls?: string[];
  additionalImageUrls?: string[];
  // Style
  styleGuide?: {
    brandColors?: {
      primary?: string;
      secondary?: string;
      tertiary?: string;
      textLight?: string;
      textDark?: string;
      accent?: string;
    };
    googleFonts?: string[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page 1 — Event Landing  (index.html, 21 sections)
// ─────────────────────────────────────────────────────────────────────────────
export interface EventLandingContent {
  // Image assignments — Claude picks from available uploaded images
  heroBackgroundImageUrl?:  string | null;   // primary hero background
  valuePropImageUrl?:        string | null;   // lifestyle/supporting image alongside VP text
  outcomesImageUrl?:         string | null;   // wide supporting image in outcomes section
  encourage1BackgroundUrl?:  string | null;   // optional atmospheric bg for encourage CTA 1
  encourage2BackgroundUrl?:  string | null;
  encourage3BackgroundUrl?:  string | null;
  // 02 Hero
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroPriceLabel?: string;
  heroPriceValue?: string;
  heroCtaText?: string;
  heroMetaLine?: string;
  // 03 Credibility 1
  credibilityQuote1?: string;
  credibilityAttribution1?: string;
  // 04 Video
  videoSectionEyebrow?: string;
  videoSectionHeading?: string;
  videoCaption?: string;
  videoUrl?: string | null;
  // 06 Audience
  audienceEyebrow?: string;
  audienceHeading?: string;
  audienceItems?: string[];
  audienceClosingText?: string;
  audienceMicrocopy?: string;
  // 07 Encourage CTA 1
  encourageText1?: string;
  encourage1Theme?: SectionTheme;   // default: "dark"
  ctaText?: string;
  // 08 Value Proposition
  vpEyebrow?: string;
  vpHeading?: string;
  vpParagraphs?: string[];
  vpPullQuote?: string;
  // 09 Credibility 2 (inline)
  credibilityQuote2?: string;
  credibilityAttribution2?: string;
  // 10 Outcomes (Edward style)
  outcomesEyebrow?: string;
  outcomesHeading?: string;
  outcomesSubheading?: string;
  outcomesItems?: { title: string; body: string }[];
  outcomesClosingText?: string;
  outcomesMicrocopy?: string;
  // 11 Personal message
  personalMessageHeading?: string;
  personalMessageParagraphs?: string[];
  personalMessageSignature?: string;
  // 12 Testimonials
  testimonialsEyebrow?: string;
  testimonialsHeading?: string;
  // 07b Encourage CTA 2
  encourageText2?: string;
  encourage2Theme?: SectionTheme;   // default: "accent"
  // 13 How it works
  howItWorksHeading?: string;
  howItWorksParagraphs?: string[];
  howItWorksClosing?: string;
  // 14 Event overview
  eventOverviewHeading?: string;
  recordingNote?: string;
  experienceItems?: { title: string; body: string }[];
  challengeItems?: string[];
  // Post-overview Credibility 3 (inline)
  credibilityQuote3?: string;
  credibilityAttribution3?: string;
  // 15 Extra VP
  extraVpHeading?: string;
  extraVpParagraphs?: string[];
  extraVpClosing?: string;
  // 07c Encourage CTA 3
  encourageText3?: string;
  encourage3Theme?: SectionTheme;   // default: "light"
  // 16 Outcomes 2 (icon grid)
  outcomes2Eyebrow?: string;
  outcomes2Heading?: string;
  outcomes2Items?: { title: string; body: string }[];
  // 17 Bio
  bioEyebrow?: string;
  bioHeading?: string;
  bioParagraphs?: string[];
  bioSignature?: string;
  // 18 Final VP
  finalVpHeading?: string;
  finalVpIntro?: string;
  finalVpFromTo?: { from: string; to: string }[];
  finalVpClosing?: string;
  finalVpCtaMicrocopy?: string;
  // 19 FAQ
  faqEyebrow?: string;
  faqItems?: { question: string; answer: string }[];
  // Final CTA
  finalCtaLine?: string;
  finalCtaText?: string;
  // 20 FTC
  ftcDisclaimer?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page 2 — Event Checkout  (checkout.html)
// ─────────────────────────────────────────────────────────────────────────────
export interface EventCheckoutContent {
  logoUrl?:                  string | null;   // brand logo for checkout header
  checkoutSidebarImageUrl?:  string | null;   // lifestyle/supporting image in sales sidebar
  priceRangeCopy?: string;
  priceMin?: number;
  priceMax?: number;
  priceDefault?: number;
  priceTiers?: { tier: number; amount: number; label: string }[];
  benefits?: string[];
  ctaText?: string;
  guaranteeText?: string;
  ftcDisclaimer?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page 3 — Upsell  (upsell.html)
// ─────────────────────────────────────────────────────────────────────────────
export interface UpsellContent {
  productImageUrl?:          string | null;   // offer/product feature image
  confirmationBannerText?: string;
  eyebrow?: string;
  headline?: string;
  description?: string;
  includedTitle?: string;
  includedItems?: { title: string; description: string }[];
  testimonialQuote?: string;
  testimonialAttribution?: string;
  regularPrice?: string;
  offerPrice?: string;
  savingAmount?: string;
  urgencyNote?: string;
  yesCtaText?: string;
  yesCtaSubText?: string;
  declineText?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page 4 — Event Thank You  (thank-you.html)
// ─────────────────────────────────────────────────────────────────────────────
export interface EventThankYouContent {
  logoUrl?:                  string | null;   // brand logo in header/footer
  backgroundImageUrl?:       string | null;   // atmospheric hero background
  label?: string;
  headline?: string;
  subheadline?: string;
  emailNote?: string;
  nextStepsHeading?: string;
  nextSteps?: { step: string; title: string; body: string }[];
  calendarHeading?: string;
  calendarSub?: string;
  timezoneNote?: string;
  detailRows?: { label: string; value: string; isLive?: boolean }[];
  zoomNote?: string;
  shareHeading?: string;
  shareSub?: string;
  shareUrl?: string;
  personalNoteHeadline?: string;
  personalNoteParagraphs?: string[];
  personalNoteSignature?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page 5 — Replay  (replay.html)
// ─────────────────────────────────────────────────────────────────────────────
export interface ReplayContent {
  heroBackgroundImageUrl?:   string | null;   // replay page header background
  logoUrl?:                  string | null;   // brand logo in header
  offerBarLabel?: string;
  offerBarTitle?: string;
  offerBarUrgency?: string;
  offerBarPrice?: string;
  eyebrow?: string;
  headline?: string;
  subtitle?: string;
  metaRecordings?: string;
  metaAccess?: string;
  resourcesLabel?: string;
  resources?: { name: string; fileType: string; fileSize?: string }[];
  videos?: {
    partLabel: string;
    title: string;
    description: string;
    duration: string;
    quotes: { text: string; author: string }[];
  }[];
  commentsEyebrow?: string;
  commentsTitle?: string;
  comments?: { bubble: string; name: string }[];
  programCtaLabel?: string;
  programCtaHeadline?: string;
  programCtaDescription?: string;
  programCtaBenefits?: string[];
  programCtaPrice?: string;
  programCtaPlanText?: string;
  programCtaUrgency?: string;
  programCtaEnrolText?: string;
  ftcText?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page 6 — Programme Landing  (program.html)
// ─────────────────────────────────────────────────────────────────────────────
export interface ProgrammeLandingContent {
  // Image assignments
  heroBackgroundImageUrl?:   string | null;   // programme hero background
  programmeFeatureImageUrl?: string | null;   // lifestyle image alongside programme content
  finalCtaBackgroundUrl?:    string | null;   // optional background for final CTA section
  // 01 Hero
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroMeta?: string[];
  heroPriceFrom?: string;
  heroCtaText?: string;
  heroUrgency?: string;
  // 02 Vision
  visionEyebrow?: string;
  visionHeading?: string;
  visionItems?: string[];
  visionCtaText?: string;
  visionCtaNote?: string;
  // 03 Already tried
  alreadyTriedEyebrow?: string;
  alreadyTriedHeading?: string;
  alreadyTriedBody?: string[];
  alreadyTriedTags?: string[];
  // 04 Promise
  promiseHeading?: string;
  promiseBody?: string[];
  promiseBullets?: string[];
  // 05 Includes
  includesEyebrow?: string;
  includesHeading?: string;
  includesItems?: { num: string; title: string; description: string; tag?: string }[];
  // 06 Session breakdown
  sessionEyebrow?: string;
  sessionHeading?: string;
  sessionWeeks?: { num: string; title: string; dates: string; points: string[] }[];
  // 07 Video testimonials
  videoTestimonialsEyebrow?: string;
  videoTestimonialsHeading?: string;
  // 08 Credibility pull quote
  credibilityQuote?: string;
  credibilityAttribution?: string;
  // 09 Bonuses
  bonusesEyebrow?: string;
  bonusesHeading?: string;
  bonusesItems?: { num: string; title: string; description: string; value: string }[];
  bonusesTotal?: string;
  // 10 Price repeat
  midPriceLabel?: string;
  midPriceCtaText?: string;
  midPriceUrgency?: string;
  // 11 Outcomes
  outcomesEyebrow?: string;
  outcomesHeading?: string;
  outcomesBody?: string;
  outcomesItems?: { before: string; after: string }[];
  outcomesCtaText?: string;
  // 12 Testimonials
  testimonialsEyebrow?: string;
  testimonialsHeading?: string;
  // 13 Pricing
  pricingEyebrow?: string;
  pricingHeading?: string;
  pricingSubheading?: string;
  pricingUrgency?: string;
  pricingCtaText?: string;
  // 14 Host
  bioEyebrow?: string;
  bioName?: string;
  bioParagraphs?: string[];
  bioCredentials?: string[];
  // 15 FAQ
  faqEyebrow?: string;
  faqItems?: { question: string; answer: string }[];
  // 03 Already tried — variable background
  alreadyTriedTheme?: SectionTheme;  // default: "dark"
  // 16 Final CTA — variable background
  finalCtaHeadline?: string;
  finalCtaBody?: string;
  finalCtaText?: string;
  finalCtaDeadline?: string;
  finalCtaTheme?: SectionTheme;      // default: "dark"
  ftcDisclaimer?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page 7 — Programme Checkout  (program-checkout.html)
// ─────────────────────────────────────────────────────────────────────────────
export interface ProgrammeCheckoutContent {
  logoUrl?:                  string | null;   // brand logo for checkout header
  programmeImageUrl?:        string | null;   // programme feature image in order sidebar
  programEyebrow?: string;
  programName?: string;
  programChips?: string[];
  plans?: {
    id: string;
    name: string;
    amount: string;
    schedule?: string;
    isFeatured?: boolean;
  }[];
  benefits?: string[];
  guaranteeTitle?: string;
  guaranteeText?: string;
  ctaText?: string;
  ftcDisclaimer?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page 8 — Programme Thank You  (program-thank-you.html)
// ─────────────────────────────────────────────────────────────────────────────
export interface ProgrammeThankYouContent {
  logoUrl?:                  string | null;   // brand logo in header
  backgroundImageUrl?:       string | null;   // atmospheric hero background
  label?: string;
  headline?: string;
  subheadline?: string;
  chips?: string[];
  emailNote?: string;
  nextHeadline?: string;
  steps?: { num: string; title: string; body: string; tag?: string }[];
  scheduleIntro?: string;
  scheduleRows?: { week: string; focus: string; dates: string; locked?: boolean }[];
  scheduleDatesNote?: string;
  noteEyebrow?: string;
  noteParagraphs?: string[];
  noteSignature?: string;
  commitmentLabel?: string;
  commitmentHeadline?: string;
  commitmentItems?: string[];
  accessCardTitle?: string;
  accessRows?: { label: string; value: string }[];
  accessNote?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root container (matches generated_funnels.content JSON shape)
// ─────────────────────────────────────────────────────────────────────────────
export interface FunnelContent {
  eventLanding?: EventLandingContent;
  eventCheckout?: EventCheckoutContent;
  upsell?: UpsellContent;
  eventThankYou?: EventThankYouContent;
  replay?: ReplayContent;
  programmeLanding?: ProgrammeLandingContent;
  programmeCheckout?: ProgrammeCheckoutContent;
  programmeThankYou?: ProgrammeThankYouContent;
  // When Claude outputs null for an image field, it populates this with a
  // description of what to photograph/upload for that slot.
  imageSuggestions?: Record<string, string>;
}
