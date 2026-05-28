"use client";

import { useState, useEffect, useRef } from "react";

const Z = {
  cream:    "#FCFAF6",
  creamMid: "#FCF8EF",
  creamDeep:"#F5EEE0",
  charcoal: "#2E2E2E",
  muted:    "#8A7A6A",
  faint:    "#C8B8A4",
  pink:     "#FF007E",
  coral:    "#FA2A45",
  white:    "#FFFFFF",
  font:     'var(--font-barlow), -apple-system, sans-serif',
};

const fieldBase: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  background: Z.white,
  border: "1.5px solid #C8B8A4",
  borderRadius: 10,
  color: Z.charcoal,
  fontSize: 14,
  fontFamily: Z.font,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label
        style={{
          display: "block",
          fontFamily: Z.font,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: Z.charcoal,
          marginBottom: 8,
        }}
      >
        {label}{" "}
        {required && <span style={{ color: Z.pink }}>*</span>}
      </label>
      {children}
      {hint && (
        <p style={{ margin: "6px 0 0", fontFamily: Z.font, fontSize: 12, color: Z.faint, lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={fieldBase}
      onFocus={(e) => { const el = e.target as HTMLInputElement; el.style.borderColor = Z.pink; el.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { const el = e.target as HTMLInputElement; el.style.borderColor = "#C8B8A4"; el.style.boxShadow = "none"; }}
    />
  );
}

// ── Date helpers ────────────────────────────────────────────────────────────
function toISO(display: string): string {
  if (!display) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(display)) return display;
  const d = new Date(display);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="date"
      value={toISO(value)}
      onChange={(e) => onChange(formatDate(e.target.value))}
      style={{ ...fieldBase, colorScheme: "light" }}
      onFocus={(e) => { const el = e.target as HTMLInputElement; el.style.borderColor = Z.pink; el.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { const el = e.target as HTMLInputElement; el.style.borderColor = "#C8B8A4"; el.style.boxShadow = "none"; }}
    />
  );
}

// ── Time helpers ─────────────────────────────────────────────────────────────
function to24h(timeStr: string): string {
  if (!timeStr) return "";
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === "AM" && h === 12) h = 0;
  if (ampm === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${m}`;
}

function to12h(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr);
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${ampm}`;
}

export function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      value={to24h(value)}
      onChange={(e) => onChange(to12h(e.target.value))}
      style={{ ...fieldBase, colorScheme: "light" }}
      onFocus={(e) => { const el = e.target as HTMLInputElement; el.style.borderColor = Z.pink; el.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { const el = e.target as HTMLInputElement; el.style.borderColor = "#C8B8A4"; el.style.boxShadow = "none"; }}
    />
  );
}

// ── SessionScheduleBuilder ───────────────────────────────────────────────────

type ScheduleFreq = "weekly" | "twice-weekly" | "bi-weekly" | "monthly" | "intensive" | "custom";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DURATIONS = ["30 min", "1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours", "4 hours", "Half day", "Full day"];
const RECORDING_OPTS = ["within 24 hours", "within 48 hours", "within 72 hours", "within 1 week", "no recording provided"];

interface Slot { day: string; startTime: string; duration: string; }
const emptySlot = (): Slot => ({ day: "", startTime: "", duration: "" });

function buildString(freq: ScheduleFreq, slots: Slot[], tz: string, rec: string, custom: string): string {
  if (freq === "custom") return custom;
  const slotStr = (s: Slot) => [
    s.day ? `${s.day}s` : "",
    s.startTime ? `at ${s.startTime}` : "",
    s.duration ? `(${s.duration})` : "",
  ].filter(Boolean).join(" ");
  const sessionPart = slots.map(slotStr).filter(Boolean).join(" & ");
  const label: Record<ScheduleFreq, string> = {
    "weekly": "Weekly", "twice-weekly": "Twice weekly", "bi-weekly": "Bi-weekly (every 2 weeks)",
    "monthly": "Monthly", "intensive": "Intensive / block format", "custom": "",
  };
  const recPart = rec && rec !== "no recording provided" ? ` · Recordings ${rec}` : "";
  const tzPart = tz ? ` ${tz}` : "";
  return `${label[freq]}${sessionPart ? ` · ${sessionPart}` : ""}${tzPart}${recPart}`;
}

export function SessionScheduleBuilder({
  value,
  onChange,
  timezone,
}: {
  value: string;
  onChange: (v: string) => void;
  timezone?: string;
}) {
  const [freq, setFreq] = useState<ScheduleFreq>("weekly");
  const [slots, setSlots] = useState<Slot[]>([emptySlot()]);
  const [rec, setRec] = useState("within 24 hours");
  const [custom, setCustom] = useState("");
  const initialised = useRef(false);

  // Seed custom text if an existing plain-text value was already saved
  useEffect(() => {
    if (!initialised.current && value) {
      setFreq("custom");
      setCustom(value);
      initialised.current = true;
    } else {
      initialised.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialised.current) return;
    onChange(buildString(freq, slots, timezone ?? "", rec, custom));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freq, slots, rec, custom, timezone]);

  function setSlot(i: number, patch: Partial<Slot>) {
    setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  const freqOptions: { id: ScheduleFreq; label: string }[] = [
    { id: "weekly",        label: "Weekly" },
    { id: "twice-weekly",  label: "Twice weekly" },
    { id: "bi-weekly",     label: "Bi-weekly" },
    { id: "monthly",       label: "Monthly" },
    { id: "intensive",     label: "Intensive / block" },
    { id: "custom",        label: "Custom text" },
  ];

  function handleFreqChange(f: ScheduleFreq) {
    setFreq(f);
    if (f === "twice-weekly") setSlots([emptySlot(), emptySlot()]);
    else if (f === "intensive") setSlots([emptySlot(), emptySlot(), emptySlot()]);
    else setSlots([emptySlot()]);
  }

  const pill = (id: ScheduleFreq, label: string) => {
    const active = freq === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => handleFreqChange(id)}
        style={{
          padding: "7px 14px",
          borderRadius: 100,
          border: active ? "none" : `1.5px solid ${Z.creamDeep}`,
          background: active ? `linear-gradient(135deg, ${Z.pink}, ${Z.coral})` : Z.white,
          color: active ? Z.white : Z.charcoal,
          fontFamily: Z.font,
          fontSize: 12,
          fontWeight: active ? 700 : 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s",
          boxShadow: active ? "0 2px 8px rgba(255,0,126,0.2)" : "none",
        }}
      >
        {label}
      </button>
    );
  };

  const miniSelect = (val: string, opts: string[], onCh: (v: string) => void, placeholder?: string) => (
    <select
      value={val}
      onChange={(e) => onCh(e.target.value)}
      style={{
        ...fieldBase,
        padding: "10px 14px",
        fontSize: 13,
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A7A6A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 32,
      }}
      onFocus={(e) => { e.target.style.borderColor = Z.pink; e.target.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { e.target.style.borderColor = "#C8B8A4"; e.target.style.boxShadow = "none"; }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const slotLabels: Record<ScheduleFreq, string[]> = {
    "weekly":       ["Session"],
    "twice-weekly": ["Session 1", "Session 2"],
    "bi-weekly":    ["Session"],
    "monthly":      ["Session"],
    "intensive":    ["Day 1", "Day 2", "Day 3"],
    "custom":       [],
  };

  return (
    <div>
      {/* Frequency pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {freqOptions.map((o) => pill(o.id, o.label))}
      </div>

      {freq === "custom" ? (
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          rows={3}
          placeholder="Describe the session schedule in your own words…"
          style={{ ...fieldBase, resize: "vertical", lineHeight: 1.65 }}
          onFocus={(e) => { e.target.style.borderColor = Z.pink; e.target.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "#C8B8A4"; e.target.style.boxShadow = "none"; }}
        />
      ) : (
        <>
          {slots.map((slot, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              {slots.length > 1 && (
                <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: Z.muted, marginBottom: 8 }}>
                  {slotLabels[freq]?.[i] ?? `Session ${i + 1}`}
                </p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {miniSelect(slot.day, DAYS, (v) => setSlot(i, { day: v }), "Day of week")}
                <input
                  type="time"
                  value={to24h(slot.startTime)}
                  onChange={(e) => setSlot(i, { startTime: to12h(e.target.value) })}
                  style={{ ...fieldBase, padding: "10px 14px", fontSize: 13, colorScheme: "light" }}
                  onFocus={(e) => { e.target.style.borderColor = Z.pink; e.target.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "#C8B8A4"; e.target.style.boxShadow = "none"; }}
                />
                {miniSelect(slot.duration, DURATIONS, (v) => setSlot(i, { duration: v }), "Duration")}
              </div>
            </div>
          ))}

          {/* Recording turnaround */}
          <div style={{ marginTop: 16 }}>
            <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: Z.muted, marginBottom: 8 }}>
              Session recordings
            </p>
            {miniSelect(rec, RECORDING_OPTS, setRec)}
          </div>

          {/* Preview */}
          {buildString(freq, slots, timezone ?? "", rec, custom) && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: Z.creamMid, borderRadius: 8, borderLeft: `3px solid ${Z.pink}` }}>
              <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: Z.muted, marginBottom: 4 }}>Preview</p>
              <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.charcoal, lineHeight: 1.5 }}>
                {buildString(freq, slots, timezone ?? "", rec, custom)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── PaymentPlanBuilder ────────────────────────────────────────────────────────

export interface PaymentPlan {
  installments: number;
  cadence: string;
  amountPerInstallment: number;
}

const CADENCE_OPTIONS = ["weekly", "fortnightly", "monthly", "bi-monthly", "quarterly", "annually"];

function planLabel(p: PaymentPlan): string {
  if (!p.installments && !p.amountPerInstallment) return "";
  const n = p.installments || "?";
  const amt = p.amountPerInstallment ? `$${p.amountPerInstallment}` : "$?";
  const cad = p.cadence || "monthly";
  return `${n} × ${amt} ${cad}`;
}

export function PaymentPlanBuilder({
  plans,
  onChange,
}: {
  plans: PaymentPlan[];
  onChange: (plans: PaymentPlan[]) => void;
}) {
  function addPlan() {
    onChange([...plans, { installments: 0, cadence: "monthly", amountPerInstallment: 0 }]);
  }

  function removePlan(i: number) {
    onChange(plans.filter((_, idx) => idx !== i));
  }

  function updatePlan(i: number, patch: Partial<PaymentPlan>) {
    onChange(plans.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  }

  const numInput = (val: number, onCh: (n: number) => void, placeholder: string) => (
    <input
      type="number"
      min={1}
      value={val || ""}
      onChange={(e) => onCh(Number(e.target.value))}
      placeholder={placeholder}
      style={{ ...fieldBase, padding: "10px 14px", fontSize: 13 }}
      onFocus={(e) => { e.target.style.borderColor = Z.pink; e.target.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { e.target.style.borderColor = "#C8B8A4"; e.target.style.boxShadow = "none"; }}
    />
  );

  const cadenceSelect = (val: string, onCh: (v: string) => void) => (
    <select
      value={val}
      onChange={(e) => onCh(e.target.value)}
      style={{
        ...fieldBase, padding: "10px 14px", fontSize: 13, appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A7A6A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32,
      }}
      onFocus={(e) => { e.target.style.borderColor = Z.pink; e.target.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { e.target.style.borderColor = "#C8B8A4"; e.target.style.boxShadow = "none"; }}
    >
      {CADENCE_OPTIONS.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
    </select>
  );

  return (
    <div>
      {plans.length === 0 && (
        <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.faint, marginBottom: 12 }}>
          No payment plans added. Click below to add one.
        </p>
      )}

      {plans.map((plan, i) => (
        <div
          key={i}
          style={{
            background: Z.creamMid,
            border: `1.5px solid ${Z.creamDeep}`,
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 10,
          }}
        >
          {/* Plan label row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: Z.muted }}>
              Plan {i + 1}{planLabel(plan) ? ` · ${planLabel(plan)}` : ""}
            </span>
            <button
              type="button"
              onClick={() => removePlan(i)}
              style={{ background: "none", border: "none", cursor: "pointer", color: Z.faint, fontSize: 18, lineHeight: 1, padding: "0 2px" }}
              title="Remove plan"
            >
              ×
            </button>
          </div>

          {/* Three columns: installments, cadence, amount */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <p style={{ fontFamily: Z.font, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 6 }}>
                # Payments
              </p>
              {numInput(plan.installments, (n) => updatePlan(i, { installments: n }), "e.g. 3")}
            </div>
            <div>
              <p style={{ fontFamily: Z.font, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 6 }}>
                Cadence
              </p>
              {cadenceSelect(plan.cadence, (v) => updatePlan(i, { cadence: v }))}
            </div>
            <div>
              <p style={{ fontFamily: Z.font, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: Z.muted, marginBottom: 6 }}>
                Amount per payment ($)
              </p>
              {numInput(plan.amountPerInstallment, (n) => updatePlan(i, { amountPerInstallment: n }), "e.g. 549")}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addPlan}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 16px",
          background: Z.white,
          border: `1.5px dashed ${Z.faint}`,
          borderRadius: 10,
          fontFamily: Z.font,
          fontSize: 13,
          fontWeight: 600,
          color: Z.muted,
          cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s",
          marginTop: plans.length > 0 ? 4 : 0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = Z.pink; (e.currentTarget as HTMLButtonElement).style.color = Z.pink; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = Z.faint; (e.currentTarget as HTMLButtonElement).style.color = Z.muted; }}
      >
        + Add payment plan
      </button>
    </div>
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...fieldBase, resize: "vertical", lineHeight: 1.65 }}
      onFocus={(e) => { const el = e.target as HTMLTextAreaElement; el.style.borderColor = Z.pink; el.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { const el = e.target as HTMLTextAreaElement; el.style.borderColor = "#C8B8A4"; el.style.boxShadow = "none"; }}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...fieldBase, cursor: "pointer" }}
      onFocus={(e) => { const el = e.target as HTMLSelectElement; el.style.borderColor = Z.pink; el.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { const el = e.target as HTMLSelectElement; el.style.borderColor = "#C8B8A4"; el.style.boxShadow = "none"; }}
    >
      <option value="">Select…</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
      {children}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3
        style={{
          fontFamily: Z.font,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: Z.pink,
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: `1px solid ${Z.creamDeep}`,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export function FileUpload({
  label,
  accept,
  onUpload,
  currentUrl,
  bucket = "wizard-uploads",
  requireTransparency = false,
}: {
  label: string;
  accept: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
  bucket?: string;
  requireTransparency?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      if (requireTransparency) {
        const { fileHasTransparency, LOGO_TRANSPARENCY_ERROR } = await import("@/lib/image-alpha");
        const ok = await fileHasTransparency(file);
        if (!ok) throw new Error(LOGO_TRANSPARENCY_ERROR);
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      if (requireTransparency) formData.append("requireTransparency", "true");
      const res = await fetch("/api/wizard/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onUpload(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const checkerboard = {
    backgroundImage: "linear-gradient(45deg, #e8e0d4 25%, transparent 25%), linear-gradient(-45deg, #e8e0d4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e0d4 75%), linear-gradient(-45deg, transparent 75%, #e8e0d4 75%)",
    backgroundSize: "12px 12px",
    backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
    backgroundColor: "#FCF8EF",
  };

  return (
    <div>
      {currentUrl && !uploading && (
        <div style={{ marginBottom: 10, padding: 12, borderRadius: 10, ...checkerboard, display: "inline-block", maxWidth: "100%" }}>
          <img src={currentUrl} alt="" style={{ maxHeight: 80, maxWidth: 240, objectFit: "contain", display: "block" }} />
        </div>
      )}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 18px",
          background: Z.white,
          border: "1.5px dashed #C8B8A4",
          borderRadius: 12,
          cursor: uploading ? "not-allowed" : "pointer",
          fontFamily: Z.font,
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLLabelElement).style.borderColor = Z.pink; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLLabelElement).style.borderColor = "#C8B8A4"; }}
      >
        <span style={{ fontSize: 22, opacity: 0.5 }}>↑</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: Z.charcoal }}>
            {uploading ? "Uploading…" : label}
          </div>
          {currentUrl && !uploading && (
            <div style={{ fontSize: 12, color: Z.pink, marginTop: 2, fontWeight: 600 }}>
              ✓ File uploaded
            </div>
          )}
          {!currentUrl && !uploading && (
            <div style={{ fontSize: 12, color: Z.faint, marginTop: 2 }}>
              Click to browse
            </div>
          )}
        </div>
        <input
          type="file"
          accept={accept}
          onChange={handleFile}
          style={{ display: "none" }}
          disabled={uploading}
        />
      </label>
      {error && (
        <p style={{ color: Z.coral, fontFamily: Z.font, fontSize: 12, marginTop: 6 }}>{error}</p>
      )}
    </div>
  );
}

export function MultipleFileUpload({
  label,
  accept,
  onUpload,
  currentUrls,
}: {
  label: string;
  accept: string;
  onUpload: (urls: string[]) => void;
  currentUrls: string[];
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await fetch("/api/wizard/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (json.url) uploaded.push(json.url);
        setUploadProgress({ done: i + 1, total: files.length });
      }
      onUpload([...currentUrls, ...uploaded]);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  async function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    await uploadFiles(Array.from(e.target.files ?? []));
    // Reset so the same file(s) can be re-added
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) uploadFiles(files);
  }

  function remove(url: string) {
    onUpload(currentUrls.filter((u) => u !== url));
  }

  const borderColor = dragOver ? Z.pink : uploading ? Z.coral : "#C8B8A4";
  const bgColor     = dragOver ? "#FFF0F7" : Z.white;

  return (
    <div>
      {currentUrls.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {currentUrls.map((url) => (
            <div
              key={url}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: Z.creamMid,
                border: `1px solid ${Z.creamDeep}`,
                borderRadius: 8,
                padding: "5px 10px",
                fontFamily: Z.font,
                fontSize: 12,
              }}
            >
              <span style={{ color: Z.pink, fontWeight: 700 }}>✓</span>
              <span style={{ color: Z.muted, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {url.split("/").pop()}
              </span>
              <button
                onClick={() => remove(url)}
                style={{ background: "none", border: "none", color: Z.faint, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 18px",
          background: bgColor,
          border: `1.5px dashed ${borderColor}`,
          borderRadius: 12,
          cursor: uploading ? "not-allowed" : "pointer",
          fontFamily: Z.font,
          transition: "border-color 0.15s, background 0.15s",
        }}
      >
        <span style={{ fontSize: 22, opacity: dragOver ? 1 : 0.5, transition: "opacity 0.15s" }}>
          {dragOver ? "⬇" : "↑"}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: dragOver ? Z.pink : Z.charcoal, transition: "color 0.15s" }}>
            {dragOver ? "Drop to upload" : uploading ? `Uploading ${uploadProgress?.done ?? 0} / ${uploadProgress?.total ?? "…"}…` : label}
          </div>
          <div style={{ fontSize: 12, color: Z.faint, marginTop: 2 }}>
            {currentUrls.length} file{currentUrls.length !== 1 ? "s" : ""} uploaded
            {!uploading && " · click or drag & drop to add more"}
          </div>
        </div>
        {uploading && uploadProgress && (
          <div style={{ flexShrink: 0, width: 80, height: 4, background: Z.creamDeep, borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: `linear-gradient(90deg, ${Z.pink}, ${Z.coral})`,
              width: `${(uploadProgress.done / uploadProgress.total) * 100}%`,
              transition: "width 0.2s",
            }} />
          </div>
        )}
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleInputChange}
          style={{ display: "none" }}
          disabled={uploading}
        />
      </label>
    </div>
  );
}

export function UrlListInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const url = input.trim();
    if (url && !value.includes(url)) {
      onChange([...value, url]);
      setInput("");
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <label
        style={{
          display: "block",
          fontFamily: Z.font,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: Z.charcoal,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder ?? "https://…"}
          style={{ ...fieldBase, flex: 1 }}
          onFocus={(e) => { const el = e.target as HTMLInputElement; el.style.borderColor = Z.pink; el.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
          onBlur={(e)  => { const el = e.target as HTMLInputElement; el.style.borderColor = "#C8B8A4"; el.style.boxShadow = "none"; }}
        />
        <button
          onClick={add}
          style={{
            padding: "12px 18px",
            background: `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`,
            color: Z.white,
            border: "none",
            borderRadius: 10,
            fontFamily: Z.font,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(250,42,69,0.2)",
          }}
        >
          + Add
        </button>
      </div>
      {value.map((url) => (
        <div
          key={url}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "9px 14px",
            background: Z.creamMid,
            border: `1px solid ${Z.creamDeep}`,
            borderRadius: 8,
            marginBottom: 6,
            fontFamily: Z.font,
          }}
        >
          <span style={{ fontSize: 13, color: Z.pink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontWeight: 600 }}>
            {url}
          </span>
          <button
            onClick={() => remove(url)}
            style={{ background: "none", border: "none", color: Z.faint, cursor: "pointer", fontSize: 18, flexShrink: 0, marginLeft: 8, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      ))}
      {hint && <p style={{ margin: "6px 0 0", fontFamily: Z.font, fontSize: 12, color: Z.faint }}>{hint}</p>}
    </div>
  );
}
