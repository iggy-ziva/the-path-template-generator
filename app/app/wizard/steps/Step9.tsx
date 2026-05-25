"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, Section, MultipleFileUpload } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step9({ data, onChange }: Props) {
  return (
    <div>
      <div style={{ background: "#1a1917", border: "1px solid #D4A87840", borderRadius: "12px", padding: "20px", marginBottom: "32px", fontSize: 13, lineHeight: 1.7, color: "#aaa" }}>
        <p style={{ margin: "0 0 12px 0" }}>
          Upload as many images as you have across each section below — the AI will suggest the best placement for each one based on the content it generates. JPEG, PNG, or WebP accepted.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div style={{ background: "#12110f", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontWeight: 600, color: "#D4A878", marginBottom: 4 }}>Hero / background images</div>
            <div style={{ color: "#888" }}>
              These span the full screen width. <strong style={{ color: "#C8A060" }}>Minimum 2560 px wide</strong> — anything smaller will look pixelated on large displays. Landscape orientation preferred. Don&apos;t compress before uploading; large files are fine.
            </div>
          </div>
          <div style={{ background: "#12110f", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontWeight: 600, color: "#D4A878", marginBottom: 4 }}>Lifestyle &amp; mood images</div>
            <div style={{ color: "#888" }}>
              Used in section backgrounds, value prop blocks, and atmosphere panels. <strong style={{ color: "#C8A060" }}>Minimum 1200 px wide.</strong> Portrait or landscape both work here.
            </div>
          </div>
          <div style={{ background: "#12110f", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontWeight: 600, color: "#D4A878", marginBottom: 4 }}>Icons &amp; badges</div>
            <div style={{ color: "#888" }}>
              Small transparent PNGs or SVGs — certifications, award badges, feature icons, trust signals. <strong style={{ color: "#C8A060" }}>Transparent background preferred.</strong> No minimum size, but vector SVG is ideal.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, padding: "10px 12px", background: "#2a1f0e", borderRadius: 8, color: "#C8A060" }}>
          <span style={{ flexShrink: 0 }}>⚠️</span>
          <span>We cannot sharpen a blurry or low-resolution source file. If the image isn&apos;t high quality going in, it won&apos;t be high quality in the funnel.</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 8, padding: "10px 12px", background: "#111", borderRadius: 8, color: "#aaa" }}>
          <span style={{ flexShrink: 0 }}>💡</span>
          <span>
            <strong style={{ color: "#D4A878" }}>More images = better output.</strong>{" "}
            The AI chooses the best image for each section of your funnel — but it can only work with what you give it. Upload everything you have: different angles, settings, moods, closeups, wide shots. Ten images will always produce a better funnel than two. Don&apos;t curate — give us the full library and let the AI decide.
          </span>
        </div>
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

      <Section title="Icons & badges (optional)">
        <Field label="Icons and badge images" hint="Small transparent PNG or SVG icons used in feature lists, benefit bullets, trust badges, and section dividers. Ideally on a transparent background. Examples: certifications, award badges, custom bullet icons, programme module icons.">
          <MultipleFileUpload
            label="Upload icons & badges"
            accept="image/png,image/svg+xml,image/webp"
            currentUrls={data.additionalImageUrls ?? []}
            onUpload={(urls) => onChange({ additionalImageUrls: urls })}
          />
        </Field>
      </Section>

      <div style={{ background: "#1a1917", borderRadius: "12px", padding: "20px", textAlign: "center", color: "#888", fontSize: "13px" }}>
        <p style={{ margin: 0 }}>No images yet? That's fine. The AI will generate your copy first — you can add and place images afterwards.</p>
      </div>
    </div>
  );
}
