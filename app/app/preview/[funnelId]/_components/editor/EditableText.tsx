"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorOptional } from "./EditorContext";
import { usePageContent } from "./PageContentContext";
import { getAtPath } from "@/lib/content-path";
import type { FunnelPageKey } from "@/lib/funnel-export/config";

type Tag = keyof React.JSX.IntrinsicElements;

interface TextStyleOverride {
  font?: string;
  color?: string;
}

interface Props {
  pageKey: FunnelPageKey;
  path: string;
  as?: Tag;
  className?: string;
  style?: React.CSSProperties;
  children: string;
  html?: boolean;
}

const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "Heading font", value: "var(--font-display)" },
  { label: "Body font", value: "var(--font-body)" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Sans", value: "Helvetica, Arial, sans-serif" },
  { label: "Mono", value: "'SF Mono', ui-monospace, monospace" },
];

const COLOR_OPTIONS: { label: string; value: string }[] = [
  { label: "Primary text", value: "var(--text-primary)" },
  { label: "Secondary text", value: "var(--text-secondary)" },
  { label: "Light text", value: "var(--text-inverse)" },
  { label: "Brand primary", value: "var(--accent-primary)" },
  { label: "Brand secondary", value: "var(--accent-secondary)" },
  { label: "Brand tertiary", value: "var(--accent-tertiary)" },
];

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
  const [hovered, setHovered] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const elRef = useRef<HTMLElement | null>(null);

  const isEditMode = editor?.isEditMode ?? false;
  const value = typeof children === "string" ? children : String(children ?? "");

  const pageContent = usePageContent(pageKey);
  const override = getAtPath(pageContent, `textStyles.${path}`) as TextStyleOverride | undefined;
  const overrideStyle: React.CSSProperties = {
    ...(override?.font ? { fontFamily: override.font } : null),
    ...(override?.color ? { color: override.color } : null),
  };

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

  // Non-editable render (view mode + export). Overrides still apply here.
  if (!isEditMode || !editor) {
    if (html) {
      return React.createElement(Tag, {
        className,
        style: { ...style, ...overrideStyle },
        dangerouslySetInnerHTML: { __html: value },
      });
    }
    return React.createElement(Tag, { className, style: { ...style, ...overrideStyle } }, value);
  }

  function commit(el: HTMLElement) {
    const next = el.innerText.trim();
    if (next !== value) editor!.updateField(pageKey, path, next);
    setEditing(false);
  }

  function openStylePopover() {
    const rect = elRef.current?.getBoundingClientRect();
    if (rect) setAnchor({ top: rect.top, left: rect.right });
    setStyleOpen(true);
  }

  function setOverride(patch: TextStyleOverride) {
    const nextFont = patch.font !== undefined ? patch.font : override?.font;
    const nextColor = patch.color !== undefined ? patch.color : override?.color;
    editor!.updateField(pageKey, `textStyles.${path}`, {
      ...(nextFont ? { font: nextFont } : null),
      ...(nextColor ? { color: nextColor } : null),
    });
  }

  const showStyleButton = (hovered || styleOpen) && !editing;

  const element = React.createElement(Tag, {
    id: editId,
    ref: (node: HTMLElement | null) => {
      elRef.current = node;
    },
    className: `${className ?? ""} editable-field${editing ? " is-editing" : ""}`.trim(),
    style: {
      ...style,
      ...overrideStyle,
      outline: editing ? "2px solid var(--accent-secondary-on-dark)" : undefined,
      outlineOffset: 2,
      cursor: "text",
    },
    contentEditable: editing,
    suppressContentEditableWarning: true,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      setHovered(true);
      if (!editing) e.currentTarget.style.outline = "1px dashed var(--accent-secondary-on-dark)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      setHovered(false);
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

  return (
    <>
      {element}
      {showStyleButton && (
        <StyleButtonPortal
          el={elRef.current}
          onOpen={openStylePopover}
          onHoverChange={setHovered}
        />
      )}
      {styleOpen && anchor && (
        <TextStylePopover
          anchor={anchor}
          current={override}
          onPickFont={(font) => setOverride({ font })}
          onPickColor={(color) => setOverride({ color })}
          onReset={() => editor!.updateField(pageKey, `textStyles.${path}`, undefined)}
          onClose={() => setStyleOpen(false)}
        />
      )}
    </>
  );
}

function StyleButtonPortal({
  el,
  onOpen,
  onHoverChange,
}: {
  el: HTMLElement | null;
  onOpen: () => void;
  onHoverChange: (v: boolean) => void;
}) {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return createPortal(
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpen();
      }}
      title="Change font & colour"
      style={{
        position: "fixed",
        top: Math.max(2, rect.top + 2),
        left: rect.right - 2,
        zIndex: 2147482000,
        transform: "translate(-100%, 0)",
        fontSize: 11,
        fontWeight: 800,
        lineHeight: 1,
        padding: "4px 7px",
        borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(20,20,18,0.9)",
        color: "#e8e4dd",
        cursor: "pointer",
        boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
      }}
    >
      Aa
    </button>,
    document.body,
  );
}

function TextStylePopover({
  anchor,
  current,
  onPickFont,
  onPickColor,
  onReset,
  onClose,
}: {
  anchor: { top: number; left: number };
  current: TextStyleOverride | undefined;
  onPickFont: (font: string) => void;
  onPickColor: (color: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const top = Math.min(anchor.top + 6, window.innerHeight - 320);
  const left = Math.min(anchor.left, window.innerWidth - 250);

  return createPortal(
    <div
      ref={ref}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "fixed",
        top: Math.max(8, top),
        left: Math.max(8, left),
        zIndex: 2147483000,
        width: 232,
        background: "#fff",
        color: "#222",
        borderRadius: 12,
        boxShadow: "0 16px 50px rgba(0,0,0,0.28)",
        border: "1px solid #ececec",
        padding: 14,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
        Font
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {FONT_OPTIONS.map((f) => {
          const active = current?.font === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => onPickFont(f.value)}
              style={{
                fontSize: 12,
                fontFamily: f.value,
                padding: "5px 9px",
                borderRadius: 7,
                border: active ? "2px solid #111" : "1px solid #ddd",
                background: active ? "#f4f0ea" : "#fff",
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
        Colour
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 14 }}>
        {COLOR_OPTIONS.map((col) => {
          const active = current?.color === col.value;
          return (
            <button
              key={col.value}
              type="button"
              title={col.label}
              onClick={() => onPickColor(col.value)}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: col.value,
                border: active ? "2px solid #111" : "1px solid #ccc",
                outline: active ? "2px solid #fff" : "none",
                outlineOffset: -3,
                cursor: "pointer",
              }}
            />
          );
        })}
        <label
          title="Custom colour"
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "1px dashed #aaa",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
            position: "relative",
            fontSize: 13,
            color: "#888",
          }}
        >
          +
          <input
            type="color"
            onChange={(e) => onPickColor(e.target.value)}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
          />
        </label>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#a33",
            background: "none",
            border: "1px solid #eedede",
            borderRadius: 7,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            background: "#111",
            border: "none",
            borderRadius: 7,
            padding: "6px 14px",
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>,
    document.body,
  );
}
