"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const Z = {
  cream:     "#FCFAF6",
  creamDeep: "#F5EEE0",
  charcoal:  "#2E2E2E",
  muted:     "#8A7A6A",
  faint:     "#C8B8A4",
  pink:      "#FF007E",
  coral:     "#FA2A45",
  white:     "#FFFFFF",
  font:      'var(--font-barlow), -apple-system, sans-serif',
  display:   '"kudryashev-d-contrast", serif',
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear + i);

interface Props {
  initialName?: string;
  onSave: (name: string) => void;
  onCancel?: () => void;
}

function parseName(name: string): { title: string; month: string; year: string } {
  // Try to parse "Title · Month YYYY"
  const match = name.match(/^(.+?)\s*·\s*([\w]+)\s+(\d{4})$/);
  if (match) return { title: match[1].trim(), month: match[2], year: match[3] };
  return { title: name === "Untitled Funnel" ? "" : name, month: "", year: String(currentYear) };
}

export default function FunnelNameModal({ initialName = "", onSave, onCancel }: Props) {
  const parsed = parseName(initialName);
  const [title, setTitle] = useState(parsed.title);
  const [month, setMonth] = useState(parsed.month || MONTHS[new Date().getMonth()]);
  const [year, setYear]   = useState(parsed.year || String(currentYear));
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const composedName = title.trim()
    ? `${title.trim()} · ${month} ${year}`
    : `${month} ${year} Funnel`;

  function handleSave() {
    onSave(composedName);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: Z.font,
    fontSize: 14,
    color: Z.charcoal,
    background: Z.white,
    border: `1.5px solid ${Z.creamDeep}`,
    borderRadius: 10,
    padding: "11px 14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: Z.font,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: Z.muted,
    marginBottom: 6,
    display: "block",
  };

  return createPortal(
    <div
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: Z.cream, borderRadius: 20, padding: "40px 36px", maxWidth: 480, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
      >
        <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: Z.pink, marginBottom: 8 }}>
          Name your funnel
        </p>
        <h2 style={{ fontFamily: Z.display, fontSize: "1.5rem", fontWeight: 700, color: Z.charcoal, marginBottom: 6, lineHeight: 1.2 }}>
          What is this funnel for?
        </h2>
        <p style={{ fontFamily: Z.font, fontSize: 14, color: Z.muted, marginBottom: 28, lineHeight: 1.6 }}>
          Give it a name so you can tell it apart from other funnels later.
        </p>

        {/* Event title */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Event title</label>
          <input
            type="text"
            placeholder="e.g. October Workshop, Presence Retreat…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            style={inputStyle}
          />
        </div>

        {/* Month + Year */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          <div>
            <label style={labelStyle}>Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Preview */}
        <div style={{ background: Z.white, border: `1.5px solid ${Z.creamDeep}`, borderRadius: 10, padding: "10px 14px", marginBottom: 24 }}>
          <span style={{ fontFamily: Z.font, fontSize: 11, color: Z.faint, marginRight: 8 }}>Preview:</span>
          <span style={{ fontFamily: Z.font, fontSize: 14, fontWeight: 700, color: Z.charcoal }}>{composedName}</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 100%)`,
              color: Z.white,
              border: "none",
              borderRadius: 10,
              fontFamily: Z.font,
              fontSize: 14,
              fontWeight: 700,
              padding: "13px 20px",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Save name →
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                background: Z.creamDeep,
                color: Z.charcoal,
                border: "none",
                borderRadius: 10,
                fontFamily: Z.font,
                fontSize: 14,
                fontWeight: 600,
                padding: "13px 18px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
