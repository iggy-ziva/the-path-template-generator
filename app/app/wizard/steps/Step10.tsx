"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Section } from "../WizardField";
import { TONE_DESCRIPTORS } from "../wizard-constants";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step10({ data, onChange }: Props) {
  const selected = data.toneDescriptors ?? [];

  function toggleDescriptor(d: string) {
    if (selected.includes(d)) {
      onChange({ toneDescriptors: selected.filter((x) => x !== d) });
    } else if (selected.length < 3) {
      onChange({ toneDescriptors: [...selected, d] });
    }
  }

  return (
    <div>
      <Section title="Choose your 3 tone descriptors">
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px", lineHeight: 1.6 }}>
          Select exactly 3 words that describe how you naturally communicate. The AI uses these to calibrate the voice of every page it writes.
          {selected.length > 0 && <span style={{ color: "#D4A878", fontWeight: 700 }}> {selected.length}/3 selected.</span>}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {TONE_DESCRIPTORS.map((d) => {
            const isSelected = selected.includes(d);
            const isDisabled = !isSelected && selected.length >= 3;
            return (
              <button
                key={d}
                onClick={() => toggleDescriptor(d)}
                disabled={isDisabled}
                style={{
                  padding: "10px 18px",
                  borderRadius: "100px",
                  border: isSelected ? "2px solid #D4A878" : isDisabled ? "1px solid #2a2926" : "1px solid #3d3a36",
                  background: isSelected ? "#D4A87825" : "#1a1917",
                  color: isSelected ? "#D4A878" : isDisabled ? "#6a6662" : "#f5f1ea",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: isSelected ? 700 : 400,
                  transition: "all 0.1s",
                }}
              >
                {isSelected && "✓ "}{d}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Copy references (optional)">
        <Field label="A URL to copy you love" hint="Paste a link to a sales page, email, or landing page whose writing style resonates with you. Claude will analyse the language and incorporate those patterns.">
          <TextInput
            type="url"
            value={data.copyLoveUrl ?? ""}
            onChange={(v) => onChange({ copyLoveUrl: v })}
            placeholder="https://…"
          />
        </Field>
        <Field label="Describe copy you want to avoid" hint="e.g. 'Overly salesy. Lots of ALL CAPS. Fake urgency. Bro-marketing vibes.' — this helps the AI know what NOT to write.">
          <TextInput
            value={data.copyHateDescription ?? ""}
            onChange={(v) => onChange({ copyHateDescription: v })}
            placeholder="I hate copy that feels…"
          />
        </Field>
      </Section>
    </div>
  );
}
