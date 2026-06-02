"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, Grid, Section, DatePicker, SessionScheduleBuilder, PaymentPlanBuilder } from "../WizardField";

const Z = {
  charcoal: "#2E2E2E", muted: "#8A7A6A", faint: "#C8B8A4",
  creamDeep: "#F5EEE0", font: 'var(--font-barlow), -apple-system, sans-serif',
};

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step5({ data, onChange }: Props) {
  const skipped = data.skippedSections?.programme ?? false;

  function toggleSkip() {
    onChange({ skippedSections: { ...data.skippedSections, programme: !skipped } });
  }

  return (
    <div>
      {/* ── Skip banner ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, background: skipped ? "#FFF8E6" : Z.creamDeep,
        border: `1.5px solid ${skipped ? "#F5C842" : Z.faint}`,
        borderRadius: 12, padding: "14px 20px", marginBottom: 28,
      }}>
        <div>
          <div style={{ fontFamily: Z.font, fontSize: 13, fontWeight: 700, color: Z.charcoal }}>
            {skipped ? "Programme page skipped — the AI will generate a placeholder page." : "Don't have a programme ready yet?"}
          </div>
          <div style={{ fontFamily: Z.font, fontSize: 12, color: Z.muted, marginTop: 3 }}>
            {skipped
              ? "You can come back and fill this in before regenerating."
              : "Skip this section and the AI will use sensible defaults. You can fill it in later and regenerate."}
          </div>
        </div>
        <button
          type="button"
          onClick={toggleSkip}
          style={{
            flexShrink: 0, fontFamily: Z.font, fontSize: 12, fontWeight: 700,
            padding: "8px 16px", borderRadius: 8, cursor: "pointer",
            background: skipped ? Z.charcoal : "none",
            color: skipped ? "#fff" : Z.muted,
            border: `1.5px solid ${skipped ? Z.charcoal : Z.faint}`,
            whiteSpace: "nowrap" as const,
          }}
        >
          {skipped ? "Fill in programme details" : "Skip for now"}
        </button>
      </div>

      {!skipped && (
      <div>
      <Section title="Programme identity">
        <Field label="Programme name" required>
          <TextInput value={data.programName ?? ""} onChange={(v) => onChange({ programName: v })} placeholder="e.g. The Somatic Freedom Collective" />
        </Field>
        <Field label="Programme tagline" hint="One sentence capturing the transformation — used in hero sections and offer bars">
          <TextInput value={data.programTagline ?? ""} onChange={(v) => onChange({ programTagline: v })} placeholder="e.g. An eight-week live journey to regulate your nervous system" />
        </Field>
      </Section>

      <Section title="Schedule">
        <Grid>
          <Field label="Programme duration" required>
            <TextInput value={data.programDuration ?? ""} onChange={(v) => onChange({ programDuration: v })} placeholder="e.g. 8 weeks" />
          </Field>
          <Field label="Start date">
            <DatePicker value={data.programStartDate ?? ""} onChange={(v) => onChange({ programStartDate: v })} />
          </Field>
        </Grid>
        <Field label="Session schedule / cadence">
          <SessionScheduleBuilder
            value={data.programSchedule ?? ""}
            onChange={(v) => onChange({ programSchedule: v })}
            timezone={data.eventTimezone}
          />
        </Field>
      </Section>

      <Section title="Pricing">
        <Field label="Full investment ($)" required hint="The one-payment price">
          <TextInput type="number" value={String(data.programPriceFull ?? "")} onChange={(v) => onChange({ programPriceFull: Number(v) })} placeholder="1497" />
        </Field>
        <Field label="Payment plans (optional)" hint="Add as many instalment options as you offer">
          <PaymentPlanBuilder
            plans={data.programPaymentPlans ?? []}
            onChange={(plans) => onChange({ programPaymentPlans: plans })}
          />
        </Field>
      </Section>

      <Section title="Guarantee">
        <Field label="Money-back guarantee" hint="What is your guarantee? This appears throughout the programme checkout and LP.">
          <Textarea value={data.programGuarantee ?? "Complete the first two weeks and do the daily practices. If you don't feel a genuine difference, receive a full refund — no questions asked."} onChange={(v) => onChange({ programGuarantee: v })} placeholder="Complete the first two weeks and do the daily practices. If you don't feel a genuine difference, receive a full refund — no questions asked." rows={3} />
        </Field>
      </Section>

      <Section title="Delivery & access">
        <Field
          label="Member portal / course login URL (optional)"
          hint="Where students access the programme after enrolling — Kajabi, Teachable, Thinkific, or a custom portal URL. Leave blank if not yet set up; the thank-you page will tell students to check their email."
        >
          <TextInput
            type="url"
            value={data.programPortalUrl ?? ""}
            onChange={(v) => onChange({ programPortalUrl: v })}
            placeholder="https://members.yourdomain.com"
          />
        </Field>
      </Section>
      </div>
      )}

    </div>
  );
}
