"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useEditorOptional } from "./EditorContext";
import { usePageContent } from "./PageContentContext";
import type { FunnelPageKey } from "@/lib/funnel-export/config";
import { getAtPath } from "@/lib/content-path";
import ImagePickerModal from "./ImagePickerModal";

interface Props {
  pageKey: FunnelPageKey;
  /** Content path that stores the image URL, e.g. "heroVisualImageUrl". */
  path: string;
  /** Pre-resolved background style for the element (includes the image when present). */
  style?: CSSProperties;
  className?: string;
  ariaHidden?: boolean;
  /** Whether the field currently has an image (controls Add vs Swap label). */
  hasImage: boolean;
  children?: ReactNode;
}

const PILL: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  background: "rgba(17,17,17,0.82)",
  border: "1px solid rgba(255,255,255,0.35)",
  borderRadius: 999,
  padding: "6px 13px",
  cursor: "pointer",
  lineHeight: 1,
  backdropFilter: "blur(4px)",
};

/**
 * Editable background-image wrapper.
 *
 * Stores a `${path}NoImage` flag alongside the URL so removal is permanent
 * even when the parent page has a wizard-image fallback — and fully reversible
 * via a Restore button that clears the flag.
 */
export default function EditableBackgroundImage({
  pageKey,
  path,
  style,
  className,
  ariaHidden,
  hasImage,
  children,
}: Props) {
  const editor = useEditorOptional();
  const isEditMode = editor?.isEditMode ?? false;
  const [pickerOpen, setPickerOpen] = useState(false);

  // noImagePath flag — persists in content alongside the URL field.
  const noImagePath = `${path}NoImage`;
  const pageContent = usePageContent(pageKey);
  const isRemoved = Boolean(getAtPath(pageContent, noImagePath));

  const currentUrl = editor
    ? (getAtPath(editor.draftContent[pageKey] as Record<string, unknown> | undefined, path) as
        | string | null | undefined)
    : undefined;

  // hasCurrentImage: image is rendering (either from content or wizard fallback)
  // and has NOT been explicitly removed.
  const hasCurrentImage =
    !isRemoved && (Boolean(currentUrl) || (hasImage && currentUrl === undefined));

  function remove() {
    editor?.updateField(pageKey, path, null);
    editor?.updateField(pageKey, noImagePath, true);
  }
  function restore() {
    editor?.updateField(pageKey, noImagePath, null);
  }

  // Suppress the parent-provided backgroundImage when removed.
  const effectiveStyle: CSSProperties = isRemoved
    ? { ...style, backgroundImage: "none" }
    : (style ?? {});

  const editStyle: CSSProperties = isEditMode
    ? {
        ...effectiveStyle,
        position: "relative",
        outline: isRemoved
          ? "2px dashed rgba(248,113,113,0.5)"
          : "2px dashed rgba(255,255,255,0.6)",
        outlineOffset: -4,
      }
    : effectiveStyle;

  return (
    <div className={className} aria-hidden={ariaHidden} style={editStyle}>
      {children}

      {isEditMode && editor && (
        isRemoved ? (
          /* ── Removed state ── */
          <div
            contentEditable={false}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(2px)",
            }}
          >
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Image removed
            </span>
            <button
              type="button"
              style={{ ...PILL, color: "#D4A878", borderColor: "rgba(212,168,120,0.5)", background: "rgba(17,17,17,0.85)" }}
              onClick={restore}
            >
              Restore image
            </button>
          </div>
        ) : (
          /* ── Normal state ── */
          <div
            contentEditable={false}
            style={{ position: "absolute", bottom: 10, right: 10, zIndex: 2, display: "flex", gap: 6 }}
          >
            <button
              type="button"
              style={{ ...PILL, color: "#fff" }}
              onClick={() => setPickerOpen(true)}
            >
              {hasCurrentImage ? "Swap image" : "Add image"}
            </button>
            {hasCurrentImage && (
              <button
                type="button"
                style={{ ...PILL, color: "#f87171", borderColor: "rgba(248,113,113,0.45)" }}
                onClick={remove}
                title="Remove image"
              >
                Remove
              </button>
            )}
          </div>
        )
      )}

      {pickerOpen && editor && (
        <ImagePickerModal
          library={editor.imageLibrary}
          currentUrl={currentUrl ?? null}
          canRemove={hasCurrentImage}
          onSelect={(url) => {
            if (url === null) {
              remove();
            } else {
              editor.updateField(pageKey, noImagePath, null);
              editor.updateField(pageKey, path, url);
            }
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
