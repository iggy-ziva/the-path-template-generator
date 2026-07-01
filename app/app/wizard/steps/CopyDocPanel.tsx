"use client";
import { useState } from "react";
import type { WizardData, GenerationMode } from "@/lib/wizard-types";
import type { CoverageReport } from "@/lib/copydoc/validate";
import type { CopyDocPageKey } from "@/lib/copydoc/copydoc-schema";
import { deriveWizardFieldsFromContent, pickEmptyWizardFields } from "@/lib/copydoc/derive-wizard";

/** Human labels for fields we may pre-fill, for the "pre-filled" confirmation. */
const PREFILL_LABELS: Partial<Record<keyof WizardData, string>> = {
  hostBio: "Bio",
  hostTagline: "Tagline",
  hostName: "Host name",
  testimonials: "Testimonials",
  audienceDescription: "Target audience",
  transformationPromise: "Transformation promise",
  methodologyDescription: "Transformation in your own words",
  uniqueApproach: "Unique approach",
  facilitators: "Facilitators",
};

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  submissionId?: string | null;
}

const Z = {
  gold: "#D4A878",
  dark: "#1a1917",
  darker: "#0f0e0c",
  border: "#2a2926",
  muted: "#9a9390",
  text: "#f5f1ea",
  green: "#4ade80",
  amber: "#f59e0b",
  red: "#ff8a8a",
};

function ModeCard({
  active,
  title,
  body,
  onClick,
}: {
  active: boolean;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 220,
        textAlign: "left",
        padding: "16px 18px",
        borderRadius: 12,
        border: active ? `2px solid ${Z.gold}` : `1px solid ${Z.border}`,
        background: active ? `${Z.gold}14` : Z.darker,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: `2px solid ${active ? Z.gold : Z.muted}`,
            background: active ? Z.gold : "transparent",
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 700, fontSize: 14, color: active ? Z.gold : Z.text }}>{title}</span>
      </div>
      <div style={{ fontSize: 12.5, color: Z.muted, lineHeight: 1.55 }}>{body}</div>
    </button>
  );
}

function CoverageReportView({ report }: { report: CoverageReport }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderRadius: 10,
          background: report.ok ? "#0f2818" : "#2a1a0a",
          border: `1px solid ${report.ok ? "#2a5a38" : "#5a3a0a"}`,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 18 }}>{report.ok ? "✅" : "⚠️"}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: report.ok ? Z.green : Z.amber }}>
            {report.ok ? "All required sections detected" : "Some required copy is missing"}
          </div>
          <div style={{ fontSize: 12, color: Z.muted, marginTop: 2 }}>
            {report.counts.sectionsDetected}/{report.counts.sectionsTotal} sections ·{" "}
            {report.counts.fieldsDetected}/{report.counts.fieldsTotal} fields detected
          </div>
        </div>
      </div>

      {report.requiredMissing.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: Z.red, marginBottom: 6 }}>
            Required — add to your document
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: Z.red, fontSize: 12.5, lineHeight: 1.7 }}>
            {report.requiredMissing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {report.warnings.length > 0 && (
        <details style={{ marginBottom: 8 }}>
          <summary style={{ fontSize: 12, color: Z.muted, cursor: "pointer" }}>
            {report.warnings.length} warning{report.warnings.length !== 1 ? "s" : ""} (optional)
          </summary>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: Z.muted, fontSize: 12, lineHeight: 1.7 }}>
            {report.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </details>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 6, marginTop: 12 }}>
        {report.sections.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 10px",
              borderRadius: 8,
              background: Z.darker,
              border: `1px solid ${Z.border}`,
              fontSize: 12,
              color: s.present ? Z.text : Z.muted,
            }}
          >
            <span style={{ flexShrink: 0 }}>{s.present ? "✓" : s.required ? "✕" : "·"}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.heading}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CopyDocPanel({ data, onChange, submissionId }: Props) {
  const mode: GenerationMode = data.generationMode ?? "ai_copy";
  const [uploading, setUploading] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [error, setError] = useState("");
  const [prefilled, setPrefilled] = useState<string[]>([]);

  function setMode(next: GenerationMode) {
    onChange({ generationMode: next });
  }

  /** Apply a parse response: pre-fill empty wizard fields + record the copy-doc. */
  function applyParseResult(parseJson: {
    pageKey?: string;
    content?: unknown;
    copyDocumentId: string;
    version: number;
    report: CoverageReport;
  }, fileName: string) {
    const pageKey: CopyDocPageKey = parseJson.pageKey === "programmeLanding" ? "programmeLanding" : "eventLanding";
    const derived = deriveWizardFieldsFromContent(
      parseJson.content as Parameters<typeof deriveWizardFieldsFromContent>[0],
      pageKey,
      { hostName: data.hostName },
    );
    const toFill = pickEmptyWizardFields(derived, data);
    const filledLabels = Object.keys(toFill)
      .map((k) => PREFILL_LABELS[k as keyof WizardData])
      .filter((l): l is string => Boolean(l));

    onChange({
      ...toFill,
      // A document always runs through the full AI pipeline (verbatim copy +
      // AI gap-filling + all 8 pages + fresh image reprocessing).
      generationMode: "hybrid",
      copyDoc: {
        documentId: parseJson.copyDocumentId,
        fileName,
        version: parseJson.version,
        report: parseJson.report,
      },
    });
    setPrefilled(filledLabels);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.docx$/i.test(file.name)) {
      setError("Please upload a .docx file (export from Word using Heading styles).");
      e.target.value = "";
      return;
    }
    setUploading(true);
    setError("");
    try {
      // 1. Upload the raw file to the private copy-docs bucket.
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", "copy-docs");
      const upRes = await fetch("/api/wizard/upload", { method: "POST", body: form });
      const upJson = await upRes.json();
      if (!upRes.ok || !upJson.path) throw new Error(upJson.error ?? "Upload failed");

      // 2. Parse + store the CopyDoc, get a coverage report.
      const parseRes = await fetch("/api/wizard/copy-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: upJson.path, fileName: file.name, submissionId, pageKey: "eventLanding" }),
      });
      const parseJson = await parseRes.json();
      if (!parseRes.ok) throw new Error(parseJson.error ?? "Could not parse the document");

      applyParseResult(parseJson, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  /** Re-parse the file already stored for the current document (no re-select). */
  async function handleReprocess() {
    if (!data.copyDoc?.documentId || reprocessing || uploading) return;
    setReprocessing(true);
    setError("");
    try {
      const parseRes = await fetch("/api/wizard/copy-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reprocessDocumentId: data.copyDoc.documentId, submissionId }),
      });
      const parseJson = await parseRes.json();
      if (!parseRes.ok) throw new Error(parseJson.error ?? "Could not reprocess the document");

      applyParseResult(parseJson, data.copyDoc.fileName ?? "document.docx");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reprocess failed");
    } finally {
      setReprocessing(false);
    }
  }

  return (
    <div style={{ background: Z.dark, border: `1px solid ${Z.border}`, borderRadius: 14, padding: 22, marginBottom: 32 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: Z.gold, margin: "0 0 14px" }}>
        How should we write the copy?
      </h3>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <ModeCard
          active={mode === "ai_copy"}
          title="Let AI write the copy"
          body="Claude writes every page from your wizard inputs, bio, and materials."
          onClick={() => setMode("ai_copy")}
        />
        <ModeCard
          active={mode === "hybrid" || mode === "copy_doc"}
          title="Use my copy document + AI"
          body="Your document is the source of truth — its words stay verbatim. AI fills any gaps, assigns your images, and writes all 8 funnel pages."
          onClick={() => setMode("hybrid")}
        />
      </div>

      {(mode === "copy_doc" || mode === "hybrid") && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <p style={{ fontSize: 12.5, color: Z.muted, margin: 0, lineHeight: 1.55, maxWidth: 460 }}>
              Follow the template (Word Heading 1/2/3 styles) so each section is detected correctly. Your copy is never rewritten — only placed.
            </p>
            <a
              href="/templates/landing-page-copy-template.md"
              download
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: Z.gold,
                border: `1px solid ${Z.gold}55`,
                borderRadius: 8,
                padding: "8px 14px",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              ↓ Download template
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 10 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flex: 1,
                padding: "16px 18px",
                background: Z.darker,
                border: `1.5px dashed ${uploading ? Z.amber : "#3a3834"}`,
                borderRadius: 12,
                cursor: uploading || reprocessing ? "not-allowed" : "pointer",
                opacity: reprocessing ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: 22, opacity: 0.6 }}>↑</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: Z.text }}>
                  {uploading ? "Parsing your document…" : data.copyDoc ? "Replace copy document" : "Upload copy document (.docx)"}
                </div>
                <div style={{ fontSize: 12, color: Z.muted, marginTop: 2 }}>
                  {data.copyDoc?.fileName
                    ? `Current: ${data.copyDoc.fileName} (v${data.copyDoc.version})`
                    : "Click to browse — .docx only"}
                </div>
              </div>
              <input type="file" accept=".docx" onChange={handleFile} style={{ display: "none" }} disabled={uploading || reprocessing} />
            </label>

            {data.copyDoc && (
              <button
                type="button"
                onClick={handleReprocess}
                disabled={uploading || reprocessing}
                title="Re-parse the current document — picks up template/section changes without re-uploading."
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  minWidth: 120,
                  padding: "12px 16px",
                  background: Z.darker,
                  border: `1.5px solid ${reprocessing ? Z.amber : `${Z.gold}55`}`,
                  borderRadius: 12,
                  color: reprocessing ? Z.amber : Z.gold,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: uploading || reprocessing ? "not-allowed" : "pointer",
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>↻</span>
                {reprocessing ? "Reprocessing…" : "Reprocess"}
              </button>
            )}
          </div>

          {error && <p style={{ color: Z.red, fontSize: 12.5, marginTop: 10 }}>{error}</p>}

          {prefilled.length > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: "11px 14px",
                borderRadius: 10,
                background: "#0f2818",
                border: "1px solid #2a5a38",
                color: "#bfe8cc",
                fontSize: 12.5,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: Z.green }}>Pre-filled {prefilled.length} field{prefilled.length !== 1 ? "s" : ""} from your document:</strong>{" "}
              {prefilled.join(", ")}. Review and edit these in the steps that follow — your uploaded copy still drives the final pages verbatim.
            </div>
          )}

          {data.copyDoc?.report && <CoverageReportView report={data.copyDoc.report} />}
        </div>
      )}
    </div>
  );
}
