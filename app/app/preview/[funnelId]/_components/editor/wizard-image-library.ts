import type { WizardSnapshot } from "../funnel-types";

export interface ImageLibraryItem {
  url: string;
  label: string;
}

function isImageUrl(u: unknown): u is string {
  if (typeof u !== "string") return false;
  const s = u.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  // Exclude obvious non-images (PDFs, fonts, videos).
  if (/\.(pdf|docx?|pptx?|woff2?|ttf|otf|mp4|mov|webm)(\?|$)/i.test(s)) return false;
  return true;
}

/**
 * Collect every image the user uploaded during the wizard so the in-preview
 * image picker can offer them for reuse. Deduped, in a sensible display order.
 */
export function collectWizardImages(wizard: WizardSnapshot | null | undefined): ImageLibraryItem[] {
  if (!wizard) return [];
  const items: ImageLibraryItem[] = [];
  const push = (url: unknown, label: string) => {
    if (isImageUrl(url)) items.push({ url, label });
  };

  // Step 9 — curated image uploads
  (wizard.heroImageUrls ?? []).forEach((u, i) => push(u, `Hero image ${i + 1}`));
  (wizard.lifestyleImageUrls ?? []).forEach((u, i) => push(u, `Lifestyle ${i + 1}`));
  (wizard.additionalImageUrls ?? []).forEach((u, i) => push(u, `Additional ${i + 1}`));

  // Step 7 — uploaded existing materials (filter out PDFs / docs)
  (wizard.existingFileUrls ?? []).forEach((u, i) => push(u, `Uploaded file ${i + 1}`));
  (wizard.existingMaterialUrls ?? []).forEach((u, i) => push(u, `Material ${i + 1}`));

  // Step 1 / 2 — host and brand assets
  push(wizard.hostHeadshotUrl, "Host headshot");
  push(wizard.hostSignatureUrl, "Host signature");
  push(wizard.logoUrl, "Logo");
  (wizard.pressLogos ?? []).forEach((p) => push(p?.logoUrl, p?.name ? `${p.name} logo` : "Press logo"));

  // Dedupe by URL, keeping the first (most descriptive) label.
  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}
