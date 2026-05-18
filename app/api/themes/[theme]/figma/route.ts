import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTheme } from "@/lib/themes";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ theme: string }> }
) {
  // Auth gate
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);

  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  if (!theme.figmaStoragePath) {
    return NextResponse.json(
      { error: "No Figma file available for this theme yet" },
      { status: 404 }
    );
  }

  // Generate a short-lived signed URL from Supabase Storage
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.storage
    .from("figma-files")
    .createSignedUrl(theme.figmaStoragePath, 60); // 60 second expiry

  if (error || !data?.signedUrl) {
    console.error("Figma signed URL error:", error);
    return NextResponse.json(
      { error: "Could not generate download link" },
      { status: 500 }
    );
  }

  // Redirect browser directly to the signed download URL
  return NextResponse.redirect(data.signedUrl, { status: 303 });
}
