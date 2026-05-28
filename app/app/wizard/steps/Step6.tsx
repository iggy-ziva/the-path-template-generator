"use client";
import { useState } from "react";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, Section } from "../WizardField";

const Z = {
  pink: "#FF007E", coral: "#FA2A45", charcoal: "#2E2E2E", muted: "#8A7A6A",
  faint: "#C8B8A4", creamMid: "#FCF8EF", creamDeep: "#F5EEE0", white: "#FFFFFF",
  font: 'var(--font-barlow), -apple-system, sans-serif',
};

const CARD: React.CSSProperties = {
  background: Z.creamMid,
  border: `1.5px solid ${Z.creamDeep}`,
  borderRadius: 12,
  padding: 20,
  marginBottom: 12,
};

const MINI_LABEL: React.CSSProperties = {
  display: "block",
  fontFamily: Z.font,
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: Z.charcoal,
  marginBottom: 6,
};

const INLINE_INPUT: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: Z.white,
  border: `1.5px solid ${Z.creamDeep}`,
  borderRadius: 8,
  color: Z.charcoal,
  fontSize: 13,
  fontFamily: Z.font,
  outline: "none",
  boxSizing: "border-box",
};

const ADD_BTN: React.CSSProperties = {
  padding: "12px 20px",
  background: "none",
  border: `1.5px dashed ${Z.faint}`,
  borderRadius: 10,
  color: Z.pink,
  fontFamily: Z.font,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  width: "100%",
};

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step6({ data, onChange }: Props) {
  const weeks = data.curriculumWeeks ?? [];
  const bonuses = data.bonuses ?? [];

  function updateWeek(index: number, field: "week" | "title" | "description", value: string) {
    const next = [...weeks];
    next[index] = { ...next[index], [field]: value };
    onChange({ curriculumWeeks: next });
  }

  function addWeek() {
    onChange({ curriculumWeeks: [...weeks, { week: `Week ${weeks.length + 1}`, title: "", description: "" }] });
  }

  function removeWeek(i: number) {
    onChange({ curriculumWeeks: weeks.filter((_, idx) => idx !== i) });
  }

  function updateBonus(index: number, field: "title" | "description" | "value", value: string) {
    const next = [...bonuses];
    next[index] = { ...next[index], [field]: value };
    onChange({ bonuses: next });
  }

  function addBonus() {
    onChange({ bonuses: [...bonuses, { title: "", description: "", value: "" }] });
  }

  return (
    <div>
      <Section title="Audience and transformation">
        <Field label="Who is this for?" required hint="Describe your ideal participant in vivid detail — the AI will use this for audience callout sections">
          <Textarea value={data.audienceDescription ?? ""} onChange={(v) => onChange({ audienceDescription: v })} rows={4} placeholder="e.g. High-sensitivity people who have done years of mindset work and still feel stuck in their bodies..." />
        </Field>
        <Field label="Transformation promise" required hint="What specific shift does your programme create? This becomes the core promise throughout the funnel.">
          <Textarea value={data.transformationPromise ?? ""} onChange={(v) => onChange({ transformationPromise: v })} rows={4} placeholder="e.g. From chronic tension and disconnection from the body to genuine ease, regulation, and somatic presence..." />
        </Field>
        <Field label="What's included (summary)" hint="A brief summary of everything in the programme — for sections that list inclusions">
          <Textarea value={data.whatIsIncluded ?? ""} onChange={(v) => onChange({ whatIsIncluded: v })} rows={4} placeholder="e.g. 8 live weekly sessions · Bi-weekly integration calls · Practice library · Private community · Lifetime recordings..." />
        </Field>
      </Section>

      <Section title="Curriculum — week by week">
        <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, marginBottom: 20 }}>Add each module or week. The AI will use these titles and descriptions to write the full curriculum section.</p>
        {weeks.map((week, i) => (
          <div key={i} style={CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: Z.pink }}>Module {i + 1}</span>
              <button onClick={() => removeWeek(i)} style={{ background: "none", border: "none", color: Z.faint, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }} title="Remove module">×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={MINI_LABEL}>Label</label>
                <input value={week.week} onChange={(e) => updateWeek(i, "week", e.target.value)} placeholder="Week 1" style={INLINE_INPUT} />
              </div>
              <div>
                <label style={MINI_LABEL}>Title</label>
                <input value={week.title} onChange={(e) => updateWeek(i, "title", e.target.value)} placeholder="Module title" style={INLINE_INPUT} />
              </div>
            </div>
            <div>
              <label style={MINI_LABEL}>Description / bullet points</label>
              <textarea value={week.description} onChange={(e) => updateWeek(i, "description", e.target.value)} placeholder="What will participants learn or experience in this week?" rows={2} style={{ ...INLINE_INPUT, resize: "vertical", lineHeight: 1.5 }} />
            </div>
          </div>
        ))}
        <button onClick={addWeek} style={ADD_BTN}>+ Add module / week</button>
      </Section>

      <Section title="Bonuses (optional)">
        {bonuses.map((bonus, i) => (
          <div key={i} style={CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: Z.pink }}>Bonus {i + 1}</span>
              <button onClick={() => onChange({ bonuses: bonuses.filter((_, idx) => idx !== i) })} style={{ background: "none", border: "none", color: Z.faint, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }} title="Remove bonus">×</button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <label style={MINI_LABEL}>Title</label>
                <input value={bonus.title} onChange={(e) => updateBonus(i, "title", e.target.value)} placeholder="Bonus title" style={INLINE_INPUT} />
              </div>
              <div>
                <label style={MINI_LABEL}>Description</label>
                <input value={bonus.description} onChange={(e) => updateBonus(i, "description", e.target.value)} placeholder="What it includes and why it's valuable" style={INLINE_INPUT} />
              </div>
              <div>
                <label style={MINI_LABEL}>Value ($)</label>
                <input type="number" value={bonus.value} onChange={(e) => updateBonus(i, "value", e.target.value)} placeholder="e.g. 297" style={{ ...INLINE_INPUT, width: 160 }} />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addBonus} style={ADD_BTN}>+ Add bonus</button>
      </Section>
    </div>
  );
}
