// ─────────────────────────────────────────────────────────────────────────────
// AI structuring-only fallback.
//
// When the deterministic parser can't place some copy (the author deviated from
// the template), we ask Claude to CLASSIFY the leftover blocks into known
// fields. Crucially, Claude only returns block INDICES — never text — so the
// copy that lands in the page is always our verbatim source. A normalised
// verbatim guard double-checks this invariant before anything is accepted.
// ─────────────────────────────────────────────────────────────────────────────

import type Anthropic from "@anthropic-ai/sdk";
import type { Block } from "./parse-blocks";
import { assembleValue } from "./segment";
import type { CopyDoc, CopyPageSpec, CopyValue } from "./copydoc-schema";

const FALLBACK_MODEL = process.env.ANTHROPIC_CLASSIFY_MODEL ?? process.env.ANTHROPIC_GENERATION_MODEL ?? "claude-sonnet-4-5";

function blockText(b: Block): string {
  if (b.type === "heading") return b.text;
  if (b.type === "paragraph") return b.text;
  return b.items.map((i) => i.text).join(" • ");
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Verbatim guard — the assembled value must come from the source block pool. */
function isVerbatim(value: CopyValue, pool: string): boolean {
  const np = normalize(pool);
  const check = (s: string) => {
    const n = normalize(s);
    return n.length === 0 || np.includes(n);
  };
  if (typeof value === "string") return check(value);
  if (Array.isArray(value)) {
    return value.every((v) => (typeof v === "string" ? check(v) : Object.values(v).every(check)));
  }
  return false;
}

interface MissingField {
  sectionId: string;
  sectionHeading: string;
  key: string;
  label: string;
  kind: string;
}

function collectMissingFields(doc: CopyDoc, spec: CopyPageSpec): MissingField[] {
  const byId = new Map(doc.sections.map((s) => [s.id, s]));
  const missing: MissingField[] = [];
  for (const sec of spec.sections) {
    const got = byId.get(sec.id);
    for (const f of sec.fields) {
      const present = got?.fields[f.key] !== undefined;
      if (!present) {
        missing.push({ sectionId: sec.id, sectionHeading: sec.heading, key: f.key, label: f.label, kind: f.kind });
      }
    }
  }
  return missing;
}

interface Assignment {
  field: string; // "sectionId.key"
  blocks: number[];
}

function extractJson(raw: string): string {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : raw;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start >= 0 && end > start ? body.slice(start, end + 1) : body;
}

/**
 * Classifies unmatched blocks into missing fields using Claude (indices only),
 * then merges verbatim values into `doc`. Mutates and returns `doc`. Never
 * overwrites a field the deterministic pass already filled.
 */
export async function applyAiFallback(
  doc: CopyDoc,
  unmatched: Block[],
  spec: CopyPageSpec,
  anthropic: Anthropic,
): Promise<{ doc: CopyDoc; warnings: string[] }> {
  const warnings: string[] = [];
  const missing = collectMissingFields(doc, spec);
  if (unmatched.length === 0 || missing.length === 0) return { doc, warnings };

  const blockList = unmatched.map((b, i) => `[${i}] (${b.type}) ${blockText(b)}`).join("\n");
  const fieldList = missing
    .map((m) => `- ${m.sectionId}.${m.key} — ${m.sectionHeading} › ${m.label} (${m.kind})`)
    .join("\n");

  const prompt = `You classify pre-written landing-page copy into known fields. You MUST NOT rewrite, summarise, translate, or invent any text. Return ONLY which block indices belong to which field.

BLOCKS:
${blockList}

TARGET FIELDS (assign blocks to these; a "list"/"items" field may take multiple blocks):
${fieldList}

Rules:
- Use each block at most once.
- Omit any block that does not clearly belong to a field.
- Output strict JSON only: {"assignments":[{"field":"sectionId.key","blocks":[0,1]}]}`;

  let assignments: Assignment[] = [];
  try {
    const res = await anthropic.messages.create({
      model: FALLBACK_MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const parsed = JSON.parse(extractJson(text)) as { assignments?: Assignment[] };
    assignments = Array.isArray(parsed.assignments) ? parsed.assignments : [];
  } catch (err) {
    warnings.push(`AI fallback unavailable: ${err instanceof Error ? err.message : "classification failed"}`);
    return { doc, warnings };
  }

  const specByField = new Map<string, { sec: typeof spec.sections[number]; f: typeof spec.sections[number]["fields"][number] }>(
    spec.sections.flatMap((sec) => sec.fields.map((f) => [`${sec.id}.${f.key}`, { sec, f }] as const)),
  );
  const pool = unmatched.map(blockText).join("\n");
  const usedBlocks = new Set<number>();

  for (const a of assignments) {
    const entry = specByField.get(a.field);
    if (!entry || !Array.isArray(a.blocks)) continue;
    const { sec, f } = entry;

    // Skip if deterministic pass already filled this field.
    const existing = doc.sections.find((s) => s.id === sec.id);
    if (existing?.fields[f.key] !== undefined) continue;

    const chosen = a.blocks
      .filter((i) => Number.isInteger(i) && i >= 0 && i < unmatched.length && !usedBlocks.has(i))
      .map((i) => unmatched[i]);
    if (chosen.length === 0) continue;

    const value = assembleValue(f, chosen);
    if (value === undefined || !isVerbatim(value, pool)) {
      warnings.push(`AI fallback rejected a non-verbatim assignment for ${sec.heading} › ${f.label}.`);
      continue;
    }

    a.blocks.forEach((i) => usedBlocks.add(i));
    let section = doc.sections.find((s) => s.id === sec.id);
    if (!section) {
      section = { id: sec.id, heading: sec.heading, fields: {} };
      doc.sections.push(section);
    }
    section.fields[f.key] = value;
    warnings.push(`AI fallback placed copy into ${sec.heading} › ${f.label}.`);
  }

  return { doc, warnings };
}
