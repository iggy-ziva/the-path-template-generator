export const WIZARD_STEPS = [
  { id: 1, title: "About You", subtitle: "Tell us about the host or facilitator" },
  { id: 2, title: "Your Brand", subtitle: "Business name, logo and contact details" },
  { id: 3, title: "Live Event", subtitle: "Date, time, pricing and platform" },
  { id: 4, title: "Programme", subtitle: "Your high-ticket upsell offer" },
  { id: 5, title: "Curriculum & Content", subtitle: "What's included and the transformation you deliver" },
  { id: 6, title: "Your Story", subtitle: "Upload existing materials for AI to analyse" },
  { id: 7, title: "Testimonials", subtitle: "Social proof for every funnel page" },
  { id: 8, title: "Images", subtitle: "Hero photos, lifestyle imagery and brand assets" },
  { id: 9, title: "Tone & Voice", subtitle: "How you want your copy to sound" },
  { id: 10, title: "Review & Generate", subtitle: "Confirm your inputs and launch the AI" },
] as const;

export const TONE_DESCRIPTORS = [
  "Warm", "Nurturing", "Direct", "Authoritative", "Playful", "Irreverent",
  "Mystical", "Grounded", "Cosmic", "Strategic", "Analytical", "Empowering",
  "Ceremonial", "Conversational", "Poetic", "Clinical", "Energetic", "Calm",
  "Celebratory", "Reverent", "Urgent", "Measured", "Provocative", "Gentle",
];

export const TIMEZONE_OPTIONS = [
  "Eastern Time (ET)", "Central Time (CT)", "Mountain Time (MT)", "Pacific Time (PT)",
  "GMT / UTC", "British Summer Time (BST)", "Central European Time (CET)",
  "Eastern European Time (EET)", "India Standard Time (IST)", "Australian Eastern Time (AET)",
  "New Zealand Standard Time (NZST)", "South Africa Standard Time (SAST)",
  "Japan Standard Time (JST)", "China Standard Time (CST)",
];

export const PLATFORM_OPTIONS = ["Zoom", "Google Meet", "Microsoft Teams", "StreamYard", "Demio", "Hopin", "Other"];

export const THEME_LIST_FOR_WIZARD = [
  { slug: "sacred", label: "Sacred", descriptor: "Mystical · Cosmic · Ceremonial", swatch: "#3D1A6B" },
  { slug: "executive", label: "Executive", descriptor: "Strategic · Authoritative · Results-driven", swatch: "#0A1628" },
  { slug: "wellness", label: "Somatic", descriptor: "Body-centred · Nurturing · Gentle", swatch: "#C4714D" },
  { slug: "highperf", label: "Peak Performance", descriptor: "Data-driven · No-fluff · Achievement-focused", swatch: "#0066FF" },
  { slug: "abundance", label: "Abundance", descriptor: "Heart-centred · Prosperity · Empowering", swatch: "#B76E79" },
  { slug: "earth", label: "Earth", descriptor: "Ancestral · Ceremonial · Grounded", swatch: "#1A3A2A" },
];
