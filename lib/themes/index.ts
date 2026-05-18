import type {
  ThemeConfig,
  ThemeSlug,
  ThemeContent,
  Host,
  EventInfo,
  ProgramInfo,
  ThemeColors,
  ThemeFonts,
} from "./types";
import { buildContent } from "./defaults";

export type { ThemeConfig, ThemeSlug, ThemeContent } from "./types";

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface ThemeSpec {
  slug: ThemeSlug;
  label: string;
  descriptor: string;
  swatch: string;
  host: Host;
  event: EventInfo;
  program: ProgramInfo;
  fonts: ThemeFonts;
  colors: ThemeColors;
  overrides?: DeepPartial<ThemeContent>;
  figmaStoragePath?: string;
}

function makeTheme(s: ThemeSpec): ThemeConfig {
  const content = buildContent(
    { host: s.host, event: s.event, program: s.program },
    s.overrides,
  );
  return {
    slug: s.slug,
    label: s.label,
    descriptor: s.descriptor,
    swatch: s.swatch,
    host: s.host,
    event: s.event,
    program: s.program,
    fonts: s.fonts,
    colors: s.colors,
    content,
    figmaStoragePath: s.figmaStoragePath,
  };
}

/* ============================================================
   THEME 00 — THRESHOLD (original Lena Hartwell mockup)
   ============================================================ */
const threshold = makeTheme({
  slug: "threshold",
  label: "Threshold",
  descriptor: "Contemplative · Spacious",
  swatch: "#7A4A28",
  figmaStoragePath: "threshold.fig",
  host: {
    name: "Lena Hartwell",
    shortName: "Lena",
    title: "Facilitator of Inner Stillness",
    brand: "Lena Hartwell",
    parentBrand: "Inner Practice Library",
    email: "hello@hartwellstudio.com",
    legalEntity: "Lena Hartwell · Inner Practice Library",
    bookTitle: "The Quiet Path",
    bio: [
      "I am a facilitator. That is the most accurate one-word description of what I do. I work with people who have arrived at a threshold they cannot cross with their existing strategies.",
      "I came to this work the slow way. <strong>Twelve years inside contemplative traditions</strong> — sitting with teachers in monasteries in Thailand, India, and Italy — followed by another decade applying those methods inside organisations: leadership teams, surgical departments, two start-ups, one think tank. I learned that the methods worked, but the language didn't travel. So I rebuilt the language.",
      "The Inner Practice Library is the result. A library of stripped-down, secular, applicable contemplative methods, taught in plain English to people who do real work in the real world. Threshold is the doorway most people use to find the rest of it.",
    ],
    bioImageDescription:
      "Lena Hartwell. Single high-quality portrait. Warm tones, soft directional light. NOT a logo wall.",
    signaturePhrase: "I would be glad to spend four hours with you on October 14. — Lena",
    credentials: [
      "12 years inside contemplative traditions (Thailand, India, Italy)",
      "10+ years applying these methods inside organisations",
      "3,200+ people through live events across four continents",
      "Author of The Quiet Path; quietly read by a small audience",
    ],
  },
  event: {
    name: "Threshold",
    tagline:
      "A live online gathering for those standing at a pivotal turning point — and ready to cross it.",
    date: "October 14, 2026",
    shortDate: "October 14",
    dayOfWeek: "Wednesday",
    time: "9am – 1pm",
    timezone: "Pacific Time",
    duration: "Four hours, with two short breaks",
    platform: "Zoom",
    priceMin: 11,
    priceMax: 111,
    priceDefault: 77,
    pricePresets: [11, 33, 47, 77, 111],
    priceLabel: "Choose your price",
    priceDisplay: "$11 — $111",
    ctaText: "Register Now",
    countdownDays: "23",
    countdownHours: "14",
    countdownMins: "09",
  },
  program: {
    name: "The Presence Collective",
    nameLine1: "The Presence",
    nameLine2: "Collective",
    tagline:
      "Eight weeks of continuous practice for those who crossed the Threshold and want to keep going.",
    durationLabel: "8 weeks",
    sessionsCount: 16,
    startDate: "November 4",
    enrolmentDeadline: "October 31",
    scheduleLine: "Tuesdays & Thursdays · 6pm EST",
    endDate: "January 15",
    fullPrice: 1997,
    fullPriceLabel: "$1,997",
    spreadPerPayment: 749,
    spreadCount: 3,
    spreadTotal: 2247,
    spreadLabel: "3 × $749",
    extendedPerPayment: 197,
    extendedCount: 12,
    extendedTotal: 2364,
    bonusTotalValue: "$791 — yours free",
    enrolCtaText: "Enrol in The Presence Collective",
  },
  fonts: {
    displayFamily: "'Source Serif 4', 'Tiempos Headline', Georgia, serif",
    bodyFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    monoFamily: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
  },
  colors: {
    surfaceCanvas: "#F5F1EA",
    surfaceSunken: "#EDE6DA",
    surfaceRaised: "#FFFFFF",
    surfaceAccent: "#1F2A2A",
    surfaceInverse: "#0F0E0C",
    textPrimary: "#0F0E0C",
    textSecondary: "#3D3A36",
    textTertiary: "#6B665E",
    textInverse: "#F5F1EA",
    textAccent: "#7A4A28",
    accentPrimary: "#7A4A28",
    accentPrimaryHover: "#5C3A20",
    accentPrimaryLight: "#D4A878",
    accentPrimaryHoverLight: "#E8C896",
    accentSecondary: "#3A4A3F",
    accentHighlight: "#D4A878",
    borderSubtle: "#D9D2C5",
    borderStrong: "#0F0E0C",
    success: "#5C7A4F",
  },
});

/* ============================================================
   THEME 01 — WELLNESS / SOMATIC
   Aria Bloom · The Embodied Hour
   ============================================================ */
const wellness = makeTheme({
  slug: "wellness",
  label: "Somatic",
  descriptor: "Body-centred · Gentle",
  swatch: "#C4714D",
  host: {
    name: "Aria Bloom",
    shortName: "Aria",
    title: "Somatic Therapist & Embodiment Coach",
    brand: "Aria Bloom",
    parentBrand: "The Embodiment Studio",
    email: "hello@ariabloom.co",
    legalEntity: "Aria Bloom Wellness Ltd",
    bookTitle: "Coming Home to the Body",
    bio: [
      "Aria Bloom is a certified somatic therapist and embodiment educator with over a decade of practice working with high-sensitivity individuals, survivors of complex trauma, and people who have simply grown tired of living from the neck up.",
      "Her work draws from somatic experiencing, polyvagal theory, and mindful movement — woven together into a gentle, body-first approach that helps people finally feel at home in themselves. Aria leads small-group intensives and speaks internationally on nervous system regulation and somatic presence.",
    ],
    bioImageDescription: "Soft natural light. Aria seated by a window, hands resting in lap. Linen tones, no make-up, slight smile.",
    signaturePhrase: "I would be glad to spend three hours with you on June 22. — Aria",
    credentials: [
      "Certified Somatic Experiencing Practitioner (SEP)",
      "12 years working with nervous-system regulation",
      "Featured in Mindful, Tricycle and Psyche",
      "Author of Coming Home to the Body (2023)",
    ],
  },
  event: {
    name: "The Embodied Hour",
    tagline: "A live online gathering to help you return to your body and feel safe there",
    date: "Sunday, 22 June 2026",
    shortDate: "June 22",
    dayOfWeek: "Sunday",
    time: "10am – 1pm",
    timezone: "Pacific Time",
    duration: "Three hours, with two breath breaks",
    platform: "Zoom",
    priceMin: 11,
    priceMax: 77,
    priceDefault: 33,
    pricePresets: [11, 22, 33, 55, 77],
    priceLabel: "Choose your price",
    priceDisplay: "$11 — $77",
    ctaText: "Reserve a seat",
    countdownDays: "18",
    countdownHours: "06",
    countdownMins: "42",
  },
  program: {
    name: "The Somatic Freedom Collective",
    nameLine1: "The Somatic",
    nameLine2: "Freedom Collective",
    tagline: "An eight-week live journey to regulate your nervous system and reclaim your ease",
    durationLabel: "8 weeks",
    sessionsCount: 16,
    startDate: "July 14",
    enrolmentDeadline: "July 10",
    scheduleLine: "Tuesdays & Thursdays · 5pm PT",
    endDate: "September 4",
    fullPrice: 1497,
    fullPriceLabel: "$1,497",
    spreadPerPayment: 549,
    spreadCount: 3,
    spreadTotal: 1647,
    spreadLabel: "3 × $549",
    extendedPerPayment: 147,
    extendedCount: 12,
    extendedTotal: 1764,
    bonusTotalValue: "$591 — yours free",
    enrolCtaText: "Enrol in The Somatic Freedom Collective",
  },
  fonts: {
    displayFamily: "'Cormorant Garamond', Georgia, serif",
    bodyFamily: "'DM Sans', sans-serif",
    monoFamily: "'JetBrains Mono', monospace",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
  },
  colors: {
    surfaceCanvas: "#F3F7F0",   // sage-tinted cream — clearly green-leaning
    surfaceSunken: "#E5EDDE",   // sage green
    surfaceRaised: "#FFFFFF",
    surfaceAccent: "#2D4A38",   // forest green for dark sections
    surfaceInverse: "#1A3025",  // deep forest hero
    textPrimary: "#182819",     // dark forest green (not warm brown!)
    textSecondary: "#334A3A",
    textTertiary: "#6A8570",
    textInverse: "#F3F7F0",
    textAccent: "#5A8B65",      // sage green
    accentPrimary: "#5A8B65",   // sage green buttons (very different from Threshold terracotta)
    accentPrimaryHover: "#3D6B4A",
    accentPrimaryLight: "#C4714D", // warm terracotta on dark backgrounds
    accentPrimaryHoverLight: "#D88060",
    accentSecondary: "#C4714D",
    accentHighlight: "#C4714D", // terracotta highlight on dark hero
    borderSubtle: "#CCDBC4",
    borderStrong: "#182819",
    success: "#4A7A50",
  },
});

/* ============================================================
   THEME 02 — SACRED (Akashic / mystical)
   ============================================================ */
const sacred = makeTheme({
  slug: "sacred",
  label: "Sacred",
  descriptor: "Mystical · Cosmic",
  swatch: "#3D1A6B",
  host: {
    name: "Selene Voss",
    shortName: "Selene",
    title: "Akashic Records Facilitator & Soul Coach",
    brand: "Selene Voss",
    parentBrand: "The Sacred Records",
    email: "hello@selenevoss.com",
    legalEntity: "Selene Voss LLC",
    bookTitle: "The Records Speak",
    bio: [
      "Selene Voss has spent two decades walking the bridge between ancient wisdom traditions and modern spiritual practice. A certified Akashic Records teacher and soul contract interpreter, she has guided thousands of seekers from across six continents in clearing the karmic patterns that quietly run their lives.",
      "Her work blends the precision of Akashic inquiry with the warmth of embodied ceremony. She is the author of <em>The Records Speak</em> and host of the Soul Contracts Decoded podcast, and she leads retreats from her studio in Sedona.",
    ],
    bioImageDescription: "Candlelit altar in background. Selene in deep eggplant linen, eyes closed, hands at heart.",
    signaturePhrase: "I would be honoured to sit with you on June 14. — Selene",
    credentials: [
      "Certified Akashic Records teacher (12 years)",
      "Author of The Records Speak (Hay House, 2022)",
      "Host of Soul Contracts Decoded — 4M+ downloads",
      "Lead facilitator at Sedona Inner Arts Retreat",
    ],
  },
  event: {
    name: "The Akashic Unfolding",
    tagline: "A live online ceremony to read what your soul has been trying to tell you",
    date: "Saturday, 14 June 2026",
    shortDate: "June 14",
    dayOfWeek: "Saturday",
    time: "11am – 2pm",
    timezone: "Mountain Time",
    duration: "Three hours, with one silent integration break",
    platform: "Zoom",
    priceMin: 22,
    priceMax: 88,
    priceDefault: 44,
    pricePresets: [22, 33, 44, 66, 88],
    priceLabel: "Choose your offering",
    priceDisplay: "$22 — $88",
    ctaText: "Reserve a seat",
    countdownDays: "11",
    countdownHours: "22",
    countdownMins: "08",
  },
  program: {
    name: "Soul Contract Mastery",
    nameLine1: "Soul Contract",
    nameLine2: "Mastery",
    tagline: "An eight-week live training to decode, dissolve, and rewrite your soul's agreements",
    durationLabel: "8 weeks",
    sessionsCount: 16,
    startDate: "July 7",
    enrolmentDeadline: "July 3",
    scheduleLine: "Mondays & Thursdays · 6pm MT",
    endDate: "August 28",
    fullPrice: 1997,
    fullPriceLabel: "$1,997",
    spreadPerPayment: 749,
    spreadCount: 3,
    spreadTotal: 2247,
    spreadLabel: "3 × $749",
    extendedPerPayment: 197,
    extendedCount: 12,
    extendedTotal: 2364,
    bonusTotalValue: "$888 — yours free",
    enrolCtaText: "Enrol in Soul Contract Mastery",
  },
  fonts: {
    displayFamily: "'Playfair Display', Georgia, serif",
    bodyFamily: "'Raleway', sans-serif",
    monoFamily: "'EB Garamond', serif",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Raleway:wght@300;400;500;600&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap",
  },
  colors: {
    surfaceCanvas: "#09060F",   // near-black, deep purple tint — DARK CANVAS
    surfaceSunken: "#060310",   // even darker for sunken sections
    surfaceRaised: "#140D24",   // slightly lighter for cards
    surfaceAccent: "#1A1035",   // dark purple for extra-vp / accent sections
    surfaceInverse: "#1E0A36",  // deep purple hero
    textPrimary: "#EDE8FF",     // lavender white — light on dark
    textSecondary: "#C8B8F0",   // muted lavender
    textTertiary: "#8A7AB8",    // darker muted lavender
    textInverse: "#EDE8FF",     // also light (inverse sections are still dark)
    textAccent: "#D4AF37",      // gold
    accentPrimary: "#9B6FF5",   // amethyst
    accentPrimaryHover: "#7A4FD4",
    accentPrimaryLight: "#D4AF37",  // gold on dark
    accentPrimaryHoverLight: "#E0C050",
    accentSecondary: "#3A2A6A",
    accentHighlight: "#D4AF37", // gold
    borderSubtle: "#2A1E44",    // dark purple border
    borderStrong: "#9B6FF5",    // amethyst border
    success: "#4A9B6A",
  },
  overrides: {
    landing: {
      heroEyebrow: "Live Online Ceremony",
      heroSubtitle:
        "A live online ceremony for those who feel something ancient and patient asking to be heard — and ready to listen.",
      videoHeadline: "Your soul has been speaking. This is the room where you finally hear it.",
      audienceHeadline: "This is for you if your soul has been whispering…",
      audience: [
        { html: "You keep <strong>circling the same lesson</strong> and you sense it isn't accidental.", iconKey: "moon" },
        { html: "A <strong>quiet inner knowing</strong> has been gently insisting for years.", iconKey: "star" },
        { html: "You feel called to do <em>specific</em> work in this lifetime — but the shape keeps slipping.", iconKey: "sun" },
        { html: "The version of you that signed soul contracts at twenty-three has <strong>fulfilled them</strong>.", iconKey: "eye" },
        { html: "You are <strong>done outsourcing</strong> your spiritual authority to teachers, books, and apps.", iconKey: "book" },
        { html: "Something in you is ready to be <em>met</em> — not analysed, not optimised. Met.", iconKey: "circle" },
      ],
      vpHeadline: "Your records are not a mystery. They are a conversation you've been postponing.",
      outcomesHeadline: "What the records will reveal",
      finalVpHeadline: "Before you scroll past this.",
    },
  },
});

/* ============================================================
   THEME 03 — EXECUTIVE / STRATEGIC
   ============================================================ */
const executive = makeTheme({
  slug: "executive",
  label: "Executive",
  descriptor: "Strategic · Authoritative",
  swatch: "#0A1628",
  host: {
    name: "Marcus Ashford",
    shortName: "Marcus",
    title: "Executive Coach & Presence Strategist",
    brand: "Marcus Ashford",
    parentBrand: "Ashford Leadership Partners",
    email: "office@marcusashford.com",
    legalEntity: "Ashford Leadership Partners Ltd",
    bookTitle: "Influence Architecture",
    bio: [
      "Marcus Ashford spent fifteen years in the C-suite at Fortune 500 companies before pivoting to executive coaching. He has worked with senior leaders at Goldman Sachs, McKinsey, and the NHS, helping them close the gap between their performance and their perceived authority.",
      "His evidence-based Influence Architecture framework has been featured in Harvard Business Review, Forbes, and The Financial Times. Marcus works with a select group of high-potential leaders who are ready to operate at the very top of their field.",
    ],
    bioImageDescription: "Black-and-white. Marcus in tailored navy, mid-laugh, hands clasped. Boardroom backdrop.",
    signaturePhrase: "I'll see you in the room on June 19. — Marcus",
    credentials: [
      "15 years C-suite at Fortune 500 organisations",
      "Featured in Harvard Business Review, FT, Forbes",
      "Coached 200+ senior leaders across 14 countries",
      "Founder of Influence Architecture™",
    ],
  },
  event: {
    name: "The Executive Presence Summit",
    tagline: "A live strategy session for leaders who know their value — and want everyone else to know it too",
    date: "Thursday, 19 June 2026",
    shortDate: "June 19",
    dayOfWeek: "Thursday",
    time: "12pm – 2:30pm",
    timezone: "Eastern Time",
    duration: "Two and a half hours, with one strategic break",
    platform: "Zoom",
    priceMin: 47,
    priceMax: 197,
    priceDefault: 97,
    pricePresets: [47, 67, 97, 147, 197],
    priceLabel: "Select your tier",
    priceDisplay: "$47 — $197",
    ctaText: "Hold my seat",
    countdownDays: "17",
    countdownHours: "04",
    countdownMins: "21",
  },
  program: {
    name: "The Influence Architecture",
    nameLine1: "The Influence",
    nameLine2: "Architecture",
    tagline: "A twelve-week intensive for leaders ready to be impossible to ignore",
    durationLabel: "12 weeks",
    sessionsCount: 24,
    startDate: "July 8",
    enrolmentDeadline: "July 1",
    scheduleLine: "Tuesdays & Thursdays · 7am ET",
    endDate: "September 26",
    fullPrice: 4997,
    fullPriceLabel: "$4,997",
    spreadPerPayment: 1799,
    spreadCount: 3,
    spreadTotal: 5397,
    spreadLabel: "3 × $1,799",
    extendedPerPayment: 497,
    extendedCount: 12,
    extendedTotal: 5964,
    bonusTotalValue: "$2,400 — included",
    enrolCtaText: "Enrol in The Influence Architecture",
  },
  fonts: {
    displayFamily: "'Montserrat', Arial, sans-serif",
    bodyFamily: "'Source Sans 3', sans-serif",
    monoFamily: "'Courier Prime', monospace",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Source+Sans+3:wght@300;400;600&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap",
  },
  colors: {
    surfaceCanvas: "#FFFFFF",
    surfaceSunken: "#F4F6F9",
    surfaceRaised: "#FFFFFF",
    surfaceAccent: "#0A1628",
    surfaceInverse: "#060E1A",
    textPrimary: "#0A1628",
    textSecondary: "#2C3E55",
    textTertiary: "#6B7A8C",
    textInverse: "#FFFFFF",
    textAccent: "#0A1628",
    accentPrimary: "#0A1628",
    accentPrimaryHover: "#152840",
    accentPrimaryLight: "#C9A84C",
    accentPrimaryHoverLight: "#DBC070",
    accentSecondary: "#2E6B3E",
    accentHighlight: "#C9A84C",
    borderSubtle: "#D8DEE6",
    borderStrong: "#0A1628",
    success: "#2E6B3E",
  },
  overrides: {
    landing: {
      heroEyebrow: "Live · Invitation Only",
      heroSubtitle:
        "A live strategy session for leaders operating near the top — and quietly aware that the next level is one of presence, not productivity.",
      videoEyebrow: "A briefing from Marcus",
      videoHeadline: "Authority is a system. So is the absence of it.",
      audienceHeadline: "This is for you if…",
      audience: [
        { html: "You are <strong>three promotions in</strong> and the next one is about presence, not output.", iconKey: "compass" },
        { html: "You can outwork the room — and you're starting to suspect <em>that</em> is the ceiling.", iconKey: "arrow" },
        { html: "You've been <strong>brought into the boardroom</strong> but not yet treated as a peer.", iconKey: "circle" },
        { html: "You watch peers with half your substance get heard twice as fast.", iconKey: "eye" },
        { html: "You're considering a <strong>board seat, a CEO role, or your own firm</strong> — and want to walk in at full weight.", iconKey: "step" },
        { html: "You're done being the <em>technically excellent</em> person in the room.", iconKey: "star" },
      ],
      vpHeadline: "Authority is a system. The good news: it's installable.",
      vpParagraphs: [
        "Most leadership ceilings aren't about competence. They are about <em>perceived</em> authority — the half-second judgement other leaders make about whether you belong in the conversation.",
        "<strong>{{event.name}}</strong> is a working session for closing that gap. {{event.duration}}. {{host.shortName}}, a select group of senior operators, and a structured walkthrough of the four levers that move the needle.",
        "You leave with a calibrated plan for the next ninety days. Not theory. Move sequences.",
      ],
      outcomesHeadline: "What you'll walk out with",
      outcomesSubline: "Five operational shifts you can install inside your existing role.",
      finalVpHeadline: "Before you close this tab.",
      finalVpParagraphs: [
        "You're not here because you lack drive. You're here because the next level requires a different shape, not more force.",
        "{{event.name}} is the working session for that shape. {{event.duration}}, with {{host.shortName}} and a select group of senior operators. {{event.date}}. Hold the seat or don't — both are answers.",
      ],
    },
    program: {
      bonusesHeadline: "Three operational bonuses included.",
    },
  },
});

/* ============================================================
   THEME 04 — HIGH PERFORMANCE
   ============================================================ */
const highperf = makeTheme({
  slug: "highperf",
  label: "Peak",
  descriptor: "Data-driven · No-fluff",
  swatch: "#0066FF",
  host: {
    name: "Kai Mercer",
    shortName: "Kai",
    title: "Performance Scientist & Cognitive Edge Coach",
    brand: "Kai Mercer",
    parentBrand: "Mercer Performance Lab",
    email: "ops@kaimercer.io",
    legalEntity: "Mercer Performance Inc",
    bookTitle: "The Cognitive Edge",
    bio: [
      "Kai Mercer is a former neuroscience researcher turned performance coach who works at the intersection of cognitive science, behavioural design, and elite-level execution. His clients include professional athletes, startup founders, and senior operators who want measurable gains in focus, decision quality, and output.",
      "Trained at Johns Hopkins and Stanford's d.school, Kai built the Cognitive Edge framework after studying the performance habits of 400 top-1% performers across sport, business, and the arts. His protocols are evidence-based, radically practical, and built for people who have already tried everything else.",
    ],
    bioImageDescription: "Studio shot. Kai in plain black tee, mid-explanation, hand mid-gesture. Whiteboard with diagrams behind.",
    signaturePhrase: "See you in the lab on June 25. — Kai",
    credentials: [
      "MSc Neuroscience, Johns Hopkins",
      "Behavioural designer trained at Stanford d.school",
      "Coached 400+ top-1% performers across 9 industries",
      "Author of The Cognitive Edge (2024)",
    ],
  },
  event: {
    name: "The Cognitive Edge Lab",
    tagline: "A live protocol session for operators who want their brain to run like a well-tuned system",
    date: "Wednesday, 25 June 2026",
    shortDate: "June 25",
    dayOfWeek: "Wednesday",
    time: "9am – 11am",
    timezone: "Pacific Time",
    duration: "Two hours, one focused block, no fluff",
    platform: "Zoom",
    priceMin: 47,
    priceMax: 197,
    priceDefault: 97,
    pricePresets: [47, 67, 97, 147, 197],
    priceLabel: "Pick a tier",
    priceDisplay: "$47 — $197",
    ctaText: "Lock my seat",
    countdownDays: "23",
    countdownHours: "14",
    countdownMins: "09",
  },
  program: {
    name: "The Peak Protocol",
    nameLine1: "The Peak",
    nameLine2: "Protocol",
    tagline: "A ten-week performance system for founders and operators who want to execute at a different level",
    durationLabel: "10 weeks",
    sessionsCount: 20,
    startDate: "July 15",
    enrolmentDeadline: "July 8",
    scheduleLine: "Tuesdays & Fridays · 7am PT",
    endDate: "September 19",
    fullPrice: 2997,
    fullPriceLabel: "$2,997",
    spreadPerPayment: 1097,
    spreadCount: 3,
    spreadTotal: 3291,
    spreadLabel: "3 × $1,097",
    extendedPerPayment: 297,
    extendedCount: 12,
    extendedTotal: 3564,
    bonusTotalValue: "$1,294 — included",
    enrolCtaText: "Enrol in The Peak Protocol",
  },
  fonts: {
    displayFamily: "'Space Grotesk', sans-serif",
    bodyFamily: "'IBM Plex Sans', sans-serif",
    monoFamily: "'IBM Plex Mono', monospace",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap",
  },
  colors: {
    surfaceCanvas: "#080D17",   // ultra-dark navy — DARK CANVAS
    surfaceSunken: "#050A13",   // even darker
    surfaceRaised: "#0E1525",   // slightly lighter for cards
    surfaceAccent: "#0A1A3A",   // dark blue for accent sections
    surfaceInverse: "#030710",  // near-black hero
    textPrimary: "#E8EEF8",     // cool near-white
    textSecondary: "#A0B0CC",   // muted blue-grey
    textTertiary: "#5A7090",    // darker muted
    textInverse: "#E8EEF8",     // also light
    textAccent: "#00AAFF",      // bright cyan-blue
    accentPrimary: "#0066FF",   // electric blue
    accentPrimaryHover: "#0050CC",
    accentPrimaryLight: "#00FF88",  // neon green on dark
    accentPrimaryHoverLight: "#33FF9E",
    accentSecondary: "#004499",
    accentHighlight: "#00FF88", // neon green
    borderSubtle: "#1A2840",    // dark blue border
    borderStrong: "#0066FF",    // electric blue border
    success: "#00CC6A",
  },
  overrides: {
    landing: {
      heroEyebrow: "Live Lab · 02 Hours",
      heroSubtitle:
        "A live working session for operators who treat their brain as infrastructure — and have decided to stop neglecting it.",
      heroVisualDescription:
        "Schematic-style diagram of cognitive systems on dark background. High-contrast lines, mono numerals.",
      videoEyebrow: "Pre-brief from Kai",
      videoHeadline: "Cognitive edge isn't a talent. It's a stack.",
      videoCaption: "A two-minute pre-brief from Kai.",
      audienceHeadline: "This is for you if…",
      audience: [
        { html: "You have <strong>built or are building</strong> something that depends on your cognitive output.", iconKey: "arrow" },
        { html: "You've measured your sleep, HRV, and time-blocks and still feel you're <em>leaking IQ</em>.", iconKey: "eye" },
        { html: "You've read the books, tried the apps, and you want <strong>a stack, not another habit</strong>.", iconKey: "compass" },
        { html: "Your decisions matter — and you want them coming from <strong>a clearer signal</strong>.", iconKey: "star" },
        { html: "You're done with productivity content that confuses motion for output.", iconKey: "ritual" },
        { html: "You want a <em>system</em> for the part of you that has to keep showing up at full capacity.", iconKey: "step" },
      ],
      vpHeadline: "Performance is a stack. You're missing two layers.",
      vpParagraphs: [
        "Most performance content optimises a single variable in isolation — sleep, focus, time-blocking — and ignores the system the variables are wired into.",
        "<strong>{{event.name}}</strong> is a working session for installing the missing layers. {{event.duration}}. {{host.shortName}}, a small live cohort, and a structured walkthrough of the four-tier protocol used by the operators in his coaching practice.",
        "You leave with a stack you can run on Monday. Not theory. Code you ship.",
      ],
      outcomesHeadline: "What you ship from the session",
      outcomesSubline: "Six concrete deliverables you'll have written by the end of {{event.duration}}.",
      outcomes: [
        { strong: "A diagnosed bottleneck", rest: "— a single specific leak in your current performance stack.", iconKey: "compass" },
        { strong: "Your morning protocol v1", rest: "— a 25-minute opening sequence built around your actual schedule.", iconKey: "ritual" },
        { strong: "A focus window template", rest: "— a 90-minute block structure you can ship Monday.", iconKey: "step" },
        { strong: "A weekly review system", rest: "— installed live, with the four prompts that catch leaks early.", iconKey: "arrow" },
        { strong: "A decision protocol", rest: "for the next three high-stakes calls you have on your calendar.", iconKey: "star" },
        { strong: "A measurable baseline", rest: "to test your stack against over the next ninety days.", iconKey: "journal" },
      ],
      faq: [
        {
          q: "Will I need any hardware?",
          a: "No. Some participants use HRV monitors, sleep trackers, etc. — useful but not required. The protocols work with paper and a phone.",
        },
        {
          q: "Is this 'biohacking'?",
          a: "No. It's evidence-based cognitive systems design. We work with sleep architecture, attention windows, decision quality, and behaviour scaffolding. No supplements, no shortcuts.",
        },
        {
          q: "Will the recording be released?",
          a: "Yes — within 24 hours. Lifetime access in your portal. The session is designed to be re-walked.",
        },
        {
          q: "How interactive is it?",
          a: "Cameras-optional. Voice or chat. You'll do work in the session, not just consume content. Plan to have a notebook (or doc) open.",
        },
        {
          q: "Tier pricing?",
          a: "Pick the tier that reflects what the work is worth to you. Higher tiers help us reserve free seats for operators between roles.",
        },
        {
          q: "Refund policy?",
          a: "Attend live. If it doesn't deliver, write within 7 days. Full refund, no friction.",
        },
      ],
    },
  },
});

/* ============================================================
   THEME 05 — ABUNDANCE
   ============================================================ */
const abundance = makeTheme({
  slug: "abundance",
  label: "Abundance",
  descriptor: "Heart-centred · Prosperity",
  swatch: "#B76E79",
  host: {
    name: "Zoe Tanaka",
    shortName: "Zoe",
    title: "Spiritual Business Mentor & Abundance Activator",
    brand: "Zoe Tanaka",
    parentBrand: "Quantum Business Studio",
    email: "hello@zoetanaka.com",
    legalEntity: "Zoe Tanaka International Ltd",
    bookTitle: "The Abundance Field",
    bio: [
      "Zoe Tanaka is a spiritual business mentor who blends quantum principles, energy psychology, and modern marketing strategy to help purpose-driven coaches and creatives attract aligned clients and income — without burning out or compromising their soul.",
      "After building her own seven-figure business from a bedroom studio in Kyoto, Zoe now runs the Quantum Business Expansion container and hosts the Abundance Field podcast, which has been downloaded over three million times. She believes that financial sovereignty and spiritual depth are not opposites — they are partners.",
    ],
    bioImageDescription: "Warm-toned portrait. Zoe in cream silk, golden light through window, knowing smile.",
    signaturePhrase: "I can't wait to receive with you on June 27. — Zoe",
    credentials: [
      "Built a seven-figure business from a Kyoto studio",
      "Host of Abundance Field — 3M+ downloads",
      "Trained 8,000+ coaches & creatives in 6 years",
      "Featured in Forbes, Entrepreneur, Mind Body Green",
    ],
  },
  event: {
    name: "The Abundance Activation",
    tagline: "A live energetic transmission and business strategy session for purpose-led women ready to receive more",
    date: "Friday, 27 June 2026",
    shortDate: "June 27",
    dayOfWeek: "Friday",
    time: "2pm – 5pm",
    timezone: "Eastern Time",
    duration: "Three hours, with energetic resets throughout",
    platform: "Zoom",
    priceMin: 22,
    priceMax: 111,
    priceDefault: 44,
    pricePresets: [22, 33, 44, 77, 111],
    priceLabel: "Choose your exchange",
    priceDisplay: "$22 — $111",
    ctaText: "Reserve a seat",
    countdownDays: "25",
    countdownHours: "11",
    countdownMins: "33",
  },
  program: {
    name: "Quantum Business Expansion",
    nameLine1: "Quantum",
    nameLine2: "Business Expansion",
    tagline: "A nine-week live immersion in aligned marketing, energetic selling, and sacred receivership",
    durationLabel: "9 weeks",
    sessionsCount: 18,
    startDate: "July 18",
    enrolmentDeadline: "July 14",
    scheduleLine: "Mondays & Wednesdays · 1pm ET",
    endDate: "September 17",
    fullPrice: 2222,
    fullPriceLabel: "$2,222",
    spreadPerPayment: 797,
    spreadCount: 3,
    spreadTotal: 2391,
    spreadLabel: "3 × $797",
    extendedPerPayment: 222,
    extendedCount: 12,
    extendedTotal: 2664,
    bonusTotalValue: "$888 — included",
    enrolCtaText: "Enrol in Quantum Business Expansion",
  },
  fonts: {
    displayFamily: "'Libre Baskerville', Georgia, serif",
    bodyFamily: "'Nunito', sans-serif",
    monoFamily: "'Cinzel', serif",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;500;600&family=Cinzel:wght@400;600&display=swap",
  },
  colors: {
    surfaceCanvas: "#FDF0EE",   // blush ivory — warm pink-leaning
    surfaceSunken: "#F5DCE0",   // deeper blush
    surfaceRaised: "#FFFFFF",
    surfaceAccent: "#3A0F1F",   // deep plum for dark sections
    surfaceInverse: "#28081A",  // very deep plum hero
    textPrimary: "#2A0F1C",     // deep plum text
    textSecondary: "#5C2A3A",
    textTertiary: "#8A6070",
    textInverse: "#FDF0EE",     // blush on dark
    textAccent: "#C0516A",      // vivid rose
    accentPrimary: "#C0516A",   // vivid rose buttons
    accentPrimaryHover: "#9B3A52",
    accentPrimaryLight: "#E8C090",   // champagne on dark
    accentPrimaryHoverLight: "#F0D0A8",
    accentSecondary: "#7A9E7E",
    accentHighlight: "#E8C090", // champagne
    borderSubtle: "#F0C8D0",    // blush pink border
    borderStrong: "#2A0F1C",
    success: "#6B9E7A",
  },
  overrides: {
    landing: {
      heroEyebrow: "Live Transmission",
      heroSubtitle:
        "A live energetic transmission and strategy session for the woman who is ready to stop performing scarcity and start receiving in proportion to her gifts.",
      videoEyebrow: "A love note from Zoe",
      videoHeadline: "Your next income level is an energetic agreement, not a tactic.",
      audienceHeadline: "This is for you if…",
      audience: [
        { html: "You're doing the <strong>spiritual work</strong> and the business work — and they keep contradicting each other.", iconKey: "moon" },
        { html: "You have a <strong>gift the world is asking for</strong> — and you keep undercharging for it.", iconKey: "star" },
        { html: "You've capped at the <em>same income level</em> for two years and you know it's not strategy.", iconKey: "compass" },
        { html: "You're tired of <strong>masculine selling tactics</strong> that work but feel like a slow soul-leak.", iconKey: "circle" },
        { html: "You want to <em>receive in proportion</em> to what you actually give.", iconKey: "ritual" },
        { html: "You're ready to <strong>step into a wealth frequency</strong> your nervous system has been quietly avoiding.", iconKey: "sun" },
      ],
      vpHeadline: "Your next income level is an energetic agreement. The good news: it's available now.",
      outcomesHeadline: "What you'll receive",
      finalVpHeadline: "Before you close this beautiful tab.",
    },
  },
});

/* ============================================================
   THEME 06 — EARTH / ANCESTRAL
   ============================================================ */
const earth = makeTheme({
  slug: "earth",
  label: "Earth",
  descriptor: "Ancestral · Ceremonial",
  swatch: "#1A3A2A",
  host: {
    name: "River Stone",
    shortName: "River",
    title: "Shamanic Practitioner & Ancestral Wisdom Keeper",
    brand: "River Stone",
    parentBrand: "Ancestral Wisdom School",
    email: "circle@riverstone.earth",
    legalEntity: "River Stone Ancestral Arts",
    bookTitle: "The Line That Runs Through You",
    bio: [
      "River Stone has walked the shamanic path for over twenty years, trained in the lineages of the Andean Q'ero tradition, Celtic earth medicine, and West African ancestral practice. They work with individuals and communities who feel the call to heal not just themselves, but the line that runs through them.",
      "River is the founder of the Ancestral Wisdom School and host of the annual Medicine Circle Gathering, which draws hundreds of participants from across the globe each year. Their work is grounded, unhurried, and rooted in the belief that the earth itself is our greatest teacher.",
    ],
    bioImageDescription: "Outdoor. River in earth-toned wool wrap, standing barefoot on moss, hand on tree.",
    signaturePhrase: "I'll meet you at the fire on June 21. — River",
    credentials: [
      "20+ years walking the shamanic path",
      "Trained in Q'ero, Celtic, and West African lineages",
      "Founder of the Ancestral Wisdom School",
      "Lead facilitator of the annual Medicine Circle Gathering",
    ],
  },
  event: {
    name: "The Medicine Circle Gathering",
    tagline: "A live online ceremony to reconnect with ancestral wisdom and the earth beneath your feet",
    date: "Saturday, 21 June 2026",
    shortDate: "June 21",
    dayOfWeek: "Saturday",
    time: "8am – 12pm",
    timezone: "Mountain Time",
    duration: "Four hours, walked in three medicine rounds",
    platform: "Zoom",
    priceMin: 22,
    priceMax: 99,
    priceDefault: 44,
    pricePresets: [22, 33, 44, 66, 99],
    priceLabel: "Choose your offering",
    priceDisplay: "$22 — $99",
    ctaText: "Hold a seat at the fire",
    countdownDays: "19",
    countdownHours: "08",
    countdownMins: "44",
  },
  program: {
    name: "The Ancestral Wisdom Path",
    nameLine1: "The Ancestral",
    nameLine2: "Wisdom Path",
    tagline: "A twelve-week ceremonial journey to heal your lineage and reclaim your power",
    durationLabel: "12 weeks",
    sessionsCount: 24,
    startDate: "July 12",
    enrolmentDeadline: "July 5",
    scheduleLine: "Sundays & Wednesdays · 7pm MT",
    endDate: "October 4",
    fullPrice: 1777,
    fullPriceLabel: "$1,777",
    spreadPerPayment: 649,
    spreadCount: 3,
    spreadTotal: 1947,
    spreadLabel: "3 × $649",
    extendedPerPayment: 177,
    extendedCount: 12,
    extendedTotal: 2124,
    bonusTotalValue: "$666 — yours free",
    enrolCtaText: "Walk the Ancestral Wisdom Path",
  },
  fonts: {
    displayFamily: "'Josefin Sans', sans-serif",
    bodyFamily: "'Merriweather', Georgia, serif",
    monoFamily: "'Josefin Sans', sans-serif",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap",
  },
  colors: {
    surfaceCanvas: "#F2EDD7",
    surfaceSunken: "#E4DCC0",
    surfaceRaised: "#FBF8E8",
    surfaceAccent: "#1F3025",
    surfaceInverse: "#0F2018",
    textPrimary: "#1A1208",
    textSecondary: "#3D2E1A",
    textTertiary: "#6B5A3D",
    textInverse: "#F2EDD7",
    textAccent: "#1A3A2A",
    accentPrimary: "#1A3A2A",
    accentPrimaryHover: "#0F2A1C",
    accentPrimaryLight: "#C4891A",
    accentPrimaryHoverLight: "#DBA033",
    accentSecondary: "#A85E3A",
    accentHighlight: "#C4891A",
    borderSubtle: "#D6CCA8",
    borderStrong: "#1A1208",
    success: "#3D6E45",
  },
  overrides: {
    landing: {
      heroEyebrow: "Live Online Ceremony",
      heroSubtitle:
        "A live online ceremony for those who feel the line that runs through them asking for tending — and who are ready to listen.",
      videoEyebrow: "From the fire — a word from River",
      videoHeadline: "Your ancestors are not behind you. They are with you. Right now.",
      audienceHeadline: "This is for you if…",
      audience: [
        { html: "You feel the <strong>lineage you came from</strong> moving in your body — and want to tend it consciously.", iconKey: "moon" },
        { html: "You sense an <strong>old grief</strong> that isn't quite yours — and you're ready to give it back.", iconKey: "circle" },
        { html: "You have been <strong>given gifts</strong> by people you never met, and want to receive them properly.", iconKey: "star" },
        { html: "You feel the <strong>earth's tempo</strong> is different to the one you've been keeping.", iconKey: "ritual" },
        { html: "You want a <em>quiet, grounded</em> way to walk this season — not another optimised one.", iconKey: "step" },
        { html: "You are ready to <strong>sit at a fire</strong> instead of scrolling past one.", iconKey: "sun" },
      ],
      vpHeadline: "You are not the start of this story. You are the part of it that's currently breathing.",
      outcomesHeadline: "What you'll carry home from the fire",
      finalVpHeadline: "Before you close this page.",
    },
  },
});

/* ============================================================ */
export const THEMES: Record<ThemeSlug, ThemeConfig> = {
  threshold,
  wellness,
  sacred,
  executive,
  highperf,
  abundance,
  earth,
};

export const THEME_SLUGS = Object.keys(THEMES) as ThemeSlug[];
export const THEME_LIST = Object.values(THEMES);

export function getTheme(slug: string): ThemeConfig | null {
  return THEMES[slug as ThemeSlug] ?? null;
}
