"use client";
import type { EventSession, WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, Select, Grid, Section, DatePicker, TimePicker } from "../WizardField";
import { TIMEZONE_OPTIONS, PLATFORM_OPTIONS } from "../wizard-constants";
import { getEventSessions, sessionsPatch } from "@/lib/event-sessions";

const Z = {
  pink: "#FF007E", coral: "#FA2A45", charcoal: "#2E2E2E", muted: "#8A7A6A",
  faint: "#C8B8A4", creamMid: "#FCF8EF", creamDeep: "#F5EEE0", white: "#FFFFFF",
  font: 'var(--font-barlow), -apple-system, sans-serif',
};

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step3({ data, onChange }: Props) {
  // At least one editable row; falls back to the legacy single-date fields.
  const existing = getEventSessions(data);
  const sessions: EventSession[] = existing.length ? existing : [{}];

  const commit = (next: EventSession[]) => onChange(sessionsPatch(next.length ? next : [{}]));
  const updateSession = (i: number, patch: Partial<EventSession>) =>
    commit(sessions.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const addSession = () => commit([...sessions, {}]);
  const removeSession = (i: number) => commit(sessions.filter((_, idx) => idx !== i));

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
        <p style={{ fontSize: 13, color: Z.muted, marginBottom: 16, marginTop: -8, lineHeight: 1.6, fontFamily: Z.font }}>
          Add one session, or several if your event runs across multiple dates. Each session has its own
          time zone and duration. The first session is treated as the primary date.
        </p>

        {sessions.map((s, i) => (
          <div
            key={i}
            style={{ background: Z.creamMid, border: `1.5px solid ${Z.creamDeep}`, borderRadius: 12, padding: 18, marginBottom: 16 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.pink }}>
                Session {i + 1}{i === 0 ? " · primary" : ""}
              </span>
              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSession(i)}
                  style={{ background: "none", border: "none", color: Z.muted, fontFamily: Z.font, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
                >
                  Remove
                </button>
              )}
            </div>
            <Grid>
              <Field label="Event date" required={i === 0}>
                <DatePicker value={s.date ?? ""} onChange={(v) => updateSession(i, { date: v })} />
              </Field>
              <Field label="Start time" required={i === 0}>
                <TimePicker value={s.time ?? ""} onChange={(v) => updateSession(i, { time: v })} />
              </Field>
            </Grid>
            <Grid>
              <Field label="Time zone" required={i === 0}>
                <Select value={s.timezone ?? ""} onChange={(v) => updateSession(i, { timezone: v })} options={TIMEZONE_OPTIONS} />
              </Field>
              <Field label="Duration" required={i === 0}>
                <TextInput value={s.duration ?? ""} onChange={(v) => updateSession(i, { duration: v })} placeholder="e.g. 3 hours" />
              </Field>
            </Grid>
          </div>
        ))}

        <button
          type="button"
          onClick={addSession}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 18px", borderRadius: 10,
            background: "transparent", border: `1.5px dashed ${Z.faint}`,
            color: Z.pink, fontFamily: Z.font, fontSize: 13, fontWeight: 700, cursor: "pointer",
            marginBottom: 24,
          }}
        >
          + Add another session
        </button>

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
