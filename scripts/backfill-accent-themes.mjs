/**
 * Backfill accent-band theme fixes across existing generated funnels.
 *
 * The "accent" surface is a mid-tone branded band that only reads correctly on
 * simple text / CTA "moment" sections. Card/grid sections (includes, bonuses,
 * outcomes, etc.) render their card chrome unreadably on the accent band. The
 * generator now guards against this (lib/section-theme-guard.ts); this script
 * applies the same correction to funnels generated before the guard existed.
 *
 * USAGE:
 *   node scripts/backfill-accent-themes.mjs                 # dry run (all funnels)
 *   node scripts/backfill-accent-themes.mjs --apply         # write changes
 *   node scripts/backfill-accent-themes.mjs <FUNNEL_ID>     # dry run, single funnel
 *   node scripts/backfill-accent-themes.mjs <FUNNEL_ID> --apply
 *
 * NOTE: The allowlist / downgrade rules below mirror lib/section-theme-guard.ts,
 * which is the canonical source of truth.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const rawLine of env.split("\n")) {
  const line = rawLine.replace(/\r$/, "");
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) {
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    process.env[m[1]] = val;
  }
}

const APPLY = process.argv.includes("--apply");
const FUNNEL_ID = process.argv.slice(2).find((a) => !a.startsWith("--"));

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Guard config (mirrors lib/section-theme-guard.ts) ──
const ACCENT_ALLOWED = {
  eventLanding: new Set([
    "stickyBar", "hero", "encourage1", "encourage2", "encourage3",
    "register", "finalVp", "credibility1", "credibility2", "credibility3",
    "personalMessage", "extraVp",
  ]),
  programmeLanding: new Set([
    "progHero", "alreadyTried", "priceRepeat", "credibility",
  ]),
};

const SECTION_DEFAULTS = {
  eventLanding: {
    stickyBar: "dark", hero: "dark", credibility1: "light", video: "light",
    audience: "light", encourage1: "dark", valueProp: "light", credibility2: "light",
    outcomes: "light", personalMessage: "light", encourage2: "accent", howItWorks: "light",
    eventOverview: "light", challenges: "light", credibility3: "light", extraVp: "accent",
    encourage3: "light", outcomes2: "light", testimonials: "light", finalVp: "dark",
    bio: "light", faq: "light", register: "dark", ftc: "light",
  },
  programmeLanding: {
    progHero: "dark", vision: "light", alreadyTried: "dark", promise: "light",
    includes: "light", session: "light", videoTestimonials: "dark", credibility: "light",
    bonuses: "light", priceRepeat: "dark", outcomes: "light", testimonials: "light",
    pricing: "light", host: "light", faq: "light", finalCta: "accent",
  },
};

const LEGACY_FIELD = {
  eventLanding: {
    hero: "heroTheme", encourage1: "encourage1Theme", encourage2: "encourage2Theme",
    encourage3: "encourage3Theme", finalVp: "finalVpTheme", register: "registerTheme",
  },
  programmeLanding: {
    alreadyTried: "alreadyTriedTheme", finalCta: "finalCtaTheme",
  },
};

const VALID = new Set(["dark", "accent", "light"]);
const asTheme = (v) => (typeof v === "string" && VALID.has(v) ? v : undefined);

function safeDowngrade(pageKey, id) {
  const fallback = SECTION_DEFAULTS[pageKey]?.[id] ?? "light";
  return fallback === "accent" ? "dark" : fallback;
}

/** Mutates page; returns array of changed section ids. */
function guardPage(pageKey, page) {
  if (!page || typeof page !== "object") return [];
  const allowed = ACCENT_ALLOWED[pageKey];
  if (!allowed) return [];
  const changed = [];
  const overrides = page.sectionThemes && typeof page.sectionThemes === "object" ? page.sectionThemes : {};

  for (const [id, value] of Object.entries(overrides)) {
    if (asTheme(value) === "accent" && !allowed.has(id)) {
      overrides[id] = safeDowngrade(pageKey, id);
      changed.push(id);
    }
  }
  for (const [id, field] of Object.entries(LEGACY_FIELD[pageKey] ?? {})) {
    if (allowed.has(id)) continue;
    if (asTheme(page[field]) === "accent") {
      const safe = safeDowngrade(pageKey, id);
      page[field] = safe;
      overrides[id] = safe;
      if (!changed.includes(id)) changed.push(id);
    }
  }
  if (Object.keys(overrides).length > 0) page.sectionThemes = overrides;
  return changed;
}

// ── Load funnels ──
let query = supabase.from("generated_funnels").select("id, content");
if (FUNNEL_ID) query = query.eq("id", FUNNEL_ID);
const { data: funnels, error } = await query;
if (error) { console.error("query failed:", error.message); process.exit(1); }
if (!funnels?.length) { console.error("No funnels found."); process.exit(1); }

console.log(`Funnels: ${funnels.length}`);
console.log(APPLY ? "*** APPLY MODE — writes will be performed ***\n" : "--- DRY RUN (pass --apply to write) ---\n");

let changedFunnels = 0;
let totalSections = 0;

for (const f of funnels) {
  const content = f.content;
  if (!content || typeof content !== "object") continue;
  const fixes = [];
  for (const pageKey of ["eventLanding", "programmeLanding"]) {
    for (const id of guardPage(pageKey, content[pageKey])) fixes.push(`${pageKey}.${id}`);
  }
  if (fixes.length === 0) continue;

  changedFunnels++;
  totalSections += fixes.length;
  console.log(`■ ${f.id}`);
  for (const fix of fixes) console.log(`    accent → safe   ${fix}`);

  if (APPLY) {
    const { error: upErr } = await supabase
      .from("generated_funnels")
      .update({ content })
      .eq("id", f.id);
    console.log(upErr ? `    ✗ update failed: ${upErr.message}` : `    ✓ updated`);
  }
}

console.log(`\n${changedFunnels} funnel(s) with ${totalSections} section(s) ${APPLY ? "updated" : "to fix"}.`);
if (!APPLY && changedFunnels > 0) console.log("Re-run with --apply to write changes.");
process.exit(0);
