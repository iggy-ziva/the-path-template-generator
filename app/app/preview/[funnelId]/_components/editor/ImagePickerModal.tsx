"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { ImageLibraryItem } from "./wizard-image-library";
import { useEditorOptional } from "./EditorContext";
import { useEditSurface } from "./EditSurfaceContext";

interface Props {
  library: ImageLibraryItem[];
  currentUrl?: string | null;
  /** When true the Remove button is shown even if currentUrl is empty
   *  (e.g. when the rendered image comes from a wizard fallback, not stored in content). */
  canRemove?: boolean;
  /** Called with the chosen URL, or null to remove the image entirely. */
  onSelect: (url: string | null) => void;
  onClose: () => void;
  /** Optional guidance (e.g. recommended dimensions) shown in the header. */
  dimensionHint?: string;
}

const OVERLAY: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 2147483000,
  background: "rgba(0,0,0,0.65)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const PANEL: CSSProperties = {
  width: "min(760px, 100%)",
  height: "min(640px, 85vh)",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  background: "#1c1c1a",
  color: "#e8e4dd",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
  overflow: "hidden",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const HEADER: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  padding: "18px 20px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

// Dedicated scroll container — owns the vertical scrollbar so the grid inside
// can size to its content and simply overflow.
const SCROLL: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
};

const GRID: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  alignContent: "start",
  gap: 10,
  padding: 20,
};

const FOOTER: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "14px 20px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

export default function ImagePickerModal({ library, currentUrl, canRemove, onSelect, onClose, dimensionHint }: Props) {
  const editor = useEditorOptional();
  const surface = useEditSurface();
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    surface.doc.addEventListener("keydown", onKey);
    return () => surface.doc.removeEventListener("keydown", onKey);
  }, [onClose, surface]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/wizard/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.url) {
        // Refresh the library so the just-uploaded image appears immediately.
        editor?.refreshImageLibrary();
        onSelect(data.url as string);
      } else {
        throw new Error("No URL returned");
      }
    } catch {
      alert("Image upload failed — please try again.");
      setUploading(false);
    }
  }

  const showRemove = canRemove || Boolean(currentUrl);

  if (!mounted) return null;

  return createPortal(
    <div style={OVERLAY} onClick={onClose} role="dialog" aria-modal="true">
      <div style={PANEL} onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={HEADER}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e8e4dd" }}>Choose an image</div>
            <div style={{ fontSize: 12, color: "rgba(232,228,221,0.5)", marginTop: 3 }}>
              {library.length > 0
                ? "Select from your wizard uploads, or upload a new one."
                : "No uploads found — upload a new image below."}
            </div>
            {dimensionHint && (
              <div style={{ fontSize: 11, color: "#D4A878", marginTop: 4 }}>
                {dimensionHint}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "none",
              fontSize: 22,
              lineHeight: 1,
              cursor: "pointer",
              color: "rgba(232,228,221,0.45)",
              padding: 4,
              flexShrink: 0,
              marginLeft: 12,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Image grid (scrollable) ── */}
        {library.length > 0 ? (
          <div style={SCROLL}>
          <div style={GRID}>
            {library.map((item) => {
              const active = item.url === currentUrl;
              const showLabel = hoveredUrl === item.url || active;
              return (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => onSelect(item.url)}
                  onMouseEnter={() => setHoveredUrl(item.url)}
                  onMouseLeave={() => setHoveredUrl((u) => (u === item.url ? null : u))}
                  title={item.label}
                  style={{
                    position: "relative",
                    padding: 0,
                    border: active
                      ? "2px solid #D4A878"
                      : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.04)",
                    aspectRatio: "4 / 3",
                    outline: active ? "2px solid rgba(212,168,120,0.3)" : "none",
                    outlineOffset: 1,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {/* Label only appears on hover (or when selected) so it never
                      obscures the image while browsing. */}
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: "4px 7px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#fff",
                      background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
                      textAlign: "left",
                      opacity: showLabel ? 1 : 0,
                      transition: "opacity 120ms ease",
                      pointerEvents: "none",
                    }}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#D4A878",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "#141412",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          </div>
        ) : (
          <div style={{ padding: "36px 20px", textAlign: "center", color: "rgba(232,228,221,0.4)", fontSize: 13 }}>
            No images were uploaded during the wizard. Upload one below.
          </div>
        )}

        {/* ── Footer ── */}
        <div style={FOOTER}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.03em",
                color: "#141412",
                background: uploading ? "rgba(212,168,120,0.5)" : "#D4A878",
                borderRadius: 8,
                padding: "10px 16px",
                cursor: uploading ? "wait" : "pointer",
                transition: "background 120ms ease",
              }}
            >
              {uploading ? "Uploading…" : "Upload new image"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
              />
            </label>
            {showRemove && (
              <button
                type="button"
                onClick={() => onSelect(null)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#f87171",
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.3)",
                  borderRadius: 8,
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                Remove image
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(232,228,221,0.6)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    surface.doc.body,
  );
}
