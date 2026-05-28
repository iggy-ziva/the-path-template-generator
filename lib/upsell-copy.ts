/** Fallback when only raw wizard description exists (no AI-distilled c.description). */
export function distillUpsellDescription(text: string, maxChars = 180): string {
  let trimmed = text.trim();
  if (!trimmed) return "";

  // Strip price / urgency tail from pasted sales copy (even when under maxChars)
  const priceSplit = trimmed.split(
    /\b(?:for just|for only|only \$\d|save \$\d|regular value|regular price|\(\s*save\b)/i,
  )[0];
  if (priceSplit && priceSplit.trim().length >= 40 && priceSplit.trim().length < trimmed.length) {
    trimmed = priceSplit.trim();
  }

  if (trimmed.length <= maxChars) return trimmed;

  const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (sentences && sentences.length >= 2) {
    const two = sentences.slice(0, 2).join("").trim();
    if (two.length <= maxChars * 1.25) return two;
  }
  if (sentences?.[0]) {
    const one = sentences[0].trim();
    if (one.length <= maxChars * 1.25) return one;
  }

  const words = trimmed.split(/\s+/);
  if (words.length > 28) {
    return `${words.slice(0, 28).join(" ")}…`;
  }

  const cut = trimmed.slice(0, maxChars);
  return `${cut.replace(/\s+\S*$/, "").trim()}…`;
}
