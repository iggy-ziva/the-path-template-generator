import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";

async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { submissionId, stepData, currentStep } = await req.json();
    const supabase = await getServiceClient();
    const userId = await getOrCreateUserId(session, supabase);
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (submissionId) {
      // Defensive merge: never let an incoming payload DROP fields that already
      // exist on the server. A client-side load/switch race could briefly leave
      // local state with only a handful of keys (e.g. the brand-analysis fields);
      // a blind replace then wiped the entire submission. Shallow-merging keeps
      // any field absent from the payload intact while still allowing present
      // fields (including cleared values and edited arrays) to update normally.
      const { data: existing } = await supabase
        .from("wizard_submissions")
        .select("step_data")
        .eq("id", submissionId)
        .eq("user_id", userId)
        .single();

      const existingStepData =
        existing?.step_data && typeof existing.step_data === "object"
          ? (existing.step_data as Record<string, unknown>)
          : {};
      const incomingStepData =
        stepData && typeof stepData === "object" ? (stepData as Record<string, unknown>) : {};
      const mergedStepData = { ...existingStepData, ...incomingStepData };

      const { data, error } = await supabase
        .from("wizard_submissions")
        .update({
          step_data: mergedStepData,
          current_step: currentStep,
          updated_at: new Date().toISOString(),
        })
        .eq("id", submissionId)
        .eq("user_id", userId)
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ submissionId: data.id });
    } else {
      const { data, error } = await supabase
        .from("wizard_submissions")
        .insert({
          user_id: userId,
          step_data: stepData,
          current_step: currentStep,
          status: "draft",
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ submissionId: data.id });
    }
  } catch (err) {
    console.error("wizard save error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ submission: null });

  const specificId = req.nextUrl.searchParams.get("id");

  if (specificId) {
    // Try direct wizard_submissions lookup first; specificId may also be a
    // generated_funnels ID (when navigating back from the preview).
    let submissionRow: Record<string, unknown> | null = null;

    const { data: direct } = await supabase
      .from("wizard_submissions")
      .select("id, name, step_data, current_step, status, updated_at, created_at")
      .eq("id", specificId)
      .eq("user_id", userId)
      .single();
    submissionRow = direct ?? null;

    if (!submissionRow) {
      // specificId is a generated_funnels ID — find the linked submission.
      const { data: gf } = await supabase
        .from("generated_funnels")
        .select("submission_id")
        .eq("id", specificId)
        .eq("user_id", userId)
        .single();
      if (gf?.submission_id) {
        const { data: linked } = await supabase
          .from("wizard_submissions")
          .select("id, name, step_data, current_step, status, updated_at, created_at")
          .eq("id", gf.submission_id)
          .eq("user_id", userId)
          .single();
        submissionRow = linked ?? null;
      }
    }

    if (!submissionRow) return NextResponse.json({ submission: null });

    // Backfill image arrays from the most recent generated_funnel's _wizardSnapshot
    // in case step_data lost them (e.g. upload happened before a save race, or an older
    // schema version didn't capture them).
    const IMAGE_FIELDS = ["heroImageUrls", "lifestyleImageUrls", "additionalImageUrls"] as const;
    const stepData = (submissionRow.step_data ?? {}) as Record<string, unknown>;
    const missingImages = IMAGE_FIELDS.some((f) => !Array.isArray(stepData[f]) || (stepData[f] as unknown[]).length === 0);

    if (missingImages) {
      const { data: latestFunnel } = await supabase
        .from("generated_funnels")
        .select("content")
        .eq("submission_id", submissionRow.id as string)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const snapshot = (latestFunnel?.content as Record<string, unknown> | null)?._wizardSnapshot as Record<string, unknown> | undefined;
      if (snapshot) {
        const patched = { ...stepData };
        for (const field of IMAGE_FIELDS) {
          if (!Array.isArray(patched[field]) || (patched[field] as unknown[]).length === 0) {
            if (Array.isArray(snapshot[field]) && (snapshot[field] as unknown[]).length > 0) {
              patched[field] = snapshot[field];
            }
          }
        }
        submissionRow = { ...submissionRow, step_data: patched };
      }
    }

    return NextResponse.json({ submission: submissionRow });
  }

  const { data } = await supabase
    .from("wizard_submissions")
    .select("id, name, step_data, current_step, status, updated_at, created_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ submission: data ?? null });
}
