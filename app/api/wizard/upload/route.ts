import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { bufferHasTransparency, LOGO_TRANSPARENCY_ERROR } from "@/lib/image-alpha";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/rtf",
  "application/rtf",
  "font/woff",
  "font/woff2",
  "application/font-woff",
  "application/font-woff2",
];

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) ?? "wizard-uploads";
    const requireTransparency = formData.get("requireTransparency") === "true";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (requireTransparency && !bufferHasTransparency(arrayBuffer, file.type)) {
      return NextResponse.json({ error: LOGO_TRANSPARENCY_ERROR }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${session.userId}/${nanoid()}.${ext}`;

    const supabase = getServiceClient();
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return NextResponse.json(
        { error: error.message ?? "Storage upload failed" },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, path });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("upload error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
