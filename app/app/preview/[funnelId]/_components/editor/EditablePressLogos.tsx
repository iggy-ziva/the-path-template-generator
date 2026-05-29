"use client";

import React, { useRef, useState } from "react";
import { useEditorOptional } from "./EditorContext";
import type { FunnelPageKey } from "@/lib/funnel-export/config";
import { PageText } from "./page-editable";

export interface PressLogoEntry {
  name: string;
  websiteUrl: string;
  logoUrl?: string;
  textFallback?: boolean;
  transparentBg?: boolean;
}

interface Props {
  pageKey: FunnelPageKey;
  eyebrow: string;
  logos: PressLogoEntry[];
  exportMode?: boolean;
}

function extractDomain(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function LogoModal({
  entry,
  index,
  onUpdate,
  onRemove,
  onClose,
}: {
  entry: PressLogoEntry;
  index: number;
  onUpdate: (patch: Partial<PressLogoEntry>) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFetch() {
    if (!entry.websiteUrl) return;
    setFetching(true);
    setFetchError("");
    try {
      const res = await fetch("/api/wizard/fetch-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: entry.websiteUrl, name: entry.name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch logo");
      onUpdate({
        logoUrl: json.logoUrl ?? "",
        textFallback: json.textFallback ?? false,
        transparentBg: json.transparentBg ?? false,
      });
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch logo");
    } finally {
      setFetching(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFetchError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "wizard-uploads");
      const res = await fetch("/api/wizard/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onUpdate({ logoUrl: json.url, textFallback: false, transparentBg: false });
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "#1a1a18",
    border: "1.5px solid #3a3936",
    borderRadius: 8,
    color: "#f5f1ea",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const btn = (label: string, onClick: () => void, disabled = false, primary = false) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border: `1.5px solid ${primary ? "#FF007E" : "#3a3936"}`,
        background: primary ? "rgba(255,0,126,0.12)" : "#252523",
        color: disabled ? "#6a6560" : primary ? "#FF007E" : "#c8b8a4",
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={`Edit press logo ${index + 1}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#141412",
          border: "1px solid #2a2926",
          borderRadius: 14,
          padding: "24px 28px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f5f1ea" }}>
            Press mention {index + 1}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", color: "#8a7a6a", fontSize: 22, cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gap: 14, marginBottom: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a7a6a", marginBottom: 6 }}>
              Publication / outlet name
            </label>
            <input
              value={entry.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="e.g. Mindvalley"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a7a6a", marginBottom: 6 }}>
              Website URL
            </label>
            <input
              type="url"
              value={entry.websiteUrl}
              onChange={(e) => onUpdate({ websiteUrl: e.target.value })}
              placeholder="https://mindvalley.com"
              style={inputStyle}
            />
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8a7a6a", lineHeight: 1.5 }}>
              Paste a URL and use auto-fetch to detect and insert the logo.
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleUpload}
          hidden
        />

        {entry.logoUrl ? (
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap" }}>
            <div
              style={{
                width: 140,
                height: 56,
                borderRadius: 8,
                background: "#252523",
                border: "1px solid #3a3936",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.logoUrl}
                alt={entry.name || "Logo preview"}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {btn(fetching ? "Fetching…" : "Re-fetch logo", handleFetch, !entry.websiteUrl || fetching, true)}
                {btn(uploading ? "Uploading…" : "Upload image", () => fileInputRef.current?.click(), uploading)}
                <button
                  type="button"
                  onClick={() => onUpdate({ logoUrl: "", textFallback: false, transparentBg: false })}
                  style={{ background: "none", border: "none", color: "#FA2A45", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
                >
                  Remove image
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {btn(fetching ? "Fetching…" : "Auto-fetch logo", handleFetch, !entry.websiteUrl || fetching, true)}
            {btn(uploading ? "Uploading…" : "Upload image", () => fileInputRef.current?.click(), uploading)}
          </div>
        )}

        {entry.textFallback && !entry.logoUrl && (
          <p style={{ fontSize: 12, color: "#7a9080", marginBottom: 12 }}>
            No logo found — a text badge will show until you upload one.
          </p>
        )}

        {fetchError && (
          <p style={{ fontSize: 12, color: "#FA2A45", marginBottom: 12 }}>{fetchError}</p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 16, borderTop: "1px solid #2a2926" }}>
          <button
            type="button"
            onClick={() => { onRemove(); onClose(); }}
            style={{ background: "none", border: "none", color: "#FA2A45", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            Delete mention
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #FF007E, #FA2A45)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function LogoSlot({
  entry,
  editMode,
  onEdit,
}: {
  entry: PressLogoEntry;
  editMode: boolean;
  onEdit: () => void;
}) {
  const label = entry.name || extractDomain(entry.websiteUrl) || "Logo";
  const inner = entry.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={entry.logoUrl}
      alt={label}
      style={{ height: 52, maxWidth: "100%", objectFit: "contain", display: "block" }}
    />
  ) : (
    label
  );

  const slot = (
    <div
      className="logo-slot"
      style={editMode ? { cursor: "pointer", position: "relative" } : undefined}
      onClick={editMode ? onEdit : undefined}
      onKeyDown={editMode ? (e) => { if (e.key === "Enter") onEdit(); } : undefined}
      role={editMode ? "button" : undefined}
      tabIndex={editMode ? 0 : undefined}
      title={editMode ? "Click to edit logo" : undefined}
    >
      {inner}
      {editMode && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 4,
            outline: "1px dashed var(--accent-secondary-on-dark)",
            outlineOffset: 2,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );

  if (!editMode && entry.websiteUrl) {
    return (
      <a href={entry.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        {slot}
      </a>
    );
  }

  return slot;
}

export default function EditablePressLogos({ pageKey, eyebrow, logos, exportMode = false }: Props) {
  const editor = useEditorOptional();
  const isEditMode = !exportMode && (editor?.isEditMode ?? false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  function setLogos(next: PressLogoEntry[]) {
    editor?.updateField(pageKey, "pressLogos", next);
  }

  function updateLogo(index: number, patch: Partial<PressLogoEntry>) {
    setLogos(logos.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeLogo(index: number) {
    setLogos(logos.filter((_, i) => i !== index));
  }

  function addLogo() {
    const next = [...logos, { name: "", websiteUrl: "", logoUrl: "" }];
    setLogos(next);
    setModalIndex(next.length - 1);
  }

  const showSection = logos.length > 0 || isEditMode;
  if (!showSection) return null;

  return (
    <section className="as-seen-on">
      <div className="container">
        <PageText pageKey={pageKey} path="asSeenOnEyebrow" as="span" className="eyebrow">
          {eyebrow}
        </PageText>
        <div className="logo-wall" aria-label="Press logos">
          {logos.filter((p) => p.name || p.logoUrl || p.websiteUrl).map((entry, i) => (
            <LogoSlot
              key={i}
              entry={entry}
              editMode={isEditMode}
              onEdit={() => setModalIndex(i)}
            />
          ))}
          {isEditMode && (
            <button
              type="button"
              onClick={addLogo}
              style={{
                flex: "0 0 auto",
                minWidth: 100,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 16px",
                background: "transparent",
                border: "1.5px dashed var(--border-subtle)",
                borderRadius: 8,
                color: "var(--accent-secondary-on-dark)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Add logo
            </button>
          )}
        </div>
      </div>

      {isEditMode && modalIndex !== null && logos[modalIndex] && (
        <LogoModal
          entry={logos[modalIndex]}
          index={modalIndex}
          onUpdate={(patch) => updateLogo(modalIndex, patch)}
          onRemove={() => removeLogo(modalIndex)}
          onClose={() => setModalIndex(null)}
        />
      )}
    </section>
  );
}
