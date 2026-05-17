export type ThemeSlug =
  | "sacred"
  | "executive"
  | "wellness"
  | "highperf"
  | "abundance"
  | "earth";

export interface ThemeConfig {
  slug: ThemeSlug;
  label: string;
  descriptor: string;
  swatch: string;
  host: {
    name: string;
    title: string;
    tagline: string;
    bio: string[];
    email: string;
    legalEntity: string;
  };
  event: {
    name: string;
    tagline: string;
    date: string;
    time: string;
    timezone: string;
    duration: string;
    platform: string;
    priceMin: number;
    priceMax: number;
    currency: string;
  };
  program: {
    name: string;
    tagline: string;
    price: number;
    paymentPlan: string;
    duration: string;
  };
  fonts: {
    displayFamily: string;
    bodyFamily: string;
    accentFamily?: string;
    googleFontsUrl: string;
  };
  colors: {
    canvas: string;
    text: string;
    accent: string;
    highlight: string;
    dark: string;
    success: string;
  };
}

export const THEMES: Record<ThemeSlug, ThemeConfig> = {
  sacred: {
    slug: "sacred",
    label: "Sacred",
    descriptor: "Mystical · Cosmic",
    swatch: "#3D1A6B",
    host: {
      name: "Selene Voss",
      title: "Akashic Records Facilitator & Soul Coach",
      tagline: "Helping awakened souls release what no longer serves them",
      bio: [
        "Selene Voss has spent two decades walking the bridge between ancient wisdom traditions and modern spiritual practice. A certified Akashic Records teacher and soul contract interpreter, she has guided thousands of seekers from across six continents in clearing the karmic patterns that quietly run their lives.",
        "Her work blends the precision of Akashic inquiry with the warmth of embodied ceremony. She is the author of <em>The Records Speak</em> and host of the Soul Contracts Decoded podcast, and she leads retreats from her studio in Sedona.",
      ],
      email: "hello@selenevoss.com",
      legalEntity: "Selene Voss LLC",
    },
    event: {
      name: "The Akashic Unfolding",
      tagline: "A live online ceremony to read what your soul has been trying to tell you",
      date: "Saturday, 14 June 2025",
      time: "11:00 AM",
      timezone: "Mountain Time (MT)",
      duration: "3 hours",
      platform: "Zoom",
      priceMin: 0,
      priceMax: 88,
      currency: "USD",
    },
    program: {
      name: "Soul Contract Mastery",
      tagline: "An eight-week live training to decode, dissolve, and rewrite your soul's agreements",
      price: 1997,
      paymentPlan: "3 × $749",
      duration: "8 weeks",
    },
    fonts: {
      displayFamily: "'Playfair Display', Georgia, serif",
      bodyFamily: "'Raleway', sans-serif",
      accentFamily: "'EB Garamond', serif",
      googleFontsUrl:
        "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Raleway:wght@300;400;500;600&family=EB+Garamond:ital,wght@0,400;1,400&display=swap",
    },
    colors: {
      canvas: "#F9F4ED",
      text: "#0A0612",
      accent: "#3D1A6B",
      highlight: "#D4AF37",
      dark: "#1A0A2E",
      success: "#4A7C5F",
    },
  },

  executive: {
    slug: "executive",
    label: "Executive",
    descriptor: "Strategic · Authoritative",
    swatch: "#0A1628",
    host: {
      name: "Marcus Ashford",
      title: "Executive Coach & Presence Strategist",
      tagline: "Developing leaders who command rooms before they open their mouths",
      bio: [
        "Marcus Ashford spent fifteen years in the C-suite at Fortune 500 companies before pivoting to executive coaching. He has worked with senior leaders at Goldman Sachs, McKinsey, and the NHS, helping them close the gap between their performance and their perceived authority.",
        "His evidence-based Influence Architecture framework has been featured in Harvard Business Review, Forbes, and The Financial Times. Marcus works with a select group of high-potential leaders who are ready to operate at the very top of their field.",
      ],
      email: "office@marcusashford.com",
      legalEntity: "Ashford Leadership Partners Ltd",
    },
    event: {
      name: "The Executive Presence Summit",
      tagline: "A live strategy session for leaders who know their value — and want everyone else to know it too",
      date: "Thursday, 19 June 2025",
      time: "12:00 PM",
      timezone: "Eastern Time (ET)",
      duration: "2.5 hours",
      platform: "Zoom",
      priceMin: 0,
      priceMax: 97,
      currency: "USD",
    },
    program: {
      name: "The Influence Architecture",
      tagline: "A twelve-week intensive for leaders ready to be impossible to ignore",
      price: 4997,
      paymentPlan: "3 × $1,799",
      duration: "12 weeks",
    },
    fonts: {
      displayFamily: "'Montserrat', Arial, sans-serif",
      bodyFamily: "'Source Sans 3', sans-serif",
      accentFamily: "'Courier Prime', monospace",
      googleFontsUrl:
        "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Source+Sans+3:wght@300;400;600&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap",
    },
    colors: {
      canvas: "#FFFFFF",
      text: "#0A1628",
      accent: "#0A1628",
      highlight: "#C9A84C",
      dark: "#060E1A",
      success: "#2E6B3E",
    },
  },

  wellness: {
    slug: "wellness",
    label: "Somatic",
    descriptor: "Body-centred · Gentle",
    swatch: "#C4714D",
    host: {
      name: "Aria Bloom",
      title: "Somatic Therapist & Embodiment Coach",
      tagline: "Creating space for the body to say what words can't reach",
      bio: [
        "Aria Bloom is a certified somatic therapist and embodiment educator with over a decade of practice working with high-sensitivity individuals, survivors of complex trauma, and people who have simply grown tired of living from the neck up.",
        "Her work draws from somatic experiencing, polyvagal theory, and mindful movement — woven together into a gentle, body-first approach that helps people finally feel at home in themselves. Aria leads small-group intensives and speaks internationally on nervous system regulation and somatic presence.",
      ],
      email: "hello@ariabloom.co",
      legalEntity: "Aria Bloom Wellness Ltd",
    },
    event: {
      name: "The Embodied Presence Intensive",
      tagline: "A live online gathering to help you return to your body and feel safe there",
      date: "Sunday, 22 June 2025",
      time: "10:00 AM",
      timezone: "Pacific Time (PT)",
      duration: "3 hours",
      platform: "Zoom",
      priceMin: 0,
      priceMax: 77,
      currency: "USD",
    },
    program: {
      name: "The Somatic Freedom Collective",
      tagline: "An eight-week live journey to regulate your nervous system and reclaim your ease",
      price: 1497,
      paymentPlan: "3 × $549",
      duration: "8 weeks",
    },
    fonts: {
      displayFamily: "'Cormorant Garamond', Georgia, serif",
      bodyFamily: "'DM Sans', sans-serif",
      accentFamily: "'DM Serif Display', serif",
      googleFontsUrl:
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap",
    },
    colors: {
      canvas: "#FAF7F2",
      text: "#2C1810",
      accent: "#C4714D",
      highlight: "#7A9E7E",
      dark: "#1F2A20",
      success: "#5C7A4F",
    },
  },

  highperf: {
    slug: "highperf",
    label: "Peak",
    descriptor: "Data-driven · No-fluff",
    swatch: "#0066FF",
    host: {
      name: "Kai Mercer",
      title: "Performance Scientist & Cognitive Edge Coach",
      tagline: "Turning your brain into your most reliable competitive advantage",
      bio: [
        "Kai Mercer is a former neuroscience researcher turned performance coach who works at the intersection of cognitive science, behavioural design, and elite-level execution. His clients include professional athletes, startup founders, and senior operators who want measurable gains in focus, decision quality, and output.",
        "Trained at Johns Hopkins and Stanford's d.school, Kai built the Cognitive Edge framework after studying the performance habits of 400 top-1% performers across sport, business, and the arts. His protocols are evidence-based, radically practical, and built for people who have already tried everything else.",
      ],
      email: "ops@kaimercer.io",
      legalEntity: "Mercer Performance Inc",
    },
    event: {
      name: "The Cognitive Edge Summit",
      tagline: "A live protocol session for operators who want their brain to run like a well-tuned system",
      date: "Wednesday, 25 June 2025",
      time: "9:00 AM",
      timezone: "Pacific Time (PT)",
      duration: "2 hours",
      platform: "Zoom",
      priceMin: 0,
      priceMax: 97,
      currency: "USD",
    },
    program: {
      name: "The Peak Protocol",
      tagline: "A ten-week performance system for founders and operators who want to execute at a different level",
      price: 2997,
      paymentPlan: "3 × $1,097",
      duration: "10 weeks",
    },
    fonts: {
      displayFamily: "'Space Grotesk', sans-serif",
      bodyFamily: "'IBM Plex Sans', sans-serif",
      accentFamily: "'IBM Plex Mono', monospace",
      googleFontsUrl:
        "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap",
    },
    colors: {
      canvas: "#F8FAFF",
      text: "#0A0A0A",
      accent: "#0066FF",
      highlight: "#00FF88",
      dark: "#0A0A0A",
      success: "#00CC6A",
    },
  },

  abundance: {
    slug: "abundance",
    label: "Abundance",
    descriptor: "Heart-centred · Prosperity",
    swatch: "#B76E79",
    host: {
      name: "Zoe Tanaka",
      title: "Spiritual Business Mentor & Abundance Activator",
      tagline: "Helping purpose-led women build businesses that feel as good as they look",
      bio: [
        "Zoe Tanaka is a spiritual business mentor who blends quantum principles, energy psychology, and modern marketing strategy to help purpose-driven coaches and creatives attract aligned clients and income — without burning out or compromising their soul.",
        "After building her own seven-figure business from a bedroom studio in Kyoto, Zoe now runs the Quantum Business Expansion container and hosts the Abundance Field podcast, which has been downloaded over three million times. She believes that financial sovereignty and spiritual depth are not opposites — they are partners.",
      ],
      email: "hello@zoetanaka.com",
      legalEntity: "Zoe Tanaka International Ltd",
    },
    event: {
      name: "The Abundance Activation",
      tagline: "A live energetic transmission and business strategy session for women ready to receive more",
      date: "Friday, 27 June 2025",
      time: "2:00 PM",
      timezone: "Eastern Time (ET)",
      duration: "3 hours",
      platform: "Zoom",
      priceMin: 0,
      priceMax: 77,
      currency: "USD",
    },
    program: {
      name: "Quantum Business Expansion",
      tagline: "A nine-week live immersion in aligned marketing, energetic selling, and sacred receivership",
      price: 2222,
      paymentPlan: "3 × $797",
      duration: "9 weeks",
    },
    fonts: {
      displayFamily: "'Libre Baskerville', Georgia, serif",
      bodyFamily: "'Nunito', sans-serif",
      accentFamily: "'Cinzel', serif",
      googleFontsUrl:
        "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;500;600&family=Cinzel:wght@400;600&display=swap",
    },
    colors: {
      canvas: "#FDFAF6",
      text: "#2A1A1E",
      accent: "#B76E79",
      highlight: "#C9A96E",
      dark: "#1F1218",
      success: "#6B9E7A",
    },
  },

  earth: {
    slug: "earth",
    label: "Earth",
    descriptor: "Ancestral · Ceremonial",
    swatch: "#1A3A2A",
    host: {
      name: "River Stone",
      title: "Shamanic Practitioner & Ancestral Wisdom Keeper",
      tagline: "Restoring the living thread between who you are and where you come from",
      bio: [
        "River Stone has walked the shamanic path for over twenty years, trained in the lineages of the Andean Q'ero tradition, Celtic earth medicine, and West African ancestral practice. They work with individuals and communities who feel the call to heal not just themselves, but the line that runs through them.",
        "River is the founder of the Ancestral Wisdom School and host of the annual Medicine Circle Gathering, which draws hundreds of participants from across the globe each year. Their work is grounded, unhurried, and rooted in the belief that the earth itself is our greatest teacher.",
      ],
      email: "circle@riverstone.earth",
      legalEntity: "River Stone Ancestral Arts",
    },
    event: {
      name: "The Medicine Circle Gathering",
      tagline: "A live online ceremony to reconnect with ancestral wisdom and the earth beneath your feet",
      date: "Saturday, 21 June 2025",
      time: "8:00 AM",
      timezone: "Mountain Time (MT)",
      duration: "4 hours",
      platform: "Zoom",
      priceMin: 0,
      priceMax: 66,
      currency: "USD",
    },
    program: {
      name: "Ancestral Wisdom Path",
      tagline: "A twelve-week ceremonial journey to heal your lineage and reclaim your power",
      price: 1777,
      paymentPlan: "3 × $649",
      duration: "12 weeks",
    },
    fonts: {
      displayFamily: "'Josefin Sans', sans-serif",
      bodyFamily: "'Merriweather', Georgia, serif",
      accentFamily: "'Josefin Sans', sans-serif",
      googleFontsUrl:
        "https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap",
    },
    colors: {
      canvas: "#F2EDD7",
      text: "#1A1208",
      accent: "#1A3A2A",
      highlight: "#C4891A",
      dark: "#0F2018",
      success: "#3D6E45",
    },
  },
};

export const THEME_SLUGS = Object.keys(THEMES) as ThemeSlug[];
export const THEME_LIST = Object.values(THEMES);

export function getTheme(slug: string): ThemeConfig | null {
  return THEMES[slug as ThemeSlug] ?? null;
}
