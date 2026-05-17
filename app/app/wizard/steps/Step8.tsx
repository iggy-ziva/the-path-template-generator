"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, Section, MultipleFileUpload } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step8({ data, onChange }: Props) {
  return (
    <div>
      <div style={{ background: "#1a1917", border: "1px solid #D4A87840", borderRadius: "12px", padding: "20px", marginBottom: "32px" }}>
        <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#aaa", margin: 0 }}>
          <strong style={{ color: "#D4A878" }}>Image formats:</strong> JPEG or PNG preferred. Minimum 1200px wide for hero images. Upload as many images as you have — the AI will suggest placements for each one based on the content it generates.
        </p>
      </div>

      <Section title="Hero / banner images">
        <Field label="Primary hero images" hint="Full-width images for the top of your landing page and programme LP. Portrait or landscape. Of you in action, in ceremony, or lifestyle.">
          <MultipleFileUpload
            label="Upload hero images"
            accept="image/jpeg,image/png,image/webp"
            currentUrls={data.heroImageUrls ?? []}
            onUpload={(urls) => onChange({ heroImageUrls: urls })}
          />
        </Field>
      </Section>

      <Section title="Lifestyle and mood images">
        <Field label="Supporting imagery" hint="Images used throughout the funnel — for value prop sections, testimonial backgrounds, programme page atmosphere. Can be of you, your workspace, nature, or anything that captures your vibe.">
          <MultipleFileUpload
            label="Upload lifestyle images"
            accept="image/jpeg,image/png,image/webp"
            currentUrls={data.lifestyleImageUrls ?? []}
            onUpload={(urls) => onChange({ lifestyleImageUrls: urls })}
          />
        </Field>
      </Section>

      <Section title="Additional assets (optional)">
        <Field label="Other images" hint="Workbook covers, product mockups, event screenshots, anything else you want available in the funnel">
          <MultipleFileUpload
            label="Upload additional images"
            accept="image/jpeg,image/png,image/webp"
            currentUrls={data.additionalImageUrls ?? []}
            onUpload={(urls) => onChange({ additionalImageUrls: urls })}
          />
        </Field>
      </Section>

      <div style={{ background: "#1a1917", borderRadius: "12px", padding: "20px", textAlign: "center", color: "#555", fontSize: "13px" }}>
        <p style={{ margin: 0 }}>No images yet? That's fine. The AI will generate your copy first — you can add and place images afterwards.</p>
      </div>
    </div>
  );
}
