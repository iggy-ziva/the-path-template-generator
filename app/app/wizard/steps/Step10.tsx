"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WizardData } from "@/lib/wizard-types";
import { THEME_LIST_FOR_WIZARD } from "../wizard-constants";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

function ReviewRow({ label, value, missing }: { label: string; value?: string | number | boolean | unknown[]; missing?: boolean }) {
  const isEmpty = value === undefined || value === null || value === "" ||
    (Array.isArray(value) && value.length === 0);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid #1a1917", gap: "16px" }}>
      <span style={{ fontSize: "13px", color: "#666", flexShrink: 0, width: "180px" }}>{label}</span>
      {isEmpty ? (
        <span style={{ fontSize: "13px", color: missing ? "#ff8a8a" : "#444", fontStyle: "italic" }}>
          {missing ? "⚠ Required — go back to add" : "Not provided (optional)"}
        </span>
      ) : (
        <span style={{ fontSize: "13px", color: "#f5f1ea", textAlign: "right", maxWidth: "400px", lineHeight: 1.4 }}>
          {Array.isArray(value) ? `${(value as unknown[]).length} item${(value as unknown[]).length !== 1 ? "s" : ""}` : String(value)}
        </span>
      )}
    </div>
  );
}

const REQUIRED_FIELDS: Array<{ key: keyof WizardData; label: string }> = [
  { key: "hostName", label: "Your name" },
  { key: "hostBio", label: "Your bio" },
  { key: "contactEmail", label: "Contact email" },
  { key: "eventName", label: "Event name" },
  { key: "eventDate", label: "Event date" },
  { key: "eventTime", label: "Event time" },
  { key: "eventTimezone", label: "Timezone" },
  { key: "programName", label: "Programme name" },
  { key: "transformationPromise", label: "Transformation promise" },
];

export default function Step10({ data }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const missing = REQUIRED_FIELDS.filter((f) => {
    const v = data[f.key];
    return v === undefined || v === null || v === "";
  });

  const refTheme = THEME_LIST_FOR_WIZARD.find((t) => t.slug === data.referenceTheme);

  async function handleGenerate() {
    if (missing.length > 0) {
      setError(`Please fill in required fields before generating: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/wizard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wizardData: data }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Generation failed");
      }
      const { funnelId } = await res.json();
      router.push(`/app/dashboard?funnel=${funnelId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed — please try again");
      setGenerating(false);
    }
  }

  return (
    <div>
      {/* COMPLETION STATUS */}
      <div style={{
        background: missing.length === 0 ? "#0f2818" : "#2a1a0a",
        border: `1px solid ${missing.length === 0 ? "#2a5a38" : "#5a3a0a"}`,
        borderRadius: "12px",
        padding: "20px 24px",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}>
        <span style={{ fontSize: "24px" }}>{missing.length === 0 ? "✅" : "⚠️"}</span>
        <div>
          <div style={{ fontWeight: 700, marginBottom: "4px", color: missing.length === 0 ? "#4ade80" : "#f59e0b" }}>
            {missing.length === 0 ? "Ready to generate" : `${missing.length} required field${missing.length > 1 ? "s" : ""} missing`}
          </div>
          {missing.length > 0 && (
            <div style={{ fontSize: "13px", color: "#888" }}>
              {missing.map((f) => f.label).join(" · ")}
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      <div style={{ background: "#1a1917", borderRadius: "16px", padding: "28px", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4A878", marginBottom: "20px" }}>
          Your inputs at a glance
        </h3>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", marginBottom: "8px" }}>About You</div>
          <ReviewRow label="Name" value={data.hostName} missing={!data.hostName} />
          <ReviewRow label="Title" value={data.hostTitle} />
          <ReviewRow label="Business" value={data.businessName} />
          <ReviewRow label="Headshot" value={data.hostHeadshotUrl ? "Uploaded" : undefined} />
          <ReviewRow label="Logo" value={data.logoUrl ? "Uploaded" : undefined} />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", marginBottom: "8px" }}>Live Event</div>
          <ReviewRow label="Event name" value={data.eventName} missing={!data.eventName} />
          <ReviewRow label="Date & time" value={data.eventDate && data.eventTime ? `${data.eventDate} · ${data.eventTime} ${data.eventTimezone}` : undefined} missing={!data.eventDate} />
          <ReviewRow label="Pricing" value={data.eventPricingModel === "fixed" ? `$${data.eventPriceFixed}` : data.eventPriceMin !== undefined ? `$${data.eventPriceMin}–$${data.eventPriceMax}` : undefined} />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", marginBottom: "8px" }}>Programme</div>
          <ReviewRow label="Programme name" value={data.programName} missing={!data.programName} />
          <ReviewRow label="Duration" value={data.programDuration} />
          <ReviewRow label="Full price" value={data.programPriceFull ? `$${data.programPriceFull}` : undefined} />
          <ReviewRow label="Curriculum modules" value={data.curriculumWeeks} />
          <ReviewRow label="Bonuses" value={data.bonuses} />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", marginBottom: "8px" }}>Content & Voice</div>
          <ReviewRow label="Testimonials" value={data.testimonials} />
          <ReviewRow label="Hero images" value={data.heroImageUrls} />
          <ReviewRow label="Uploaded materials" value={data.existingFileUrls} />
          <ReviewRow label="Material URLs" value={data.existingMaterialUrls} />
          <ReviewRow label="Tone descriptors" value={(data.toneDescriptors ?? []).join(" · ") || undefined} />
          <ReviewRow label="Reference theme" value={refTheme?.label} />
        </div>
      </div>

      {/* WHAT CLAUDE WILL WRITE */}
      <div style={{ background: "#1a1917", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4A878", marginBottom: "16px" }}>
          Claude will generate
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          {[
            "Event landing page",
            "Event checkout",
            "Post-checkout upsell",
            "Event thank-you page",
            "Replay page",
            "Programme landing page",
            "Programme checkout",
            "Programme thank-you",
          ].map((page, i) => (
            <div key={page} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#0f0e0c", borderRadius: "8px" }}>
              <span style={{ color: "#D4A878", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>0{i + 1}</span>
              <span style={{ fontSize: "13px", color: "#aaa" }}>{page}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#555", marginTop: "16px", lineHeight: 1.5 }}>
          Generation typically takes 60–90 seconds. Claude reads your bio, materials, testimonials, and tone preferences before writing — the output will sound like you, not a generic template.
        </p>
      </div>

      {error && (
        <div style={{ background: "#3a1a1a", border: "1px solid #5a2a2a", borderRadius: "10px", padding: "16px", marginBottom: "20px", fontSize: "13px", color: "#ff8a8a", lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={generating}
        style={{
          width: "100%",
          padding: "20px",
          background: generating ? "#2a2926" : "#D4A878",
          color: generating ? "#666" : "#0f0e0c",
          border: "none",
          borderRadius: "14px",
          fontWeight: 700,
          fontSize: "16px",
          cursor: generating ? "not-allowed" : "pointer",
          letterSpacing: "0.01em",
          transition: "all 0.2s",
        }}
      >
        {generating ? "⏳  Generating your funnel… please wait" : "✨  Generate my complete funnel →"}
      </button>
      <p style={{ textAlign: "center", fontSize: "12px", color: "#444", marginTop: "12px" }}>
        You can regenerate any page after reviewing the results
      </p>
    </div>
  );
}
