export type ThemeSlug =
  | "threshold"
  | "sacred"
  | "executive"
  | "wellness"
  | "highperf"
  | "abundance"
  | "earth";

/* ====== Style ====== */
export interface ThemeColors {
  surfaceCanvas: string;
  surfaceSunken: string;
  surfaceRaised: string;
  surfaceAccent: string;
  surfaceInverse: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textAccent: string;
  accentPrimary: string;
  accentPrimaryHover: string;
  accentPrimaryLight: string;
  accentPrimaryHoverLight: string;
  accentSecondary: string;
  accentHighlight: string;
  borderSubtle: string;
  borderStrong: string;
  success: string;
}

export interface ThemeFonts {
  displayFamily: string;
  bodyFamily: string;
  monoFamily?: string;
  googleFontsUrl: string;
}

/* ====== Core entities ====== */
export interface Host {
  name: string;
  shortName: string;            // first name used in signatures
  title: string;                // "Facilitator of Inner Stillness"
  brand: string;                // "Lena Hartwell" - the legal display name
  parentBrand: string;          // "Inner Practice Library"
  email: string;
  legalEntity: string;
  bookTitle: string;
  bio: string[];                // 2-3 bio paragraphs (HTML allowed)
  bioImageDescription: string;  // for the placeholder
  signaturePhrase: string;      // "I would be glad to spend four hours with you on October 14. — Lena"
  credentials: string[];        // 4 bullets for the program host section
}

export interface EventInfo {
  name: string;
  tagline: string;
  date: string;                 // "October 14, 2026"
  shortDate: string;            // "October 14"
  dayOfWeek: string;            // "Wednesday"
  time: string;                 // "9am – 1pm"
  timezone: string;             // "Pacific Time"
  duration: string;             // "Four hours, with two short breaks"
  platform: string;             // "Zoom"
  priceMin: number;
  priceMax: number;
  priceDefault: number;
  pricePresets: number[];
  priceLabel: string;           // "Choose your price"
  priceDisplay: string;         // "$11 — $111"
  ctaText: string;              // "Register Now"
  countdownDays: string;
  countdownHours: string;
  countdownMins: string;
}

export interface ProgramInfo {
  name: string;
  nameLine1: string;            // "The Presence" — for split display
  nameLine2: string;            // "Collective"
  tagline: string;
  durationLabel: string;        // "8 weeks"
  sessionsCount: number;        // 16
  startDate: string;            // "November 4"
  enrolmentDeadline: string;    // "October 31"
  scheduleLine: string;         // "Tuesday & Thursday · 6pm EST"
  endDate: string;              // "Jan 15"
  fullPrice: number;            // 1997
  fullPriceLabel: string;       // "$1,997"
  spreadPerPayment: number;     // 749
  spreadCount: number;          // 3
  spreadTotal: number;          // 2247
  spreadLabel: string;          // "3 × $749"
  extendedPerPayment: number;
  extendedCount: number;
  extendedTotal: number;
  bonusTotalValue: string;      // "$791 — yours free"
  enrolCtaText: string;         // "Enrol in The Presence Collective"
}

/* ====== Content fragments ====== */
export interface AudienceItem { html: string; iconKey: string; }
export interface OutcomeItem { strong: string; rest: string; iconKey: string; }
export interface OutcomesGridItem { title: string; body: string; iconKey: string; }
export interface ExperienceItem { strong: string; body: string; iconKey: string; }
export interface PressLogo { name: string; variant?: "default" | "style-2" | "style-3"; }
export interface Testimonial {
  headline?: string;
  quote: string;
  name: string;
  location?: string;
  context?: string;
}
export interface FaqItem { q: string; a: string; }
export interface FromToItem { from: string; to: string; }
export interface VisionItem { strong: string; rest: string; }
export interface BundleItem { title: string; description: string; iconKey: string; }
export interface ChatComment { text: string; name: string; }
export interface VideoTestimonial { quote: string; author: string; duration: string; }
export interface WrittenTestimonial { stars: number; body: string; name: string; handle: string; }
export interface WeekItem { week: number; title: string; dates: string; points: string[]; }
export interface Bonus {
  num: string;
  title: string;
  description: string;
  value: string;
  restriction?: string;
}
export interface IncludesItem {
  num: string;
  title: string;
  description: string;
  tag: string;
  iconKey: string;
}
export interface ResourceItem { name: string; size: string; }
export interface ReplayPart {
  label: string;
  title: string;
  description: string;
  duration: string;
  quotes: { text: string; author: string }[];
}
export interface NextStep { title: string; body: string; tag?: string; tagIconKey?: string; }
export interface ScheduleRow { week: string; title: string; dates: string; locked?: boolean; upcoming?: boolean; }
export interface SalesBenefit { title: string; rest: string; }

/* ====== Page contents ====== */
export interface LandingContent {
  heroEyebrow: string;
  heroSubtitle: string;
  heroHostBadge: string;
  heroPriceLabel: string;
  heroPriceValue: string;
  heroCtaMicrocopy: string;
  heroVisualDescription: string;

  credibilityHero: Testimonial;

  videoEyebrow: string;
  videoHeadline: string;
  videoCaption: string;

  asSeenOnEyebrow: string;
  pressLogos: PressLogo[];

  audienceEyebrow: string;
  audienceHeadline: string;
  audience: AudienceItem[];
  audienceClose: string;
  audienceCtaMicrocopy: string;

  encourageDarkLine: string;
  encourageAccentLine: string;
  encourageSunkenLine: string;
  encourageFinalLine: string;

  vpEyebrow: string;
  vpHeadline: string;
  vpParagraphs: string[];
  vpPullQuote: string;
  vpImageDescription: string;

  credibilityInline: Testimonial;

  outcomesEyebrow: string;
  outcomesHeadline: string;
  outcomesSubline: string;
  outcomes: OutcomeItem[];
  outcomesImageDescription: string;
  outcomesClose: string;
  outcomesMicrocopy: string;

  personalMessageHeadline: string;
  personalMessage: string[];
  personalMessageSignature: string;

  testimonialsEyebrow: string;
  testimonialsHeadline: string;
  testimonials: Testimonial[];

  howHeadline: string;
  howParagraphs: string[];
  howClosing: string;

  overviewHeadline: string;
  overviewExperienceTitle: string;
  overviewExperience: ExperienceItem[];
  overviewChallengesTitle: string;
  overviewChallenges: string[];

  credibilityOverview: Testimonial;

  extraVpHeadline: string;
  extraVpParagraphs: string[];
  extraVpClosing: string;

  outcomesGridEyebrow: string;
  outcomesGridHeadline: string;
  outcomesGrid: OutcomesGridItem[];

  bioEyebrow: string;
  bioHeadline: string;

  finalVpHeadline: string;
  finalVpParagraphs: string[];
  fromTo: FromToItem[];
  finalVpMicrocopy: string;

  faq: FaqItem[];
  ftcParagraphs: string[];
}

export interface CheckoutContent {
  priceCardTitle: string;
  priceCardDescription: string;
  priceCardHint: string;
  orderItemDescription: string;
  orderItemSubtitle: string;
  salesEventTagline: string;
  salesPriceDescriptor: string;
  salesBenefits: SalesBenefit[];
  ftcParagraph: string;
}

export interface UpsellContent {
  bundleName: string;
  bundleEyebrow: string;
  bundleHeadline: string;
  bundleDescription: string;
  includedTitle: string;
  bundleItems: BundleItem[];
  testimonial: Testimonial;
  priceWas: string;
  priceNow: string;
  priceSaving: string;
  priceNote: string;
  yesCta: string;
  yesCtaSub: string;
  noCta: string;
  confirmBannerText: string;
}

export interface ThankYouContent {
  headline: string;
  eventNameLine: string;
  eventDetails: string[];
  emailNote: string;
  nextStepsLabel: string;
  nextSteps: NextStep[];
  calendarHeadline: string;
  calendarSub: string;
  calendarReminder: string;
  calendarReminderSub: string;
  calendarStart: string;
  calendarEnd: string;
  calendarTimezone: string;
  detailsLabel: string;
  detailsRows: { label: string; value: string }[];
  zoomNote: string;
  shareHeadline: string;
  shareSub: string;
  personalNoteHeadline: string;
  personalNote: string[];
  personalNoteSignature: string;
}

export interface ReplayContent {
  offerLabel: string;
  offerTitle: string;
  offerUrgency: string;
  offerCtaText: string;
  pageEyebrow: string;
  pageSubtitle: string;
  metaItems: string[];
  resourcesLabel: string;
  resources: ResourceItem[];
  parts: ReplayPart[];
  chatEyebrow: string;
  chatHeadline: string;
  chatComments: ChatComment[];
  programCtaLabel: string;
  programCtaDescription: string;
  programCtaBenefits: string[];
  programUrgency: string;
  disclaimerText: string;
}

export interface ProgramContent {
  heroEyebrow: string;
  visionEyebrow: string;
  visionHeadline: string;
  vision: VisionItem[];
  alreadyTriedEyebrow: string;
  alreadyTriedHeadline: string;
  alreadyTriedBody: string[];
  triedTags: string[];
  promiseHeadline: string;
  promiseBody: string;
  promiseItems: VisionItem[];
  includesEyebrow: string;
  includesHeadline: string;
  includesSubline: string;
  includes: IncludesItem[];
  sessionEyebrow: string;
  sessionHeadline: string;
  sessionSubline: string;
  weeks: WeekItem[];
  videoTestimonialsEyebrow: string;
  videoTestimonialsHeadline: string;
  videoTestimonials: VideoTestimonial[];
  credibilityProgram: Testimonial;
  bonusesEyebrow: string;
  bonusesHeadline: string;
  bonuses: Bonus[];
  bonusTotalNote: string;
  priceRepeatLabel: string;
  priceRepeatUrgency: string;
  outcomesEyebrow: string;
  outcomesHeadline: string;
  outcomesSubline: string;
  outcomes: OutcomeItem[];
  writtenEyebrow: string;
  writtenHeadline: string;
  writtenTestimonials: WrittenTestimonial[];
  pricingEyebrow: string;
  pricingHeadline: string;
  pricingSubline: string;
  pricingUrgency: string;
  hostEyebrow: string;
  faqHeadline: string;
  faq: FaqItem[];
  finalCtaHeadline: string;
  finalCtaBody: string;
  finalCtaDeadline: string;
  disclaimerText: string;
}

export interface ProgramCheckoutContent {
  programDescription: string;
  programIncludes: string[];
  guaranteeHeadline: string;
  guaranteeBody: string;
  orderAttribution: string;
  ftcText: string;
}

export interface ProgramThankYouContent {
  label: string;
  headline: string;
  subheadline: string;
  chips: string[];
  emailNote: string;
  nextStepsLabel: string;
  nextStepsHeadline: string;
  nextSteps: NextStep[];
  scheduleLabel: string;
  scheduleHeadline: string;
  scheduleSub: string;
  scheduleRows: ScheduleRow[];
  scheduleDates: string[];
  noteEyebrow: string;
  note: string[];
  noteSignatureTitle: string;
  commitmentLabel: string;
  commitmentHeadline: string;
  commitmentItems: string[];
  accessEyebrow: string;
  accessRows: { label: string; value: string }[];
  accessNote: string;
}

export interface ThemeContent {
  landing: LandingContent;
  checkout: CheckoutContent;
  upsell: UpsellContent;
  thankYou: ThankYouContent;
  replay: ReplayContent;
  program: ProgramContent;
  programCheckout: ProgramCheckoutContent;
  programThankYou: ProgramThankYouContent;
}

export interface ThemeConfig {
  slug: ThemeSlug;
  label: string;
  descriptor: string;
  swatch: string;
  host: Host;
  event: EventInfo;
  program: ProgramInfo;
  fonts: ThemeFonts;
  colors: ThemeColors;
  content: ThemeContent;
}
