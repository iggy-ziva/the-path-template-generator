// ─────────────────────────────────────────────────────────────────────────────
// CopyDoc — normalized intermediate representation of an uploaded copy document.
//
// A CopyDoc is the deterministic bridge between a client-authored copy document
// (.docx, following templates/landing-page-copy-template.md) and the
// `FunnelContent` copy fields consumed by the preview/editor. Copy is treated as
// verbatim source-of-truth: the engine and any AI fallback may classify and
// place text, but must NEVER reword it.
//
// This module owns two things:
//   1. The CopyDoc data types.
//   2. The canonical section -> FunnelContent mapping table (the registry that
//      the parser, validator, and mapper all consume).
// ─────────────────────────────────────────────────────────────────────────────

export const COPYDOC_VERSION = 1 as const;

/** Pages the copy-doc engine can target. Phase 1 covers Event Landing only. */
export type CopyDocPageKey = "eventLanding" | "programmeLanding";

/** A structured list item, e.g. `{ title, body }` or `{ question, answer }`. */
export type CopyItem = Record<string, string>;

/** The value a single field can hold once segmented from the document. */
export type CopyValue = string | string[] | CopyItem[];

/** One canonical section detected in the document, with its segmented fields. */
export interface CopyDocSection {
  /** Canonical section id (mirrors editor/section-theme.ts ids where possible). */
  id: string;
  /** The canonical heading this section matched (for reporting). */
  heading: string;
  /** Field key -> verbatim value. Keys come from the registry `key`s. */
  fields: Record<string, CopyValue>;
}

/** The full parsed document. */
export interface CopyDoc {
  version: typeof COPYDOC_VERSION;
  page: CopyDocPageKey;
  sections: CopyDocSection[];
  /** Non-fatal parse notes (unmatched blocks, smart-quote normalisation, etc.). */
  warnings: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Field + section specification used by the canonical mapping table.
// ─────────────────────────────────────────────────────────────────────────────

export type CopyFieldKind = "text" | "list" | "items";

export interface CopyFieldSpec {
  /** Heading-3 label as authored in the template (matched case-insensitively). */
  label: string;
  /** Alternative labels accepted for the same field. */
  aliases?: string[];
  /** Stable key stored under `CopyDocSection.fields`. */
  key: string;
  kind: CopyFieldKind;
  /**
   * For `items`, the ordered subfield keys. The parser splits each list item on
   * its leading bold run: bold text -> subfields[0], remainder -> subfields[1].
   * Special shapes ("faq", "fromto") are handled explicitly by the parser.
   */
  itemShape?: string[];
  /** Dot-path into the page content object (e.g. EventLandingContent). */
  target: string;
  required?: boolean;
  /** Exact required count for list/items (emits a cardinality warning if off). */
  count?: number;
  minCount?: number;
  maxCount?: number;
}

export interface CopySectionSpec {
  /** Canonical section id. */
  id: string;
  /** Canonical Heading-2 text used in the template. */
  heading: string;
  /** Alternative headings accepted when segmenting (case-insensitive). */
  aliases?: string[];
  /** A required section must be present for a clean coverage report. */
  required?: boolean;
  fields: CopyFieldSpec[];
}

export interface CopyPageSpec {
  page: CopyDocPageKey;
  /** Heading-1 text that opens the page block in the template. */
  pageHeading: string;
  aliases?: string[];
  sections: CopySectionSpec[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical mapping table — Event Landing.
//
// Targets are dot-paths into EventLandingContent (see funnel-types.ts). Only
// copy fields appear here; brand, host facts, prices, dates and images come from
// the wizard and are layered in by the generation pipeline, never from the doc.
// ─────────────────────────────────────────────────────────────────────────────

export const EVENT_LANDING_COPY_SPEC: CopyPageSpec = {
  page: "eventLanding",
  pageHeading: "Event Landing Page",
  aliases: ["Event Landing", "Live Event Landing Page"],
  sections: [
    {
      id: "hero",
      heading: "Hero",
      required: true,
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "heroEyebrow" },
        { label: "Headline", aliases: ["Title"], key: "headline", kind: "text", target: "heroHeadline", required: true },
        { label: "Subheadline", aliases: ["Subtitle"], key: "subheadline", kind: "text", target: "heroSubheadline", required: true },
        { label: "Primary CTA", aliases: ["CTA"], key: "cta", kind: "text", target: "heroCtaText" },
      ],
    },
    {
      id: "credibility1",
      heading: "Credibility 1",
      aliases: ["Credibility Statement", "Credibility Statement (under hero)"],
      fields: [
        { label: "Quote", key: "quote", kind: "text", target: "credibilityQuote1" },
        { label: "Attribution", key: "attribution", kind: "text", target: "credibilityAttribution1" },
      ],
    },
    {
      id: "video",
      heading: "Video",
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "videoSectionEyebrow" },
        { label: "Heading", key: "heading", kind: "text", target: "videoSectionHeading" },
        { label: "Caption", key: "caption", kind: "text", target: "videoCaption" },
      ],
    },
    {
      id: "audience",
      heading: "Audience",
      aliases: ["Audience Callouts", "This Is For You If"],
      required: true,
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "audienceHeading" },
        { label: "Items", aliases: ["Callouts"], key: "items", kind: "list", target: "audienceItems", required: true, count: 6 },
        { label: "Closing line", key: "closing", kind: "text", target: "audienceClosingText" },
      ],
    },
    {
      id: "encourage1",
      heading: "Encourage 1",
      aliases: ["Encouragement CTA", "Encouragement CTA 1"],
      fields: [
        { label: "Text", key: "text", kind: "text", target: "encourageText1" },
        { label: "CTA", key: "cta", kind: "text", target: "ctaText" },
      ],
    },
    {
      id: "valueProp",
      heading: "Value Proposition",
      aliases: ["Value Proposition 1"],
      required: true,
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "vpHeading" },
        { label: "Body", key: "body", kind: "list", target: "vpParagraphs", required: true },
        { label: "Pull quote", key: "pullQuote", kind: "text", target: "vpPullQuote" },
      ],
    },
    {
      id: "credibility2",
      heading: "Credibility 2",
      aliases: ["Credibility Statement (inline)"],
      fields: [
        { label: "Quote", key: "quote", kind: "text", target: "credibilityQuote2" },
        { label: "Attribution", key: "attribution", kind: "text", target: "credibilityAttribution2" },
      ],
    },
    {
      id: "outcomes",
      heading: "Outcomes",
      aliases: ["Outcomes / Desired States"],
      required: true,
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "outcomesHeading" },
        { label: "Subheading", aliases: ["Subtitle"], key: "subheading", kind: "text", target: "outcomesSubheading" },
        { label: "Items", key: "items", kind: "items", itemShape: ["title", "body"], target: "outcomesItems", required: true, count: 6 },
        { label: "Closing line", key: "closing", kind: "text", target: "outcomesClosingText" },
        { label: "CTA microcopy", key: "microcopy", kind: "text", target: "outcomesMicrocopy" },
      ],
    },
    {
      id: "personalMessage",
      heading: "Personal Message",
      aliases: ["Personal Message to Audience", "A note from the host"],
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "personalMessageHeading" },
        { label: "Body", key: "body", kind: "list", target: "personalMessageParagraphs" },
        { label: "Signature", key: "signature", kind: "text", target: "personalMessageSignature" },
      ],
    },
    {
      id: "testimonials",
      heading: "Testimonials",
      aliases: ["Text Testimonials", "Text Testimonials Carousel"],
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "testimonialsHeading" },
        { label: "Items", key: "items", kind: "items", itemShape: ["quote", "name"], target: "testimonialItems", minCount: 1 },
      ],
    },
    {
      id: "encourage2",
      heading: "Encourage 2",
      aliases: ["Encouragement CTA 2"],
      fields: [
        { label: "Text", key: "text", kind: "text", target: "encourageText2" },
      ],
    },
    {
      id: "howItWorks",
      heading: "How It Works",
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "howItWorksHeading" },
        { label: "Body", key: "body", kind: "list", target: "howItWorksParagraphs" },
        { label: "Closing line", key: "closing", kind: "text", target: "howItWorksClosing" },
      ],
    },
    {
      id: "eventOverview",
      heading: "Event Overview",
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "eventOverviewHeading" },
        { label: "Recording note", key: "recordingNote", kind: "text", target: "recordingNote" },
        { label: "Experience heading", key: "experienceHeading", kind: "text", target: "experienceHeading" },
        { label: "Experience items", key: "experienceItems", kind: "items", itemShape: ["title", "body"], target: "experienceItems" },
      ],
    },
    {
      id: "challenges",
      heading: "Challenges",
      aliases: ["This session is built to address things like"],
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "challengeHeading" },
        { label: "Items", key: "items", kind: "list", target: "challengeItems" },
      ],
    },
    {
      id: "credibility3",
      heading: "Credibility 3",
      aliases: ["Credibility Statement (post-overview)"],
      fields: [
        { label: "Quote", key: "quote", kind: "text", target: "credibilityQuote3" },
        { label: "Attribution", key: "attribution", kind: "text", target: "credibilityAttribution3" },
      ],
    },
    {
      id: "extraVp",
      heading: "Extra Value Proposition",
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "extraVpHeading" },
        { label: "Body", key: "body", kind: "list", target: "extraVpParagraphs" },
        { label: "Closing line", key: "closing", kind: "text", target: "extraVpClosing" },
      ],
    },
    {
      id: "encourage3",
      heading: "Encourage 3",
      aliases: ["Encouragement CTA 3"],
      fields: [
        { label: "Text", key: "text", kind: "text", target: "encourageText3" },
      ],
    },
    {
      id: "outcomes2",
      heading: "Outcomes 2",
      aliases: ["Outcomes 2 — Full-Width Icon Grid", "Six things you'll take home"],
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "outcomes2Heading" },
        { label: "Items", key: "items", kind: "items", itemShape: ["title", "body"], target: "outcomes2Items", count: 6 },
      ],
    },
    {
      id: "bio",
      heading: "Bio",
      aliases: ["Bio / About You", "About the host"],
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "bioHeading" },
        { label: "Body", key: "body", kind: "list", target: "bioParagraphs" },
        { label: "Signature", key: "signature", kind: "text", target: "bioSignature" },
      ],
    },
    {
      id: "facilitators",
      heading: "Facilitators",
      aliases: ["Team", "Co-facilitators", "Co-hosts", "Meet the facilitators", "Facilitators & Team"],
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "facilitatorsHeading" },
        { label: "People", aliases: ["Team", "List"], key: "people", kind: "items", itemShape: ["name", "title", "bio"], target: "facilitators" },
      ],
    },
    {
      id: "finalVp",
      heading: "Final Value Proposition",
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "finalVpHeading" },
        { label: "Intro", key: "intro", kind: "text", target: "finalVpIntro" },
        { label: "From/To", key: "fromTo", kind: "items", itemShape: ["from", "to"], target: "finalVpFromTo" },
        { label: "Closing line", key: "closing", kind: "text", target: "finalVpClosing" },
        { label: "CTA microcopy", key: "microcopy", kind: "text", target: "finalVpCtaMicrocopy" },
      ],
    },
    {
      id: "faq",
      heading: "FAQ",
      aliases: ["Frequently Asked Questions"],
      fields: [
        { label: "Items", key: "items", kind: "items", itemShape: ["question", "answer"], target: "faqItems", minCount: 1 },
      ],
    },
    {
      id: "register",
      heading: "Final CTA",
      aliases: ["Footer CTA"],
      fields: [
        { label: "Line", key: "line", kind: "text", target: "finalCtaLine" },
        { label: "CTA", key: "cta", kind: "text", target: "finalCtaText" },
      ],
    },
    {
      id: "ftc",
      heading: "FTC Disclaimer",
      aliases: ["Disclaimer"],
      fields: [
        { label: "Body", key: "body", kind: "text", target: "ftcDisclaimer" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Canonical mapping table — Programme Landing.
//
// Targets are dot-paths into ProgrammeLandingContent. Curriculum weeks, session
// dates, prices and images come from the wizard; only narrative copy is mapped
// here.
// ─────────────────────────────────────────────────────────────────────────────

export const PROGRAMME_LANDING_COPY_SPEC: CopyPageSpec = {
  page: "programmeLanding",
  pageHeading: "Programme Landing Page",
  aliases: ["Programme Landing", "Program Landing Page"],
  sections: [
    {
      id: "progHero",
      heading: "Hero",
      aliases: ["Programme Hero"],
      required: true,
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "heroEyebrow" },
        { label: "Headline", aliases: ["Title"], key: "headline", kind: "text", target: "heroHeadline", required: true },
        { label: "Subheadline", aliases: ["Subtitle"], key: "subheadline", kind: "text", target: "heroSubheadline", required: true },
        { label: "Primary CTA", aliases: ["CTA"], key: "cta", kind: "text", target: "heroCtaText" },
        { label: "Urgency", key: "urgency", kind: "text", target: "heroUrgency" },
      ],
    },
    {
      id: "vision",
      heading: "Vision",
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "visionEyebrow" },
        { label: "Heading", key: "heading", kind: "text", target: "visionHeading" },
        { label: "Items", key: "items", kind: "list", target: "visionItems" },
        { label: "CTA", key: "cta", kind: "text", target: "visionCtaText" },
        { label: "CTA note", key: "ctaNote", kind: "text", target: "visionCtaNote" },
      ],
    },
    {
      id: "alreadyTried",
      heading: "Already Tried",
      aliases: ["What You've Already Tried"],
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "alreadyTriedEyebrow" },
        { label: "Heading", key: "heading", kind: "text", target: "alreadyTriedHeading" },
        { label: "Body", key: "body", kind: "list", target: "alreadyTriedBody" },
        { label: "Tags", key: "tags", kind: "list", target: "alreadyTriedTags" },
      ],
    },
    {
      id: "promise",
      heading: "Promise",
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "promiseHeading" },
        { label: "Body", key: "body", kind: "list", target: "promiseBody" },
        { label: "Bullets", key: "bullets", kind: "list", target: "promiseBullets" },
      ],
    },
    {
      id: "includes",
      heading: "Includes",
      aliases: ["What's Included"],
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "includesEyebrow" },
        { label: "Heading", key: "heading", kind: "text", target: "includesHeading" },
        { label: "Items", key: "items", kind: "items", itemShape: ["title", "description"], target: "includesItems" },
      ],
    },
    {
      id: "session",
      heading: "Session Breakdown",
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "sessionEyebrow" },
        { label: "Heading", key: "heading", kind: "text", target: "sessionHeading" },
      ],
    },
    {
      id: "videoTestimonials",
      heading: "Video Testimonials",
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "videoTestimonialsEyebrow" },
        { label: "Heading", key: "heading", kind: "text", target: "videoTestimonialsHeading" },
      ],
    },
    {
      id: "credibility",
      heading: "Credibility",
      fields: [
        { label: "Quote", key: "quote", kind: "text", target: "credibilityQuote" },
        { label: "Attribution", key: "attribution", kind: "text", target: "credibilityAttribution" },
      ],
    },
    {
      id: "bonuses",
      heading: "Bonuses",
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "bonusesEyebrow" },
        { label: "Heading", key: "heading", kind: "text", target: "bonusesHeading" },
      ],
    },
    {
      id: "outcomes",
      heading: "Outcomes",
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "outcomesEyebrow" },
        { label: "Heading", key: "heading", kind: "text", target: "outcomesHeading" },
        { label: "Body", key: "body", kind: "text", target: "outcomesBody" },
        { label: "Items", key: "items", kind: "items", itemShape: ["before", "after"], target: "outcomesItems" },
        { label: "CTA", key: "cta", kind: "text", target: "outcomesCtaText" },
      ],
    },
    {
      id: "testimonials",
      heading: "Testimonials",
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "testimonialsEyebrow" },
        { label: "Heading", key: "heading", kind: "text", target: "testimonialsHeading" },
      ],
    },
    {
      id: "pricing",
      heading: "Pricing",
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "pricingEyebrow" },
        { label: "Heading", key: "heading", kind: "text", target: "pricingHeading" },
        { label: "Subheading", key: "subheading", kind: "text", target: "pricingSubheading" },
        { label: "Urgency", key: "urgency", kind: "text", target: "pricingUrgency" },
        { label: "CTA", key: "cta", kind: "text", target: "pricingCtaText" },
      ],
    },
    {
      id: "host",
      heading: "Host",
      aliases: ["About the Host", "Bio"],
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "bioEyebrow" },
        { label: "Name", key: "name", kind: "text", target: "bioName" },
        { label: "Body", key: "body", kind: "list", target: "bioParagraphs" },
        { label: "Credentials", key: "credentials", kind: "list", target: "bioCredentials" },
      ],
    },
    {
      id: "facilitators",
      heading: "Facilitators",
      aliases: ["Team", "Co-facilitators", "Co-hosts", "Meet the facilitators", "Facilitators & Team"],
      fields: [
        { label: "Heading", key: "heading", kind: "text", target: "facilitatorsHeading" },
        { label: "People", aliases: ["Team", "List"], key: "people", kind: "items", itemShape: ["name", "title", "bio"], target: "facilitators" },
      ],
    },
    {
      id: "faq",
      heading: "FAQ",
      aliases: ["Frequently Asked Questions"],
      fields: [
        { label: "Eyebrow", key: "eyebrow", kind: "text", target: "faqEyebrow" },
        { label: "Items", key: "items", kind: "items", itemShape: ["question", "answer"], target: "faqItems", minCount: 1 },
      ],
    },
    {
      id: "finalCta",
      heading: "Final CTA",
      fields: [
        { label: "Headline", key: "headline", kind: "text", target: "finalCtaHeadline" },
        { label: "Body", key: "body", kind: "text", target: "finalCtaBody" },
        { label: "CTA", key: "cta", kind: "text", target: "finalCtaText" },
        { label: "Deadline", key: "deadline", kind: "text", target: "finalCtaDeadline" },
      ],
    },
    {
      id: "ftc",
      heading: "FTC Disclaimer",
      aliases: ["Disclaimer"],
      fields: [
        { label: "Body", key: "body", kind: "text", target: "ftcDisclaimer" },
      ],
    },
  ],
};

/** Registry of every page spec the engine understands. */
export const COPY_PAGE_SPECS: Record<CopyDocPageKey, CopyPageSpec | undefined> = {
  eventLanding: EVENT_LANDING_COPY_SPEC,
  programmeLanding: PROGRAMME_LANDING_COPY_SPEC,
};

export function getPageSpec(page: CopyDocPageKey): CopyPageSpec | undefined {
  return COPY_PAGE_SPECS[page];
}
