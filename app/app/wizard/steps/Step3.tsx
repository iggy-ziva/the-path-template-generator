"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, Select, Grid, Section, DatePicker, TimePicker } from "../WizardField";
import { TIMEZONE_OPTIONS, PLATFORM_OPTIONS } from "../wizard-constants";

const Z = {
  pink: "#FF007E", coral: "#FA2A45", charcoal: "#2E2E2E", muted: "#8A7A6A",
  faint: "#C8B8A4", creamMid: "#FCF8EF", creamDeep: "#F5EEE0", white: "#FFFFFF",
  font: 'var(--font-barlow), -apple-system, sans-serif',
};

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step3({ data, onChange }: Props) {
  return (
    <div>
      <Section title="Event identity">
        <Field label="Event name" required>
          <TextInput value={data.eventName ?? ""} onChange={(v) => onChange({ eventName: v })} placeholder="e.g. The Embodied Presence Intensive" />
        </Field>
        <Field label="Event tagline" hint="One sentence that captures what people will experience — used in hero sections">
          <TextInput value={data.eventTagline ?? ""} onChange={(v) => onChange({ eventTagline: v })} placeholder="e.g. A live online gathering to help you return to your body" />
        </Field>
      </Section>

      <Section title="Date and time">
        <Grid>
          <Field label="Event date" required>
            <DatePicker value={data.eventDate ?? ""} onChange={(v) => onChange({ eventDate: v })} />
          </Field>
          <Field label="Start time" required>
            <TimePicker value={data.eventTime ?? ""} onChange={(v) => onChange({ eventTime: v })} />
          </Field>
        </Grid>
        <Grid>
          <Field label="Time zone" required>
            <Select value={data.eventTimezone ?? ""} onChange={(v) => onChange({ eventTimezone: v })} options={TIMEZONE_OPTIONS} />
          </Field>
          <Field label="Duration" required>
            <TextInput value={data.eventDuration ?? ""} onChange={(v) => onChange({ eventDuration: v })} placeholder="e.g. 3 hours" />
          </Field>
        </Grid>
        <Field label="Platform" required>
          <Select value={data.eventPlatform ?? ""} onChange={(v) => onChange({ eventPlatform: v })} options={PLATFORM_OPTIONS} />
        </Field>
      </Section>

      <Section title="Pricing">
        <Field label="Pricing model" required>
          <div style={{ display: "flex", gap: "10px" }}>
            {(["pay-what-you-want", "fixed"] as const).map((model) => {
              const active = data.eventPricingModel === model;
              return (
                <button
                  key={model}
                  onClick={() => onChange({ eventPricingModel: model })}
                  style={{
                    padding: "12px 20px",
                    border: active ? `2px solid ${Z.pink}` : `1.5px solid ${Z.creamDeep}`,
                    borderRadius: "10px",
                    background: active ? "rgba(255,0,126,0.07)" : Z.white,
                    color: active ? Z.pink : Z.muted,
                    cursor: "pointer",
                    fontWeight: active ? 700 : 400,
                    fontSize: "14px",
                    fontFamily: Z.font,
                    transition: "all 0.15s",
                  }}
                >
                  {model === "pay-what-you-want" ? "Pay what you want" : "Fixed price"}
                </button>
              );
            })}
          </div>
        </Field>

        {data.eventPricingModel === "pay-what-you-want" ? (
          <Grid>
            <Field label="Minimum ($)" hint="0 for completely free">
              <TextInput type="number" value={String(data.eventPriceMin ?? "")} onChange={(v) => onChange({ eventPriceMin: Number(v) })} placeholder="0" />
            </Field>
            <Field label="Maximum / suggested ($)">
              <TextInput type="number" value={String(data.eventPriceMax ?? "")} onChange={(v) => onChange({ eventPriceMax: Number(v) })} placeholder="97" />
            </Field>
          </Grid>
        ) : (
          <Field label="Price ($)">
            <TextInput type="number" value={String(data.eventPriceFixed ?? "")} onChange={(v) => onChange({ eventPriceFixed: Number(v) })} placeholder="47" />
          </Field>
        )}
      </Section>

      <Section title="Additional details">
        <Field label="Event video URL (optional)" hint="YouTube or Vimeo link — embedded on the registration page. Leave blank and the video section will be skipped in the generated funnel.">
          <TextInput
            type="url"
            value={data.eventVideoUrl ?? ""}
            onChange={(v) => onChange({ eventVideoUrl: v })}
            placeholder="https://youtube.com/watch?v=..."
          />
        </Field>
        <Field label="Recording policy" hint="Do attendees get a recording? For how long?">
          <Textarea
            value={data.eventRecordingPolicy ?? "All registered participants receive the full recording within 24 hours of the live event."}
            onChange={(v) => onChange({ eventRecordingPolicy: v })}
            placeholder="e.g. All registered participants receive the full recording within 24 hours of the live event."
            rows={3}
          />
        </Field>
      </Section>
    </div>
  );
}
