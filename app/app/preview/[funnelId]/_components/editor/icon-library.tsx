"use client";

import React, { useState } from "react";
import { useEditorOptional } from "./EditorContext";
import { usePageContent } from "./PageContentContext";
import { getAtPath } from "@/lib/content-path";
import type { FunnelPageKey } from "@/lib/funnel-export/config";

/**
 * A small, curated icon set for bullet lists. Kept deliberately minimal (per the
 * meeting: a short list, not a huge library) so designers aren't overwhelmed.
 * Each entry is the inner SVG markup for a 24×24 stroke icon.
 */
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

export function renderIcon(name: string | undefined, size = 18): React.ReactNode {
  if (!name) return null;
  const svg = ICON_MAP.get(name);
  if (!svg) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      {svg}
    </svg>
  );
}

interface Props {
  pageKey: FunnelPageKey;
  /** Content path holding the chosen icon name. */
  path: string;
  /** Default marker rendered when no icon is chosen. */
  fallback: React.ReactNode;
  size?: number;
  exportMode?: boolean;
}

/**
 * Renders the chosen icon (or a fallback marker) and, in edit mode, lets the
 * user pick from the curated set or reset to the default.
 */
export default function EditableIcon({ pageKey, path, fallback, size = 18, exportMode = false }: Props) {
  const editor = useEditorOptional();
  const editMode = !exportMode && Boolean(editor?.isEditMode);
  const pageContent = usePageContent(pageKey);
  const [open, setOpen] = useState(false);

  const chosen = getAtPath(pageContent, path);
  const chosenName = typeof chosen === "string" && chosen ? chosen : undefined;
  const marker = chosenName ? renderIcon(chosenName, size) : fallback;

  if (!editMode || !editor) return <>{marker}</>;

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
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
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 4,
            padding: 8,
            width: 232,
            background: "rgba(20, 20, 18, 0.95)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {ICON_LIBRARY.map((icon) => {
            const active = icon.name === chosenName;
            return (
              <button
                key={icon.name}
                type="button"
                title={icon.label}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.updateField(pageKey, path, icon.name);
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
                {renderIcon(icon.name, 18)}
              </button>
            );
          })}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.updateField(pageKey, path, null);
              setOpen(false);
            }}
            style={{
              gridColumn: "1 / -1",
              marginTop: 2,
              padding: "5px 0",
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
