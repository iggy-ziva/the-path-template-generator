"use client";

import { useState, useEffect, useRef } from "react";

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
};

export interface FunnelSummary {
  id: string;
  name: string;
  current_step: number;
  status: string;
  theme_slug: string | null;
  updated_at: string;
  generated_funnel_id?: string | null;
  /** Wizard completeness 0–100, computed server-side from step_data. */
  completion_pct?: number;
}

const GENERATE_THRESHOLD = 80;

interface Props {
  open: boolean;
  onClose: () => void;
  activeFunnelId: string | null;
  funnels: FunnelSummary[];
  onFunnelsChange: (funnels: FunnelSummary[]) => void;
  onSwitch: (funnel: FunnelSummary) => void;
  onDelete: (id: string) => void;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FunnelSidebar({
  open,
  onClose,
  activeFunnelId,
  funnels,
  onFunnelsChange,
  onSwitch,
  onDelete,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameRef.current) renameRef.current.focus();
  }, [renamingId]);

  async function createFunnel() {
    setCreating(true);
    try {
      const res = await fetch("/api/wizard/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Funnel" }),
      });
      const { funnel } = await res.json();
      if (funnel) {
        onFunnelsChange([funnel, ...funnels]);
        onSwitch(funnel);
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  async function commitRename(id: string) {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenamingId(null); return; }
    await fetch(`/api/wizard/funnels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    onFunnelsChange(funnels.map((f) => f.id === id ? { ...f, name: trimmed } : f));
    setRenamingId(null);
  }

  async function deleteFunnel(id: string) {
    if (!confirm("Delete this funnel? This cannot be undone.")) return;
    await fetch(`/api/wizard/funnels/${id}`, { method: "DELETE" });
    onFunnelsChange(funnels.filter((f) => f.id !== id));
    onDelete(id);
  }

  const statusColor = (s: string) => s === "complete" ? "#3D6B30" : s === "generating" ? "#9A6E00" : Z.muted;
  const statusLabel = (s: string) => s === "complete" ? "Complete" : s === "generating" ? "Generating…" : "Draft";

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.25)" }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 320,
          zIndex: 101,
          background: Z.white,
          boxShadow: "4px 0 32px rgba(0,0,0,0.10)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${Z.creamDeep}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: Z.pink, marginBottom: 2 }}>My Funnels</p>
            <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, marginBottom: 8 }}>{funnels.length} funnel{funnels.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} style={{ background: Z.creamDeep, border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, color: Z.muted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
        </div>

        {/* New funnel button */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${Z.creamDeep}` }}>
          <button
            onClick={createFunnel}
            disabled={creating}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 100%)`,
              color: Z.white,
              border: "none",
              borderRadius: 10,
              fontFamily: Z.font,
              fontSize: 13,
              fontWeight: 700,
              padding: "11px 16px",
              cursor: creating ? "not-allowed" : "pointer",
              opacity: creating ? 0.7 : 1,
              letterSpacing: "0.02em",
            }}
          >
            {creating ? "Creating…" : "+ New funnel"}
          </button>
        </div>

        {/* Funnel list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {funnels.length === 0 ? (
            <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, textAlign: "center", padding: "32px 16px" }}>No funnels yet. Create one above.</p>
          ) : (
            funnels.map((funnel) => {
              const isActive = funnel.id === activeFunnelId;
              const isRenaming = renamingId === funnel.id;
              // Use the server-computed completeness if present; fall back to
              // a step-derived approximation for any older API responses.
              const TOTAL_STEPS = 11;
              const pct = Math.min(
                100,
                typeof funnel.completion_pct === "number"
                  ? funnel.completion_pct
                  : Math.round(((funnel.current_step - 1) / (TOTAL_STEPS - 1)) * 100)
              );
              const readyToGenerate = pct >= GENERATE_THRESHOLD;
              return (
                <div
                  key={funnel.id}
                  onClick={() => !isRenaming && onSwitch(funnel)}
                  style={{
                    padding: "12px 16px",
                    margin: "2px 8px",
                    borderRadius: 10,
                    cursor: isRenaming ? "default" : "pointer",
                    background: isActive ? `${Z.pink}10` : "transparent",
                    border: isActive ? `1.5px solid ${Z.pink}30` : "1.5px solid transparent",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Name row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {isRenaming ? (
                      <input
                        ref={renameRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => commitRename(funnel.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename(funnel.id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          fontFamily: Z.font,
                          fontSize: 13,
                          fontWeight: 700,
                          color: Z.charcoal,
                          border: `1.5px solid ${Z.pink}`,
                          borderRadius: 6,
                          padding: "3px 8px",
                          background: Z.white,
                          outline: "none",
                        }}
                      />
                    ) : (
                      <span style={{ flex: 1, fontFamily: Z.font, fontSize: 13, fontWeight: 700, color: isActive ? Z.pink : Z.charcoal, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {funnel.name || "Untitled Funnel"}
                      </span>
                    )}

                    {!isRenaming && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(funnel.id);
                          setRenameValue(funnel.name || "");
                        }}
                        title="Rename"
                        style={{ background: "none", border: "none", cursor: "pointer", color: Z.muted, padding: 2, fontSize: 13, lineHeight: 1 }}
                      >
                        ✎
                      </button>
                    )}

                    {!isRenaming && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteFunnel(funnel.id); }}
                        title="Delete"
                        style={{ background: "none", border: "none", cursor: "pointer", color: Z.muted, padding: 2, fontSize: 13, lineHeight: 1 }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Meta row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: funnel.generated_funnel_id ? 8 : 8 }}>
                    <span style={{ fontFamily: Z.font, fontSize: 11, fontWeight: 600, color: statusColor(funnel.status) }}>
                      {statusLabel(funnel.status)}
                    </span>
                    <span style={{ color: Z.charcoal, fontSize: 11 }}>·</span>
                    <span style={{ fontFamily: Z.font, fontSize: 11, color: Z.charcoal }}>
                      {relativeTime(funnel.updated_at)}
                    </span>
                    {funnel.generated_funnel_id && (
                      <>
                        <span style={{ color: Z.charcoal, fontSize: 11 }}>·</span>
                        <a
                          href={`/app/preview/${funnel.generated_funnel_id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontFamily: Z.font,
                            fontSize: 11,
                            fontWeight: 700,
                            color: Z.pink,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          View →
                        </a>
                      </>
                    )}
                  </div>

                  {/* Progress bar — reflects field completeness, not the tab the user happens to be on */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: Z.font, fontSize: 10, color: Z.charcoal }}>
                        {readyToGenerate ? "Ready to generate" : `${pct}% complete`}
                      </span>
                      <span style={{
                        fontFamily: Z.font,
                        fontSize: 10,
                        color: readyToGenerate ? "#16a34a" : isActive ? Z.pink : Z.charcoal,
                        fontWeight: 600,
                      }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ position: "relative", height: 4, background: "#F5EEE0", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: readyToGenerate
                          ? "linear-gradient(90deg, #16a34a, #22c55e)"
                          : isActive
                            ? "linear-gradient(90deg, #FF007E, #FA2A45)"
                            : Z.faint,
                        borderRadius: 2,
                        transition: "width 0.3s ease, background 0.3s ease",
                      }} />
                      {/* Threshold tick */}
                      {!readyToGenerate && (
                        <div
                          aria-hidden
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: `${GENERATE_THRESHOLD}%`,
                            width: 1,
                            background: Z.muted,
                            opacity: 0.55,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
