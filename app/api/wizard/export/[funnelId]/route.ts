export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { getSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";
import JSZip from "jszip";
import { splitFunnelContent } from "@/lib/funnel-snapshot";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";
import { computeBrandTokens, buildBrandCSS } from "@/lib/brand-tokens";
import type { WizardSnapshot } from "@/app/app/preview/[funnelId]/_components/funnel-types";
import { FUNNEL_PAGES } from "@/lib/funnel-export/config";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function readPublicCss(filename: string): string {
  return readFileSync(join(process.cwd(), "public", filename), "utf8");
}

/**
 * Page HTML is rendered on the client (see PreviewClient.handleDownload) because
 * the funnel page components are interactive Client Components that cannot be
 * invoked from this server route under the App Router RSC boundary. The client
 * sends a map of `{ filename: fullHtmlDocument }`; this route validates
 * ownership, adds the shared CSS + brand tokens + README, and returns the ZIP.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { funnelId } = await params;
  const supabase = getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data: funnel } = await supabase
    .from("generated_funnels")
    .select("id, content, submission_id")
    .eq("id", funnelId)
    .eq("user_id", userId)
    .single();

  if (!funnel) return NextResponse.json({ error: "Funnel not found" }, { status: 404 });

  let body: { files?: Record<string, string> };
  try {
    body = (await req.json()) as { files?: Record<string, string> };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const files = body.files;
  if (!files || typeof files !== "object") {
    return NextResponse.json({ error: "Missing rendered pages" }, { status: 400 });
  }

  const { wizardSnapshot } = splitFunnelContent(
    funnel.content as Record<string, unknown>,
  );
  let wizard: WizardSnapshot = (wizardSnapshot ?? {}) as WizardSnapshot;

  if (!wizardSnapshot && funnel.submission_id) {
    const { data: submission } = await supabase
      .from("wizard_submissions")
      .select("step_data")
      .eq("id", funnel.submission_id)
      .single();
    if (submission?.step_data) wizard = submission.step_data as WizardSnapshot;
  }

  const brandCss = buildBrandCSS(computeBrandTokens(wizard));
  const funnelStyleCss = readPublicCss("funnel-style.css");
  const funnelPagesCss = readPublicCss("funnel-pages.css");

  const allowedFiles = new Set<string>(FUNNEL_PAGES.map((p) => p.file));

  const zip = new JSZip();
  zip.file("funnel-style.css", funnelStyleCss);
  zip.file("funnel-pages.css", funnelPagesCss);
  zip.file("brand.css", brandCss);

  for (const [file, html] of Object.entries(files)) {
    if (!allowedFiles.has(file) || typeof html !== "string") continue;
    zip.file(file, html);
  }

  zip.file(
    "README.txt",
    `The Path Funnel Export
Generated: ${new Date().toISOString()}
Funnel ID: ${funnelId}

This ZIP matches the preview in the template generator — same HTML structure,
CSS class names, brand tokens, and copy fields.

Files:
  index.html               — Event landing page
  event-checkout.html      — Event checkout
  upsell.html              — Upsell
  event-thank-you.html     — Event registration confirmation
  replay.html              — Event replay
  programme.html           — Programme landing page
  programme-checkout.html  — Programme checkout
  programme-thank-you.html — Programme enrolment confirmation
  funnel-style.css         — Shared design system
  funnel-pages.css         — Page-specific styles
  brand.css                — Per-funnel brand colours and fonts

Deploy:
  Upload all files to your web host keeping paths flat (same folder).
  Google Fonts load from CDN — internet required for correct typography.
  Images use URLs from your upload storage.
  Replace payment form placeholders with your processor embed codes.
`,
  );

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
