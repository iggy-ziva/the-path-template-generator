"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, Textarea, Section, MultipleFileUpload, UrlListInput } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step6({ data, onChange }: Props) {
  return (
    <div>
      <div style={{ background: "#1a1917", border: "1px solid #D4A87840", borderRadius: "12px", padding: "20px", marginBottom: "32px" }}>
        <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#aaa", margin: 0 }}>
          <strong style={{ color: "#D4A878" }}>How the AI uses this material:</strong> Claude will scrape any URLs you provide, read any files you upload, and combine them with your answers in earlier steps to extract your authentic voice, identify the language your audience responds to, and write all eight funnel pages in a tone that sounds genuinely like you — not a generic template.
        </p>
      </div>

      <Section title="Existing website and content URLs">
        <UrlListInput
          label="Paste URLs to your existing content"
          hint="Your website, sales pages, blog posts, podcast descriptions, social bios — the more, the better. AI will scrape these for language patterns."
          value={data.existingMaterialUrls ?? []}
          onChange={(urls) => onChange({ existingMaterialUrls: urls })}
          placeholder="https://your-website.com/about"
        />
      </Section>

      <Section title="Upload existing materials">
        <Field label="Upload documents, sales pages, or content files" hint="PDF, Word (.docx), or plain text. Upload existing copy, your bio doc, past sales pages, transcripts — anything that shows how you write and speak.">
          <MultipleFileUpload
            label="Upload files"
            accept=".pdf,.docx,.doc,.txt,.rtf"
            currentUrls={data.existingFileUrls ?? []}
            onUpload={(urls) => onChange({ existingFileUrls: urls })}
          />
        </Field>
      </Section>

      <Section title="In your own words">
        <Field label="Your transformation promise" required hint="In your own words (no AI polish yet) — what do people experience or achieve through working with you? What's the before and after?">
          <Textarea value={data.methodologyDescription ?? ""} onChange={(v) => onChange({ methodologyDescription: v })} rows={5} placeholder="Before working with me, people tend to feel... After working with me, they consistently experience..." />
        </Field>
        <Field label="Your unique approach or methodology" hint="What makes how you work different from everyone else in your field? What's your proprietary framework, philosophy, or method?">
          <Textarea value={data.uniqueApproach ?? ""} onChange={(v) => onChange({ uniqueApproach: v })} rows={5} placeholder="The thing that makes my approach different is..." />
        </Field>
      </Section>
    </div>
  );
}
