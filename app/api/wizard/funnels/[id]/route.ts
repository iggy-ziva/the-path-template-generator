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

/** Rename (or update metadata of) a funnel */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.name === "string") updates.name = body.name;
  if (typeof body.theme_slug === "string") updates.theme_slug = body.theme_slug;

  const supabase = await getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("wizard_submissions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, name, current_step, status, theme_slug, updated_at")
    .single();

  if (error) {
    console.error("funnel patch error:", error);
    return NextResponse.json({ error: "Failed to update funnel" }, { status: 500 });
  }

  return NextResponse.json({ funnel: data });
}

/** Delete a funnel */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { error } = await supabase
    .from("wizard_submissions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("funnel delete error:", error);
    return NextResponse.json({ error: "Failed to delete funnel" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
