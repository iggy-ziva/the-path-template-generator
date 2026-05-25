/**
 * Figma export — payment-plan modal (route handler).
 *
 * This is intentionally a Next.js Route Handler instead of a `page.tsx` so
 * it BYPASSES the parent `app/themes/[theme]/layout.tsx` entirely. That
 * means: no `threshold.css`, no `theme-variants.css`, no `.theme-root`
 * wrapper, no inherited `var(--*)` cascade, no ThemeSwitcher / FunnelNav
 * components — none of the things the html.to.design Figma plugin was
 * choking on.
 *
 * The handler returns a fully self-contained HTML document. Every visual
 * property is set in a single embedded <style> block using literal hex
 * values (and pre-computed rgba() approximations of color-mix) pulled
 * straight from the active theme record. The plugin gets a tight, naked
 * HTML page with one <style> block and one DOM tree — nothing else to
 * misinterpret.
 *
 * Plugin-quirk workarounds:
 *  - All class names are prefixed `fx-` to guarantee zero collision with
 *    any other stylesheet the plugin might pre-load.
 *  - `box-shadow` is omitted entirely. html.to.design has been observed
 *    to render shadow color as the element fill on certain blur radii.
 *  - Plain `<div>` everywhere — no semantic `<main>`/`<section>`/`<header>`
 *    in case the plugin's HTML-to-Figma converter treats them differently.
 *  - `background-color` long-form is used everywhere instead of the
 *    `background` shorthand (more reliably parsed by HTML-to-Figma tools).
 *  - The modal is a direct child of `<body>` (no `.fx-stage` wrapper). The
 *    plugin appears to merge single-child wrapper elements into their child
 *    and inherit the OUTER fill — which was clobbering the modal's white
 *    background with the dark page backdrop. Hidden `.fx-noop` siblings
 *    are also added next to the modal to guarantee the body never has a
 *    single child for the plugin to collapse.
 *  - `dynamic = "force-dynamic"` so the response is never cached at the
 *    edge — every fetch from the plugin gets the latest deploy's HTML.
 *
 * Note: a Route Handler and `page.tsx` cannot coexist in the same Next.js
 * route segment. Using a route handler ensures the theme layout cannot
 * leak into the response.
 */

import { NextResponse } from "next/server";
import { getTheme } from "@/lib/themes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Plan {
  label: string;
  price: string;
  cadence: string; // may contain a literal <br> tag — emitted unescaped
  saving?: string;
  ctaText: string;
  featured?: boolean;
  badge?: string;
  outline?: boolean;
}

/** Convert `#RRGGBB` to an `rgba()` string at the given alpha. */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** HTML-escape user-controlled text (everything except trusted cadence HTML). */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[ch] ?? ch;
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ theme: string }> },
) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) {
    return new NextResponse("Theme not found", { status: 404 });
  }

  const c = theme.colors;
  const f = theme.fonts;
  const { host, program } = theme;

  const plans: Plan[] = [
    {
      label: "Extended",
      price: program.extendedPerPayment.toString(),
      cadence: `× ${program.extendedCount} monthly payments<br>Total $${program.extendedTotal.toLocaleString()}`,
      ctaText: "Enrol now",
      outline: true,
    },
    {
      label: "Spread",
      price: program.spreadPerPayment.toString(),
      cadence: `× ${program.spreadCount} monthly payments<br>Total $${program.spreadTotal.toLocaleString()}`,
      ctaText: "Enrol now",
      featured: true,
      badge: "Most popular",
    },
    {
      label: "Pay in full",
      price: program.fullPrice.toLocaleString(),
      cadence: `One payment<br>Save $${(program.spreadTotal - program.fullPrice).toLocaleString()} vs spread`,
      saving: "+ Includes 1:1 onboarding call",
      ctaText: "Enrol now",
      outline: true,
    },
  ];

  const planMarkup = plans
    .map((p) => {
      const cardClass = `fx-plan${p.featured ? " fx-plan-featured" : ""}`;
      const ctaClass = `fx-plan-cta ${p.outline ? "fx-plan-cta-outline" : "fx-plan-cta-filled"}`;
      return `
      <div class="${cardClass}">
        ${p.badge ? `<div class="fx-plan-badge">${escapeHtml(p.badge)}</div>` : ""}
        <div class="fx-plan-label">${escapeHtml(p.label)}</div>
        <div class="fx-plan-price"><span class="fx-plan-currency">$</span>${escapeHtml(p.price.replace("$", ""))}</div>
        <div class="fx-plan-cadence">${p.cadence}</div>
        ${p.saving ? `<div class="fx-plan-saving">${escapeHtml(p.saving)}</div>` : ""}
        <a href="#" class="${ctaClass}">${escapeHtml(p.ctaText)}</a>
      </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="robots" content="noindex,nofollow" />
  <title>${escapeHtml(themeSlug)} — Payment Plans (Figma export)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${f.googleFontsUrl}" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background-color: ${c.surfaceInverse};
      min-height: 100vh;
      width: 100%;
      font-family: ${f.bodyFamily};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    body {
      display: grid;
      place-items: center;
      padding: 32px;
      gap: 0;
    }
    .fx-modal {
      display: flex;
      flex-direction: column;
      position: relative;
      background-color: ${c.surfaceRaised};
      border: 1px solid ${c.borderSubtle};
      border-radius: 20px;
      padding: 64px;
      width: 100%;
      max-width: 780px;
    }
    .fx-noop {
      width: 1px;
      height: 1px;
      background-color: transparent;
      flex-shrink: 0;
    }
    .fx-modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 48px;
      gap: 24px;
    }
    .fx-modal-title {
      font-family: ${f.displayFamily};
      font-size: 22px;
      font-weight: 700;
      color: ${c.textPrimary};
      line-height: 1.2;
    }
    .fx-modal-sub {
      font-size: 13px;
      color: ${c.textTertiary};
      margin-top: 2px;
      line-height: 1.4;
    }
    .fx-modal-close {
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background-color: ${c.surfaceSunken};
      border: 1px solid ${c.borderSubtle};
      display: grid;
      place-items: center;
      font-size: 16px;
      color: ${c.textTertiary};
      flex-shrink: 0;
    }
    .fx-plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .fx-plan {
      position: relative;
      border: 1px solid ${c.borderSubtle};
      border-radius: 14px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-align: center;
      background-color: ${c.surfaceCanvas};
    }
    .fx-plan-featured {
      background-color: ${c.surfaceInverse};
      border-color: transparent;
      color: ${c.textInverse};
    }
    .fx-plan-badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background-color: ${hexToRgba(c.accentPrimary, 0.15)};
      color: ${c.accentPrimary};
      padding: 3px 10px;
      border-radius: 9999px;
    }
    .fx-plan-featured .fx-plan-badge {
      background-color: ${hexToRgba(c.accentHighlight, 0.22)};
      color: ${c.accentHighlight};
    }
    .fx-plan-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${c.textTertiary};
    }
    .fx-plan-featured .fx-plan-label { color: ${hexToRgba(c.textInverse, 0.5)}; }
    .fx-plan-price {
      font-size: 32px;
      font-weight: 800;
      color: ${c.textPrimary};
      line-height: 1;
    }
    .fx-plan-currency { font-size: 16px; vertical-align: super; line-height: 0; }
    .fx-plan-featured .fx-plan-price { color: ${c.textInverse}; }
    .fx-plan-cadence {
      font-size: 12px;
      color: ${c.textTertiary};
      line-height: 1.5;
    }
    .fx-plan-featured .fx-plan-cadence { color: ${hexToRgba(c.textInverse, 0.45)}; }
    .fx-plan-saving {
      font-size: 12px;
      font-weight: 600;
      color: ${c.success};
    }
    .fx-plan-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 11px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      margin-top: auto;
    }
    .fx-plan-cta-outline {
      background-color: transparent;
      border: 1px solid ${c.borderSubtle};
      color: ${c.textPrimary};
    }
    .fx-plan-featured .fx-plan-cta-outline {
      border-color: ${hexToRgba(c.textInverse, 0.25)};
      color: ${c.textInverse};
    }
    .fx-plan-cta-filled {
      background-color: ${c.accentHighlight};
      color: #0F0E0C;
      border: none;
    }
    .fx-modal-foot {
      text-align: center;
      margin-top: 32px;
      font-size: 12px;
      color: ${c.textTertiary};
    }
    .fx-modal-foot a {
      color: ${c.accentPrimary};
      text-decoration: underline;
    }
    @media (max-width: 640px) {
      body { padding: 16px; }
      .fx-modal { padding: 32px 24px; }
      .fx-plans-grid { grid-template-columns: 1fr; }
      .fx-modal-head { margin-bottom: 32px; }
    }
  </style>
</head>
<body>
  <div class="fx-noop"></div>
  <div class="fx-modal" style="background-color: ${c.surfaceRaised};">
    <div class="fx-modal-head">
      <div>
        <div class="fx-modal-title">Payment Plans</div>
        <div class="fx-modal-sub">Choose the option that works for you. Same program, same access.</div>
      </div>
      <div class="fx-modal-close" aria-label="Close">×</div>
    </div>
    <div class="fx-plans-grid">${planMarkup}
    </div>
    <div class="fx-modal-foot">
      Secure checkout via Stripe · All major cards accepted · Questions?
      <a href="mailto:${escapeHtml(host.email)}">Email us</a>
    </div>
  </div>
  <div class="fx-noop"></div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
