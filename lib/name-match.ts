// Lightweight person-name matching, used to keep the primary host from also
// appearing in the facilitators list. Token-based (not substring) so "Al" does
// not match "Alexandra", while "Aria" still matches "Aria Bloom".

function nameTokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * True when two names likely refer to the same person: the shorter token set is
 * fully contained in the longer one (e.g. "Aria" ⊂ "Aria Bloom").
 */
export function isSameName(a?: string | null, b?: string | null): boolean {
  const ta = nameTokens(a ?? "");
  const tb = nameTokens(b ?? "");
  if (!ta.length || !tb.length) return false;
  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  return short.every((t) => long.includes(t));
}
