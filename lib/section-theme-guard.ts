import {
  EVENT_LANDING_SECTIONS,
  PROGRAMME_LANDING_SECTIONS,
  EVENT_LANDING_LEGACY_FIELD,
  PROGRAMME_LANDING_LEGACY_FIELD,
  asSectionTheme,
  type SectionTheme,
  type SectionThemeDef,
} from "@/app/app/preview/[funnelId]/_components/editor/section-theme";

// ─────────────────────────────────────────────────────────────────────────────
// Accent-band guard.
//
// The "accent" surface is a mid-tone branded band. It only reads correctly on
// simple text / CTA "moment" sections. Card/grid sections render their chrome
// with `--surface-raised` (a near-invisible translucent white over the band)
// and `--accent-primary` decorative details (the brand colour itself, which
// disappears on the accent surface). On those sections "accent" produces the
// unreadable result reported for the Includes / "what you get" grid.
//
// This guard restricts "accent" to the allowlisted band sections and downgrades
// any card/grid section the AI marked "accent" to its safe structural default.
// ─────────────────────────────────────────────────────────────────────────────

/** Event Landing sections where the accent band renders legibly (text/CTA bands, no cards). */
const EVENT_ACCENT_ALLOWED = new Set<string>([
  "stickyBar",
  "hero",
  "encourage1",
  "encourage2",
  "encourage3",
  "register",
  "finalVp",
  "credibility1",
  "credibility2",
  "credibility3",
  "personalMessage",
  "extraVp",
]);

/** Programme Landing sections where the accent band renders legibly (text/CTA bands, no cards). */
const PROGRAMME_ACCENT_ALLOWED = new Set<string>([
  "progHero",
  "alreadyTried",
  "priceRepeat",
  "credibility",
]);

interface PageGuardConfig {
  sections: SectionThemeDef[];
  legacyField: Record<string, string>;
  accentAllowed: Set<string>;
}

const PAGE_GUARDS: Record<string, PageGuardConfig> = {
  eventLanding: {
    sections: EVENT_LANDING_SECTIONS,
    legacyField: EVENT_LANDING_LEGACY_FIELD,
    accentAllowed: EVENT_ACCENT_ALLOWED,
  },
  programmeLanding: {
    sections: PROGRAMME_LANDING_SECTIONS,
    legacyField: PROGRAMME_LANDING_LEGACY_FIELD,
    accentAllowed: PROGRAMME_ACCENT_ALLOWED,
  },
};

/** Safe fallback theme for a card/grid section that must not be "accent". */
function safeDowngrade(def: SectionThemeDef | undefined): SectionTheme {
  const fallback = def?.defaultTheme ?? "light";
  // A few card sections (e.g. finalCta) default to "accent"; fall back to "dark".
  return fallback === "accent" ? "dark" : fallback;
}

/**
 * Enforce that "accent" is only used on accent-safe band sections for a single
 * landing page. Any card/grid section the AI marked "accent" (in the
 * `sectionThemes` map or a legacy `*Theme` field) is downgraded to its safe
 * default. Mutates `page` in place.
 *
 * @returns the `${pageKey}.${sectionId}` keys that were changed.
 */
export function guardPageThemes(pageKey: string, page: Record<string, unknown>): string[] {
  const cfg = PAGE_GUARDS[pageKey];
  if (!cfg || !page || typeof page !== "object") return [];

  const changed: string[] = [];
  const byId = new Map(cfg.sections.map((s) => [s.id, s]));

  const overrides: Record<string, unknown> =
    page.sectionThemes && typeof page.sectionThemes === "object"
      ? (page.sectionThemes as Record<string, unknown>)
      : {};

  // 1) Clamp the explicit per-section override map.
  for (const [id, value] of Object.entries(overrides)) {
    if (asSectionTheme(value) === "accent" && !cfg.accentAllowed.has(id)) {
      overrides[id] = safeDowngrade(byId.get(id));
      changed.push(`${pageKey}.${id}`);
    }
  }

  // 2) Clamp legacy *Theme fields that map to unsafe sections, mirroring the
  //    result into the override map so the resolved theme is unambiguous.
  for (const [id, field] of Object.entries(cfg.legacyField)) {
    if (cfg.accentAllowed.has(id)) continue;
    if (asSectionTheme(page[field]) === "accent") {
      const safe = safeDowngrade(byId.get(id));
      page[field] = safe;
      overrides[id] = safe;
      if (!changed.includes(`${pageKey}.${id}`)) changed.push(`${pageKey}.${id}`);
    }
  }

  if (Object.keys(overrides).length > 0) page.sectionThemes = overrides;
  return changed;
}

/**
 * Guard every landing page on a funnel content object. Mutates `content` in
 * place and returns the list of changed `${pageKey}.${sectionId}` keys.
 */
export function guardFunnelThemes(content: Record<string, unknown>): string[] {
  const changed: string[] = [];
  for (const pageKey of Object.keys(PAGE_GUARDS)) {
    const page = content[pageKey];
    if (page && typeof page === "object") {
      changed.push(...guardPageThemes(pageKey, page as Record<string, unknown>));
    }
  }
  return changed;
}
