import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";
import { disconnectFigma, figmaOAuthConfigured, getFigmaConnection } from "@/lib/figma/oauth";

function getServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

/** Whether the current user has connected Figma. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ connected: false, configured: figmaOAuthConfigured() });
  const supabase = getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ connected: false, configured: figmaOAuthConfigured() });
  const conn = await getFigmaConnection(supabase, userId);
  return NextResponse.json({ ...conn, configured: figmaOAuthConfigured() });
}

/** Disconnect Figma for the current user. */
export async function DELETE(_req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });
  await disconnectFigma(supabase, userId);
  return NextResponse.json({ connected: false });
}
