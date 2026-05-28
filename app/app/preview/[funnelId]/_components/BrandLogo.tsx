import type { CSSProperties } from "react";
import { shouldShowLogoImage } from "@/lib/logo-display";
import { safeUrl } from "./funnel-types";

export { logoUrlIsOpaque, shouldShowLogoImage } from "@/lib/logo-display";

interface BrandLogoProps {
  logoUrl?: string | null;
  logoTransparent?: boolean;
  name: string;
  /** Applied to the text fallback (e.g. sticky-bar `.logo`). */
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
}

export default function BrandLogo({
  logoUrl,
  logoTransparent,
  name,
  className,
  style,
  imgStyle,
}: BrandLogoProps) {
  const url = safeUrl(logoUrl);

  if (url && shouldShowLogoImage(url, logoTransparent)) {
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
