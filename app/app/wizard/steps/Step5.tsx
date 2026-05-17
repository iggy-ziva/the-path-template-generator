"use client";
import { useState } from "react";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, Section } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step5({ data, onChange }: Props) {
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
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>Add each module or week. The AI will use these titles and descriptions to write the full curriculum section.</p>
        {weeks.map((week, i) => (
          <div key={i} style={{ background: "#1a1917", border: "1px solid #2a2926", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#D4A878" }}>Module {i + 1}</span>
              <button onClick={() => removeWeek(i)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "4px" }}>Label</label>
                <input value={week.week} onChange={(e) => updateWeek(i, "week", e.target.value)} placeholder="Week 1" style={{ width: "100%", padding: "10px", background: "#0f0e0c", border: "1px solid #2a2926", borderRadius: "8px", color: "#f5f1ea", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "4px" }}>Title</label>
                <input value={week.title} onChange={(e) => updateWeek(i, "title", e.target.value)} placeholder="Module title" style={{ width: "100%", padding: "10px", background: "#0f0e0c", border: "1px solid #2a2926", borderRadius: "8px", color: "#f5f1ea", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "4px" }}>Description / bullet points</label>
              <textarea value={week.description} onChange={(e) => updateWeek(i, "description", e.target.value)} placeholder="What will participants learn or experience in this week?" rows={2} style={{ width: "100%", padding: "10px", background: "#0f0e0c", border: "1px solid #2a2926", borderRadius: "8px", color: "#f5f1ea", fontSize: "13px", outline: "none", resize: "vertical", lineHeight: 1.5, boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </div>
        ))}
        <button onClick={addWeek} style={{ padding: "12px 20px", background: "none", border: "1px dashed #2a2926", borderRadius: "10px", color: "#D4A878", cursor: "pointer", fontSize: "14px", fontWeight: 600, width: "100%" }}>
          + Add module / week
        </button>
      </Section>

      <Section title="Bonuses (optional)">
        {bonuses.map((bonus, i) => (
          <div key={i} style={{ background: "#1a1917", border: "1px solid #2a2926", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#D4A878" }}>Bonus {i + 1}</span>
              <button onClick={() => onChange({ bonuses: bonuses.filter((_, idx) => idx !== i) })} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              <input value={bonus.title} onChange={(e) => updateBonus(i, "title", e.target.value)} placeholder="Bonus title" style={{ padding: "10px", background: "#0f0e0c", border: "1px solid #2a2926", borderRadius: "8px", color: "#f5f1ea", fontSize: "13px", outline: "none" }} />
              <input value={bonus.description} onChange={(e) => updateBonus(i, "description", e.target.value)} placeholder="What it includes and why it's valuable" style={{ padding: "10px", background: "#0f0e0c", border: "1px solid #2a2926", borderRadius: "8px", color: "#f5f1ea", fontSize: "13px", outline: "none" }} />
              <input type="number" value={bonus.value} onChange={(e) => updateBonus(i, "value", e.target.value)} placeholder="Value in $ (e.g. 297)" style={{ padding: "10px", background: "#0f0e0c", border: "1px solid #2a2926", borderRadius: "8px", color: "#f5f1ea", fontSize: "13px", outline: "none", width: "160px" }} />
            </div>
          </div>
        ))}
        <button onClick={addBonus} style={{ padding: "12px 20px", background: "none", border: "1px dashed #2a2926", borderRadius: "10px", color: "#D4A878", cursor: "pointer", fontSize: "14px", fontWeight: 600, width: "100%" }}>
          + Add bonus
        </button>
      </Section>
    </div>
  );
}
