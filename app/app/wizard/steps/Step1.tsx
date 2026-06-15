"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, FileUpload, Grid, Section, MultipleFileUpload, UrlListInput } from "../WizardField";
import CopyDocPanel from "./CopyDocPanel";
import { isCopyDocEngineEnabledClient } from "@/lib/feature-flags";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; submissionId?: string | null; }

export default function Step1({ data, onChange, submissionId }: Props) {
  const copyDocEnabled = isCopyDocEngineEnabledClient();
  return (
    <div>
      {/* How should we write the copy? — first decision in the wizard. */}
      {copyDocEnabled && <CopyDocPanel data={data} onChange={onChange} submissionId={submissionId} />}

      <Section title="Your identity">
        <Grid>
          <Field label="Full name" required>
            <TextInput value={data.hostName ?? ""} onChange={(v) => onChange({ hostName: v })} placeholder="e.g. Aria Bloom" />
          </Field>
          <Field label="Professional title" required>
            <TextInput value={data.hostTitle ?? ""} onChange={(v) => onChange({ hostTitle: v })} placeholder="e.g. Somatic Therapist & Embodiment Coach" />
          </Field>
        </Grid>
        <Field label="Tagline" hint="A one-line positioning statement. This appears below your name throughout the funnel.">
          <TextInput value={data.hostTagline ?? ""} onChange={(v) => onChange({ hostTagline: v })} placeholder="e.g. Creating space for the body to say what words can't reach" />
        </Field>
      </Section>

      <Section title="Your bio">
        <Field label="Bio" required hint="2–4 paragraphs about your background, credentials, and approach. The AI will rewrite this in your chosen tone — paste your existing bio or write something fresh." >
          <Textarea value={data.hostBio ?? ""} onChange={(v) => onChange({ hostBio: v })} placeholder="I've been working with..." rows={8} />
        </Field>
      </Section>

      <Section title="Photos">
        <Grid>
          <Field label="Headshot" hint="Used throughout the funnel — hero, bio section, programme LP">
            <FileUpload label="Upload headshot" accept="image/jpeg,image/png,image/webp" currentUrl={data.hostHeadshotUrl} onUpload={(url) => onChange({ hostHeadshotUrl: url })} />
          </Field>
          <Field label="Signature (optional)" hint="A handwritten signature image for personal notes — PNG with transparent background works best">
            <FileUpload label="Upload signature" accept="image/jpeg,image/png,image/webp" currentUrl={data.hostSignatureUrl} onUpload={(url) => onChange({ hostSignatureUrl: url })} />
          </Field>
        </Grid>
      </Section>

      {/* ── Your Story (merged in from the former standalone step) ─────────── */}
      <div style={{ background: "#1a1917", border: "1px solid #D4A87840", borderRadius: "12px", padding: "20px", margin: "8px 0 32px" }}>
        <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#aaa", margin: 0 }}>
          <strong style={{ color: "#D4A878" }}>How the AI uses this material:</strong> Claude will scrape any URLs you provide, read any files you upload, and combine them with your answers in the steps that follow to extract your authentic voice, identify the language your audience responds to, and write all eight funnel pages in a tone that sounds genuinely like you — not a generic template.
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
