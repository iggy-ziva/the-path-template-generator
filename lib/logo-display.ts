/** Whether a logo URL points at a format that cannot have transparency. */
export function logoUrlIsOpaque(url: string): boolean {
  const path = url.split("?")[0].toLowerCase();
  return /\.(jpe?g|gif)$/.test(path);
}

export interface LogoVariants {
  /** Default / primary logo — the fallback when no variant fits. */
  logoUrl?: string | null;
  /** Light-coloured logo, for dark/accent backgrounds. */
  logoLightUrl?: string | null;
  /** Dark-coloured logo, for light backgrounds. */
  logoDarkUrl?: string | null;
}

/**
 * Pick the best logo variant for a background.
 * Dark/accent backgrounds want the LIGHT logo; light backgrounds want the DARK logo.
 * Falls back to the default logo, then the opposite variant, so we always render
 * something when at least one asset exists.
 */
export function pickLogoVariant(
  variants: LogoVariants,
  backgroundIsDark: boolean,
): string | null | undefined {
  const preferred = backgroundIsDark ? variants.logoLightUrl : variants.logoDarkUrl;
  const opposite = backgroundIsDark ? variants.logoDarkUrl : variants.logoLightUrl;
  return preferred || variants.logoUrl || opposite || null;
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
