"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, FileUpload, Grid, Section } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step1({ data, onChange }: Props) {
  return (
    <div>
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
    </div>
  );
}
