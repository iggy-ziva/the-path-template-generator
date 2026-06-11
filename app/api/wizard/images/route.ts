import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const BUCKET = "wizard-uploads";
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|svg)$/i;

/**
 * GET /api/wizard/images
 *
 * Returns only the image files uploaded by the currently logged-in user.
 * Listing is scoped to the `{userId}/` prefix in the wizard-uploads bucket
 * so it is structurally impossible for one user to see another's uploads.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ urls: [] });

  // List all files under the user's own prefix.
  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(userId, { limit: 500, sortBy: { column: "created_at", order: "desc" } });

  if (error || !files) {
    console.error("image list error:", error);
    return NextResponse.json({ urls: [] });
  }

  const imageFiles = files.filter(
    (f) => f.name && IMAGE_EXTENSIONS.test(f.name)
  );

  const urls = imageFiles.map((f) => {
    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(`${userId}/${f.name}`);
    return data.publicUrl;
  });

  return NextResponse.json({ urls });
}
