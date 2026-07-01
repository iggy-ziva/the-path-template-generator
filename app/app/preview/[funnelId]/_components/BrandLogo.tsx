import type { CSSProperties } from "react";
import type { SectionTheme } from "@/lib/brand-surfaces";
import { shouldShowLogoImage, pickLogoVariant } from "@/lib/logo-display";
import { safeUrl } from "./funnel-types";

export { logoUrlIsOpaque, shouldShowLogoImage } from "@/lib/logo-display";

interface BrandLogoProps {
  logoUrl?: string | null;
  /** Light-coloured logo variant — used on dark/accent backgrounds. */
  logoLightUrl?: string | null;
  /** Dark-coloured logo variant — used on light backgrounds. */
  logoDarkUrl?: string | null;
  logoTransparent?: boolean;
  /**
   * Background this logo sits on. Dark/accent → light logo; light → dark logo.
   * Defaults to "dark" because headers and footers are dark surfaces.
   */
  background?: SectionTheme;
  name: string;
  /** Applied to the text fallback (e.g. sticky-bar `.logo`). */
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
}

export default function BrandLogo({
  logoUrl,
  logoLightUrl,
  logoDarkUrl,
  logoTransparent,
  background = "dark",
  name,
  className,
  style,
  imgStyle,
}: BrandLogoProps) {
  const backgroundIsDark = background !== "light";
  const chosen = pickLogoVariant({ logoUrl, logoLightUrl, logoDarkUrl }, backgroundIsDark);
  const url = safeUrl(chosen);
  // A chosen variant (light/dark) is always an uploaded transparent asset; only the
  // default logoUrl carries the explicit logoTransparent flag from the wizard.
  const transparent = chosen && chosen === logoUrl ? logoTransparent : true;

  if (url && shouldShowLogoImage(url, transparent)) {
    return (
      <img
        src={url}
        alt={name}
        style={imgStyle ?? style}
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent && !parent.textContent?.trim()) {
            parent.textContent = name;
            if (className) parent.className = className;
          }
        }}
      />
    );
  }

  if (url || name) {
    return (
      <div className={className} style={style}>
        {name}
      </div>
    );
  }

  return null;
}
