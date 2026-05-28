"use client";
import type { WizardData } from "@/lib/wizard-types";
import { Field, TextInput, Textarea, Section, Grid } from "../WizardField";

interface Props { data: WizardData; onChange: (patch: Partial<WizardData>) => void; onNext: () => void; }

const Z = {
  pink: "#FF007E", coral: "#FA2A45", charcoal: "#2E2E2E", muted: "#8A7A6A",
  faint: "#C8B8A4", creamMid: "#FCF8EF", creamDeep: "#F5EEE0", white: "#FFFFFF",
  font: 'var(--font-barlow), -apple-system, sans-serif',
};

const ROW_STYLE: React.CSSProperties = {
  background: Z.creamMid,
  border: `1.5px solid ${Z.creamDeep}`,
  borderRadius: 12,
  padding: 20,
  marginBottom: 12,
};

export default function Step4({ data, onChange }: Props) {
  const items = data.upsellIncludedItems ?? [];

  function getQuotes(): { quote: string; attribution: string }[] {
    if (data.upsellQuotes && data.upsellQuotes.length > 0) return data.upsellQuotes;
    if (data.upsellQuote) return [{ quote: data.upsellQuote, attribution: data.upsellQuoteAttribution ?? "" }];
    return [];
  }

  const quotes = getQuotes();

  function updateQuote(index: number, field: "quote" | "attribution", value: string) {
    const next = [...getQuotes()];
    next[index] = { ...next[index], [field]: value };
    onChange({ upsellQuotes: next });
  }

  function addQuote() {
    onChange({ upsellQuotes: [...getQuotes(), { quote: "", attribution: "" }] });
  }

  function removeQuote(i: number) {
    onChange({ upsellQuotes: getQuotes().filter((_, idx) => idx !== i) });
  }

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
          label="Product name"
          required
          hint="The product title — e.g. 'Adios Anxiety™'. This is the main headline on the upsell page."
        >
          <TextInput
            value={data.upsellOfferName ?? ""}
            onChange={(v) => onChange({ upsellOfferName: v })}
            placeholder="e.g. The Integration Bundle"
          />
        </Field>
        <Field
          label="Tagline / promise"
          hint="One short line beneath the product name — the emotional hook, not the full sales pitch. Under ~15 words."
        >
          <TextInput
            value={data.upsellHeadline ?? ""}
            onChange={(v) => onChange({ upsellHeadline: v })}
            placeholder="e.g. Take the work deeper — and keep it alive after the session."
          />
        </Field>
        <Field
          label="Offer description (source material)"
          hint="Raw context for the AI — 1–2 sentences ideal. Long pasted copy will be distilled at generation; bullets belong in 'What's included' below."
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
        <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, marginBottom: 20 }}>
          Add each item in the bundle. Each one gets a title and a short description — the AI will use these verbatim.
        </p>
        {items.map((item, i) => (
          <div key={i} style={ROW_STYLE}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: Z.pink }}>Item {i + 1}</span>
              <button
                onClick={() => removeItem(i)}
                style={{ background: "none", border: "none", color: Z.faint, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
                title="Remove item"
              >
                ×
              </button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: Z.charcoal, marginBottom: 6 }}>Title</label>
              <TextInput
                value={item.title}
                onChange={(v) => updateItem(i, "title", v)}
                placeholder="e.g. Six-week inquiry journal"
              />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: Z.charcoal, marginBottom: 6 }}>Description</label>
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
            border: `1.5px dashed ${Z.faint}`, borderRadius: 10,
            color: Z.pink, fontFamily: Z.font, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          + Add included item
        </button>
      </Section>

      {/* ── Testimonials ── */}
      <Section title="Upsell testimonials">
        <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, marginBottom: 20 }}>
          Add one or more testimonials specifically about this product or the post-event experience — each appears in the offer quote block on the upsell page.
        </p>
        {quotes.map((q, i) => (
          <div key={i} style={ROW_STYLE}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: Z.pink }}>Quote {i + 1}</span>
              <button
                type="button"
                onClick={() => removeQuote(i)}
                style={{ background: "none", border: "none", color: Z.faint, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
                title="Remove quote"
              >
                ×
              </button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: Z.charcoal, marginBottom: 6 }}>Quote</label>
              <Textarea
                value={q.quote}
                onChange={(v) => updateQuote(i, "quote", v)}
                rows={3}
                placeholder="e.g. The journal kept me in the work long after the session ended. Week four was when something I hadn't even named in October finally surfaced."
              />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: Z.font, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: Z.charcoal, marginBottom: 6 }}>Attribution</label>
              <TextInput
                value={q.attribution}
                onChange={(v) => updateQuote(i, "attribution", v)}
                placeholder="e.g. Adaeze O. · Lagos · Threshold, March 2026"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addQuote}
          style={{
            width: "100%", padding: "12px", background: "none",
            border: `1.5px dashed ${Z.faint}`, borderRadius: 10,
            color: Z.pink, fontFamily: Z.font, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          + Add quote
        </button>
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
