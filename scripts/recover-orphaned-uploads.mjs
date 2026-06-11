/**
 * Recover orphaned wizard uploads.
 *
 * Files uploaded during the wizard land in storage immediately, but a debounce
 * race historically meant some URLs were never written into the submission's
 * step_data — leaving them orphaned in storage. This script re-attaches each
 * orphaned image to the submission that was active when it was uploaded.
 *
 * USAGE:
 *   node scripts/recover-orphaned-uploads.mjs <USER_ID>            # dry run (default)
 *   node scripts/recover-orphaned-uploads.mjs <USER_ID> --apply    # actually writes
 *
 * Mapping rules:
 *   • Owning submission = the submission with the latest created_at that is still
 *     <= the file's upload time (i.e. the funnel you were working on then).
 *   • SAFETY: by default only submissions that currently have ZERO images are
 *     recovered. Orphans can be either (a) uploads lost to the old debounce bug
 *     OR (b) images the user deliberately removed (remove() drops the URL from
 *     step_data but leaves the file in storage). A submission with a curated set
 *     of images is assumed intact; its orphans are treated as intentional
 *     deletions and left alone. Pass --include-nonempty to override.
 *   • Field by file type:
 *       .svg                       -> additionalImageUrls (icons & badges)
 *       .png                       -> additionalImageUrls (icons & badges; usually transparent)
 *       .jpg / .jpeg / .webp / .gif-> lifestyleImageUrls  (supporting imagery)
 *     (Hero is left untouched — pick those in the editor's image picker, which
 *      now shows your full upload library. Re-sorting within the wizard is quick.)
 *   • Files are appended (deduped); nothing existing is removed.
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

const USER = process.argv[2];
const APPLY = process.argv.includes("--apply");
const INCLUDE_NONEMPTY = process.argv.includes("--include-nonempty");
if (!USER) {
  console.error("Usage: node scripts/recover-orphaned-uploads.mjs <USER_ID> [--apply]");
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = "wizard-uploads";
const IMAGE_FIELDS = ["heroImageUrls", "lifestyleImageUrls", "additionalImageUrls"];
const isImage = (n) => /\.(jpe?g|png|webp|gif|svg)$/i.test(n);
const fieldForFile = (n) => (/\.(svg|png)$/i.test(n) ? "additionalImageUrls" : "lifestyleImageUrls");

// ── Load submissions ──
const { data: subs, error: subErr } = await supabase
  .from("wizard_submissions")
  .select("id, name, step_data, created_at")
  .eq("user_id", USER)
  .order("created_at", { ascending: true });
if (subErr) { console.error("submission query failed:", subErr.message); process.exit(1); }
if (!subs?.length) { console.error("No submissions for user", USER); process.exit(1); }

// Build the set of already-referenced filenames across ALL submissions.
const referenced = new Set();
for (const s of subs) {
  for (const f of IMAGE_FIELDS) {
    for (const u of (s.step_data?.[f] ?? [])) {
      if (typeof u === "string") referenced.add(u.split("/").pop());
    }
  }
}

// ── List storage files ──
const { data: files, error: listErr } = await supabase.storage
  .from(BUCKET).list(USER, { limit: 2000, sortBy: { column: "created_at", order: "asc" } });
if (listErr) { console.error("storage list failed:", listErr.message); process.exit(1); }

const orphans = (files ?? []).filter((f) => isImage(f.name) && !referenced.has(f.name));

// A submission is "empty" if it has no images in any of the three fields.
const totalImages = (s) => IMAGE_FIELDS.reduce((n, f) => n + (Array.isArray(s.step_data?.[f]) ? s.step_data[f].length : 0), 0);
const recoverable = new Set(subs.filter((s) => INCLUDE_NONEMPTY || totalImages(s) === 0).map((s) => s.id));

console.log(`User: ${USER}`);
console.log(`Submissions: ${subs.length} | Orphaned image files: ${orphans.length}`);
console.log(`Recovery target: ${INCLUDE_NONEMPTY ? "ALL submissions (--include-nonempty)" : "only submissions with 0 images (safe default)"}`);
for (const s of subs) {
  const t = totalImages(s);
  console.log(`  ${recoverable.has(s.id) ? "RECOVER" : "skip   "}  ${s.name}  (currently ${t} images)`);
}
console.log(APPLY ? "\n*** APPLY MODE — writes will be performed ***\n" : "\n--- DRY RUN (pass --apply to write) ---\n");

const publicUrl = (name) => supabase.storage.from(BUCKET).getPublicUrl(`${USER}/${name}`).data.publicUrl;

// Owning submission = latest submission created at or before the file's upload time.
function owningSub(fileCreatedAt) {
  const t = new Date(fileCreatedAt).getTime();
  let owner = subs[0];
  for (const s of subs) {
    if (new Date(s.created_at).getTime() <= t) owner = s;
  }
  return owner;
}

// Plan: submissionId -> { name, additions: { field -> [urls] } }
const plan = new Map();
let skippedCount = 0;
for (const file of orphans) {
  const sub = owningSub(file.created_at);
  if (!recoverable.has(sub.id)) { skippedCount++; continue; }
  const field = fieldForFile(file.name);
  if (!plan.has(sub.id)) plan.set(sub.id, { name: sub.name, additions: {} });
  const entry = plan.get(sub.id);
  (entry.additions[field] ??= []).push(publicUrl(file.name));
}

for (const [sid, { name, additions }] of plan) {
  console.log(`\n■ ${name}  (${sid})`);
  for (const field of IMAGE_FIELDS) {
    const urls = additions[field];
    if (urls?.length) {
      console.log(`    ${field}: +${urls.length}`);
      for (const u of urls) console.log(`        ${u.split("/").pop()}`);
    }
  }
}

if (skippedCount > 0) {
  console.log(`\n(${skippedCount} orphan(s) skipped — they belong to submissions that already have a curated image set, so they're treated as intentional deletions.)`);
}

if (!APPLY) {
  console.log("\nNothing written. Re-run with --apply to perform recovery.");
  process.exit(0);
}

// ── Apply ──
console.log("\nApplying…");
for (const [sid, { name, additions }] of plan) {
  const sub = subs.find((s) => s.id === sid);
  const stepData = { ...(sub.step_data ?? {}) };
  for (const field of IMAGE_FIELDS) {
    const adds = additions[field];
    if (!adds?.length) continue;
    const existing = Array.isArray(stepData[field]) ? stepData[field] : [];
    const merged = [...existing];
    for (const u of adds) if (!merged.includes(u)) merged.push(u);
    stepData[field] = merged;
  }
  const { error } = await supabase
    .from("wizard_submissions")
    .update({ step_data: stepData, updated_at: new Date().toISOString() })
    .eq("id", sid)
    .eq("user_id", USER);
  console.log(error ? `  ✗ ${name}: ${error.message}` : `  ✓ ${name} updated`);
}
console.log("\nDone.");
process.exit(0);
