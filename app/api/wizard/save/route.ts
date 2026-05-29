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
    const { data } = await supabase
      .from("wizard_submissions")
      .select("id, name, step_data, current_step, status, updated_at, created_at")
      .eq("id", specificId)
      .eq("user_id", userId)
      .single();
    return NextResponse.json({ submission: data ?? null });
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
