// ─────────────────────────────────────────────────────────────────────────────
// Block extraction — turns a copy document into an ordered list of semantic
// blocks (headings, paragraphs, lists) with leading bold runs preserved.
//
// Two front-ends share one block model:
//   • parseBlocksFromHtml  — consumes mammoth's clean HTML output (.docx path)
//   • parseBlocksFromMarkdown — consumes the .md template (verification path)
//
// Downstream, segment.ts walks these blocks against the canonical spec.
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockListItem {
  /** Full item text, plain. */
  text: string;
  /** Leading bold run, if the item begins with one (item title / FAQ question). */
  boldLead?: string;
}

export type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string; boldLead?: string }
  | { type: "list"; items: BlockListItem[] };

// ── shared text utilities ───────────────────────────────────────────────────

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&mdash;": "—",
  "&ndash;": "–",
  "&hellip;": "…",
  "&rsquo;": "\u2019",
  "&lsquo;": "\u2018",
  "&rdquo;": "\u201d",
  "&ldquo;": "\u201c",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/** Extracts a leading bold run from an HTML fragment, if present. */
function leadingBoldHtml(inner: string): string | undefined {
  const m = inner.match(/^\s*<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/i);
  if (!m) return undefined;
  const lead = stripTags(m[2]);
  return lead || undefined;
}

/** Extracts a leading **bold** run from a markdown fragment, if present. */
function leadingBoldMd(line: string): string | undefined {
  const m = line.match(/^\s*\*\*([^*]+)\*\*/);
  if (!m) return undefined;
  return m[1].trim() || undefined;
}

function stripMarkdownInline(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// ── HTML front-end (mammoth .docx output) ─────────────────────────────────────

export function parseBlocksFromHtml(html: string): Block[] {
  const blocks: Block[] = [];
  const BLOCK_RE = /<(h1|h2|h3|h4|h5|h6|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;

  while ((m = BLOCK_RE.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const inner = m[2];

    if (/^h[1-6]$/.test(tag)) {
      const level = Math.min(3, Number(tag[1])) as 1 | 2 | 3;
      const text = stripTags(inner);
      if (text) blocks.push({ type: "heading", level, text });
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items: BlockListItem[] = [];
      const LI_RE = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
      let li: RegExpExecArray | null;
      while ((li = LI_RE.exec(inner)) !== null) {
        const boldLead = leadingBoldHtml(li[1]);
        const text = stripTags(li[1]);
        if (text) items.push({ text, boldLead });
      }
      if (items.length) blocks.push({ type: "list", items });
      continue;
    }

    // paragraph
    const boldLead = leadingBoldHtml(inner);
    const text = stripTags(inner);
    if (text) blocks.push({ type: "paragraph", text, boldLead });
  }

  return blocks;
}

// ── Markdown front-end (template verification) ───────────────────────────────

export function parseBlocksFromMarkdown(md: string): Block[] {
  // Drop HTML comments (template usage notes) before parsing.
  const cleaned = md.replace(/<!--[\s\S]*?-->/g, "");
  const lines = cleaned.split(/\r?\n/);
  const blocks: Block[] = [];
  let listBuf: BlockListItem[] | null = null;

  const flushList = () => {
    if (listBuf && listBuf.length) blocks.push({ type: "list", items: listBuf });
    listBuf = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushList();
      const level = Math.min(3, heading[1].length) as 1 | 2 | 3;
      const text = stripMarkdownInline(heading[2]);
      if (text) blocks.push({ type: "heading", level, text });
      continue;
    }

    const listItem = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*)$/);
    if (listItem) {
      const boldLead = leadingBoldMd(listItem[1]);
      const text = stripMarkdownInline(listItem[1]);
      if (text) {
        listBuf = listBuf ?? [];
        listBuf.push({ text, boldLead });
      }
      continue;
    }

    // Markdown blockquotes (`>`) are treated as paragraphs.
    const quote = line.replace(/^\s*>\s?/, "");
    flushList();
    const boldLead = leadingBoldMd(quote);
    const text = stripMarkdownInline(quote);
    if (text) blocks.push({ type: "paragraph", text, boldLead });
  }

  flushList();
  return blocks;
}
