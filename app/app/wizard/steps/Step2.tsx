"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, FileUpload, Grid, Section } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step2({ data, onChange }: Props) {
  return (
    <div>
      <Section title="Business details">
        <Grid>
          <Field label="Business / practice name" required>
            <TextInput value={data.businessName ?? ""} onChange={(v) => onChange({ businessName: v })} placeholder="e.g. Aria Bloom Wellness" />
          </Field>
          <Field label="Contact email" required hint="Used in footer and support sections">
            <TextInput type="email" value={data.contactEmail ?? ""} onChange={(v) => onChange({ contactEmail: v })} placeholder="hello@yourdomain.com" />
          </Field>
        </Grid>
        <Field label="Legal entity name" hint="Used in FTC disclaimers and footers — e.g. 'Aria Bloom Wellness Ltd'">
          <TextInput value={data.legalEntityName ?? ""} onChange={(v) => onChange({ legalEntityName: v })} placeholder="Your LLC, Ltd or trading name" />
        </Field>
      </Section>

      <Section title="Logo">
        <Field label="Logo file" hint="PNG with transparent background preferred. Used in headers and footers throughout the funnel.">
          <FileUpload label="Upload logo" accept="image/jpeg,image/png,image/webp,image/svg+xml" currentUrl={data.logoUrl} onUpload={(url) => onChange({ logoUrl: url })} />
        </Field>
      </Section>

      <Section title="Online presence">
        <Grid>
          <Field label="Website URL (optional)">
            <TextInput type="url" value={data.websiteUrl ?? ""} onChange={(v) => onChange({ websiteUrl: v })} placeholder="https://yourwebsite.com" />
          </Field>
          <Field label="Instagram URL (optional)">
            <TextInput type="url" value={data.instagramUrl ?? ""} onChange={(v) => onChange({ instagramUrl: v })} placeholder="https://instagram.com/yourhandle" />
          </Field>
        </Grid>
        <Field label="LinkedIn URL (optional)">
          <TextInput type="url" value={data.linkedinUrl ?? ""} onChange={(v) => onChange({ linkedinUrl: v })} placeholder="https://linkedin.com/in/yourprofile" />
        </Field>
      </Section>
    </div>
  );
}
