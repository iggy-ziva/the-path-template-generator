export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";
import JSZip from "jszip";
import { splitFunnelContent } from "@/lib/funnel-snapshot";
import { resolveFontRoles, buildGoogleFontsImport } from "@/lib/font-roles";
import { shouldShowLogoImage } from "@/lib/logo-display";
import { buildSurfaceCSSVars } from "@/lib/brand-surfaces";

// NOTE: No React component imports here — HTML is built from template strings
// to avoid Turbopack bundling the client-side preview components into this route.

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

function buildGlobalCSS(wizard: AnyRecord): string {
  const sg = wizard.styleGuide ?? {};
  const primary = sg?.brandColors?.primary ?? "#D4A878";
  const secondary = sg?.brandColors?.secondary ?? "#445566";
  const tertiary = sg?.brandColors?.tertiary ?? "#6699BB";
  const fonts: string[] = sg?.googleFonts ?? [];
  const { display: displayFont, body: bodyFont } = resolveFontRoles(fonts, {
    fontDisplay: sg?.fontDisplay,
    fontBody: sg?.fontBody,
  });
  const fontImport = buildGoogleFontsImport([displayFont, bodyFont, ...fonts])
    || `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&display=swap');`;
  const surfaceVars = buildSurfaceCSSVars({
    primary,
    secondary,
    tertiary,
  });

  return `${fontImport}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; overflow-x: hidden; }
body { margin: 0; padding: 0; background: var(--surface-canvas); color: var(--text-primary); -webkit-font-smoothing: antialiased; font-family: '${bodyFont}', -apple-system, system-ui, sans-serif; }
img { max-width: 100%; display: block; }
a { text-decoration: none; color: inherit; }
button { font: inherit; cursor: pointer; border: none; }
h1, h2, h3, h4, h5, h6 { margin: 0; font-family: '${displayFont}', Georgia, serif; }
p { margin: 0; }

:root {
  ${surfaceVars}
  --brand-bg: var(--surface-inverse);
  --brand-text: var(--text-inverse);
  --font-display: '${displayFont}', Georgia, serif;
  --font-body: '${bodyFont}', -apple-system, system-ui, sans-serif;
}

.page-section { max-width: 900px; margin: 0 auto; padding: 60px 32px; }
.hero { padding: 100px 32px; text-align: center; background: linear-gradient(to bottom, #1a1917, #0F0E0C); }
.hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 24px; color: var(--brand-primary); }
.hero p { font-size: 1.2rem; opacity: 0.8; max-width: 600px; margin: 0 auto 40px; }
.cta-btn { display: inline-block; background: var(--brand-primary); color: #0F0E0C; font-weight: 700; font-size: 1.1rem; padding: 18px 40px; border-radius: 8px; cursor: pointer; margin: 12px 0; }
.section-heading { font-size: clamp(1.5rem, 3vw, 2.5rem); margin-bottom: 24px; }
.card { background: #1a1917; border: 1px solid #2a2926; border-radius: 12px; padding: 28px; margin-bottom: 16px; }
.card h3 { font-size: 1.1rem; margin-bottom: 8px; color: var(--brand-primary); }
.card p { opacity: 0.8; line-height: 1.6; }
.price-block { text-align: center; padding: 60px 32px; }
.price-was { font-size: 1.1rem; opacity: 0.5; text-decoration: line-through; margin-bottom: 8px; }
.price-now { font-size: 3.5rem; font-weight: 700; color: var(--brand-primary); }
.testimonial { border-left: 3px solid var(--brand-primary); padding: 20px 28px; margin: 20px 0; background: #1a1917; border-radius: 0 12px 12px 0; }
.testimonial p { font-style: italic; line-height: 1.7; margin-bottom: 12px; }
.testimonial cite { font-size: 0.85rem; opacity: 0.6; font-style: normal; }
.note { font-size: 0.85rem; opacity: 0.5; margin-top: 12px; }
.decline-link { display: block; text-align: center; margin-top: 20px; opacity: 0.5; font-size: 0.9rem; }
.faq-item { border-bottom: 1px solid #2a2926; padding: 20px 0; }
.faq-item h4 { margin-bottom: 10px; }
.faq-item p { opacity: 0.7; line-height: 1.6; }
.items-grid { display: grid; gap: 16px; }
.steps-list { list-style: none; padding: 0; counter-reset: steps; }
.steps-list li { counter-increment: steps; display: flex; gap: 16px; margin-bottom: 24px; align-items: flex-start; }
.steps-list li::before { content: counter(steps); min-width: 36px; height: 36px; background: var(--brand-primary); color: #0F0E0C; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
`.trim();
}

function esc(str: unknown): string {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrapHtml(title: string, css: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;
}

function renderPage(title: string, content: AnyRecord, wizard: AnyRecord, sections: string): string {
  const css = buildGlobalCSS(wizard);
  return wrapHtml(title, css, sections);
}

function items(arr: AnyRecord[] = [], keyTitle = "title", keyDesc = "description"): string {
  return arr.map(it => `<div class="card"><h3>${esc(it[keyTitle])}</h3><p>${esc(it[keyDesc])}</p></div>`).join("\n");
}

function testimonials(arr: AnyRecord[] = []): string {
  return arr.map(t => `
    <div class="testimonial">
      <p>"${esc(t.quote)}"</p>
      <cite>${esc(t.name)}${t.location ? ` · ${esc(t.location)}` : ""}${t.context ? ` · ${esc(t.context)}` : ""}</cite>
    </div>`).join("\n");
}

function faqs(arr: AnyRecord[] = []): string {
  return arr.map(f => `
    <div class="faq-item">
      <h4>${esc(f.question)}</h4>
      <p>${esc(f.answer)}</p>
    </div>`).join("\n");
}

function buildEventLanding(c: AnyRecord, w: AnyRecord): string {
  const brandName = w.businessName ?? w.hostName ?? "";
  const logoBlock = w.logoUrl && shouldShowLogoImage(w.logoUrl, w.logoTransparent)
    ? `<img src="${esc(w.logoUrl)}" alt="${esc(brandName)}" style="max-width:160px;margin:0 auto 40px;" />`
    : brandName
      ? `<p class="logo" style="font-size:18px;margin:0 auto 40px;">${esc(brandName)}</p>`
      : "";
  return renderPage(w.eventName ?? "Event", c, w, `
    <section class="hero">
      ${logoBlock}
      <p style="color:var(--brand-primary);font-size:.9rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px">${esc(c.heroEyebrow)}</p>
      <h1>${esc(c.heroHeadline)}</h1>
      <p>${esc(c.heroSubheadline)}</p>
      <a class="cta-btn" href="event-checkout.html">${esc(c.heroCtaText ?? "Register Now")}</a>
      <p class="note">${esc(c.heroPriceStatement)}</p>
    </section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.visionHeading)}</h2>
      ${(c.visionParagraphs ?? []).map((p: string) => `<p style="line-height:1.8;margin-bottom:16px;opacity:.85">${esc(p)}</p>`).join("")}
    </section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.outcomeHeading)}</h2>
      <div class="items-grid">${items(c.outcomeItems ?? [], "icon", "text")}</div>
    </section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.bioHeading)}</h2>
      ${w.hostHeadshotUrl ? `<img src="${esc(w.hostHeadshotUrl)}" alt="${esc(w.hostName)}" style="width:120px;height:120px;border-radius:50%;margin-bottom:20px;" />` : ""}
      <p style="line-height:1.8;opacity:.85">${esc(c.bioText)}</p>
    </section>
    <section class="page-section">${testimonials(w.testimonials)}</section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.faqHeading ?? "Frequently Asked Questions")}</h2>
      ${faqs(c.faqItems)}
    </section>
    <section class="hero" style="padding:80px 32px">
      <h2 class="section-heading">${esc(c.finalCtaHeadline)}</h2>
      <p style="opacity:.8;margin-bottom:32px">${esc(c.finalCtaBody)}</p>
      <a class="cta-btn" href="event-checkout.html">${esc(c.finalCtaText ?? "Register Now")}</a>
    </section>`);
}

function buildEventCheckout(c: AnyRecord, w: AnyRecord): string {
  return renderPage(`Checkout — ${w.eventName ?? "Event"}`, c, w, `
    <section class="hero" style="padding:60px 32px">
      <h1>${esc(c.headline)}</h1>
      <p style="opacity:.8">${esc(c.subheadline)}</p>
    </section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.orderSummaryTitle ?? "Your Order")}</h2>
      <div class="items-grid">${(c.whatYouGetItems ?? []).map((it: string) => `<div class="card"><p>✓ ${esc(it)}</p></div>`).join("")}</div>
      <div class="card" style="margin-top:32px">
        <h3>${esc(c.guaranteeHeadline)}</h3>
        <p>${esc(c.guaranteeText)}</p>
      </div>
      <div style="text-align:center;margin-top:40px">
        <p style="font-size:1rem;opacity:.6;margin-bottom:8px">Payment form would be embedded here</p>
        <a class="cta-btn" href="upsell.html">${esc(c.ctaText ?? "Complete Registration")}</a>
      </div>
    </section>`);
}

function buildUpsell(c: AnyRecord, w: AnyRecord): string {
  return renderPage(`Special Offer`, c, w, `
    <section class="hero" style="padding:80px 32px">
      <h1>${esc(c.offerHeadline)}</h1>
      <p style="opacity:.8;max-width:600px;margin:0 auto">${esc(c.offerDescription)}</p>
    </section>
    <section class="page-section">
      <div class="items-grid">${items(c.includedItems ?? [])}</div>
    </section>
    <section class="page-section">
      <div class="testimonial">
        <p>"${esc(c.quoteText)}"</p>
        <cite>${esc(c.quoteAttribution)}</cite>
      </div>
    </section>
    <div class="price-block">
      <p class="price-was">${c.priceWas ? `Regular value: ${esc(c.priceWas)}` : ""}</p>
      <div class="price-now">${esc(c.priceNow)}</div>
      <p style="color:var(--brand-primary);font-weight:700;margin:8px 0 24px">${esc(c.priceSaving)}</p>
      <a class="cta-btn" href="event-thank-you.html">${esc(c.ctaText)}</a>
      <p class="note">${esc(c.ctaSubText)}</p>
      <p class="note">${esc(c.priceNote)}</p>
      <a class="decline-link" href="event-thank-you.html">${esc(c.declineText)}</a>
    </div>`);
}

function buildEventThankYou(c: AnyRecord, w: AnyRecord): string {
  return renderPage(`Thank You — ${w.eventName ?? "Event"}`, c, w, `
    <section class="hero" style="padding:80px 32px">
      <h1>${esc(c.headline)}</h1>
      <p style="opacity:.8">${esc(c.subheadline)}</p>
      <p style="opacity:.7;max-width:600px;margin:0 auto;line-height:1.7">${esc(c.confirmationBody)}</p>
    </section>
    <section class="page-section">
      <h2 class="section-heading">What happens next</h2>
      <ul class="steps-list">
        ${(c.whatHappensNext ?? []).map((s: AnyRecord) => `<li><div><strong>${esc(s.title)}</strong><p style="opacity:.7;margin-top:4px">${esc(s.body)}</p></div></li>`).join("")}
      </ul>
    </section>
    <section class="page-section" style="text-align:center">
      <a class="cta-btn" href="#">${esc(c.calendarCtaText ?? "Add to Calendar")}</a>
    </section>`);
}

function buildReplay(c: AnyRecord, w: AnyRecord): string {
  return renderPage(`Replay — ${w.eventName ?? "Event"}`, c, w, `
    <section class="hero" style="padding:80px 32px">
      <h1>${esc(c.headline)}</h1>
      <p style="opacity:.8">${esc(c.subheadline)}</p>
    </section>
    <section class="page-section">
      <div style="background:#1a1917;border-radius:12px;padding:40px;text-align:center;margin-bottom:40px">
        <p style="opacity:.5;font-size:.9rem">Video player would be embedded here</p>
      </div>
      <p style="opacity:.7;line-height:1.7">${esc(c.bodyText)}</p>
    </section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.upsellTeaserHeadline)}</h2>
      <p style="opacity:.8;line-height:1.7;margin-bottom:24px">${esc(c.upsellTeaserBody)}</p>
      <a class="cta-btn" href="programme.html">${esc(c.upsellTeaserCtaText)}</a>
    </section>`);
}

function buildProgrammeLanding(c: AnyRecord, w: AnyRecord): string {
  return renderPage(w.programName ?? "Programme", c, w, `
    <section class="hero">
      <p style="color:var(--brand-primary);font-size:.9rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px">${esc(c.heroEyebrow)}</p>
      <h1>${esc(c.heroHeadline)}</h1>
      <p>${esc(c.heroSubheadline)}</p>
      <a class="cta-btn" href="programme-checkout.html">${esc(c.heroCtaText ?? "Enrol Now")}</a>
      <p class="note">${esc(c.heroPriceStatement)}</p>
    </section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.visionHeading)}</h2>
      ${(c.visionParagraphs ?? []).map((p: string) => `<p style="line-height:1.8;margin-bottom:16px;opacity:.85">${esc(p)}</p>`).join("")}
    </section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.includesHeading)}</h2>
      <div class="items-grid">${items(c.includesItems ?? [], "title", "description")}</div>
    </section>
    <section class="page-section">${testimonials(w.testimonials ?? [])}</section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.pricingHeadline)}</h2>
      <p style="opacity:.8;margin-bottom:32px">${esc(c.pricingSubheadline)}</p>
      <a class="cta-btn" href="programme-checkout.html">${esc(c.pricingCtaText ?? "Enrol Now")}</a>
    </section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.bioHeading)}</h2>
      <p style="line-height:1.8;opacity:.85">${esc(c.bioText)}</p>
    </section>
    <section class="page-section">
      <h2 class="section-heading">FAQs</h2>
      ${faqs(c.faqItems ?? [])}
    </section>
    <section class="hero" style="padding:80px 32px">
      <h2>${esc(c.finalCtaHeadline)}</h2>
      <p style="opacity:.8;margin-bottom:32px">${esc(c.finalCtaBody)}</p>
      <a class="cta-btn" href="programme-checkout.html">${esc(c.finalCtaText ?? "Enrol Now")}</a>
    </section>`);
}

function buildProgrammeCheckout(c: AnyRecord, w: AnyRecord): string {
  return renderPage(`Enrol — ${w.programName ?? "Programme"}`, c, w, `
    <section class="hero" style="padding:60px 32px">
      <h1>${esc(c.headline)}</h1>
      <p style="opacity:.8">${esc(c.subheadline)}</p>
    </section>
    <section class="page-section">
      <h2 class="section-heading">${esc(c.orderSummaryTitle ?? "Your Enrolment")}</h2>
      <div class="items-grid">${(c.whatYouGetItems ?? []).map((it: string) => `<div class="card"><p>✓ ${esc(it)}</p></div>`).join("")}</div>
      <div class="card" style="margin-top:32px">
        <h3>${esc(c.guaranteeHeadline)}</h3>
        <p>${esc(c.guaranteeText)}</p>
      </div>
      <div style="text-align:center;margin-top:40px">
        <p style="font-size:1rem;opacity:.6;margin-bottom:8px">Payment form would be embedded here</p>
        <a class="cta-btn" href="programme-thank-you.html">${esc(c.ctaText ?? "Complete Enrolment")}</a>
      </div>
    </section>`);
}

function buildProgrammeThankYou(c: AnyRecord, w: AnyRecord): string {
  const portalUrl = w.programPortalUrl ?? "#";
  return renderPage(`Welcome — ${w.programName ?? "Programme"}`, c, w, `
    <section class="hero" style="padding:80px 32px">
      <h1>${esc(c.headline)}</h1>
      <p style="opacity:.8">${esc(c.subheadline)}</p>
      <p style="opacity:.7;max-width:600px;margin:0 auto;line-height:1.7">${esc(c.confirmationBody)}</p>
    </section>
    <section class="page-section">
      <h2 class="section-heading">Getting started</h2>
      <ul class="steps-list">
        ${(c.onboardingSteps ?? []).map((s: AnyRecord) => `<li><div><strong>${esc(s.title)}</strong><p style="opacity:.7;margin-top:4px">${esc(s.body)}</p></div></li>`).join("")}
      </ul>
    </section>
    <section class="page-section" style="text-align:center">
      <a class="cta-btn" href="${esc(portalUrl)}">${esc(c.portalCtaText ?? "Access your portal →")}</a>
    </section>`);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { funnelId } = await params;
  const supabase = getServiceClient();

  const { data: funnel } = await supabase
    .from("generated_funnels")
    .select("id, content, submission_id")
    .eq("id", funnelId)
    .eq("user_id", session.userId ?? "")
    .single();

  if (!funnel) return NextResponse.json({ error: "Funnel not found" }, { status: 404 });

  const { pageContent, wizardSnapshot } = splitFunnelContent(
    funnel.content as Record<string, unknown>,
  );
  let wizard: AnyRecord = wizardSnapshot ?? {};

  if (!wizardSnapshot && funnel.submission_id) {
    const { data: submission } = await supabase
      .from("wizard_submissions")
      .select("step_data")
      .eq("id", funnel.submission_id)
      .single();
    if (submission?.step_data) wizard = submission.step_data as AnyRecord;
  }

  const zip = new JSZip();

  const pages: { filename: string; html: string }[] = [
    { filename: "index.html",                html: buildEventLanding(pageContent.eventLanding ?? {}, wizard) },
    { filename: "event-checkout.html",       html: buildEventCheckout(pageContent.eventCheckout ?? {}, wizard) },
    { filename: "upsell.html",               html: buildUpsell(pageContent.upsell ?? {}, wizard) },
    { filename: "event-thank-you.html",      html: buildEventThankYou(pageContent.eventThankYou ?? {}, wizard) },
    { filename: "replay.html",               html: buildReplay(pageContent.replay ?? {}, wizard) },
    { filename: "programme.html",            html: buildProgrammeLanding(pageContent.programmeLanding ?? {}, wizard) },
    { filename: "programme-checkout.html",   html: buildProgrammeCheckout(pageContent.programmeCheckout ?? {}, wizard) },
    { filename: "programme-thank-you.html",  html: buildProgrammeThankYou(pageContent.programmeThankYou ?? {}, wizard) },
  ];

  for (const { filename, html } of pages) {
    zip.file(filename, html);
  }

  zip.file("README.txt", `The Path Funnel Export
Generated: ${new Date().toISOString()}
Funnel ID: ${funnelId}

Files:
  index.html               — Event landing page
  event-checkout.html      — Event checkout
  upsell.html              — Upsell (shown after event checkout)
  event-thank-you.html     — Event registration confirmation
  replay.html              — Event replay access
  programme.html           — Programme landing page
  programme-checkout.html  — Programme checkout
  programme-thank-you.html — Programme enrolment confirmation

To use:
- All pages are self-contained HTML files with inline styles
- Google Fonts are loaded from CDN — internet connection required for correct typography
- Brand colours are set via CSS custom properties (--brand-primary, etc.)
- Replace "Payment form would be embedded here" comments with your payment processor embed codes
- Images reference URLs from your upload storage — no changes needed if storage is live
`);

  const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

  return new Response(zipArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="funnel-${funnelId.slice(0, 8)}.zip"`,
      "Content-Length": String(zipArrayBuffer.byteLength),
    },
  });
}
