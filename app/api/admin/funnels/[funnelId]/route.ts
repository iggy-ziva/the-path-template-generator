import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = ["hello@ziva.marketing", "ignusvermaak@gmail.com"];

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/** Admin: update funnel hosting workflow status. */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || !ADMIN_EMAILS.includes(session.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { funnelId, hostingStatus, hostedUrl, notes } = body;

  if (!funnelId || typeof funnelId !== "string") {
    return NextResponse.json({ error: "funnelId required" }, { status: 400 });
  }

  const allowed = ["none", "requested", "approved", "hosted"];
  if (hostingStatus && !allowed.includes(hostingStatus)) {
    return NextResponse.json({ error: "Invalid hostingStatus" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (hostingStatus) patch.hosting_status = hostingStatus;
  if (hostedUrl !== undefined) patch.hosted_url = hostedUrl;
  if (hostingStatus === "approved") patch.approved_at = new Date().toISOString();

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("generated_funnels")
    .update(patch)
    .eq("id", funnelId)
    .select("id, hosting_status, hosted_url, approved_at, updated_at")
    .single();

  if (error) {
    console.error("admin funnel patch:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ funnel: data, notes: notes ?? null });
}
