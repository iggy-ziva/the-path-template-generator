// ─────────────────────────────────────────────────────────────────────────────
// Segment — deterministically maps an ordered block list onto the canonical
// page spec, producing a CopyDoc. Text is copied verbatim; nothing is reworded
// or invented. Unmatched headings become warnings, never silent guesses.
// ─────────────────────────────────────────────────────────────────────────────

import type { Block } from "./parse-blocks";
import {
  COPYDOC_VERSION,
  type CopyDoc,
  type CopyDocPageKey,
  type CopyDocSection,
  type CopyFieldSpec,
  type CopyItem,
  type CopyPageSpec,
  type CopySectionSpec,
  type CopyValue,
} from "./copydoc-schema";

/** Normalise a heading/label for tolerant matching. */
function norm(s: string): string {
  return s
    .replace(/^\s*\d+\s*[—\-–.):]*\s*/, "") // strip leading "02 —", "6.", etc.
    .replace(/\([^)]*\)/g, "")              // strip parentheticals
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");            // keep only alphanumerics
}

function matchesSection(text: string, spec: CopySectionSpec): boolean {
  const n = norm(text);
  if (norm(spec.heading) === n) return true;
  return (spec.aliases ?? []).some((a) => norm(a) === n);
}

function matchesField(text: string, field: CopyFieldSpec): boolean {
  const n = norm(text);
  if (norm(field.label) === n) return true;
  return (field.aliases ?? []).some((a) => norm(a) === n);
}

/** Removes a leading bold run (and trailing separator punctuation) from text. */
function stripLead(text: string, lead: string): string {
  let rest = text;
  if (lead && rest.toLowerCase().startsWith(lead.toLowerCase())) {
    rest = rest.slice(lead.length);
  }
  return rest.replace(/^[\s.:—–\-]+/, "").trim();
}

/** Split a "Name — Title" (or "Name, Title") lead into its two parts. */
function splitNameTitle(lead: string): { name: string; title: string } {
  const t = lead.trim();
  const m = t.match(/^(.*?)\s*[—–\-|,·:]\s*(.+)$/);
  if (m) return { name: m[1].trim(), title: m[2].trim() };
  return { name: t, title: "" };
}

/** A short, punctuation-free line reads as a person's name/title, not a bio. */
function looksLikeName(text: string): boolean {
  const t = text.trim();
  if (!t || t.length > 70) return false;
  if (/[.!?:;]$/.test(t)) return false;
  return t.split(/\s+/).length <= 7;
}

/**
 * Group free-form paragraphs into people. A short, punctuation-free line starts
 * a new person (its name); the paragraphs that follow are that person's bio. A
 * bold lead ("**Name — Title** bio") also starts a new person. This prevents a
 * single facilitator's name + bio from exploding into multiple entries.
 */
function assemblePeople(paragraphs: { text: string; boldLead?: string }[], shape: string[]): CopyItem[] {
  const [kName, kTitle, kBody] = shape;
  const people: CopyItem[] = [];
  let cur: CopyItem | null = null;
  const push = () => { if (cur) { people.push(cur); cur = null; } };

  for (const p of paragraphs) {
    const text = p.text.trim();
    if (!text) continue;
    const lead = p.boldLead?.trim();
    if (lead) {
      push();
      const { name, title } = splitNameTitle(lead);
      cur = { [kName]: name, [kTitle]: title, [kBody]: stripLead(p.text, p.boldLead!) };
    } else if (looksLikeName(text)) {
      // A bare short line after a name (with no bio/title yet) is the title;
      // otherwise it begins a new person.
      if (cur && !cur[kBody] && !cur[kTitle]) {
        cur[kTitle] = text;
      } else {
        push();
        cur = { [kName]: text, [kTitle]: "", [kBody]: "" };
      }
    } else {
      if (!cur) cur = { [kName]: "", [kTitle]: "", [kBody]: "" };
      cur[kBody] = cur[kBody] ? `${cur[kBody]}\n\n${text}` : text;
    }
  }
  push();
  return people;
}

function buildItem(item: { text: string; boldLead?: string }, shape: string[]): CopyItem {
  const [a, b] = shape;

  // FAQ: "Q: question?" then answer.
  if (shape[0] === "question") {
    let question = item.boldLead ?? "";
    let answer = stripLead(item.text, item.boldLead ?? "");
    question = question.replace(/^q\s*[:.\-]?\s*/i, "").trim();
    if (!question) {
      const qm = item.text.match(/^([\s\S]*?\?)\s*([\s\S]*)$/);
      if (qm) {
        question = qm[1].replace(/^q\s*[:.\-]?\s*/i, "").trim();
        answer = qm[2].trim();
      }
    }
    return { question, answer };
  }

  // From/To pairs: From "x" to "y". Prefer the quoted form so an inner " to "
  // (e.g. "I need to change") doesn't split the phrase early.
  if (shape[0] === "from") {
    const quoted = item.text.match(/from\s+["“']([\s\S]+?)["”']\s+to\s+["“']([\s\S]+?)["”']/i);
    if (quoted) return { from: quoted[1].trim(), to: quoted[2].trim() };
    const loose = item.text.match(/^from\s+([\s\S]+?)\s+to\s+([\s\S]+?)\.?$/i);
    if (loose) return { from: loose[1].replace(/^["“']|["”']$/g, "").trim(), to: loose[2].replace(/^["“']|["”']$/g, "").trim() };
    return { from: item.text.trim(), to: "" };
  }

  // Facilitator / person: bold lead is "Name — Title" (or "Name, Title"),
  // remainder is the bio. Split the lead on the first separator into name + title.
  if (shape[0] === "name") {
    const [kName, kTitle, kBody] = shape;
    if (item.boldLead) {
      const { name, title } = splitNameTitle(item.boldLead);
      return { [kName]: name, [kTitle]: title, [kBody]: stripLead(item.text, item.boldLead) };
    }
    return { [kName]: item.text.trim(), [kTitle]: "", [kBody]: "" };
  }

  // Generic two-part: leading bold = first field, remainder = second. Only the
  // title-style first field gets trailing punctuation trimmed; quotes are kept
  // verbatim.
  if (item.boldLead) {
    const first = a === "title" ? item.boldLead.replace(/[.:]$/, "").trim() : item.boldLead.trim();
    return { [a]: first, [b]: stripLead(item.text, item.boldLead) };
  }
  return { [a]: item.text.trim(), [b]: "" };
}

export function assembleValue(field: CopyFieldSpec, blocks: Block[]): CopyValue | undefined {
  const paragraphs = blocks.filter((b) => b.type === "paragraph") as Extract<Block, { type: "paragraph" }>[];
  const lists = blocks.filter((b) => b.type === "list") as Extract<Block, { type: "list" }>[];

  if (field.kind === "text") {
    const text = paragraphs.map((p) => p.text).join(" ").trim();
    if (text) return text;
    const fallback = lists.flatMap((l) => l.items.map((i) => i.text)).join(" ").trim();
    return fallback || undefined;
  }

  if (field.kind === "list") {
    const fromLists = lists.flatMap((l) => l.items.map((i) => i.text));
    if (fromLists.length) return fromLists;
    const fromParas = paragraphs.map((p) => p.text);
    return fromParas.length ? fromParas : undefined;
  }

  // items
  const shape = field.itemShape ?? ["title", "body"];

  // People/facilitators: bullets are explicit delimiters (one person each), but
  // when authored as prose, group each name line with the bio paragraphs that
  // follow it — rather than turning every paragraph into a separate person.
  if (shape[0] === "name") {
    if (lists.length) {
      const items = lists.flatMap((l) => l.items).map((i) => buildItem(i, shape));
      return items.length ? items : undefined;
    }
    const people = assemblePeople(paragraphs.map((p) => ({ text: p.text, boldLead: p.boldLead })), shape);
    return people.length ? people : undefined;
  }

  const rawItems: { text: string; boldLead?: string }[] = [
    ...lists.flatMap((l) => l.items),
    // Allow paragraph-per-item authoring as a fallback.
    ...(lists.length === 0 ? paragraphs.map((p) => ({ text: p.text, boldLead: p.boldLead })) : []),
  ];
  if (!rawItems.length) return undefined;
  return rawItems.map((i) => buildItem(i, shape));
}

export interface SegmentResult {
  doc: CopyDoc;
  /** Content blocks that couldn't be placed deterministically (for AI fallback). */
  unmatched: Block[];
}

export function segmentBlocks(blocks: Block[], spec: CopyPageSpec): SegmentResult {
  const sections: CopyDocSection[] = [];
  const warnings: string[] = [];
  const unmatched: Block[] = [];

  let curSpec: CopySectionSpec | null = null;
  let curSection: CopyDocSection | null = null;
  let curField: CopyFieldSpec | null = null;
  let fieldBuffer: Block[] = [];

  const flushField = () => {
    if (curField && curSection) {
      const value = assembleValue(curField, fieldBuffer);
      if (value !== undefined) curSection.fields[curField.key] = value;
    }
    curField = null;
    fieldBuffer = [];
  };

  const flushSection = () => {
    flushField();
    if (curSection && Object.keys(curSection.fields).length > 0) {
      sections.push(curSection);
    }
    curSection = null;
    curSpec = null;
  };

  for (const block of blocks) {
    if (block.type === "heading" && block.level === 1) {
      // Page heading — ignored for segmentation.
      continue;
    }

    if (block.type === "heading" && block.level === 2) {
      flushSection();
      const found = spec.sections.find((s) => matchesSection(block.text, s));
      if (found) {
        curSpec = found;
        curSection = { id: found.id, heading: found.heading, fields: {} };
      } else {
        warnings.push(`Unrecognised section heading: "${block.text}"`);
      }
      continue;
    }

    if (block.type === "heading" && block.level === 3) {
      flushField();
      if (!curSpec || !curSection) {
        warnings.push(`Field "${block.text}" appears before any recognised section.`);
        continue;
      }
      const found = curSpec.fields.find((f) => matchesField(block.text, f));
      if (found) {
        curField = found;
      } else {
        warnings.push(`Unrecognised field "${block.text}" in section "${curSpec.heading}".`);
      }
      continue;
    }

    // content block
    if (curField) fieldBuffer.push(block);
    else unmatched.push(block);
  }

  flushSection();

  return {
    doc: {
      version: COPYDOC_VERSION,
      page: spec.page as CopyDocPageKey,
      sections,
      warnings,
    },
    unmatched,
  };
}
