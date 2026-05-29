"use client";

import React, { useEffect, useId, useState } from "react";
import { useEditorOptional } from "./EditorContext";
import type { FunnelPageKey } from "@/lib/funnel-export/config";

type Tag = keyof React.JSX.IntrinsicElements;

interface Props {
  pageKey: FunnelPageKey;
  path: string;
  as?: Tag;
  className?: string;
  style?: React.CSSProperties;
  children: string;
  html?: boolean;
}

export default function EditableText({
  pageKey,
  path,
  as: Tag = "span",
  className,
  style,
  children,
  html = false,
}: Props) {
  const editor = useEditorOptional();
  const editId = useId();
  const [editing, setEditing] = useState(false);

  const isEditMode = editor?.isEditMode ?? false;
  const value = typeof children === "string" ? children : String(children ?? "");

  useEffect(() => {
    if (!editing) return;
    const el = document.getElementById(editId);
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [editing, editId]);

  if (!isEditMode || !editor) {
    if (html) {
      return React.createElement(Tag, {
        className,
        style,
        dangerouslySetInnerHTML: { __html: value },
      });
    }
    return React.createElement(Tag, { className, style }, value);
  }

  function commit(el: HTMLElement) {
    const next = el.innerText.trim();
    if (next !== value) editor!.updateField(pageKey, path, next);
    setEditing(false);
  }

  return React.createElement(Tag, {
    id: editId,
    className: `${className ?? ""} editable-field${editing ? " is-editing" : ""}`.trim(),
    style: {
      ...style,
      outline: editing ? "2px solid var(--accent-secondary-on-dark)" : undefined,
      outlineOffset: 2,
      cursor: "text",
    },
    contentEditable: editing,
    suppressContentEditableWarning: true,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      if (!editing) e.currentTarget.style.outline = "1px dashed var(--accent-secondary-on-dark)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      if (!editing) e.currentTarget.style.outline = "";
    },
    onClick: () => setEditing(true),
    onBlur: (e: React.FocusEvent<HTMLElement>) => commit(e.currentTarget),
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commit(e.currentTarget);
      }
      if (e.key === "Escape") {
        e.currentTarget.innerText = value;
        setEditing(false);
      }
    },
  }, value);
}
