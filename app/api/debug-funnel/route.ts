import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const funnelId = req.nextUrl.searchParams.get("id");
  if (!funnelId) return NextResponse.json({ error: "?id= required" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: funnel } = await supabase
    .from("generated_funnels")
    .select("id, content, created_at, submission_id")
    .eq("id", funnelId)
    .single();

  if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Pull out only image-related fields for quick inspection
  const c = funnel.content as Record<string, unknown>;
  const imageFields: Record<string, unknown> = {};

  const pageKeys = ["eventLanding", "eventCheckout", "upsell", "eventThankYou", "replay", "programmeLanding", "programmeCheckout", "programmeThankYou"];
  const imageFieldNames = ["heroBackgroundImageUrl", "valuePropImageUrl", "outcomesImageUrl", "encourage1BackgroundUrl", "encourage2BackgroundUrl", "encourage3BackgroundUrl", "logoUrl", "checkoutSidebarImageUrl", "productImageUrl", "backgroundImageUrl", "programmeFeatureImageUrl", "finalCtaBackgroundUrl", "programmeImageUrl"];

  for (const page of pageKeys) {
    const pageContent = c[page] as Record<string, unknown> | undefined;
    if (!pageContent) continue;
    const found: Record<string, unknown> = {};
    for (const field of imageFieldNames) {
      if (field in pageContent) found[field] = pageContent[field];
    }
    if (Object.keys(found).length > 0) imageFields[page] = found;
  }

  return NextResponse.json({
    funnelId,
    createdAt: funnel.created_at,
    imageSuggestions: c.imageSuggestions ?? null,
    imageFields,
    // Also return the full content for deep inspection if needed
    fullContent: c,
  });
}
