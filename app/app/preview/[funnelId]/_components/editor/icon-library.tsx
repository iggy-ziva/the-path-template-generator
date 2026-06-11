"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditorOptional } from "./EditorContext";
import { usePageContent } from "./PageContentContext";
import { getAtPath } from "@/lib/content-path";
import type { FunnelPageKey } from "@/lib/funnel-export/config";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Stored at content paths like `audienceItemIcons.0`.
 * Plain strings are treated as legacy named-icon values (backward compat).
 */
export interface IconOverride {
  /** Named icon from the curated set, OR a full https:// URL for an uploaded image. */
  v: string;
  /** Rendered size in px. Falls back to the component's `defaultSize` when absent. */
  size?: number;
  /**
   * MIME type stored at upload time ("image/svg+xml", "image/png", "image/jpeg").
   * Used by the renderer to decide whether to apply a CSS mask (SVG/PNG inherit
   * currentColor) or show the image as-is (JPEG).
   */
  mime?: string;
}

export function parseIconOverride(raw: unknown): IconOverride | null {
  if (!raw) return null;
  if (typeof raw === "string" && raw) return { v: raw }; // backward compat
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.v === "string" && obj.v) {
      return {
        v: obj.v,
        size: typeof obj.size === "number" ? obj.size : undefined,
        mime: typeof obj.mime === "string" ? obj.mime : undefined,
      };
    }
  }
  return null;
}

function isUrl(v: string) {
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/");
}

function shouldUseMask(override: IconOverride): boolean {
  if (override.mime) {
    return override.mime === "image/svg+xml" || override.mime === "image/png";
  }
  const lower = override.v.toLowerCase();
  if (/\.(jpg|jpeg)(\?|$)/.test(lower)) return false;
  if (/\.(svg|png)(\?|$)/.test(lower)) return true;
  return true; // default to mask for unknown — covers Supabase paths
}

// ── Curated icon library ──────────────────────────────────────────────────────

export const ICON_LIBRARY: { name: string; label: string; svg: React.ReactNode }[] = [
  { name: "check",   label: "Check",   svg: <polyline points="20 6 9 17 4 12" /> },
  { name: "star",    label: "Star",    svg: <polygon points="12 2 15 9 22 9.3 16.5 13.8 18.5 21 12 16.8 5.5 21 7.5 13.8 2 9.3 9 9" /> },
  { name: "heart",   label: "Heart",   svg: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /> },
  { name: "sparkle", label: "Sparkle", svg: <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" /> },
  { name: "bolt",    label: "Bolt",    svg: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /> },
  { name: "leaf",    label: "Leaf",    svg: <path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 9-3 16-9 16zM4 21c3-3 6-5 10-7" /> },
  { name: "sun",     label: "Sun",     svg: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></> },
  { name: "shield",  label: "Shield",  svg: <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" /> },
  { name: "compass", label: "Compass", svg: <><circle cx="12" cy="12" r="9" /><polygon points="16 8 13.5 13.5 8 16 10.5 10.5 16 8" /></> },
  { name: "target",  label: "Target",  svg: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></> },
  { name: "arrow",   label: "Arrow",   svg: <><line x1="4" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></> },
  { name: "key",     label: "Key",     svg: <><circle cx="8" cy="8" r="4" /><path d="M11 11l9 9M16 16l2-2M19 19l2-2" /></> },
];

const ICON_MAP = new Map(ICON_LIBRARY.map((i) => [i.name, i.svg]));

const SIZE_PRESETS = [
  { label: "S",  size: 14 },
  { label: "M",  size: 18 },
  { label: "L",  size: 24 },
  { label: "XL", size: 32 },
];

// ── Render helpers ─────────────────────────────────────────────────────────────

export function renderIcon(name: string | undefined, size = 18): React.ReactNode {
  if (!name) return null;
  const svg = ICON_MAP.get(name);
  if (!svg) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: size, flexShrink: 0, display: "block" }}
    >
      {svg}
    </svg>
  );
}

/**
 * Render an icon from an IconOverride.
 * - Named icons: inline SVG (inherits currentColor via stroke).
 * - Uploaded SVG / PNG: CSS mask so the image inherits currentColor.
 * - Uploaded JPEG: plain <img> (fully opaque; mask not applicable).
 */
export function renderIconValue(override: IconOverride | null, defaultSize = 18): React.ReactNode {
  if (!override) return null;
  const size = override.size ?? defaultSize;
  const v = override.v;

  if (!isUrl(v)) return renderIcon(v, size);

  if (shouldUseMask(override)) {
    return (
      <span
        aria-hidden="true"
        style={{
          display: "block",
          width: size,
          height: size,
          flexShrink: 0,
          backgroundColor: "currentColor",
          WebkitMaskImage: `url(${v})`,
          maskImage: `url(${v})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        } as React.CSSProperties}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={v}
      alt=""
      style={{ width: size, height: size, objectFit: "contain", display: "block", flexShrink: 0 }}
    />
  );
}

// ── IconContainer ─────────────────────────────────────────────────────────────

interface IconContainerProps {
  pageKey: FunnelPageKey;
  /** Icon content path (e.g. "audienceItemIcons.0"). Used to read the live size. */
  path: string;
  /** Default icon size in px when no override is stored. */
  defaultSize?: number;
  /** Padding added to each side of the icon to form the container dimensions. */
  containerPadding?: number;
  tag?: "div" | "span";
  className?: string;
  "aria-hidden"?: boolean | "true";
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * A container div/span that reactively tracks the current icon size via
 * `usePageContent` so its width/height always matches the chosen icon size.
 * The CSS class provides background, border-radius, and flex centering.
 */
export function IconContainer({
  pageKey,
  path,
  defaultSize = 18,
  containerPadding = 6,
  tag: Tag = "div",
  className,
  style,
  children,
  ...rest
}: IconContainerProps) {
  const pageContent = usePageContent(pageKey);
  const override = parseIconOverride(getAtPath(pageContent, path));
  const iconSize = override?.size ?? defaultSize;
  const dim = iconSize + containerPadding * 2;
  return (
    <Tag
      className={className}
      style={{ alignSelf: "start", width: dim, height: dim, ...style }}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </Tag>
  );
}

// ── EditableIcon component ────────────────────────────────────────────────────

interface Props {
  pageKey: FunnelPageKey;
  path: string;
  fallback: React.ReactNode;
  defaultSize?: number;
  exportMode?: boolean;
  /**
   * When provided, the picker shows an "Apply to all" button that copies the
   * current icon choice to every path in this list (not just the current one).
   * Pass all sibling icon paths in the section, e.g.
   * `["audienceItemIcons.0", "audienceItemIcons.1", ...]`.
   */
  siblingPaths?: string[];
}

export default function EditableIcon({
  pageKey,
  path,
  fallback,
  defaultSize = 18,
  exportMode = false,
  siblingPaths,
}: Props) {
  const editor = useEditorOptional();
  const editMode = !exportMode && Boolean(editor?.isEditMode);
  const pageContent = usePageContent(pageKey);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const raw = getAtPath(pageContent, path);
  const override = parseIconOverride(raw);
  const currentSize = override?.size ?? defaultSize;

  const marker = override ? renderIconValue(override, defaultSize) : fallback;

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // All writes fan out to every sibling in the section so the entire section
  // stays in sync automatically. siblingPaths includes the current path.
  const sectionPaths = siblingPaths?.length ? siblingPaths : [path];

  function buildOverride(patch: Partial<IconOverride>): IconOverride | null {
    const v = patch.v ?? override?.v ?? "";
    if (!v) return null;
    const size = patch.size ?? currentSize;
    const mime = patch.mime ?? (patch.v && isUrl(patch.v) ? undefined : override?.mime);
    const next: IconOverride = { v, size };
    if (mime) next.mime = mime;
    return next;
  }

  function write(patch: Partial<IconOverride>) {
    const next = buildOverride(patch);
    sectionPaths.forEach((p) => editor?.updateField(pageKey, p, next));
  }

  function resetAll() {
    sectionPaths.forEach((p) => editor?.updateField(pageKey, p, null));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/wizard/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Upload failed");
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) write({ v: data.url, size: currentSize, mime: file.type });
    } catch (err) {
      alert(`Icon upload failed — ${err instanceof Error ? err.message : "please try again."}`);
    } finally {
      setUploading(false);
      if (uploadRef.current) uploadRef.current.value = "";
    }
  }

  if (!editMode || !editor) return <>{marker}</>;

  return (
    <span ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        contentEditable={false}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        title="Change icon"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          border: "1px dashed transparent",
          borderRadius: 6,
          background: "none",
          color: "inherit",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "currentColor"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"; }}
      >
        {marker}
      </button>

      {open && (
        <div
          contentEditable={false}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 140,
            width: 248,
            padding: 10,
            background: "rgba(20, 20, 18, 0.97)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Section scope indicator */}
          {sectionPaths.length > 1 && (
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              Applies to all {sectionPaths.length} items in this section
            </p>
          )}

          {/* Curated icons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
            {ICON_LIBRARY.map((icon) => {
              const active = override?.v === icon.name;
              return (
                <button
                  key={icon.name}
                  type="button"
                  title={icon.label}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    write({ v: icon.name });
                    setOpen(false);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    color: active ? "#141412" : "#e8e4dd",
                    background: active ? "#D4A878" : "transparent",
                  }}
                >
                  {renderIcon(icon.name, 16)}
                </button>
              );
            })}
          </div>

          {/* Custom upload */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
              Custom icon
            </p>
            <input
              ref={uploadRef}
              type="file"
              accept="image/svg+xml,image/png,image/jpeg"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); uploadRef.current?.click(); }}
              disabled={uploading}
              style={{
                width: "100%",
                padding: "7px 0",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "#e8e4dd",
                fontSize: 11,
                fontWeight: 700,
                cursor: uploading ? "wait" : "pointer",
              }}
            >
              {uploading ? "Uploading…" : "↑ Upload SVG / PNG / JPEG"}
            </button>
            {override && isUrl(override.v) && (
              <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
                {shouldUseMask(override) ? "Custom icon (theme colour applied)" : "Custom icon active"}
              </p>
            )}
          </div>

          {/* Size presets */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
              Size
            </p>
            <div style={{ display: "flex", gap: 4 }}>
              {SIZE_PRESETS.map((p) => {
                const active = currentSize === p.size;
                return (
                  <button
                    key={p.label}
                    type="button"
                    title={`${p.size}px`}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); write({ size: p.size }); }}
                    style={{
                      flex: 1,
                      padding: "5px 0",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: active ? "#D4A878" : "transparent",
                      color: active ? "#141412" : "#e8e4dd",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetAll();
              setOpen(false);
            }}
            style={{
              width: "100%",
              padding: "6px 0",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "transparent",
              color: "#e8e4dd",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Use default marker
          </button>
        </div>
      )}
    </span>
  );
}
