"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useEditorOptional } from "./EditorContext";
import type { FunnelPageKey } from "@/lib/funnel-export/config";
import { getAtPath } from "@/lib/content-path";
import ImagePickerModal from "./ImagePickerModal";

interface Props {
  pageKey: FunnelPageKey;
  /** Content path that stores the image URL, e.g. "heroBackgroundImageUrl". */
  path: string;
  /** Pre-resolved background style for the element (includes the image when present). */
  style?: CSSProperties;
  className?: string;
  ariaHidden?: boolean;
  /** Whether the field currently has an image (controls Add vs Swap label + placeholder). */
  hasImage: boolean;
  children?: ReactNode;
}

const SWAP_PILL: CSSProperties = {
  position: "absolute",
  bottom: 10,
  right: 10,
  zIndex: 2,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#fff",
  background: "rgba(17,17,17,0.82)",
  border: "1px solid rgba(255,255,255,0.35)",
  borderRadius: 999,
  padding: "6px 13px",
  cursor: "pointer",
  lineHeight: 1,
  backdropFilter: "blur(4px)",
};

/**
 * Editable background-image wrapper. In edit mode it overlays an upload button
 * that swaps the image and writes the new URL via editor.updateField — i.e. it
 * only mutates the in-memory draft. Persistence happens through the editor's
 * normal full-content save, so this can't partially overwrite stored content.
 * Outside edit mode (and in export, where there's no editor) it renders a plain
 * element, preserving what-you-see-is-what-you-get parity.
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

  const currentUrl = editor
    ? (getAtPath(editor.draftContent[pageKey] as Record<string, unknown> | undefined, path) as
        | string
        | null
        | undefined)
    : undefined;

  const editStyle: CSSProperties = isEditMode
    ? { ...style, position: "relative", outline: "2px dashed rgba(255,255,255,0.6)", outlineOffset: -4 }
    : (style ?? {});

  return (
    <div className={className} aria-hidden={ariaHidden} style={editStyle}>
      {children}
      {isEditMode && editor && (
        <button
          type="button"
          style={SWAP_PILL}
          contentEditable={false}
          onClick={() => setPickerOpen(true)}
        >
          {hasImage ? "Swap image" : "Add image"}
        </button>
      )}
      {pickerOpen && editor && (
        <ImagePickerModal
          library={editor.imageLibrary}
          currentUrl={currentUrl ?? null}
          onSelect={(url) => {
            editor.updateField(pageKey, path, url ?? null);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
