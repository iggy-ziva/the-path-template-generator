"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { ImageLibraryItem } from "./wizard-image-library";

interface Props {
  library: ImageLibraryItem[];
  currentUrl?: string | null;
  /** Called with the chosen URL (either a reused library image or a freshly uploaded one). */
  onSelect: (url: string) => void;
  onClose: () => void;
}

const OVERLAY: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 2147483000,
  background: "rgba(17,17,17,0.55)",
  backdropFilter: "blur(2px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const PANEL: CSSProperties = {
  width: "min(760px, 100%)",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  background: "#fff",
  color: "#111",
  borderRadius: 14,
  boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
  overflow: "hidden",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const HEADER: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  borderBottom: "1px solid #ececec",
};

const GRID: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: 12,
  padding: 20,
  overflowY: "auto",
};

const FOOTER: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "14px 20px",
  borderTop: "1px solid #ececec",
};

export default function ImagePickerModal({ library, currentUrl, onSelect, onClose }: Props) {
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/wizard/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.url) {
        onSelect(data.url as string);
      } else {
        throw new Error("No URL returned");
      }
    } catch {
      alert("Image upload failed — please try again.");
      setUploading(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div style={OVERLAY} onClick={onClose} role="dialog" aria-modal="true">
      <div style={PANEL} onClick={(e) => e.stopPropagation()}>
        <div style={HEADER}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Choose an image</div>
            <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
              {library.length > 0
                ? "Reuse an image from your wizard uploads, or upload a new one."
                : "Upload an image to use here."}
            </div>
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
              color: "#888",
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {library.length > 0 ? (
          <div style={GRID}>
            {library.map((item) => {
              const active = item.url === currentUrl;
              return (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => onSelect(item.url)}
                  title={item.label}
                  style={{
                    position: "relative",
                    padding: 0,
                    border: active ? "3px solid #111" : "1px solid #e2e2e2",
                    borderRadius: 10,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#f6f6f6",
                    aspectRatio: "4 / 3",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: "4px 6px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#fff",
                      background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
                      textAlign: "left",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "#888", fontSize: 13 }}>
            No images were uploaded during the wizard. Upload one below.
          </div>
        )}

        <div style={FOOTER}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              background: "#111",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: uploading ? "wait" : "pointer",
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
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#555",
              background: "none",
              border: "1px solid #ddd",
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
    document.body,
  );
}
