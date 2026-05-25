/**
 * Default content blocks for every theme — exact section-for-section mirror
 * of the Threshold mockup (mockup/*.html). Strings contain {{tokens}} that
 * are substituted from each theme's host / event / program meta.
 *
 * Tokens available everywhere:
 *   {{host.name}} {{host.shortName}} {{host.title}} {{host.brand}}
 *   {{event.name}} {{event.tagline}} {{event.date}} {{event.shortDate}}
 *   {{event.dayOfWeek}} {{event.time}} {{event.timezone}} {{event.duration}}
 *   {{event.platform}} {{event.priceDisplay}}
 *   {{program.name}} {{program.nameLine1}} {{program.nameLine2}}
 *   {{program.startDate}} {{program.fullPriceLabel}} {{program.spreadLabel}}
 *   {{program.durationLabel}} {{program.sessionsCount}}
 */

import type {
  ThemeContent,
  Host,
  EventInfo,
  ProgramInfo,
} from "./types";

export interface TokenContext {
  host: Host;
  event: EventInfo;
  program: ProgramInfo;
}

const TOKEN_RE = /\{\{([\w.]+)\}\}/g;

export function applyTokens(input: string, ctx: TokenContext): string {
  return input.replace(TOKEN_RE, (_, path) => {
    const parts = path.split(".");
    let v: unknown = ctx;
    for (const p of parts) {
      if (v && typeof v === "object" && p in (v as Record<string, unknown>)) {
        v = (v as Record<string, unknown>)[p];
      } else {
        return "";
      }
    }
    return String(v ?? "");
  });
}

export function tokeniseDeep<T>(value: T, ctx: TokenContext): T {
  if (typeof value === "string") return applyTokens(value, ctx) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => tokeniseDeep(v, ctx)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>)) {
      out[k] = tokeniseDeep((value as Record<string, unknown>)[k], ctx);
    }
    return out as T;
  }
  return value;
}

/* ============================================================
   BASE CONTENT — structural defaults for every theme.
   Identical layout to Threshold mockup. Personalises via tokens.
   ============================================================ */
export const BASE_CONTENT: ThemeContent = {
  landing: {
    heroEyebrow: "LIVE ONLINE",
    heroSubtitle:
      "A live online gathering for those standing at a pivotal turning point — and ready to cross it.",
    heroHostBadge:
      "<div class=\"hero-host-name\">With <strong>{{host.name}}</strong></div><span class=\"hero-host-title\">{{host.title}}</span>",
    heroPriceLabel: "Choose your price",
    heroPriceValue: "{{event.priceDisplay}}",
    heroCtaMicrocopy: "No prerequisites · Recording included",
    heroVisualDescription:
      "Atmospheric. Mountain ridge at dawn. Single small figure for cinematic scale. Film grain 8%, deep vignette.",

    credibilityHero: {
      quote:
        "The clearest four hours I've spent with myself in a decade. I came in scattered. I left knowing the next move.",
      name: "Adaeze O.",
      location: "Lagos",
    },

    videoEyebrow: "A note from {{host.shortName}}",
    videoHeadline: "The threshold is not a place. It is a quality of attention.",
    videoCaption: "A two-minute invitation from {{host.shortName}}.",

    asSeenOnEyebrow: "As featured in",
    pressLogos: [
      { name: "The Atlantic" },
      { name: "Tedx", variant: "style-2" },
      { name: "Psyche" },
      { name: "/Tricycle", variant: "style-3" },
      { name: "Forbes", variant: "style-2" },
      { name: "Mindful" },
    ],

    audienceEyebrow: "For whom this is built",
    audienceHeadline: "This is for you if…",
    audience: [
      { html: "You are at the <strong>edge of a decision</strong> that everyone around you wants to make for you.", iconKey: "sun" },
      { html: "You feel <strong>the old version of your life</strong> dissolving — and the new one hasn't arrived yet.", iconKey: "moon" },
      { html: "You've been told you're \"doing well\" but a quieter voice keeps saying, <em>something has to change</em>.", iconKey: "eye" },
      { html: "You've been <strong>collecting frameworks and practices</strong> for years, and you sense it is time to actually live one.", iconKey: "book" },
      { html: "You are tired of advice. You want <strong>a clean encounter with your own knowing</strong>.", iconKey: "star" },
      { html: "You've reached the natural end of a chapter and refuse to begin the next one <strong>on autopilot</strong>.", iconKey: "clock" },
    ],
    audienceClose: "Now is your time to step over the line, not around it.",
    audienceCtaMicrocopy: "Some thresholds are crossed alone. This one isn't.",

    encourageDarkLine: "Some thresholds are crossed alone. This one isn't.",
    encourageAccentLine: "Stay with what wants to move in you. {{host.shortName}} will hold the rest.",
    encourageSunkenLine: "{{event.duration}}. One room. One decision held in better light.",
    encourageFinalLine: "Doors close when the room fills.",

    vpEyebrow: "The premise",
    vpHeadline: "You don't need more information. You need a different room.",
    vpParagraphs: [
      "Most plateaus aren't really plateaus. They're the place where the cost of changing has finally become smaller than the cost of staying. The trouble is, that calculation happens in <em>conditions</em> — not in a podcast.",
      "<strong>{{event.name}}</strong> is the room in which the calculation can be made. {{event.duration}}. {{host.shortName}}, a small live group, and a structure designed to let the truth surface without coercion.",
      "What you do with it is yours. But by the end of the session, you will know what wants to happen next.",
    ],
    vpPullQuote: "The threshold is not a place. It is a quality of attention.",
    vpImageDescription:
      "Single still object — open book, cup, single window — soft natural light, asymmetric composition.",

    credibilityInline: {
      quote:
        "I expected another wellness webinar. I got the room I should have walked into ten years ago.",
      name: "Jonas R.",
      location: "Berlin",
    },

    outcomesEyebrow: "Outcomes",
    outcomesHeadline: "What you'll experience",
    outcomesSubline:
      "Six distinct shifts that typically begin during the live session and continue in the days after.",
    outcomes: [
      { strong: "A clean reading", rest: "of what is actually in motion in your life — without the noise of advice or expectation.", iconKey: "compass" },
      { strong: "Permission to drop", rest: "the explanation, the management, the strategy. For four hours, you don't have to perform.", iconKey: "feather" },
      { strong: "A direct experience", rest: "of the kind of stillness that can hold a serious question without flinching.", iconKey: "stillness" },
      { strong: "Specific clarity", rest: "on one — sometimes two — moves your next chapter is asking of you.", iconKey: "arrow" },
      { strong: "A practice you keep", rest: "— a short daily ritual you can carry into the rest of your year, not just the rest of the week.", iconKey: "ritual" },
      { strong: "Witnesses", rest: "— a small group of people who know what you decided. Quiet accountability you didn't have yesterday.", iconKey: "circle" },
    ],
    outcomesImageDescription:
      "Single hand resting on a stone, or shadow across raw linen. Texture-led, no people's faces.",
    outcomesClose:
      "The work isn't to add more. The work is to clear the line of sight.",
    outcomesMicrocopy:
      "You can keep building on top of confusion, or you can spend {{event.duration}} clearing it.",

    personalMessageHeadline: "A note from {{host.shortName}}",
    personalMessage: [
      "I built this gathering for the version of myself I was at thirty-eight. Successful enough on paper. Quietly disoriented. Surrounded by advice, hungry for stillness.",
      "What I needed wasn't another framework. I needed a room where the question I was avoiding could finally land — and where someone trusted me enough not to rush me past it.",
      "That is the room I keep building, and {{event.name}} is the cleanest version of it I've ever taught. If anything you've read here feels like a small <em>yes</em> in the chest, that is enough information.",
    ],
    personalMessageSignature: "— {{host.name}}",

    testimonialsEyebrow: "In their words",
    testimonialsHeadline: "What past participants have said",
    testimonials: [
      {
        headline: "I stopped trying to optimise the wrong life",
        quote:
          "I came in with a five-year plan that no longer fit me. By the end of the session I had crossed out half of it and circled the part that was actually mine.",
        name: "Maya T.",
        location: "Toronto",
      },
      {
        headline: "The first event I've recommended to people I love",
        quote:
          "It's rare to leave an online gathering feeling more like yourself, not less. {{host.shortName}} holds the room with extraordinary precision and care.",
        name: "Daniel A.",
        location: "Cape Town",
      },
      {
        headline: "Four hours that lasted six months",
        quote:
          "I'm still drawing on what came up in that session. It re-organised something I didn't know was tangled.",
        name: "Priya N.",
        location: "London",
      },
    ],

    howHeadline: "How {{event.duration}} actually moves you.",
    howParagraphs: [
      "We begin by lowering the noise. {{host.shortName}} opens with a short framing, then a guided arrival that brings you out of execution-mode and into the kind of attention this work requires.",
      "From there, we move through three distinct passes — first naming what's actually in motion, then meeting the part of you that has been hesitating, then writing a single clear next move you can take this week.",
      "There is room to speak, room to listen, and space to be silent. You will be supported, but never pressured. This is a room for serious adults asking serious questions.",
    ],
    howClosing:
      "By the end, you will not have a perfect plan. You will have something better — a clean signal.",

    overviewHeadline: "Event Overview",
    overviewExperienceTitle: "What you'll experience",
    overviewExperience: [
      { strong: "Live online · {{event.platform}}", body: "{{event.dayOfWeek}}, {{event.time}} {{event.timezone}} · Cameras on or off — your call.", iconKey: "video" },
      { strong: "Small live group", body: "Capped at a size that keeps the room intimate — every participant is held.", iconKey: "group" },
      { strong: "Lifetime replay", body: "The recording is yours. Re-walk the threshold whenever you need it.", iconKey: "rewind" },
      { strong: "A written companion", body: "A short PDF arrives 24 hours before — an arrival ritual and one quiet question to bring with you.", iconKey: "paper" },
    ],
    overviewChallengesTitle: "This session is built to address things like",
    overviewChallenges: [
      "A career chapter that has quietly closed but you haven't named yet.",
      "A relationship asking for a more honest configuration.",
      "A creative project that has been in the wings for three years.",
      "The growing sense that your time is finite — and you've been spending it absent-mindedly.",
      "An identity you have outgrown but keep performing.",
      "The fear that if you stop moving, you'll lose the thing you've built.",
      "A clear inner voice you've been calling \"just a feeling\".",
      "The reckoning between who you said you'd be and who you're being.",
    ],

    credibilityOverview: {
      quote:
        "I've taken every retreat, course and intensive you can name. This is the first one in years where I felt something actually shift, instead of being entertained.",
      name: "Lakshmi V.",
      location: "Bangalore",
    },

    extraVpHeadline: "Why this works.",
    extraVpParagraphs: [
      "Most modern personal development is built on the wrong assumption — that the missing ingredient is information. Insight. A better framework. One more book.",
      "The missing ingredient is almost never information. It is <strong>conditions</strong>. The conditions to think clearly, feel honestly, and choose deliberately. That is what {{event.name}} is engineered to create.",
      "{{host.shortName}} holds the room so that you don't have to. Your job, for {{event.duration}}, is to be present to your own life.",
    ],
    extraVpClosing: "The rest follows.",

    outcomesGridEyebrow: "What you take home",
    outcomesGridHeadline: "Six durable shifts",
    outcomesGrid: [
      { title: "A named threshold", body: "You will know — precisely — what doorway you are standing in front of.", iconKey: "door" },
      { title: "A clear next move", body: "One specific action that comes from you, not from anyone's strategy.", iconKey: "step" },
      { title: "A practice you actually keep", body: "A short daily ritual that fits the life you are walking into.", iconKey: "ritual" },
      { title: "Permission", body: "Internal permission to stop optimising the wrong thing.", iconKey: "release" },
      { title: "A short written record", body: "Your own words for what shifted — to come back to in three months.", iconKey: "journal" },
      { title: "Witnesses", body: "A small group of adults who know what you decided. Quiet, durable accountability.", iconKey: "circle" },
    ],

    bioEyebrow: "About the host",
    bioHeadline: "About {{host.shortName}}",

    finalVpHeadline: "Before you close this tab.",
    finalVpParagraphs: [
      "You came here looking for something. Not more information — you have too much of that. Probably not another framework either.",
      "You came looking for a room that will treat your life as serious work. {{event.name}} is that room. {{event.duration}}, {{event.dayOfWeek}}, with {{host.shortName}} and a small live group of people who have decided the next chapter starts with attention, not advice.",
    ],
    fromTo: [
      { from: "Endless input.", to: "One clean decision." },
      { from: "Borrowed strategy.", to: "Your own knowing." },
      { from: "Performed forward motion.", to: "Deliberate next steps." },
      { from: "Spinning quietly.", to: "Crossing the threshold." },
    ],
    finalVpMicrocopy:
      "You can wait for the moment to be right, or you can build the moment.",

    faq: [
      {
        q: "What if I can't make it live?",
        a: "The full recording is yours within 24 hours of the session, alongside the written companion. Many participants attend live and then re-walk the recording in the weeks after — it's built to hold a second pass.",
      },
      {
        q: "Is this therapy?",
        a: "No. {{event.name}} is a facilitated gathering, not clinical care. It's intentionally designed for adults navigating ordinary turning points with clarity and seriousness. If you're in acute crisis, please reach out to a qualified therapist first.",
      },
      {
        q: "How interactive is it?",
        a: "You can choose. Cameras on or off, voice or chat. There are moments of guided reflection, moments of small-group conversation, and quiet stretches. You'll never be put on the spot.",
      },
      {
        q: "Will I leave with a plan?",
        a: "You'll leave with something more useful than a plan — a clear signal. One or two specific moves your next chapter is asking of you, written in your own words.",
      },
      {
        q: "What's the price thing about?",
        a: "{{event.name}} is offered on a chosen-price basis between {{event.priceDisplay}}. Pay what feels honest. Higher contributions help me hold a few free seats for people who can't pay this season.",
      },
      {
        q: "Do you offer refunds?",
        a: "Yes — if you attend live and the session doesn't deliver what's described here, write to me within 7 days and I'll refund you in full, no questions.",
      },
    ],
    ftcParagraphs: [
      "Results are not guaranteed. {{event.name}} is an educational and reflective event delivered by {{host.legalEntity}}. Testimonials are the personal experience of past participants and do not represent typical outcomes.",
      "By registering you agree to our terms and privacy policy. Refunds are honoured under the conditions described in the FAQ.",
    ],
  },

  /* ============================== */
  checkout: {
    priceCardTitle: "Choose your price",
    priceCardDescription:
      "Pay any amount you like — what feels honest. Higher contributions help {{host.shortName}} hold a few free seats for people who can't pay this season.",
    priceCardHint: "Minimum reflects a sustainable floor · Full price reflects the work's value",
    orderItemDescription: "{{event.name}} — Live Online Gathering",
    orderItemSubtitle: "{{event.date}} · With {{host.name}}",
    salesEventTagline: "{{event.tagline}}",
    salesPriceDescriptor: "pay what feels right",
    salesBenefits: [
      { title: "Live with {{host.shortName}}", rest: "for {{event.duration}} — {{event.dayOfWeek}}, {{event.time}} {{event.timezone}}." },
      { title: "Small group format", rest: "— intimate enough that the room is held, large enough to feel a real container." },
      { title: "Lifetime recording", rest: "— re-walk the threshold whenever you need it." },
      { title: "Arrival companion (PDF)", rest: "— delivered 24h ahead with one quiet question to bring." },
      { title: "Cameras-optional", rest: "— show up the way you need to. Chat or voice. You set the pace." },
      { title: "Full refund window", rest: "— if it doesn't deliver, write within 7 days. No friction." },
    ],
    ftcParagraph:
      "{{event.name}} is delivered by {{host.legalEntity}}. Results vary by participant. By completing this purchase you agree to our terms of service and privacy policy.",
  },

  /* ============================== */
  upsell: {
    bundleName: "The Practitioner Bundle",
    bundleEyebrow: "One-time offer · Step 2 of 2",
    bundleHeadline: "Add the practitioner bundle to take the work further.",
    bundleDescription:
      "Three short companion experiences designed to extend what begins in {{event.name}} into your daily and weekly practice. Available only on this page, only right now.",
    includedTitle: "What's in the bundle",
    bundleItems: [
      {
        title: "The 30-Day Threshold Journal (PDF)",
        description:
          "A printable companion with one written prompt per morning. Built to keep the inner conversation alive in the month after the gathering.",
        iconKey: "journal",
      },
      {
        title: "Three guided audio practices",
        description:
          "Twelve-, eighteen- and twenty-five-minute somatic-meditative recordings to deepen the state {{host.shortName}} opens during {{event.name}}.",
        iconKey: "audio",
      },
      {
        title: "Private Q&A replay library",
        description:
          "A curated archive of past live Q&A sessions with {{host.shortName}}, edited into short, searchable answers to common threshold questions.",
        iconKey: "library",
      },
    ],
    testimonial: {
      quote:
        "The bundle is what made the work stick. Three months later I'm still using the morning prompts — they've quietly rewired how I begin every day.",
      name: "Cara D.",
      location: "Edinburgh",
      context: "Past participant · {{event.name}} attendee",
    },
    priceWas: "$297",
    priceNow: "$97",
    priceSaving: "Save $200 — today only",
    priceNote: "This offer is available once. If you decline, it will not return at this price.",
    yesCta: "Yes — add the bundle for $97",
    yesCtaSub: "Secure checkout · Lifetime access",
    noCta: "No thanks, just take me to my confirmation",
    confirmBannerText:
      "Your seat for {{event.name}} on {{event.shortDate}} is confirmed. This page is a one-time companion offer.",
  },

  /* ============================== */
  thankYou: {
    headline: "You're in.",
    eventNameLine: "{{event.name}} — with {{host.name}}",
    eventDetails: [
      "{{event.date}}",
      "{{event.dayOfWeek}} {{event.time}} {{event.timezone}}",
      "Live Online · {{event.platform}}",
    ],
    emailNote:
      "A confirmation email is on its way. If it doesn't arrive within ten minutes, please check your spam folder or write to us at {{host.email}}.",
    nextStepsLabel: "What happens next",
    nextSteps: [
      {
        title: "Check your inbox",
        body: "Your confirmation and {{event.platform}} link are on their way — usually within five minutes.",
        tag: "Within 10 min",
        tagIconKey: "mail",
      },
      {
        title: "Add the session to your calendar",
        body: "Use the calendar links below to block the time. The room opens 15 minutes before we begin.",
        tag: "1 minute",
        tagIconKey: "calendar",
      },
      {
        title: "Receive your arrival companion",
        body: "24 hours before the session, a short written companion arrives with one quiet question to bring with you.",
        tag: "24h before",
        tagIconKey: "paper",
      },
    ],
    calendarHeadline: "Add {{event.name}} to your calendar",
    calendarSub:
      "One click — the link, the time, the arrival window. So your calendar holds it for you.",
    calendarReminder: "{{event.date}} · {{event.dayOfWeek}} {{event.time}} {{event.timezone}}",
    calendarReminderSub: "Recording included · Lifetime access",
    calendarStart: "10/14/2026 09:00 AM",
    calendarEnd: "10/14/2026 01:00 PM",
    calendarTimezone: "America/Los_Angeles",
    detailsLabel: "Your event details",
    detailsRows: [
      { label: "Event", value: "{{event.name}}" },
      { label: "Date", value: "{{event.date}}" },
      { label: "Time", value: "{{event.time}} {{event.timezone}}" },
      { label: "Duration", value: "{{event.duration}}" },
      { label: "Where", value: "Online via {{event.platform}}" },
      { label: "Host", value: "{{host.name}}" },
    ],
    zoomNote:
      "Your {{event.platform}} link will arrive by email within 24 hours of the session. Keep an eye on your inbox.",
    shareHeadline: "Know someone standing at their own threshold?",
    shareSub:
      "If this work feels useful, the kindest thing you can do is send the page to one person who needs it.",
    personalNoteHeadline: "A note from {{host.shortName}}",
    personalNote: [
      "Thank you for choosing to spend {{event.duration}} of your one wild life with me on {{event.shortDate}}. That choice does not go unnoticed on my end.",
      "Between now and then, do nothing special. Drink water. Sleep well. Bring whatever question has been quietly tapping you on the shoulder this season. I'll meet you in the room.",
    ],
    personalNoteSignature: "— {{host.name}}",
  },

  /* ============================== */
  replay: {
    offerLabel: "Special offer for attendees",
    offerTitle: "Join {{program.name}}",
    offerUrgency: "Enrolment closes {{program.enrolmentDeadline}} · Payment plans available",
    offerCtaText: "Learn more →",
    pageEyebrow: "Replay · Live event recording",
    pageSubtitle: "Re-walk the threshold any time. Below: the full session, your take-home resources, and what's next.",
    metaItems: [
      "{{event.duration}}",
      "Recorded {{event.date}}",
      "Lifetime access",
    ],
    resourcesLabel: "Your take-home resources",
    resources: [
      { name: "The Threshold Workbook (PDF)", size: "1.4 MB" },
      { name: "Arrival ritual — guided audio", size: "18 min" },
      { name: "Closing reflection — guided audio", size: "22 min" },
    ],
    parts: [
      {
        label: "Part One",
        title: "Naming the threshold",
        description:
          "The opening framing, the arrival ritual, and the first pass — locating what is actually in motion in your life right now.",
        duration: "01:48:12",
        quotes: [
          { text: "The line you've been quietly approaching — let's name it.", author: "{{host.shortName}}" },
          { text: "Most thresholds are mis-described as plateaus.", author: "{{host.shortName}}" },
        ],
      },
      {
        label: "Part Two",
        title: "Crossing the line",
        description:
          "The second and third passes — meeting the hesitation, then writing a single specific next move you can take this week.",
        duration: "01:54:31",
        quotes: [
          { text: "Specificity is the kindest thing you can give yourself today.", author: "{{host.shortName}}" },
          { text: "One real move beats six tidy intentions.", author: "{{host.shortName}}" },
        ],
      },
    ],
    chatEyebrow: "From the live chat",
    chatHeadline: "What attendees said in the room",
    chatComments: [
      { text: "Just dropped my five-year plan in real time. Wow.", name: "Maya T." },
      { text: "I needed permission to stop optimising. Got it.", name: "Jonas R." },
      { text: "This is the first webinar that hasn't felt like a sales funnel in disguise.", name: "Adaeze O." },
      { text: "Crying. Quietly. In a good way.", name: "Priya N." },
      { text: "Bookmarking this. The arrival ritual alone is gold.", name: "Cara D." },
      { text: "OK I see why people kept telling me to come.", name: "Daniel A." },
    ],
    programCtaLabel: "The next step",
    programCtaDescription:
      "If {{event.name}} cracked something open, {{program.name}} is where you build it. {{program.durationLabel}}. {{program.sessionsCount}} live sessions. A small cohort moving together.",
    programCtaBenefits: [
      "Live with {{host.shortName}} · {{program.scheduleLine}}",
      "A small cohort — peer pods of 4–6",
      "{{program.sessionsCount}} sessions across {{program.durationLabel}}",
      "Begins {{program.startDate}} · Closes {{program.enrolmentDeadline}}",
    ],
    programUrgency: "Enrolment closes {{program.enrolmentDeadline}}",
    disclaimerText:
      "{{program.name}} is delivered by {{host.legalEntity}}. Results vary. The replay is for personal use only and not for redistribution.",
  },

  /* ============================== */
  program: {
    heroEyebrow: "A program by {{host.name}}",
    visionEyebrow: "What becomes possible",
    visionHeadline: "Eight weeks. Sixteen live sessions. One quieter, clearer life.",
    vision: [
      { strong: "A nervous system", rest: "that has remembered how to settle without instruction." },
      { strong: "Daily practice", rest: "that no longer requires willpower because it has become rhythm." },
      { strong: "A small cohort", rest: "of adults who know what you're doing and will not let you quietly disappear." },
      { strong: "A direct line", rest: "from inner state to outer decision — a way to move that you can trust." },
      { strong: "Permission", rest: "to stop dressing up confusion as ambition." },
      { strong: "A written record", rest: "of who you became while you were paying attention." },
    ],

    alreadyTriedEyebrow: "The honest part",
    alreadyTriedHeadline: "You've already tried a lot of things.",
    alreadyTriedBody: [
      "If you've gotten this far in your life paying serious attention to what's underneath, you have done the work. You have the apps, the journals, the courses, the breathwork weekend, the eight-week mindfulness program from the year you almost left.",
      "{{program.name}} is not another framework on top of those. It is the container that finally lets the ones that work for you become routine — and helps you let go of the rest.",
    ],
    triedTags: [
      "Therapy", "Meditation apps", "Breathwork", "Plant medicine",
      "Coaching", "Journaling", "Yoga teacher training",
      "Reading every book", "Silent retreats", "Cold plunges",
      "Mindfulness MBSR", "Vipassana", "Substack subscriptions",
      "Substacks · the sequel", "Habit trackers", "Notion templates",
      "Five different planners", "ChatGPT therapy", "Half-finished podcasts",
      "Telling yourself this is the year",
    ],

    promiseHeadline: "What {{program.name}} promises.",
    promiseBody:
      "It will not promise to fix you. It will not promise transformation in 48 hours. It will give you, over {{program.durationLabel}}, the conditions to install four small things that turn out to matter for the rest of your life:",
    promiseItems: [
      { strong: "A daily practice", rest: "you can actually keep, designed around your nervous system, not someone else's." },
      { strong: "A weekly review", rest: "that surfaces what is asking for your attention before it becomes a crisis." },
      { strong: "A small cohort", rest: "of peers who know your work and will be there in {{program.durationLabel}}, six months, three years." },
      { strong: "A way of deciding", rest: "that is rooted in your own knowing — not borrowed strategy." },
    ],

    includesEyebrow: "What's included",
    includesHeadline: "Everything you need across {{program.durationLabel}}.",
    includesSubline:
      "Built so the work fits inside a real adult life — not the other way round.",
    includes: [
      {
        num: "01",
        title: "{{program.sessionsCount}} live sessions with {{host.shortName}}",
        description: "Two per week across {{program.durationLabel}}. Cameras-optional, recorded, structured for depth.",
        tag: "Live · {{program.scheduleLine}}",
        iconKey: "video",
      },
      {
        num: "02",
        title: "A small peer pod (4–6 people)",
        description: "Hand-curated based on chapter and season. You'll meet weekly between sessions.",
        tag: "Weekly pod",
        iconKey: "group",
      },
      {
        num: "03",
        title: "The Practice Library",
        description: "A curated set of short daily practices — guided audio, written rituals, embodied prompts.",
        tag: "Lifetime access",
        iconKey: "library",
      },
      {
        num: "04",
        title: "The Companion Workbook",
        description: "Printable companion that follows the {{program.durationLabel}} arc, prompt by prompt.",
        tag: "PDF · 110 pages",
        iconKey: "book",
      },
      {
        num: "05",
        title: "Private community",
        description: "Off-platform, no ads, no algorithms. Just your cohort and the alumni circle.",
        tag: "Alumni · Lifetime",
        iconKey: "circle",
      },
      {
        num: "06",
        title: "Three private 1:1 office hours",
        description: "Schedule a direct hour with {{host.shortName}} during the program — by request, on the calendar.",
        tag: "1:1 · 60 min",
        iconKey: "compass",
      },
    ],

    sessionEyebrow: "The arc",
    sessionHeadline: "What we walk through, week by week.",
    sessionSubline:
      "Each week opens a single question, supported by one practice and one conversation in your pod.",
    weeks: [
      {
        week: 1,
        title: "Arrival",
        dates: "{{program.startDate}} – Week 1",
        points: [
          "The opening container — naming what brought you here.",
          "Installing the daily practice (15 minutes, non-negotiable).",
          "Meeting your peer pod for the first time.",
        ],
      },
      {
        week: 2,
        title: "Inventory",
        dates: "Week 2",
        points: [
          "An honest reading of what's actually on your plate.",
          "Sorting what is yours from what you've been carrying for others.",
          "First weekly review — installed.",
        ],
      },
      {
        week: 3,
        title: "The hesitation",
        dates: "Week 3",
        points: [
          "Meeting the part of you that has been quietly delaying.",
          "Not pushing past it. Listening to it.",
          "First pod-only midweek call.",
        ],
      },
      {
        week: 4,
        title: "The threshold",
        dates: "Week 4",
        points: [
          "Naming the specific doorway you are standing in front of.",
          "Writing your next move in your own words.",
          "Mid-program 1:1 office hour available.",
        ],
      },
      {
        week: 5,
        title: "Practice",
        dates: "Week 5",
        points: [
          "Living the move — small, specific, daily.",
          "Recovering from the first stumble (everybody has one).",
          "Witness ritual in your pod.",
        ],
      },
      {
        week: 6,
        title: "The plateau",
        dates: "Week 6",
        points: [
          "The week the novelty fades — and the real work begins.",
          "Building rituals that don't need motivation.",
          "Optional second 1:1 office hour.",
        ],
      },
      {
        week: 7,
        title: "Integration",
        dates: "Week 7",
        points: [
          "Bringing the work back into your relationships.",
          "Letting the changes be witnessed by the people closest to you.",
          "The integration practice.",
        ],
      },
      {
        week: 8,
        title: "Continuation",
        dates: "Week 8 · ends {{program.endDate}}",
        points: [
          "Designing the version of this you carry forward without {{host.shortName}}.",
          "Your written record of the {{program.durationLabel}}.",
          "Alumni circle — closing ritual and onward.",
        ],
      },
    ],

    videoTestimonialsEyebrow: "In their words",
    videoTestimonialsHeadline: "Three past participants.",
    videoTestimonials: [
      { quote: "I stopped trying to be the person I thought I should be.", author: "Maya T., Toronto", duration: "1:42" },
      { quote: "The pod is the thing I didn't know I'd been missing for ten years.", author: "Jonas R., Berlin", duration: "2:08" },
      { quote: "I have a daily practice now. Actually. Every day.", author: "Priya N., London", duration: "1:54" },
    ],

    credibilityProgram: {
      quote:
        "I came in thinking I'd get another framework. I left with a way of living. Eight weeks I'll be drawing on for the rest of my life.",
      name: "Adaeze O.",
      location: "Lagos",
    },

    bonusesEyebrow: "Yours when you enrol",
    bonusesHeadline: "Three bonuses included.",
    bonuses: [
      {
        num: "01",
        title: "The Threshold Companion (audio)",
        description:
          "A six-part audio companion — short, walkable, listenable in transit. Built to keep the work alive between live sessions.",
        value: "Value $197",
      },
      {
        num: "02",
        title: "Lifetime access to The Practice Library",
        description:
          "The full curated practice archive — guided audio, written rituals, somatic prompts. Yours to keep, indefinitely.",
        value: "Value $297",
      },
      {
        num: "03",
        title: "Alumni Circle membership (12 months)",
        description:
          "Quarterly live calls with {{host.shortName}} and the broader alumni community. A way to keep the cohort warm beyond {{program.durationLabel}}.",
        value: "Value $297",
        restriction: "Renews by invitation only after the first year.",
      },
    ],
    bonusTotalNote: "Total bonus value: {{program.bonusTotalValue}} — included with every enrolment. No code required.",

    priceRepeatLabel: "Enrolment is open",
    priceRepeatUrgency: "Begins {{program.startDate}} · Closes {{program.enrolmentDeadline}}",

    outcomesEyebrow: "Outcomes",
    outcomesHeadline: "What you'll carry forward.",
    outcomesSubline:
      "Six durable shifts that participants name three to six months after the program ends.",
    outcomes: [
      { strong: "A daily practice", rest: "that no longer requires willpower — it has become rhythm.", iconKey: "ritual" },
      { strong: "A weekly review", rest: "that catches what is in motion before it becomes urgent.", iconKey: "compass" },
      { strong: "A peer cohort", rest: "of adults who know your work and will be there in five years.", iconKey: "circle" },
      { strong: "A clean decision-making rhythm", rest: "rooted in your own knowing, not borrowed strategy.", iconKey: "arrow" },
      { strong: "An ability to settle", rest: "your own nervous system on cue.", iconKey: "stillness" },
      { strong: "A written record", rest: "of who you became while you were paying attention.", iconKey: "journal" },
    ],

    writtenEyebrow: "Written reflections",
    writtenHeadline: "Notes from past cohorts.",
    writtenTestimonials: [
      {
        stars: 5,
        body: "I came in thinking eight weeks was a lot to commit. I came out thinking eight weeks was the smallest investment I could have made for what I got back.",
        name: "Cara D.",
        handle: "Edinburgh",
      },
      {
        stars: 5,
        body: "The peer pod is the part I underestimated and now can't imagine my year without. We still meet, four months after the program ended.",
        name: "Daniel A.",
        handle: "Cape Town",
      },
      {
        stars: 5,
        body: "{{host.shortName}} holds the room with extraordinary precision. I have never felt more met and less managed.",
        name: "Lakshmi V.",
        handle: "Bangalore",
      },
    ],

    pricingEyebrow: "Enrol",
    pricingHeadline: "Choose the rhythm that fits you.",
    pricingSubline: "Three options. Same program. Same cohort.",
    pricingUrgency: "Doors close {{program.enrolmentDeadline}}.",

    hostEyebrow: "Your facilitator",
    faqHeadline: "Honest answers.",
    faq: [
      {
        q: "How much time per week?",
        a: "Plan on two live sessions (90 minutes each), one pod call (60 minutes), and 15 minutes of daily practice. Around four hours of dedicated time per week.",
      },
      {
        q: "What if I miss a live session?",
        a: "Every live is recorded and available in your portal within 24 hours. Many participants attend half live and watch half recorded.",
      },
      {
        q: "Is the work hard?",
        a: "It is honest. Not punishing. The practices are short and walkable. The conversations are deep but never coercive. {{host.shortName}} keeps the room safe and adult.",
      },
      {
        q: "Will my pod be a good fit?",
        a: "Pods are hand-curated by chapter and season. If yours doesn't feel right in the first two weeks, write us and we'll re-cast.",
      },
      {
        q: "Refund policy?",
        a: "30 days, no questions. If you attend the first two weeks and {{program.name}} isn't the room you need, we'll refund in full.",
      },
      {
        q: "What's the price about?",
        a: "{{program.fullPriceLabel}} pay-in-full, or {{program.spreadLabel}} on a three-month plan. Bursary places are available — write to {{host.email}} privately.",
      },
    ],

    finalCtaHeadline: "Doors close {{program.enrolmentDeadline}}.",
    finalCtaBody:
      "{{program.name}} begins {{program.startDate}}. The cohort is small. If reading this far has been quietly persistent in your chest — that is enough information.",
    finalCtaDeadline: "Enrolment closes {{program.enrolmentDeadline}} · {{program.sessionsCount}} live sessions across {{program.durationLabel}}.",
    disclaimerText:
      "{{program.name}} is delivered by {{host.legalEntity}}. Results vary. Testimonials reflect personal experience and not typical outcomes.",
  },

  /* ============================== */
  programCheckout: {
    programDescription: "{{program.durationLabel}} · {{program.sessionsCount}} live sessions · Starts {{program.startDate}}",
    programIncludes: [
      "{{program.sessionsCount}} live sessions with {{host.shortName}}",
      "Hand-curated peer pod (4–6 people)",
      "Lifetime access to The Practice Library",
      "The Companion Workbook (PDF)",
      "Three 1:1 office hours with {{host.shortName}}",
      "Alumni Circle membership (12 months)",
    ],
    guaranteeHeadline: "30-day money-back guarantee",
    guaranteeBody:
      "Attend the first two weeks. If {{program.name}} isn't the room you need, write to {{host.email}} and we'll refund in full — no questions, no friction.",
    orderAttribution: "Charged to {{host.legalEntity}} · Secure checkout",
    ftcText:
      "{{program.name}} is delivered by {{host.legalEntity}}. Results vary by participant. By completing this purchase you agree to our terms and privacy policy.",
  },

  /* ============================== */
  programThankYou: {
    label: "Enrolment confirmed",
    headline: "You're in.",
    subheadline:
      "Welcome to {{program.name}}. Eight weeks begins {{program.startDate}}.",
    chips: ["Starts {{program.startDate}}", "{{program.durationLabel}}", "{{program.sessionsCount}} live sessions"],
    emailNote:
      "A welcome email is on its way with your portal access. If it doesn't arrive in ten minutes, check spam or write to {{host.email}}.",
    nextStepsLabel: "What happens next",
    nextStepsHeadline: "Four things before {{program.startDate}}.",
    nextSteps: [
      {
        title: "Check your inbox",
        body: "Your welcome email includes your portal login, the program calendar, and your first prompt.",
        tag: "Within 10 min",
        tagIconKey: "mail",
      },
      {
        title: "Block the calendar",
        body: "Add all {{program.sessionsCount}} live sessions to your calendar in one click using the link in your welcome email.",
        tag: "1 minute",
        tagIconKey: "calendar",
      },
      {
        title: "Meet your pod",
        body: "Within 7 days you'll receive an intro email with your hand-curated peer pod and your first pod meeting time.",
        tag: "Within 7 days",
        tagIconKey: "group",
      },
      {
        title: "Begin the arrival ritual",
        body: "A 5-day pre-program audio companion begins one week before {{program.startDate}}. Built to land you gently.",
        tag: "1 week ahead",
        tagIconKey: "ritual",
      },
    ],
    scheduleLabel: "The arc",
    scheduleHeadline: "Eight weeks at a glance.",
    scheduleSub: "Your portal will hold the live links, recordings and weekly prompts.",
    scheduleRows: [
      { week: "Week 1", title: "Arrival", dates: "{{program.startDate}}", upcoming: true },
      { week: "Week 2", title: "Inventory", dates: "+1 week", locked: true },
      { week: "Week 3", title: "The hesitation", dates: "+2 weeks", locked: true },
      { week: "Week 4", title: "The threshold", dates: "+3 weeks", locked: true },
      { week: "Week 5", title: "Practice", dates: "+4 weeks", locked: true },
      { week: "Week 6", title: "The plateau", dates: "+5 weeks", locked: true },
      { week: "Week 7", title: "Integration", dates: "+6 weeks", locked: true },
      { week: "Week 8", title: "Continuation", dates: "ends {{program.endDate}}", locked: true },
    ],
    scheduleDates: [
      "All sessions are {{program.scheduleLine}}",
      "Recordings posted within 24 hours of each live",
      "Three private 1:1 office hours can be scheduled any time across the {{program.durationLabel}}",
    ],
    noteEyebrow: "A note from {{host.shortName}}",
    note: [
      "Thank you for trusting me with the next {{program.durationLabel}} of your life. That choice does not go unnoticed on my end.",
      "Between now and {{program.startDate}}, do nothing special. The arrival companion will arrive a week ahead. Drink water. Sleep well. Bring the quiet question that has been tapping you on the shoulder this season.",
    ],
    noteSignatureTitle: "{{host.title}}",

    commitmentLabel: "What this builds",
    commitmentHeadline: "What {{program.durationLabel}} actually buys you.",
    commitmentItems: [
      "A daily practice that no longer requires willpower.",
      "A small cohort of adults who know your work — for the long arc.",
      "A way of deciding rooted in your own knowing, not borrowed strategy.",
    ],

    accessEyebrow: "Your program details",
    accessRows: [
      { label: "Program", value: "{{program.name}}" },
      { label: "Starts", value: "{{program.startDate}}" },
      { label: "Duration", value: "{{program.durationLabel}}" },
      { label: "Sessions", value: "{{program.sessionsCount}} live" },
      { label: "Schedule", value: "{{program.scheduleLine}}" },
    ],
    accessNote:
      "Portal access and {{event.platform}} links will arrive by email within 24 hours. For anything urgent, write to {{host.email}}.",
  },
};

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

export function buildContent(
  ctx: TokenContext,
  overrides?: DeepPartial<ThemeContent>,
): ThemeContent {
  const base = tokeniseDeep(BASE_CONTENT, ctx);
  if (!overrides) return base;
  return deepMerge(base, tokeniseDeep(overrides, ctx)) as ThemeContent;
}

function deepMerge<A, B>(a: A, b: B): A & B {
  if (b === undefined || b === null) return a as A & B;
  if (Array.isArray(b)) return b as unknown as A & B;
  if (typeof b !== "object") return b as unknown as A & B;
  const out: Record<string, unknown> = { ...(a as Record<string, unknown>) };
  for (const k of Object.keys(b as Record<string, unknown>)) {
    const av = (a as Record<string, unknown>)[k];
    const bv = (b as Record<string, unknown>)[k];
    if (av && bv && typeof av === "object" && typeof bv === "object" && !Array.isArray(bv)) {
      out[k] = deepMerge(av, bv);
    } else {
      out[k] = bv;
    }
  }
  return out as A & B;
}
