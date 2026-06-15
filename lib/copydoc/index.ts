// ─────────────────────────────────────────────────────────────────────────────
// Copy-Document engine — public surface.
//
// parse (.docx | .md) -> segment -> [optional AI fallback] -> validate
// (coverage) -> map (copy fields). The result pairs a
// Partial<EventLandingContent> of verbatim copy with a coverage report. Facts,
// prices, images and themes are layered on at generation time (the page
// components fall back to the wizard snapshot).
// ─────────────────────────────────────────────────────────────────────────────

import type Anthropic from "@anthropic-ai/sdk";
import type { EventLandingContent } from "@/app/app/preview/[funnelId]/_components/funnel-types";
import { getPageSpec, type CopyDoc, type CopyDocPageKey } from "./copydoc-schema";
import { parseBlocksFromMarkdown, type Block } from "./parse-blocks";
import { parseBlocksFromDocxBuffer } from "./parse-docx";
import { segmentBlocks } from "./segment";
import { buildCoverageReport, type CoverageReport } from "./validate";
import { mapCopyDocToContent, mapCopyDocToEventLanding, mapCopyDocToProgrammeLanding } from "./map-to-content";
import { applyAiFallback } from "./ai-fallback";

export type { CopyDoc, CoverageReport };
export { mapCopyDocToEventLanding, mapCopyDocToProgrammeLanding, mapCopyDocToContent };

export interface CopyDocResult {
  copyDoc: CopyDoc;
  report: CoverageReport;
  /** Verbatim copy projected onto the page content (copy fields only). */
  content: Partial<EventLandingContent> & Record<string, unknown>;
}

function finalize(copyDoc: CopyDoc, page: CopyDocPageKey): CopyDocResult {
  const spec = getPageSpec(page)!;
  const report = buildCoverageReport(copyDoc, spec);
  const content = mapCopyDocToContent(copyDoc, spec);
  return { copyDoc, report, content };
}

async function buildFromBlocks(
  blocks: Block[],
  page: CopyDocPageKey,
  anthropic?: Anthropic,
): Promise<CopyDocResult> {
  const spec = getPageSpec(page);
  if (!spec) throw new Error(`No copy-doc spec registered for page "${page}".`);

  const { doc, unmatched } = segmentBlocks(blocks, spec);
  let result = finalize(doc, page);

  // Only spend an AI call when deterministic parsing left required copy missing
  // and there are leftover blocks to classify.
  if (anthropic && !result.report.ok && unmatched.length > 0) {
    const { doc: merged, warnings } = await applyAiFallback(doc, unmatched, spec, anthropic);
    merged.warnings.push(...warnings);
    result = finalize(merged, page);
  }

  return result;
}

export async function buildCopyDocFromDocx(
  buffer: Buffer,
  page: CopyDocPageKey = "eventLanding",
  anthropic?: Anthropic,
): Promise<CopyDocResult & { parseMessages: string[] }> {
  const { blocks, messages } = await parseBlocksFromDocxBuffer(buffer);
  const result = await buildFromBlocks(blocks, page, anthropic);
  result.report.warnings.push(...messages.filter(Boolean));
  return { ...result, parseMessages: messages };
}

/** Synchronous, deterministic-only build (no AI). Used for template verification. */
export function buildCopyDocFromMarkdown(
  markdown: string,
  page: CopyDocPageKey = "eventLanding",
): CopyDocResult {
  const spec = getPageSpec(page);
  if (!spec) throw new Error(`No copy-doc spec registered for page "${page}".`);
  const { doc } = segmentBlocks(parseBlocksFromMarkdown(markdown), spec);
  return finalize(doc, page);
}
