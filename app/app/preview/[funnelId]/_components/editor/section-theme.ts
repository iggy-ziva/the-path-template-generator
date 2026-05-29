import type { SectionTheme } from "@/lib/brand-surfaces";

export type { SectionTheme };

/** A section that can be themed (dark/accent/light) in edit mode. */
export interface SectionThemeDef {
  /** Stable id — the key used in content.sectionThemes and updateField paths. */
  id: string;
  /** Human label shown in the edit-mode control. */
  label: string;
  /**
   * Structural base. "plain" uses the generic background utility; the others
   * keep their bespoke base CSS (hero gradient, encourage band, etc.).
   */
  base: "plain" | "hero" | "encourage" | "final-vp";
  /** Fallback theme when neither an override nor a legacy field is set. */
  defaultTheme: SectionTheme;
}

const VALID_THEMES: readonly SectionTheme[] = ["dark", "accent", "light"];

/** Narrow an arbitrary value to a SectionTheme, or undefined. */
export function asSectionTheme(value: unknown): SectionTheme | undefined {
  return typeof value === "string" && (VALID_THEMES as readonly string[]).includes(value)
    ? (value as SectionTheme)
    : undefined;
}

/**
 * Resolve the effective theme for a section.
 * Priority: manual override map > legacy AI field > structural default.
 */
export function resolveSectionTheme(
  sectionId: string,
  overrides: Partial<Record<string, SectionTheme>> | undefined,
  legacy: unknown,
  fallback: SectionTheme,
): SectionTheme {
  return (
    asSectionTheme(overrides?.[sectionId]) ??
    asSectionTheme(legacy) ??
    fallback
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-page section id registries. Ids are stable contracts shared by the
// component wiring, the override map, and the AI schema.
// ─────────────────────────────────────────────────────────────────────────────

/** Event Landing — ordered top to bottom. */
export const EVENT_LANDING_SECTIONS: SectionThemeDef[] = [
  { id: "stickyBar",     label: "Header bar",        base: "plain",     defaultTheme: "dark"   },
  { id: "hero",          label: "Hero",              base: "hero",      defaultTheme: "dark"   },
  { id: "credibility1",  label: "Credibility 1",     base: "plain",     defaultTheme: "light"  },
  { id: "video",         label: "Video",             base: "plain",     defaultTheme: "light"  },
  { id: "audience",      label: "Audience",          base: "plain",     defaultTheme: "light"  },
  { id: "encourage1",    label: "Encourage 1",       base: "encourage", defaultTheme: "dark"   },
  { id: "valueProp",     label: "Value proposition", base: "plain",     defaultTheme: "light"  },
  { id: "credibility2",  label: "Credibility 2",     base: "plain",     defaultTheme: "light"  },
  { id: "outcomes",      label: "Outcomes",          base: "plain",     defaultTheme: "light"  },
  { id: "personalMessage", label: "Personal message", base: "plain",    defaultTheme: "light"  },
  { id: "encourage2",    label: "Encourage 2",       base: "encourage", defaultTheme: "accent" },
  { id: "howItWorks",    label: "How it works",      base: "plain",     defaultTheme: "light"  },
  { id: "eventOverview", label: "Event overview",    base: "plain",     defaultTheme: "light"  },
  { id: "credibility3",  label: "Credibility 3",     base: "plain",     defaultTheme: "light"  },
  { id: "extraVp",       label: "Extra value prop",  base: "plain",     defaultTheme: "accent" },
  { id: "encourage3",    label: "Encourage 3",       base: "encourage", defaultTheme: "light"  },
  { id: "outcomes2",     label: "Outcomes 2",        base: "plain",     defaultTheme: "light"  },
  { id: "testimonials",  label: "Testimonials",      base: "plain",     defaultTheme: "light"  },
  { id: "finalVp",       label: "Final value prop",  base: "final-vp",  defaultTheme: "dark"   },
  { id: "bio",           label: "Host bio",          base: "plain",     defaultTheme: "light"  },
  { id: "faq",           label: "FAQ",               base: "plain",     defaultTheme: "light"  },
  { id: "register",      label: "Final CTA",         base: "encourage", defaultTheme: "dark"   },
  { id: "ftc",           label: "Disclaimer",        base: "plain",     defaultTheme: "light"  },
];

/** Maps section id -> legacy content field name (for backward-compat fallback). */
export const EVENT_LANDING_LEGACY_FIELD: Record<string, string> = {
  hero: "heroTheme",
  encourage1: "encourage1Theme",
  encourage2: "encourage2Theme",
  encourage3: "encourage3Theme",
  finalVp: "finalVpTheme",
  register: "registerTheme",
};

/** Programme Landing — ordered top to bottom. */
export const PROGRAMME_LANDING_SECTIONS: SectionThemeDef[] = [
  { id: "progHero",     label: "Header / Hero",    base: "plain", defaultTheme: "dark"   },
  { id: "vision",       label: "Vision",           base: "plain", defaultTheme: "light"  },
  { id: "alreadyTried", label: "Already tried",    base: "plain", defaultTheme: "dark"   },
  { id: "promise",      label: "Promise",          base: "plain", defaultTheme: "light"  },
  { id: "includes",     label: "Includes",         base: "plain", defaultTheme: "light"  },
  { id: "session",      label: "Session breakdown", base: "plain", defaultTheme: "light" },
  { id: "videoTestimonials", label: "Video testimonials", base: "plain", defaultTheme: "dark" },
  { id: "credibility",  label: "Credibility",      base: "plain", defaultTheme: "light"  },
  { id: "bonuses",      label: "Bonuses",          base: "plain", defaultTheme: "light"  },
  { id: "priceRepeat",  label: "Price repeat",     base: "plain", defaultTheme: "dark"   },
  { id: "outcomes",     label: "Outcomes",         base: "plain", defaultTheme: "light"  },
  { id: "testimonials", label: "Testimonials",     base: "plain", defaultTheme: "light"  },
  { id: "pricing",      label: "Pricing",          base: "plain", defaultTheme: "light"  },
  { id: "host",         label: "Host",             base: "plain", defaultTheme: "light"  },
  { id: "faq",          label: "FAQ",              base: "plain", defaultTheme: "light"  },
  { id: "finalCta",     label: "Final CTA",        base: "plain", defaultTheme: "accent" },
];

/** Maps section id -> legacy content field name (for backward-compat fallback). */
export const PROGRAMME_LANDING_LEGACY_FIELD: Record<string, string> = {
  alreadyTried: "alreadyTriedTheme",
  finalCta: "finalCtaTheme",
};
