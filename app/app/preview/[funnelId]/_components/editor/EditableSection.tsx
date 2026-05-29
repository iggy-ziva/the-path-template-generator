"use client";

import React from "react";
import { useEditorOptional } from "./EditorContext";
import {
  sectionThemeClass,
  structuralSectionClass,
  type SectionTheme,
} from "@/lib/brand-surfaces";
import type { FunnelPageKey } from "@/lib/funnel-export/config";

const THEME_OPTIONS: { value: SectionTheme; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "accent", label: "Accent" },
  { value: "light", label: "Light" },
];

interface Props {
  pageKey: FunnelPageKey;
  /** Stable section id — used in content.sectionThemes and the updateField path. */
  sectionId: string;
  /** Resolved current theme (computed by the page from live content). */
  theme: SectionTheme;
  /** Structural base. "plain" sections get a generic themed background. */
  base?: "plain" | "hero" | "encourage" | "final-vp";
  /** Skip the inline background override and let CSS classes control it
   *  (used for the sticky bar, which has a bespoke translucent/blur look). */
  bgViaClass?: boolean;
  as?: "section" | "div";
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  exportMode?: boolean;
  children: React.ReactNode;
}

function themeBackground(theme: SectionTheme): string {
  if (theme === "dark") return "var(--surface-inverse)";
  if (theme === "accent") return "var(--surface-accent)";
  return "var(--surface-canvas)";
}

export default function EditableSection({
  pageKey,
  sectionId,
  theme,
  base = "plain",
  bgViaClass = false,
  as = "section",
  id,
  className = "",
  style,
  exportMode = false,
  children,
}: Props) {
  const editor = useEditorOptional();
  const editMode = !exportMode && Boolean(editor?.isEditMode);

  const isStructural = base !== "plain";
  const composed = (
    isStructural
      ? `${structuralSectionClass(base as "hero" | "final-vp" | "encourage", theme)} ${className}`
      : `${sectionThemeClass(theme)} ${className}`
  ).trim();

  // For plain sections without a background image, force the themed background
  // inline so it always wins over any page-specific CSS background rule
  // (funnel-pages.css loads after funnel-style.css and would otherwise win).
  const hasBgImage = Boolean(style?.backgroundImage);
  const resolvedStyle: React.CSSProperties = { ...style };
  if (!isStructural && !hasBgImage && !bgViaClass) {
    resolvedStyle.background = themeBackground(theme);
  }

  const controls = editMode && editor ? (
    <SectionThemeControl
      current={theme}
      onSelect={(t) => editor.updateField(pageKey, `sectionThemes.${sectionId}`, t)}
    />
  ) : null;

  return React.createElement(
    as,
    { id, className: composed, style: resolvedStyle },
    controls,
    children,
  );
}

function SectionThemeControl({
  current,
  onSelect,
}: {
  current: SectionTheme;
  onSelect: (theme: SectionTheme) => void;
}) {
  return (
    <div
      contentEditable={false}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 20,
        display: "inline-flex",
        gap: 2,
        padding: 3,
        borderRadius: 8,
        background: "rgba(20, 20, 18, 0.82)",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {THEME_OPTIONS.map((opt) => {
        const active = opt.value === current;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(opt.value);
            }}
            title={`Set section to ${opt.label.toLowerCase()}`}
            style={{
              padding: "3px 9px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1.4,
              color: active ? "#141412" : "#e8e4dd",
              background: active ? "#D4A878" : "transparent",
              transition: "background 120ms ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
