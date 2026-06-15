// ─────────────────────────────────────────────────────────────────────────────
// Edit-preservation / merge behaviour for copy-doc regeneration.
//
// Policy: the copy document is canonical for COPY. On regeneration, copy fields
// are always replaced from the (new version of the) document. Everything the
// user can change in the preview editor that is NOT copy — section themes, image
// assignments, logo overrides, icon overrides — is preserved from the previous
// generation. A copy-field-level merge (keeping manual copy tweaks) is
// intentionally out of scope: in copy-doc mode the source of truth is the doc.
// ─────────────────────────────────────────────────────────────────────────────

import { getPageSpec, type CopyDocPageKey } from "./copydoc-schema";

/** Content keys the copy document is authoritative for, for a given page. */
export function copyTargetKeys(page: CopyDocPageKey): Set<string> {
  const spec = getPageSpec(page);
  return new Set(spec ? spec.sections.flatMap((s) => s.fields.map((f) => f.target)) : []);
}

/** Event Landing copy targets (kept for convenience). */
export const EVENT_LANDING_COPY_TARGET_KEYS = copyTargetKeys("eventLanding");

/**
 * Merge a freshly mapped copy object over a previously generated page,
 * preserving the user's non-copy layout edits.
 *
 * - Copy-target keys: taken from `nextCopy` (document wins).
 * - All other keys present on `previous` (themes, *ImageUrl, *Icons, logoUrl,
 *   etc.): preserved.
 */
export function mergePreservingLayout(
  previous: Record<string, unknown> | undefined,
  nextCopy: Record<string, unknown>,
  page: CopyDocPageKey = "eventLanding",
): Record<string, unknown> {
  if (!previous) return { ...nextCopy };

  const targets = copyTargetKeys(page);
  const merged: Record<string, unknown> = { ...nextCopy };
  for (const [key, value] of Object.entries(previous)) {
    if (key === "_wizardSnapshot") continue;
    if (targets.has(key)) continue;                     // copy → document wins
    if (merged[key] === undefined) merged[key] = value; // preserve layout/edits
  }
  return merged;
}
