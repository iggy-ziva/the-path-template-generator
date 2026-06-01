import type { WizardSnapshot } from "../funnel-types";

export interface BrandColorOption {
  label: string;
  value: string;
}

function normalizeHex(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  const hex = s.startsWith("#") ? s : `#${s}`;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex) ? hex : null;
}

/**
 * The exact brand colours the user entered in the wizard, surfaced for the
 * per-text colour picker so they can recolour copy with their own palette.
 */
export function collectBrandColors(wizard: WizardSnapshot | null | undefined): BrandColorOption[] {
  const bc = wizard?.styleGuide?.brandColors;
  if (!bc) return [];
  const items: BrandColorOption[] = [];
  const push = (label: string, v: unknown) => {
    const hex = normalizeHex(v);
    if (hex) items.push({ label, value: hex });
  };
  push("Primary", bc.primary);
  push("Secondary", bc.secondary);
  push("Tertiary", bc.tertiary);
  push("Accent", bc.accent);
  push("Dark text", bc.textDark);
  push("Light text", bc.textLight);

  const seen = new Set<string>();
  return items.filter((it) => {
    const k = it.value.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
