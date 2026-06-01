"use client";

import React, { useState } from "react";
import { useEditorOptional } from "./EditorContext";
import { usePageContent } from "./PageContentContext";
import { getAtPath } from "@/lib/content-path";
import ImagePickerModal from "./ImagePickerModal";
import {
  safeUrl,
  brandHeroOverlay,
  brandSectionOverlay,
  brandLightSectionOverlay,
  brandImageBackground,
} from "../funnel-types";
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

type OverlayKind = "hero" | "section" | "light" | "auto";

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
  /** Disable the per-section background-image control (e.g. the sticky bar). */
  noBackground?: boolean;
  /** Content path holding this section's background image URL.
   *  Defaults to `sectionBackgrounds.<sectionId>`. */
  backgroundPath?: string;
  /** Fallback image used when no override is set (e.g. a wizard image). */
  backgroundFallbackUrl?: string | null;
  /** Overlay scrim applied over the background image. "auto" picks by theme/base. */
  backgroundOverlay?: OverlayKind;
  /** Push the edit controls down (px) so they clear an overlapping fixed bar (e.g. the hero under the sticky bar). */
  controlsTopOffset?: number;
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

function resolveOverlay(kind: OverlayKind, base: Props["base"], theme: SectionTheme): string {
  if (kind === "hero") return brandHeroOverlay();
  if (kind === "section") return brandSectionOverlay();
  if (kind === "light") return brandLightSectionOverlay();
  // auto
  if (base === "hero") return brandHeroOverlay();
  if (theme === "light") return brandLightSectionOverlay();
  return brandSectionOverlay();
}

export default function EditableSection({
  pageKey,
  sectionId,
  theme,
  base = "plain",
  bgViaClass = false,
  noBackground = false,
  backgroundPath,
  backgroundFallbackUrl,
  backgroundOverlay = "auto",
  controlsTopOffset = 8,
  as = "section",
  id,
  className = "",
  style,
  exportMode = false,
  children,
}: Props) {
  const editor = useEditorOptional();
  const editMode = !exportMode && Boolean(editor?.isEditMode);
  const [pickerOpen, setPickerOpen] = useState(false);

  const bgPath = backgroundPath ?? `sectionBackgrounds.${sectionId}`;
  const pageContent = usePageContent(pageKey);
  const overrideUrl = safeUrl(getAtPath(pageContent, bgPath) as string | null | undefined);
  const bgUrl = overrideUrl ?? safeUrl(backgroundFallbackUrl ?? null);

  const styleHasOwnBg = Boolean(style?.backgroundImage);
  const showsBgImage = Boolean(bgUrl) && !styleHasOwnBg;

  const isStructural = base !== "plain";
  const composed = (
    (isStructural
      ? `${structuralSectionClass(base as "hero" | "final-vp" | "encourage", theme)} ${className}`
      : `${sectionThemeClass(theme)} ${className}`) + (showsBgImage ? " has-bg-image" : "")
  ).trim();

  const resolvedStyle: React.CSSProperties = { ...style };

  // Background image (override or fallback). Rather than painting it on the
  // element background — which structural sections (e.g. .hero) hide behind an
  // opaque ::before overlay — we render a dedicated absolutely-positioned layer
  // inside the section's own stacking context. It sits above the decorative
  // ::before/::after (negative z-index) but below the in-flow content, so the
  // image is reliably visible without depending on cached CSS.
  if (showsBgImage) {
    resolvedStyle.position = resolvedStyle.position ?? "relative";
    resolvedStyle.isolation = "isolate";
  } else if (!isStructural && !styleHasOwnBg && !bgViaClass) {
    // Plain section, no image → force the themed background inline so it always
    // wins over page-specific CSS background rules.
    resolvedStyle.background = themeBackground(theme);
  }

  const bgLayer = showsBgImage ? (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        backgroundImage: brandImageBackground(resolveOverlay(backgroundOverlay, base, theme), bgUrl!),
        backgroundSize: "cover",
        backgroundPosition: "center",
        pointerEvents: "none",
      }}
    />
  ) : null;

  const showBgControl = editMode && editor && !noBackground && !bgViaClass;

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
        flexWrap: "wrap",
        justifyContent: "flex-end",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <SectionThemeControl
        current={theme}
        onSelect={(t) => editor.updateField(pageKey, `sectionThemes.${sectionId}`, t)}
      />
      {showBgControl && (
        <BackgroundControl
          hasImage={Boolean(overrideUrl)}
          onOpen={() => setPickerOpen(true)}
          onRemove={() => editor.updateField(pageKey, bgPath, null)}
        />
      )}
    </div>
  ) : null;

  const picker =
    pickerOpen && editor ? (
      <ImagePickerModal
        library={editor.imageLibrary}
        currentUrl={overrideUrl}
        onSelect={(url) => {
          editor.updateField(pageKey, bgPath, url);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    ) : null;

  return React.createElement(
    as,
    { id, className: composed, style: resolvedStyle },
    bgLayer,
    controls,
    picker,
    children,
  );
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

function SectionThemeControl({
  current,
  onSelect,
}: {
  current: SectionTheme;
  onSelect: (theme: SectionTheme) => void;
}) {
  return (
    <div style={CONTROL_WRAP}>
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

function BackgroundControl({
  hasImage,
  onOpen,
  onRemove,
}: {
  hasImage: boolean;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const btn: React.CSSProperties = {
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
  return (
    <div style={CONTROL_WRAP}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpen();
        }}
        title="Set or swap this section's background image"
        style={btn}
      >
        {hasImage ? "Swap bg" : "+ Image"}
      </button>
      {hasImage && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          title="Remove background image"
          style={{ ...btn, color: "#f1b0b0" }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
