/** Whether a logo URL points at a format that cannot have transparency. */
export function logoUrlIsOpaque(url: string): boolean {
  const path = url.split("?")[0].toLowerCase();
  return /\.(jpe?g|gif)$/.test(path);
}

/** Whether to render the logo image (vs client name text). */
export function shouldShowLogoImage(
  logoUrl: string | null | undefined,
  logoTransparent?: boolean,
): boolean {
  if (!logoUrl) return false;
  if (!logoUrl.startsWith("http://") && !logoUrl.startsWith("https://")) return false;
  if (logoTransparent === true) return true;
  if (logoTransparent === false) return false;
  return !logoUrlIsOpaque(logoUrl);
}
