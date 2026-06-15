// ─────────────────────────────────────────────────────────────────────────────
// map-to-content — pure projection of a CopyDoc onto a page's copy fields.
//
// Writes ONLY the copy carried by the document, verbatim, into the targets
// declared in the canonical spec. No AI, no facts, no images, no themes — those
// are layered in afterwards by the generation pipeline. Generic across pages:
// item shapes come from each field's `itemShape`.
// ─────────────────────────────────────────────────────────────────────────────

import type { EventLandingContent, ProgrammeLandingContent } from "@/app/app/preview/[funnelId]/_components/funnel-types";
import { getPageSpec, type CopyDoc, type CopyItem, type CopyPageSpec, type CopyValue } from "./copydoc-schema";

function isCopyItemArray(value: CopyValue): value is CopyItem[] {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === "object";
}

/** Generic mapping: CopyDoc -> copy fields, driven entirely by the page spec. */
export function mapCopyDocToContent(doc: CopyDoc, spec: CopyPageSpec): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const byId = new Map(doc.sections.map((s) => [s.id, s]));

  for (const secSpec of spec.sections) {
    const section = byId.get(secSpec.id);
    if (!section) continue;

    for (const field of secSpec.fields) {
      const value = section.fields[field.key];
      if (value === undefined) continue;

      if (field.kind === "items" && isCopyItemArray(value)) {
        const shape = field.itemShape ?? ["title", "body"];
        out[field.target] = value.map((it) =>
          Object.fromEntries(shape.map((k) => [k, it[k] ?? ""])),
        );
      } else {
        out[field.target] = value;
      }
    }
  }

  return out;
}

export function mapCopyDocToEventLanding(doc: CopyDoc): Partial<EventLandingContent> {
  const spec = getPageSpec("eventLanding");
  if (!spec) return {};
  return mapCopyDocToContent(doc, spec) as Partial<EventLandingContent>;
}

export function mapCopyDocToProgrammeLanding(doc: CopyDoc): Partial<ProgrammeLandingContent> {
  const spec = getPageSpec("programmeLanding");
  if (!spec) return {};
  return mapCopyDocToContent(doc, spec) as Partial<ProgrammeLandingContent>;
}
