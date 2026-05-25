"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, Section, Grid } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

const ROW_STYLE: React.CSSProperties = {
  background: "#1a1917",
  border: "1px solid #2a2926",
  borderRadius: 12,
  padding: 20,
  marginBottom: 12,
};

export default function Step4({ data, onChange }: Props) {
  const items = data.upsellIncludedItems ?? [];

  function updateItem(index: number, field: "title" | "description", value: string) {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange({ upsellIncludedItems: next });
  }

  function addItem() {
    onChange({ upsellIncludedItems: [...items, { title: "", description: "" }] });
  }

  function removeItem(i: number) {
    onChange({ upsellIncludedItems: items.filter((_, idx) => idx !== i) });
  }

  return (
    <div>
      {/* ── Offer identity ── */}
      <Section title="Offer identity">
        <Field
          label="Offer / product name"
          required
          hint="The name of the one-time product — e.g. 'The Integration Bundle'. Used in the headline, CTA, and decline link."
        >
          <TextInput
            value={data.upsellOfferName ?? ""}
            onChange={(v) => onChange({ upsellOfferName: v })}
            placeholder="e.g. The Integration Bundle"
          />
        </Field>
        <Field
          label="Offer headline"
          hint="The main h1 on the upsell page — should name the product and the promise"
        >
          <TextInput
            value={data.upsellHeadline ?? ""}
            onChange={(v) => onChange({ upsellHeadline: v })}
            placeholder="e.g. Take the work deeper with The Integration Bundle."
          />
        </Field>
        <Field
          label="Offer description"
          hint="One or two sentences explaining the product in the context of the live event — what it adds, what it enables"
        >
          <Textarea
            value={data.upsellDescription ?? ""}
            onChange={(v) => onChange({ upsellDescription: v })}
            rows={3}
            placeholder="e.g. Threshold gives you the four-hour experience. The Integration Bundle gives you the structure to keep it alive. Three tools, used together, for the six weeks following the session."
          />
        </Field>
      </Section>

      {/* ── What's included ── */}
      <Section title="What's included">
        <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
          Add each item in the bundle. Each one gets a title and a short description — the AI will use these verbatim.
        </p>
        {items.map((item, i) => (
          <div key={i} style={ROW_STYLE}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#D4A878" }}>Item {i + 1}</span>
              <button
                onClick={() => removeItem(i)}
                style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}
              >
                ×
              </button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>Title</label>
              <TextInput
                value={item.title}
                onChange={(v) => updateItem(i, "title", v)}
                placeholder="e.g. Six-week inquiry journal"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>Description</label>
              <Textarea
                value={item.description}
                onChange={(v) => updateItem(i, "description", v)}
                rows={2}
                placeholder="e.g. A structured PDF workbook with three prompts per week, each one designed to deepen a specific protocol from the session."
              />
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          style={{
            width: "100%", padding: "12px", background: "none",
            border: "2px dashed #2a2926", borderRadius: 10,
            color: "#555", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          + Add included item
        </button>
      </Section>

      {/* ── Testimonial ── */}
      <Section title="Upsell testimonial">
        <Field
          label="Quote"
          hint="A testimonial specifically about this product or the post-event experience — appears in the offer quote block"
        >
          <Textarea
            value={data.upsellQuote ?? ""}
            onChange={(v) => onChange({ upsellQuote: v })}
            rows={3}
            placeholder="e.g. The journal kept me in the work long after the session ended. Week four was when something I hadn't even named in October finally surfaced."
          />
        </Field>
        <Field
          label="Attribution"
          hint="Name, location, and context — e.g. 'Adaeze O. · Lagos · Threshold, March 2026'"
        >
          <TextInput
            value={data.upsellQuoteAttribution ?? ""}
            onChange={(v) => onChange({ upsellQuoteAttribution: v })}
            placeholder="e.g. Adaeze O. · Lagos · Threshold, March 2026"
          />
        </Field>
      </Section>

      {/* ── Pricing ── */}
      <Section title="Pricing">
        <Grid>
          <Field
            label="Regular value ($)"
            hint="The crossed-out 'was' price — shows what you'd normally charge"
          >
            <TextInput
              type="number"
              value={String(data.upsellRegularValue ?? "")}
              onChange={(v) => onChange({ upsellRegularValue: v ? Number(v) : undefined })}
              placeholder="e.g. 297"
            />
          </Field>
          <Field
            label="Offer price ($)"
            hint="The one-time discounted price shown on this page — typically 60–70% off regular value"
          >
            <TextInput
              type="number"
              value={String(data.upsellOfferPrice ?? "")}
              onChange={(v) => onChange({ upsellOfferPrice: v ? Number(v) : undefined })}
              placeholder="e.g. 97"
            />
          </Field>
        </Grid>
        <Field
          label="Price note"
          hint="The urgency/scarcity copy below the price — this appears in smaller text under the CTA"
        >
          <Textarea
            value={data.upsellPriceNote ?? ""}
            onChange={(v) => onChange({ upsellPriceNote: v })}
            rows={2}
            placeholder="e.g. This offer is available once, right now. It will not be available after you leave this page. Added to your existing payment method — no second checkout."
          />
        </Field>
      </Section>

      {/* ── CTAs ── */}
      <Section title="Call to action">
        <Field
          label="Yes button text"
          hint="The primary accept button — should name the product explicitly"
        >
          <TextInput
            value={data.upsellCtaText ?? ""}
            onChange={(v) => onChange({ upsellCtaText: v })}
            placeholder={`Yes — add ${data.upsellOfferName || "the offer"} to my order`}
          />
        </Field>
        <Field
          label="Yes button sub-text"
          hint="Small reassurance line directly below the accept button"
        >
          <TextInput
            value={data.upsellCtaSubText ?? ""}
            onChange={(v) => onChange({ upsellCtaSubText: v })}
            placeholder="e.g. Charged to the same card. No extra form to fill."
          />
        </Field>
        <Field
          label="Decline link text"
          hint="The opt-out link below the CTA — should acknowledge what they're passing on"
        >
          <TextInput
            value={data.upsellDeclineText ?? ""}
            onChange={(v) => onChange({ upsellDeclineText: v })}
            placeholder={`No thanks — I'll pass on ${data.upsellOfferName || "this offer"} and go to my confirmation.`}
          />
        </Field>
      </Section>
    </div>
  );
}
