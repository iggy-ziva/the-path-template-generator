import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Issues a short-lived signed upload URL so the browser can upload large files
 * DIRECTLY to Supabase storage — bypassing the serverless request-body limit
 * (~4.5 MB on Vercel) that would otherwise block big style-guide screenshots.
 * The request/response here are tiny (just a path + token), so they never hit
 * that limit themselves.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let ext = "bin";
  let bucket = "wizard-uploads";
  try {
    const body = await req.json();
    if (typeof body?.ext === "string") ext = body.ext;
    if (typeof body?.bucket === "string") bucket = body.bucket;
  } catch {
    // empty body is fine — use defaults
  }

  const safeExt = ext.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase() || "bin";
  const path = `${session.userId}/${nanoid()}.${safeExt}`;

  const supabase = getServiceClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("signed-upload error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Could not create upload URL" },
      { status: 500 }
    );
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ path: data.path, token: data.token, publicUrl, bucket });
}
