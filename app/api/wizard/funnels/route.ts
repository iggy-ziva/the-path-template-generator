import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";
import { overallCompleteness } from "@/lib/wizard-completeness";
import type { WizardData } from "@/lib/wizard-types";

async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** List all funnels for the logged-in user */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [submissionsResult, generatedResult] = await Promise.all([
    supabase
      .from("wizard_submissions")
      .select("id, name, current_step, status, updated_at, created_at, step_data")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("generated_funnels")
      .select("id, submission_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (submissionsResult.error) {
    console.error("funnels list error:", submissionsResult.error);
    return NextResponse.json({ error: "Failed to load funnels" }, { status: 500 });
  }

  // Build a map: submission_id → most recent generated_funnel id
  const generatedMap: Record<string, string> = {};
  for (const gf of (generatedResult.data ?? [])) {
    if (gf.submission_id && !generatedMap[gf.submission_id]) {
      generatedMap[gf.submission_id] = gf.id;
    }
  }

  // Strip step_data out of the sidebar response (it's large) but expose a
  // computed completion_pct so the sidebar can show consistent progress.
  const funnels = (submissionsResult.data ?? []).map((f) => {
    const { step_data, ...rest } = f as { step_data?: WizardData } & Record<string, unknown>;
    return {
      ...rest,
      generated_funnel_id: generatedMap[f.id] ?? null,
      completion_pct: overallCompleteness(step_data ?? {}),
    };
  });

  return NextResponse.json({ funnels });
}

/** Create a new blank funnel */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = (body.name as string | undefined) ?? "Untitled Funnel";

  const supabase = await getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("wizard_submissions")
    .insert({
      user_id: userId,
      name: name ?? "Untitled Funnel",
      step_data: {},
      current_step: 1,
      status: "draft",
    })
    .select("id, name, current_step, status, updated_at, created_at")
    .single();

  if (error) {
    console.error("funnel create error:", error);
    return NextResponse.json({ error: "Failed to create funnel" }, { status: 500 });
  }

  return NextResponse.json({ funnel: data });
}
