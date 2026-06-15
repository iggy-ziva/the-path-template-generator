import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";
import { isCopyDocEngineEnabled } from "@/lib/feature-flags";
import { buildCopyDocFromDocx } from "@/lib/copydoc";
import type { CopyDocPageKey } from "@/lib/copydoc/copydoc-schema";

export const maxDuration = 60;

const COPY_DOCS_BUCKET = "copy-docs";

async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Parse a previously uploaded .docx into a CopyDoc, store it in copy_documents,
 * and return a coverage report. The browser uploads the file directly to the
 * private `copy-docs` bucket via /api/wizard/signed-upload, then calls this with
 * the returned storage path.
 */
export async function POST(req: NextRequest) {
  if (!isCopyDocEngineEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const storagePath: string | undefined = body?.storagePath;
    const fileName: string | undefined = body?.fileName;
    const submissionId: string | undefined = body?.submissionId;
    const pageKey: CopyDocPageKey = body?.pageKey === "programmeLanding" ? "programmeLanding" : "eventLanding";

    if (!storagePath || !/\.docx$/i.test(fileName ?? storagePath)) {
      return NextResponse.json({ error: "A .docx file is required." }, { status: 400 });
    }

    const supabase = await getServiceClient();
    const userId = await getOrCreateUserId(session, supabase);
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Defence in depth: uploaded paths are namespaced by user id.
    if (!storagePath.startsWith(`${session.userId}/`)) {
      return NextResponse.json({ error: "Invalid upload path." }, { status: 403 });
    }

    const { data: blob, error: dlErr } = await supabase.storage.from(COPY_DOCS_BUCKET).download(storagePath);
    if (dlErr || !blob) {
      return NextResponse.json({ error: "Could not read the uploaded document." }, { status: 400 });
    }
    const buffer = Buffer.from(await blob.arrayBuffer());

    let parsed;
    try {
      let anthropic: import("@anthropic-ai/sdk").default | undefined;
      if (process.env.ANTHROPIC_API_KEY) {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      }
      parsed = await buildCopyDocFromDocx(buffer, pageKey, anthropic);
    } catch (err) {
      console.error("copy-doc parse error:", err);
      // Still record the failed attempt for support/debugging.
      await supabase.from("copy_documents").insert({
        user_id: userId,
        submission_id: submissionId ?? null,
        storage_path: storagePath,
        file_name: fileName ?? null,
        page_key: pageKey,
        parse_status: "failed",
        parse_report: { error: err instanceof Error ? err.message : "parse failed" },
      });
      return NextResponse.json({ error: "We couldn't parse that document. Make sure it follows the template and uses Word heading styles." }, { status: 422 });
    }

    // Version = next per submission (or 1 when standalone).
    let version = 1;
    if (submissionId) {
      const { data: prev } = await supabase
        .from("copy_documents")
        .select("version")
        .eq("user_id", userId)
        .eq("submission_id", submissionId)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prev?.version) version = Number(prev.version) + 1;
    }

    const { data: doc, error: insErr } = await supabase
      .from("copy_documents")
      .insert({
        user_id: userId,
        submission_id: submissionId ?? null,
        storage_path: storagePath,
        file_name: fileName ?? null,
        page_key: pageKey,
        parsed_json: parsed.copyDoc,
        parse_status: "parsed",
        parse_report: parsed.report,
        version,
      })
      .select("id, version")
      .single();

    if (insErr || !doc) throw insErr ?? new Error("Failed to store document");

    if (submissionId) {
      await supabase
        .from("wizard_submissions")
        .update({
          active_copy_document_id: doc.id,
          generation_mode: "copy_doc",
          updated_at: new Date().toISOString(),
        })
        .eq("id", submissionId)
        .eq("user_id", userId);
    }

    return NextResponse.json({ copyDocumentId: doc.id, version: doc.version, report: parsed.report });
  } catch (err) {
    console.error("copy-doc error:", err);
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 });
  }
}

/** Fetch the latest copy document (and its coverage report) for a submission. */
export async function GET(req: NextRequest) {
  if (!isCopyDocEngineEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const submissionId = req.nextUrl.searchParams.get("submissionId");
  if (!submissionId) return NextResponse.json({ document: null });

  const supabase = await getServiceClient();
  const userId = await getOrCreateUserId(session, supabase);
  if (!userId) return NextResponse.json({ document: null });

  const { data } = await supabase
    .from("copy_documents")
    .select("id, file_name, page_key, parse_status, parse_report, version, created_at")
    .eq("user_id", userId)
    .eq("submission_id", submissionId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ document: data ?? null });
}
