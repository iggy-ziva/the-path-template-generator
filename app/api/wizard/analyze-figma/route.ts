import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";
import { getValidFigmaToken } from "@/lib/figma/oauth";
import { extractBrandFromFigma, FigmaAccessError, parseFigmaFileRef } from "@/lib/figma/extract-brand";

export const maxDuration = 60;

function getServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

/** Analyse a Figma file the user has connected access to, into the brand schema. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let fileUrl = "";
  try {
    const body = await req.json();
    fileUrl = typeof body?.fileUrl === "string" ? body.fileUrl.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!fileUrl) return NextResponse.json({ error: "Paste a Figma file link first." }, { status: 400 });
  if (!parseFigmaFileRef(fileUrl)) {
    return NextResponse.json({ error: "That doesn't look like a Figma file link." }, { status: 400 });
  }

  const supabase = getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const token = await getValidFigmaToken(supabase, userId);
  if (!token) {
    return NextResponse.json({ error: "not_connected", message: "Connect your Figma account first." }, { status: 428 });
  }

  try {
    const result = await extractBrandFromFigma(fileUrl, token);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof FigmaAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status === 429 ? 429 : 400 });
    }
    console.error("analyze-figma error:", err);
    return NextResponse.json({ error: "Figma analysis failed" }, { status: 500 });
  }
}
