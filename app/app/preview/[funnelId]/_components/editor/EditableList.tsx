"use client";

import React, { useState } from "react";
import { useEditorOptional } from "./EditorContext";
import { usePageContent } from "./PageContentContext";
import type { FunnelPageKey } from "@/lib/funnel-export/config";
import { getAtPath } from "@/lib/content-path";
import EditableText from "./EditableText";
import ImagePickerModal from "./ImagePickerModal";

interface Props {
  pageKey: FunnelPageKey;
  path: string;
  items: string[];
  renderItem?: (item: string, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  defaultNewItem?: string;
}

export default function EditableList({
  pageKey,
  path,
  items,
  renderItem,
  className,
  itemClassName,
  defaultNewItem = "New item",
}: Props) {
  const editor = useEditorOptional();
  const isEditMode = editor?.isEditMode ?? false;

  return (
    <ul className={className}>
      {items.map((item, i) => (
        <li key={i} className={itemClassName}>
          {isEditMode && editor ? (
            <>
              <EditableText pageKey={pageKey} path={`${path}[${i}]`} as="span">
                {item}
              </EditableText>
              <button
                type="button"
                className="editable-list-remove"
                onClick={() => editor.removeListItem(pageKey, path, i)}
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  color: "var(--text-tertiary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </>
          ) : renderItem ? (
            renderItem(item, i)
          ) : (
            item
          )}
        </li>
      ))}
      {isEditMode && editor && (
        <li>
          <button
            type="button"
            onClick={() => editor.addListItem(pageKey, path, defaultNewItem)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--accent-secondary-on-dark)",
              background: "none",
              border: "1px dashed var(--border-subtle)",
              borderRadius: 6,
              padding: "6px 12px",
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            + Add item
          </button>
        </li>
      )}
    </ul>
  );
}

interface EditableImageProps {
  pageKey: FunnelPageKey;
  path: string;
  url: string | null | undefined;
  alt: string;
  className?: string;
  imgStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

const IMG_BTN: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  border: "none",
  padding: "5px 11px",
  borderRadius: 6,
  cursor: "pointer",
  lineHeight: 1,
};

/**
 * Editable inline-image wrapper.
 *
 * Stores a `${path}NoImage` flag in content so the image can be removed
 * even when the parent page has a wizard fallback — and fully restored
 * via a Restore button that clears the flag.
 */
export function EditableImage({
  pageKey,
  path,
  url,
  alt,
  className,
  imgStyle,
  children,
}: EditableImageProps) {
  const editor = useEditorOptional();
  const [pickerOpen, setPickerOpen] = useState(false);
  const isEditMode = editor?.isEditMode ?? false;

  const noImagePath = `${path}NoImage`;
  const pageContent = usePageContent(pageKey);
  const isRemoved = Boolean(getAtPath(pageContent, noImagePath));

  // Suppress fallback URL when explicitly removed.
  const effectiveUrl = isRemoved ? null : url;

  // In export/view mode, a removed image renders nothing.
  if (!isEditMode && isRemoved) return null;

  function remove() {
    editor?.updateField(pageKey, path, null);
    editor?.updateField(pageKey, noImagePath, true);
  }
  function restore() {
    editor?.updateField(pageKey, noImagePath, null);
  }

  const wrap = (node: React.ReactNode) => {
    if (!isEditMode || !editor) return node;
    return (
      <div
        className={`editable-image-wrap${className ? ` ${className}` : ""}`}
        style={{
          position: "relative",
          outline: isRemoved
            ? "1px dashed rgba(248,113,113,0.5)"
            : "1px dashed rgba(255,255,255,0.35)",
          outlineOffset: 4,
        }}
      >
        {node}

        {isRemoved ? (
          /* ── Removed state ── */
          <div
            contentEditable={false}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)",
              borderRadius: 4,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Removed
            </span>
            <button
              type="button"
              onClick={restore}
              style={{ ...IMG_BTN, background: "rgba(212,168,120,0.9)", color: "#141412" }}
            >
              Restore
            </button>
          </div>
        ) : (
          /* ── Normal state ── */
          <div
            contentEditable={false}
            style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 5 }}
          >
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              style={{ ...IMG_BTN, background: "rgba(17,17,17,0.82)", color: "#fff", backdropFilter: "blur(4px)" }}
            >
              {effectiveUrl ? "Swap" : "Add image"}
            </button>
            {effectiveUrl && (
              <button
                type="button"
                onClick={remove}
                style={{ ...IMG_BTN, background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.35)" }}
              >
                Remove
              </button>
            )}
          </div>
        )}

        {pickerOpen && (
          <ImagePickerModal
            library={editor.imageLibrary}
            currentUrl={effectiveUrl}
            canRemove={Boolean(effectiveUrl)}
            onSelect={(newUrl) => {
              if (newUrl === null) {
                remove();
              } else {
                editor.updateField(pageKey, noImagePath, null);
                editor.updateField(pageKey, path, newUrl);
              }
              setPickerOpen(false);
            }}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>
    );
  };

  if (effectiveUrl) {
    return wrap(
      // eslint-disable-next-line @next/next/no-img-element
      <img src={effectiveUrl} alt={alt} style={imgStyle} className={!isEditMode ? className : undefined} />,
    );
  }

  return wrap(children ?? null);
}
