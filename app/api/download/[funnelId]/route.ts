import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import JSZip from "jszip";

async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { funnelId } = await params;
  const supabase = await getServiceClient();

  const { data: funnel } = await supabase
    .from("generated_funnels")
    .select("content, theme_slug")
    .eq("id", funnelId)
    .single();

  if (!funnel) return NextResponse.json({ error: "Funnel not found" }, { status: 404 });

  const zip = new JSZip();
  const content = funnel.content as Record<string, Record<string, unknown>>;

  const pages = [
    { key: "eventLanding",      file: "index.html",                 title: "Event Landing Page" },
    { key: "eventCheckout",     file: "event-checkout.html",        title: "Event Checkout" },
    { key: "upsell",            file: "upsell.html",                title: "Upsell Offer" },
    { key: "eventThankYou",     file: "event-thank-you.html",       title: "Event Thank You" },
    { key: "replay",            file: "replay.html",                title: "Replay Page" },
    { key: "programmeLanding",  file: "programme.html",             title: "Programme Landing" },
    { key: "programmeCheckout", file: "programme-checkout.html",    title: "Programme Checkout" },
    { key: "programmeThankYou", file: "programme-thank-you.html",   title: "Programme Thank You" },
  ];

  for (const page of pages) {
    const data = content[page.key] ?? {};
    zip.file(page.file, generateHtml(page.title, data));
  }

  zip.file("styles.css", globalCss());
  zip.file("README.txt", readme());

  const uint8 = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  const arrayBuffer = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);

  return new NextResponse(arrayBuffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="funnel-${funnelId.slice(0, 8)}.zip"`,
    },
  });
}

function generateHtml(title: string, data: Record<string, unknown>): string {
  const headline = (data.headline as string) ?? "";
  const subheadline = (data.subheadline as string) ?? "";
  const body1 = (data.heroBodyCopy ?? data.valueSummary ?? data.programmeIntro ?? data.introBody ?? data.confirmationBody ?? "") as string;
  const bullets: string[] = (data.benefitBullets as string[] ?? data.whatHappensNext as string[] ?? []);
  const ctaText = (data.ctaText as string) ?? "";
  const extra = (data.urgencyLine ?? data.priceAnchorLine ?? data.priceStatement ?? data.guaranteeText ?? data.curriculumIntro ?? data.aboutHostSnippet ?? "") as string;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(headline || title)}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="page">
    ${headline ? `<h1 class="headline">${escHtml(headline)}</h1>` : ""}
    ${subheadline ? `<p class="subheadline">${escHtml(subheadline)}</p>` : ""}
    ${body1 ? `<p class="body-copy">${escHtml(body1)}</p>` : ""}
    ${bullets.length ? `<ul class="bullets">${bullets.map((b) => `<li>${escHtml(b)}</li>`).join("\n    ")}</ul>` : ""}
    ${ctaText ? `<div class="cta-wrap"><a href="#" class="cta-btn">${escHtml(ctaText)}</a></div>` : ""}
    ${extra ? `<p class="extra">${escHtml(extra)}</p>` : ""}
  </main>
</body>
</html>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function globalCss(): string {
  return `/* The Path — Generated Funnel Styles */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #FCFAF6; color: #2E2E2E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; }
.page { max-width: 760px; margin: 0 auto; padding: 80px 24px 120px; }
.headline { font-size: clamp(2rem, 5vw, 3.4rem); font-weight: 700; line-height: 1.1; margin-bottom: 20px; }
.subheadline { font-size: 1.15rem; color: #8A7A6A; margin-bottom: 28px; }
.body-copy { font-size: 1rem; color: #2E2E2E; margin-bottom: 28px; line-height: 1.7; }
.bullets { list-style: none; margin-bottom: 36px; }
.bullets li { padding: 12px 0; border-bottom: 1px solid #F5EEE0; padding-left: 20px; position: relative; font-size: 1rem; }
.bullets li::before { content: '→'; color: #FF007E; position: absolute; left: 0; font-weight: 700; }
.cta-wrap { text-align: center; margin: 40px 0; }
.cta-btn { display: inline-block; padding: 18px 44px; background: linear-gradient(135deg, #FF007E, #FA2A45); color: #fff; text-decoration: none; border-radius: 14px; font-size: 1.05rem; font-weight: 700; letter-spacing: 0.02em; box-shadow: 0 4px 24px rgba(255,0,126,0.25); }
.extra { font-size: 0.9rem; color: #8A7A6A; font-style: italic; text-align: center; margin-top: 16px; }
@media (max-width: 600px) { .page { padding: 40px 16px 80px; } }`;
}

function readme(): string {
  return `THE PATH — GENERATED FUNNEL FILES
==================================

This ZIP was generated by The Path wizard (Ziva Marketing).

FILES
-----
index.html              Event landing page
event-checkout.html     Event registration checkout
upsell.html             Post-registration upsell
event-thank-you.html    Event confirmation page
replay.html             Event replay page
programme.html          Programme landing page
programme-checkout.html Programme checkout
programme-thank-you.html Programme confirmation
styles.css              Shared stylesheet

DEPLOYMENT
----------
Upload all files to your web host (Netlify, Vercel, cPanel, etc.).
Make sure all files are in the same folder so CSS links work correctly.

The HTML files contain placeholder #href links — replace these with
your actual checkout/registration URLs before going live.

Need help? Email development@ziva.marketing
`;
}
