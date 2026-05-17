"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, Grid, Section } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step4({ data, onChange }: Props) {
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
            <TextInput value={data.programStartDate ?? ""} onChange={(v) => onChange({ programStartDate: v })} placeholder="e.g. 7 July 2025" />
          </Field>
        </Grid>
        <Field label="Session schedule / cadence" hint="When do live sessions take place each week?">
          <TextInput value={data.programSchedule ?? ""} onChange={(v) => onChange({ programSchedule: v })} placeholder="e.g. Sundays 10am–1pm PT · recordings within 24 hours" />
        </Field>
      </Section>

      <Section title="Pricing">
        <Grid>
          <Field label="Full investment ($)" required hint="The one-payment price">
            <TextInput type="number" value={String(data.programPriceFull ?? "")} onChange={(v) => onChange({ programPriceFull: Number(v) })} placeholder="1497" />
          </Field>
          <Field label="Payment plan 1 (optional)" hint="e.g. '3 × $549'">
            <TextInput value={data.programPricePlan1 ?? ""} onChange={(v) => onChange({ programPricePlan1: v })} placeholder="3 × $549" />
          </Field>
        </Grid>
        <Field label="Payment plan 2 (optional)">
          <TextInput value={data.programPricePlan2 ?? ""} onChange={(v) => onChange({ programPricePlan2: v })} placeholder="e.g. 12 × $147" />
        </Field>
      </Section>

      <Section title="Guarantee">
        <Field label="Money-back guarantee" hint="What is your guarantee? This appears throughout the programme checkout and LP.">
          <Textarea value={data.programGuarantee ?? ""} onChange={(v) => onChange({ programGuarantee: v })} placeholder="e.g. Complete the first two weeks and do the daily practices. If you don't feel a genuine difference, receive a full refund — no questions asked." rows={3} />
        </Field>
      </Section>
    </div>
  );
}
