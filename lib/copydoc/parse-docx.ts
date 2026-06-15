// ─────────────────────────────────────────────────────────────────────────────
// parse-docx — converts a .docx buffer into semantic blocks via mammoth.
//
// mammoth maps Word Heading 1/2/3 styles to <h1>/<h2>/<h3> and bullet lists to
// <ul>/<ol>, which is exactly the structure our block parser expects. Tables,
// comments, and track-changes markup are dropped by mammoth's default rules.
// ─────────────────────────────────────────────────────────────────────────────

import { parseBlocksFromHtml, type Block } from "./parse-blocks";

export async function parseBlocksFromDocxBuffer(buffer: Buffer): Promise<{ blocks: Block[]; messages: string[] }> {
  const mammoth = (await import("mammoth")).default ?? (await import("mammoth"));
  const result = await mammoth.convertToHtml({ buffer });
  const blocks = parseBlocksFromHtml(result.value);
  const messages = (result.messages ?? []).map((m: { message: string }) => m.message);
  return { blocks, messages };
}
