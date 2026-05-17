"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Section, UrlListInput } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

export default function Step7({ data, onChange }: Props) {
  const testimonials = data.testimonials ?? [];

  function updateTestimonial(
    index: number,
    field: "quote" | "name" | "location" | "context",
    value: string
  ) {
    const next = [...testimonials];
    next[index] = { ...next[index], [field]: value };
    onChange({ testimonials: next });
  }

  function addTestimonial() {
    onChange({ testimonials: [...testimonials, { quote: "", name: "", location: "", context: "" }] });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    background: "#0f0e0c",
    border: "1px solid #2a2926",
    borderRadius: "8px",
    color: "#f5f1ea",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "32px", lineHeight: 1.6 }}>
        Add at least 3 testimonials for the best results. These appear in the landing page, programme LP, and replay page. The AI will use the language and specific details to make testimonial sections feel authentic.
      </p>

      <Section title="Text testimonials">
        {testimonials.map((t, i) => (
          <div key={i} style={{ background: "#1a1917", border: "1px solid #2a2926", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#D4A878" }}>Testimonial {i + 1}</span>
              <button onClick={() => onChange({ testimonials: testimonials.filter((_, idx) => idx !== i) })} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              <textarea value={t.quote} onChange={(e) => updateTestimonial(i, "quote", e.target.value)} placeholder="The testimonial quote — the more specific and vivid, the better" rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input value={t.name} onChange={(e) => updateTestimonial(i, "name", e.target.value)} placeholder="First name & last initial (e.g. Sarah T.)" style={inputStyle} />
                <input value={t.location} onChange={(e) => updateTestimonial(i, "location", e.target.value)} placeholder="City, Country" style={inputStyle} />
              </div>
              <input value={t.context ?? ""} onChange={(e) => updateTestimonial(i, "context", e.target.value)} placeholder="Context (optional): e.g. 'Cohort 3, Soul Contract Mastery'" style={inputStyle} />
            </div>
          </div>
        ))}
        <button onClick={addTestimonial} style={{ padding: "12px 20px", background: "none", border: "1px dashed #2a2926", borderRadius: "10px", color: "#D4A878", cursor: "pointer", fontSize: "14px", fontWeight: 600, width: "100%" }}>
          + Add testimonial
        </button>
      </Section>

      <Section title="Video testimonials (optional)">
        <UrlListInput
          label="Video testimonial URLs"
          hint="Links to YouTube, Vimeo, or Loom — the AI will reference these in the replay page and programme LP video sections"
          value={data.videoTestimonialUrls ?? []}
          onChange={(urls) => onChange({ videoTestimonialUrls: urls })}
          placeholder="https://youtube.com/watch?v=..."
        />
      </Section>

      <Section title="Press and media mentions (optional)">
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>List any publications, podcasts, or media outlets that have featured you. These appear in the 'As seen in' logo wall section.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
          {(data.pressLogos ?? []).map((logo) => (
            <div key={logo} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#1a1917", borderRadius: "8px", padding: "6px 12px", fontSize: "13px" }}>
              <span>{logo}</span>
              <button onClick={() => onChange({ pressLogos: (data.pressLogos ?? []).filter((l) => l !== logo) })} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>×</button>
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a publication name and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = (e.target as HTMLInputElement).value.trim();
              if (val) {
                onChange({ pressLogos: [...(data.pressLogos ?? []), val] });
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
          style={{ width: "100%", padding: "12px 14px", background: "#1a1917", border: "1px solid #2a2926", borderRadius: "10px", color: "#f5f1ea", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
        />
      </Section>
    </div>
  );
}
