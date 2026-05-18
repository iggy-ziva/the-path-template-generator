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

/** List all funnels for the logged-in user */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("wizard_submissions")
    .select("id, name, current_step, status, theme_slug, updated_at, created_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("funnels list error:", error);
    return NextResponse.json({ error: "Failed to load funnels" }, { status: 500 });
  }

  return NextResponse.json({ funnels: data ?? [] });
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
      name,
      step_data: {},
      current_step: 1,
      status: "draft",
    })
    .select("id, name, current_step, status, theme_slug, updated_at, created_at")
    .single();

  if (error) {
    console.error("funnel create error:", error);
    return NextResponse.json({ error: "Failed to create funnel" }, { status: 500 });
  }

  return NextResponse.json({ funnel: data });
}
