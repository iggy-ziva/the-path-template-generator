import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";
import { WIZARD_SNAPSHOT_KEY, splitFunnelContent } from "@/lib/funnel-snapshot";
import { deepMergeContent } from "@/lib/content-path";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";

const PAGE_KEYS = [
  "eventLanding",
  "eventCheckout",
  "upsell",
  "eventThankYou",
  "replay",
  "programmeLanding",
  "programmeCheckout",
  "programmeThankYou",
] as const;

type PageKey = (typeof PAGE_KEYS)[number];

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function isPageKey(k: string): k is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(k);
}

const VALID_THEMES = new Set(["dark", "accent", "light"]);

/** Drop any sectionThemes values that aren't a valid theme enum (defensive). */
function clampSectionThemes(page: unknown): unknown {
  if (!page || typeof page !== "object" || Array.isArray(page)) return page;
  const obj = page as Record<string, unknown>;
  const themes = obj.sectionThemes;
  if (!themes || typeof themes !== "object" || Array.isArray(themes)) return page;
  const cleaned: Record<string, string> = {};
  for (const [id, value] of Object.entries(themes as Record<string, unknown>)) {
    if (typeof value === "string" && VALID_THEMES.has(value)) cleaned[id] = value;
  }
  return { ...obj, sectionThemes: cleaned };
}

/** Update generated funnel page content after AI generation (editor saves). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: funnelId } = await params;
  const body = await req.json().catch(() => ({}));

  const supabase = getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data: funnel, error: fetchErr } = await supabase
    .from("generated_funnels")
    .select("id, content, user_id")
    .eq("id", funnelId)
    .eq("user_id", userId)
    .single();

  if (fetchErr || !funnel) {
    return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
  }

  const raw = funnel.content as Record<string, unknown>;
  const { pageContent, wizardSnapshot } = splitFunnelContent(raw);
  let nextContent: Record<string, unknown> = { ...pageContent };

  if (wizardSnapshot) {
    nextContent = { [WIZARD_SNAPSHOT_KEY]: wizardSnapshot, ...nextContent };
  }

  // Full content replace. Defensive: merge incoming pages OVER the existing
  // ones rather than wholesale-replacing, so a payload that is missing a page
  // (e.g. a partial/raced client save) can never drop pages that already exist.
  // The editor always sends the complete draft, so normal saves are unaffected.
  if (body.content && typeof body.content === "object" && !Array.isArray(body.content)) {
    const incoming = body.content as Record<string, unknown>;
    const { [WIZARD_SNAPSHOT_KEY]: _s, ...pages } = incoming;
    const cleanPages = Object.fromEntries(
      Object.entries(pages).map(([k, v]) => [k, clampSectionThemes(v)]),
    );
    const mergedPages = { ...pageContent, ...cleanPages };
    nextContent = wizardSnapshot
      ? { [WIZARD_SNAPSHOT_KEY]: wizardSnapshot, ...mergedPages }
      : { ...mergedPages };
  }

  // Single page patch: { pageKey, patch }
  if (typeof body.pageKey === "string" && isPageKey(body.pageKey) && body.patch && typeof body.patch === "object") {
    const existing = (pageContent[body.pageKey] as Record<string, unknown>) ?? {};
    const merged = deepMergeContent(existing, body.patch as Record<string, unknown>);
    nextContent = wizardSnapshot
      ? { [WIZARD_SNAPSHOT_KEY]: wizardSnapshot, ...pageContent, [body.pageKey]: merged }
      : { ...pageContent, [body.pageKey]: merged };
  }

  const updatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("generated_funnels")
    .update({ content: nextContent })
    .eq("id", funnelId)
    .eq("user_id", userId)
    .select("id, content")
    .single();

  if (error) {
    console.error("funnel content patch error:", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }

  const split = splitFunnelContent(data.content as Record<string, unknown>);
  return NextResponse.json({
    funnelId: data.id,
    content: split.pageContent,
    updatedAt: updatedAt,
  });
}
