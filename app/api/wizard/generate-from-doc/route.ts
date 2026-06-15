import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOrCreateUserId } from "@/lib/getOrCreateUserId";
import type { WizardData } from "@/lib/wizard-types";
import { withWizardSnapshot } from "@/lib/funnel-snapshot";
import { computeBrandProfile } from "@/lib/brand-profile";
import { guardFunnelThemes } from "@/lib/section-theme-guard";
import { isCopyDocEngineEnabled } from "@/lib/feature-flags";
import { buildCopyDocFromDocx, mapCopyDocToContent } from "@/lib/copydoc";
import { mergePreservingLayout } from "@/lib/copydoc/merge";
import { getPageSpec, type CopyDoc, type CopyDocPageKey } from "@/lib/copydoc/copydoc-schema";

export const maxDuration = 120;

const COPY_DOCS_BUCKET = "copy-docs";

async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Generate a funnel from an uploaded copy document (layout-only path).
 *
 * Copy fields are taken verbatim from the parsed CopyDoc; brand, host facts,
 * prices, dates and images are layered in from the wizard snapshot at render
 * time. The AI copywriter is never invoked here.
 */
export async function POST(req: NextRequest) {
  if (!isCopyDocEngineEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { wizardData, submissionId, copyDocumentId, previousFunnelId } = await req.json() as {
      wizardData: WizardData;
      submissionId?: string;
      copyDocumentId: string;
      /** When regenerating, preserve this funnel's non-copy layout edits. */
      previousFunnelId?: string;
    };

    if (!copyDocumentId) {
      return NextResponse.json({ error: "A copy document is required." }, { status: 400 });
    }

    const supabase = await getServiceClient();
    const userId = await getOrCreateUserId(session, supabase);
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: docRow, error: docErr } = await supabase
      .from("copy_documents")
      .select("id, storage_path, page_key, parsed_json, version")
      .eq("id", copyDocumentId)
      .eq("user_id", userId)
      .single();

    if (docErr || !docRow) {
      return NextResponse.json({ error: "Copy document not found." }, { status: 404 });
    }

    // Prefer the cached CopyDoc; re-parse from storage if missing.
    let copyDoc = docRow.parsed_json as CopyDoc | null;
    let report: unknown = null;
    if (!copyDoc) {
      const { data: blob, error: dlErr } = await supabase.storage.from(COPY_DOCS_BUCKET).download(docRow.storage_path);
      if (dlErr || !blob) {
        return NextResponse.json({ error: "Could not read the copy document." }, { status: 400 });
      }
      const buffer = Buffer.from(await blob.arrayBuffer());
      let anthropic: import("@anthropic-ai/sdk").default | undefined;
      if (process.env.ANTHROPIC_API_KEY) {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      }
      const parsed = await buildCopyDocFromDocx(buffer, docRow.page_key, anthropic);
      copyDoc = parsed.copyDoc;
      report = parsed.report;
      await supabase
        .from("copy_documents")
        .update({ parsed_json: copyDoc, parse_report: report, parse_status: "parsed", updated_at: new Date().toISOString() })
        .eq("id", docRow.id);
    }

    // ── Map copy verbatim into page content ──
    const pageKey = (docRow.page_key as CopyDocPageKey) ?? "eventLanding";
    const spec = getPageSpec(pageKey);
    if (!spec) {
      return NextResponse.json({ error: `Unsupported page type: ${pageKey}` }, { status: 400 });
    }
    let mapped: Record<string, unknown> = mapCopyDocToContent(copyDoc, spec);

    // Edit preservation: keep the previous generation's non-copy layout edits
    // (section themes, image assignments, logo/icon overrides). Copy always
    // comes from the (new) document.
    if (previousFunnelId) {
      const { data: prev } = await supabase
        .from("generated_funnels")
        .select("content")
        .eq("id", previousFunnelId)
        .eq("user_id", userId)
        .maybeSingle();
      const prevPage = (prev?.content as Record<string, unknown> | null)?.[pageKey] as
        | Record<string, unknown>
        | undefined;
      mapped = mergePreservingLayout(prevPage, mapped, pageKey);
    }

    // Freeze brand/profile so the preview is deterministic, mirroring the AI path.
    const brandProfile = computeBrandProfile(wizardData);
    const wizardForGen: WizardData = {
      ...wizardData,
      brandProfile,
      referenceTheme: wizardData.referenceTheme ?? brandProfile.suggestedThemeSlug,
    };

    const pageContent: Record<string, unknown> = { [pageKey]: mapped };

    // Layout pass: enforce theme safety (accent only on legible band sections).
    const themeFixes = guardFunnelThemes(pageContent);
    if (themeFixes.length > 0) {
      console.warn(`Copy-doc accent guard downgraded ${themeFixes.length} section(s): ${themeFixes.join(", ")}`);
    }

    const content = withWizardSnapshot(pageContent, wizardForGen as Record<string, unknown>);

    const { data: funnel, error } = await supabase
      .from("generated_funnels")
      .insert({
        user_id: userId,
        submission_id: submissionId ?? null,
        content,
        theme_slug: wizardForGen.referenceTheme ?? brandProfile.suggestedThemeSlug,
        generation_mode: "copy_doc",
        source_document_id: docRow.id,
        copy_doc_version: docRow.version,
      })
      .select("id")
      .single();

    if (error || !funnel) throw error ?? new Error("Failed to store funnel");

    if (submissionId) {
      await supabase
        .from("wizard_submissions")
        .update({ status: "complete", updated_at: new Date().toISOString() })
        .eq("id", submissionId)
        .eq("user_id", userId);
    }

    return NextResponse.json({ funnelId: funnel.id, report });
  } catch (err) {
    console.error("Generate-from-doc error:", err);
    const msg = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: `Generation failed: ${msg}` }, { status: 500 });
  }
}
