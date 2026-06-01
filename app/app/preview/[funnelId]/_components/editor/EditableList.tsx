"use client";

import React, { useState } from "react";
import { useEditorOptional } from "./EditorContext";
import type { FunnelPageKey } from "@/lib/funnel-export/config";
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

  const wrap = (node: React.ReactNode) => {
    if (!isEditMode || !editor) return node;
    return (
      <div
        className={`editable-image-wrap${className ? ` ${className}` : ""}`}
        style={{
          position: "relative",
          outline: "1px dashed var(--accent-secondary-on-dark)",
          outlineOffset: 4,
        }}
      >
        {node}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            fontSize: 11,
            fontWeight: 700,
            background: "var(--surface-inverse)",
            color: "var(--text-inverse)",
            border: "none",
            padding: "4px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {url ? "Swap image" : "Add image"}
        </button>
        {pickerOpen && (
          <ImagePickerModal
            library={editor.imageLibrary}
            currentUrl={url}
            onSelect={(newUrl) => {
              editor.updateField(pageKey, path, newUrl);
              setPickerOpen(false);
            }}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>
    );
  };

  if (url) {
    return wrap(
      <img src={url} alt={alt} style={imgStyle} className={!isEditMode ? className : undefined} />,
    );
  }

  return wrap(children ?? null);
}
