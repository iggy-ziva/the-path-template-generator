/** Classify and assign display (headline) vs body fonts from a detected font list. */

const SERIF_RE =
  /serif|garamond|times|crimson|playfair|merriweather|lora|georgia|tiempos|sectra|baskerville|cormorant|eb garamond|source serif|noto serif|libre baskerville|bitter|spectral|cardo|vollkorn|dm serif|fraunces|newsreader|literata|pt serif|alegreya|zilla slab|rokkitt|arvo|slabo|old standard|gentium|josefin slab/i;

const SANS_RE =
  /sans|roboto|inter|open sans|lato|montserrat|poppins|nunito|raleway|work sans|dm sans|figtree|manrope|red hat|ibm plex sans|system-ui|helvetica|arial|sohne|proxima|avenir|futura|barlow|rubik|outfit|plus jakarta|jakarta|exo|ubuntu|karla|mulish/i;

export function isSerifFont(name: string): boolean {
  return SERIF_RE.test(name);
}

export function isSansFont(name: string): boolean {
  if (SERIF_RE.test(name)) return false;
  return SANS_RE.test(name) || /sans$/i.test(name);
}

export interface FontRoles {
  display: string;
  body: string;
}

export interface FontRoleHints {
  fontDisplay?: string;
  fontBody?: string;
}

/** Pick display (headline) and body fonts from a detected list + optional explicit hints. */
export function resolveFontRoles(
  fonts: string[],
  hints?: FontRoleHints,
): FontRoles {
  const list = fonts.filter(Boolean);
  if (hints?.fontDisplay && hints?.fontBody) {
    return { display: hints.fontDisplay, body: hints.fontBody };
  }

  const serifs = list.filter(isSerifFont);
  const sans = list.filter(isSansFont);

  let display = hints?.fontDisplay ?? serifs[0] ?? sans[0] ?? list[0] ?? "Source Serif 4";
  let body = hints?.fontBody ?? sans.find((f) => f !== display) ?? sans[0] ?? serifs.find((f) => f !== display) ?? list.find((f) => f !== display) ?? list[0] ?? "Inter";

  if (display === body && list.length > 1) {
    const alt = list.find((f) => f !== display);
    if (alt) {
      if (isSansFont(alt) && isSerifFont(display)) body = alt;
      else if (isSerifFont(alt) && isSansFont(display)) body = display, display = alt;
      else body = alt;
    }
  }

  return { display, body };
}

function cleanFontName(raw: string): string {
  return raw
    .split(",")[0]
    .replace(/["']/g, "")
    .trim();
}

/** Scan CSS for heading vs body font-family declarations. */
export function detectFontRolesFromCss(css: string): FontRoleHints {
  const hints: FontRoleHints = {};

  const headingSelectors =
    /(?:^|[,\s])(?:h1|h2|h3|\.display-hero|\.display-section|\.headline|\.entry-title|\.elementor-heading-title)[^{]*\{([^}]+)\}/gim;
  const bodySelectors =
    /(?:^|[,\s])(?:body|html|p|\.body|\.entry-content|\.elementor-widget-text-editor)[^{]*\{([^}]+)\}/gim;

  for (const m of css.matchAll(headingSelectors)) {
    const ff = m[1].match(/font-family\s*:\s*([^;]+)/i);
    if (ff) {
      const name = cleanFontName(ff[1]);
      if (name && !isIconFont(name)) {
        hints.fontDisplay = name;
        break;
      }
    }
  }

  for (const m of css.matchAll(bodySelectors)) {
    const ff = m[1].match(/font-family\s*:\s*([^;]+)/i);
    if (ff) {
      const name = cleanFontName(ff[1]);
      if (name && !isIconFont(name)) {
        hints.fontBody = name;
        break;
      }
    }
  }

  return hints;
}

function isIconFont(name: string): boolean {
  return /icon|fontawesome|dashicons|woocommerce|elementor-icons/i.test(name);
}

export function buildGoogleFontsImport(fonts: string[]): string {
  const unique = [...new Set(fonts.filter(Boolean))];
  if (!unique.length) return "";
  return `@import url('https://fonts.googleapis.com/css2?family=${unique.map((f) => f.replace(/ /g, "+") + ":wght@400;500;600;700").join("&family=")}&display=swap');`;
}

export function fontFamilyCss(name: string, fallback: string): string {
  return `"${name}", ${fallback}`;
}
