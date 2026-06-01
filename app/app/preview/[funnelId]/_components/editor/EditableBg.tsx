"use client";

import React, { useState } from "react";
import { useEditorOptional } from "./EditorContext";
import { usePageContent } from "./PageContentContext";
import { getAtPath } from "@/lib/content-path";
import ImagePickerModal from "./ImagePickerModal";
import { safeUrl, brandSectionOverlay, brandImageBackground } from "../funnel-types";
import type { FunnelPageKey } from "@/lib/funnel-export/config";

interface Props {
  pageKey: FunnelPageKey;
  /** Content path holding this element's background image URL. */
  path: string;
  /** Fallback image used when no override is set (e.g. a wizard image). */
  fallbackUrl?: string | null;
  /** Scrim opacity for the default dark overlay (ignored if `overlay` is given). */
  overlayOpacity?: number;
  /** Explicit overlay gradient string (e.g. a left-weighted hero gradient). */
  overlay?: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  /** Class appended only when a background image is actually shown (e.g. "on-dark"). */
  imageClassName?: string;
  style?: React.CSSProperties;
  /** Push the edit controls down (px) so they clear an overlapping fixed bar. */
  controlsTopOffset?: number;
  id?: string;
  children: React.ReactNode;
}

const CONTROL_WRAP: React.CSSProperties = {
  display: "inline-flex",
  gap: 2,
  padding: 3,
  borderRadius: 8,
  background: "rgba(20, 20, 18, 0.82)",
  backdropFilter: "blur(6px)",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
};

const PILL_BTN: React.CSSProperties = {
  padding: "3px 9px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.02em",
  lineHeight: 1.4,
  color: "#e8e4dd",
  background: "transparent",
};

/**
 * Lightweight editable background wrapper for sections that are NOT EditableSection
 * (page headers, thank-you heroes, etc.). Provides the same image picker + bg-layer
 * rendering as EditableSection, minus the theme toggle. Export-safe: with no editor
 * it just renders the background from content/fallback.
 */
export default function EditableBg({
  pageKey,
  path,
  fallbackUrl,
  overlayOpacity = 0.88,
  overlay,
  as = "section",
  className = "",
  imageClassName,
  style,
  controlsTopOffset = 8,
  id,
  children,
}: Props) {
  const editor = useEditorOptional();
  const editMode = Boolean(editor?.isEditMode);
  const [pickerOpen, setPickerOpen] = useState(false);

  const pageContent = usePageContent(pageKey);
  const overrideUrl = safeUrl(getAtPath(pageContent, path) as string | null | undefined);
  const bgUrl = overrideUrl ?? safeUrl(fallbackUrl ?? null);
  const showsImage = Boolean(bgUrl);

  const composed = `${className}${showsImage && imageClassName ? ` ${imageClassName}` : ""}`.trim();

  const resolvedStyle: React.CSSProperties = { ...style };
  if (showsImage) {
    resolvedStyle.position = resolvedStyle.position ?? "relative";
    resolvedStyle.isolation = "isolate";
  }

  const bgLayer = showsImage ? (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        backgroundImage: brandImageBackground(overlay ?? brandSectionOverlay(overlayOpacity), bgUrl!),
        backgroundSize: "cover",
        backgroundPosition: "center",
        pointerEvents: "none",
      }}
    />
  ) : null;

  const controls = editMode && editor ? (
    <div
      contentEditable={false}
      style={{
        position: "absolute",
        top: controlsTopOffset,
        right: 8,
        zIndex: 130,
        display: "inline-flex",
        gap: 6,
        alignItems: "center",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={CONTROL_WRAP}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPickerOpen(true);
          }}
          title="Set or swap this section's background image"
          style={PILL_BTN}
        >
          {overrideUrl ? "Swap bg" : "+ Image"}
        </button>
        {overrideUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.updateField(pageKey, path, null);
            }}
            title="Remove background image"
            style={{ ...PILL_BTN, color: "#f1b0b0" }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  ) : null;

  const picker =
    pickerOpen && editor ? (
      <ImagePickerModal
        library={editor.imageLibrary}
        currentUrl={overrideUrl}
        onSelect={(url) => {
          editor.updateField(pageKey, path, url);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    ) : null;

  return React.createElement(
    as,
    { id, className: composed || undefined, style: resolvedStyle },
    bgLayer,
    controls,
    picker,
    children,
  );
}
