"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, Grid, Section, DatePicker, SessionScheduleBuilder, PaymentPlanBuilder } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step5({ data, onChange }: Props) {
  return (
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
  );
}
