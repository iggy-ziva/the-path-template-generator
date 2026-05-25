export interface ThemeEntry {
  slug: string;
  label: string;
  descriptor: string;
  swatch: string;
}

export const THEME_LIST: ThemeEntry[] = [
  {
    slug: "threshold",
    label: "Threshold",
    descriptor: "Literary · Contemplative · Introspective",
    swatch: "#D4A878",
  },
  {
    slug: "sacred",
    label: "Sacred",
    descriptor: "Mystical · Cosmic · Ceremonial",
    swatch: "#3D1A6B",
  },
  {
    slug: "executive",
    label: "Executive",
    descriptor: "Strategic · Authoritative · Results-driven",
    swatch: "#0A1628",
  },
  {
    slug: "wellness",
    label: "Somatic",
    descriptor: "Body-centred · Nurturing · Gentle",
    swatch: "#C4714D",
  },
  {
    slug: "highperf",
    label: "Peak Performance",
    descriptor: "Data-driven · No-fluff · Achievement-focused",
    swatch: "#0066FF",
  },
  {
    slug: "abundance",
    label: "Abundance",
    descriptor: "Heart-centred · Prosperity · Empowering",
    swatch: "#B76E79",
  },
  {
    slug: "earth",
    label: "Earth",
    descriptor: "Ancestral · Ceremonial · Grounded",
    swatch: "#1A3A2A",
  },
];
