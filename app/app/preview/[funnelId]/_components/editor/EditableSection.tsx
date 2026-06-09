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

// Section vertical-padding ladder — snaps to the design-token scale so spacing
// stays on-grid. 128px (--s-10) is the global section default.
const PADDING_STEPS = [0, 48, 64, 96, 128, 160, 200];
const PADDING_DEFAULT = 128;
const PADDING_MOBILE_CAP = 96;

function stepPadding(current: number, dir: 1 | -1): number {
  // Snap current to the nearest rung, then move one step.
  let idx = 0;
  let best = Infinity;
  PADDING_STEPS.forEach((v, i) => {
    const d = Math.abs(v - current);
    if (d < best) { best = d; idx = i; }
  });
  const next = Math.min(PADDING_STEPS.length - 1, Math.max(0, idx + dir));
  return PADDING_STEPS[next];
}

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
  /** Optional guidance (recommended dimensions) shown in the image picker. */
  bgDimensionHint?: string;
  /** Push the edit controls down (px) so they clear an overlapping fixed bar (e.g. the hero under the sticky bar). */
  controlsTopOffset?: number;
  /** Whether the section can be removed/hidden from the editor. Defaults to true. */
  deletable?: boolean;
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
  // A light section must always get a light scrim, otherwise a dark hero/section
  // overlay would defeat the light theme even when an explicit overlay kind is set.
  if (theme === "light") return brandLightSectionOverlay();
  if (kind === "hero") return brandHeroOverlay();
  if (kind === "section") return brandSectionOverlay();
  if (kind === "light") return brandLightSectionOverlay();
  // auto
  if (base === "hero") return brandHeroOverlay();
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
  bgDimensionHint,
  controlsTopOffset = 8,
  deletable = true,
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
  const [hovered, setHovered] = useState(false);

  const bgPath = backgroundPath ?? `sectionBackgrounds.${sectionId}`;
  const pageContent = usePageContent(pageKey);
  const overrideUrl = safeUrl(getAtPath(pageContent, bgPath) as string | null | undefined);
  const bgUrl = overrideUrl ?? safeUrl(backgroundFallbackUrl ?? null);

  // Per-section padding overrides (top/bottom, px). Unset = inherit CSS default.
  const padTopRaw = getAtPath(pageContent, `sectionPadding.${sectionId}.top`);
  const padBottomRaw = getAtPath(pageContent, `sectionPadding.${sectionId}.bottom`);
  const padTop = typeof padTopRaw === "number" ? padTopRaw : undefined;
  const padBottom = typeof padBottomRaw === "number" ? padBottomRaw : undefined;
  const hasPadOverride = padTop !== undefined || padBottom !== undefined;
  const padClass = hasPadOverride
    ? `sp-${pageKey}-${sectionId}`.replace(/[^a-zA-Z0-9_-]/g, "-")
    : "";
  const setPad = (edge: "top" | "bottom", value: number) =>
    editor?.updateField(pageKey, `sectionPadding.${sectionId}.${edge}`, value);

  // Hidden/removed section state.
  const hidden = deletable && Boolean(getAtPath(pageContent, `hiddenSections.${sectionId}`));
  const toggleHidden = () =>
    editor?.updateField(pageKey, `hiddenSections.${sectionId}`, !hidden);

  // Outside edit mode (live preview + export) a hidden section renders nothing.
  if (hidden && !editMode) return null;

  const styleHasOwnBg = Boolean(style?.backgroundImage);
  const showsBgImage = Boolean(bgUrl) && !styleHasOwnBg;

  const isStructural = base !== "plain";
  const composed = (
    (isStructural
      ? `${structuralSectionClass(base as "hero" | "final-vp" | "encourage", theme)} ${className}`
      : `${sectionThemeClass(theme)} ${className}`)
      + (showsBgImage ? " has-bg-image" : "")
      + (padClass ? ` ${padClass}` : "")
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
  // Ensure the absolutely-positioned edit controls/handles anchor to this section.
  if (editMode) resolvedStyle.position = resolvedStyle.position ?? "relative";
  if (hidden && editMode) {
    resolvedStyle.outline = "2px dashed rgba(193, 122, 67, 0.85)";
    resolvedStyle.outlineOffset = -4;
  }

  // Scoped padding override (desktop + mobile cap). Rendered in both preview and
  // export so the chosen spacing persists in the published page.
  const padStyleEl = hasPadOverride ? (
    <style
      dangerouslySetInnerHTML={{
        __html:
          `.${padClass}{` +
          (padTop !== undefined ? `padding-top:${padTop}px!important;` : "") +
          (padBottom !== undefined ? `padding-bottom:${padBottom}px!important;` : "") +
          `}` +
          `@media(max-width:768px){.${padClass}{` +
          (padTop !== undefined ? `padding-top:min(${padTop}px,${PADDING_MOBILE_CAP}px)!important;` : "") +
          (padBottom !== undefined ? `padding-bottom:min(${padBottom}px,${PADDING_MOBILE_CAP}px)!important;` : "") +
          `}}`,
      }}
    />
  ) : null;

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
      {deletable && <DeleteControl onRemove={toggleHidden} />}
    </div>
  ) : null;

  // When a section is hidden in edit mode we dim it with a scrim and offer a
  // single, prominent restore action (other controls are suppressed).
  const hiddenOverlay = hidden && editMode ? (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 60,
          background: "color-mix(in srgb, var(--surface-canvas) 55%, transparent)",
          pointerEvents: "none",
        }}
      />
      <div
        contentEditable={false}
        style={{
          position: "absolute",
          top: controlsTopOffset,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 131,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 8,
          background: "rgba(20, 20, 18, 0.9)",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          fontSize: 11,
          fontWeight: 700,
          color: "#e8e4dd",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>Section hidden</span>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHidden(); }}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            color: "#141412",
            background: "#D4A878",
          }}
        >
          Restore section
        </button>
      </div>
    </>
  ) : null;

  const picker =
    pickerOpen && editor ? (
      <ImagePickerModal
        library={editor.imageLibrary}
        currentUrl={overrideUrl}
        dimensionHint={bgDimensionHint}
        onSelect={(url) => {
          editor.updateField(pageKey, bgPath, url);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    ) : null;

  const paddingHandles = editMode && editor && hovered ? (
    <>
      <PaddingHandle
        edge="top"
        value={padTop ?? PADDING_DEFAULT}
        isSet={padTop !== undefined}
        onStep={(dir) => setPad("top", stepPadding(padTop ?? PADDING_DEFAULT, dir))}
      />
      <PaddingHandle
        edge="bottom"
        value={padBottom ?? PADDING_DEFAULT}
        isSet={padBottom !== undefined}
        onStep={(dir) => setPad("bottom", stepPadding(padBottom ?? PADDING_DEFAULT, dir))}
      />
    </>
  ) : null;

  const domProps: Record<string, unknown> = { id, className: composed, style: resolvedStyle };
  if (editMode) {
    domProps.onMouseEnter = () => setHovered(true);
    domProps.onMouseLeave = () => setHovered(false);
  }

  return React.createElement(
    as,
    domProps,
    padStyleEl,
    bgLayer,
    hidden ? hiddenOverlay : controls,
    hidden ? null : paddingHandles,
    picker,
    children,
  );
}

function PaddingHandle({
  edge,
  value,
  isSet,
  onStep,
}: {
  edge: "top" | "bottom";
  value: number;
  isSet: boolean;
  onStep: (dir: 1 | -1) => void;
}) {
  const wrap: React.CSSProperties = {
    position: "absolute",
    [edge]: 6,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 129,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 6px",
    borderRadius: 8,
    background: "rgba(20, 20, 18, 0.82)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
    opacity: 0.5,
    transition: "opacity 120ms ease",
  };
  const btn: React.CSSProperties = {
    width: 20,
    height: 20,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1,
    color: "#141412",
    background: "#D4A878",
  };
  const label: React.CSSProperties = {
    minWidth: 64,
    textAlign: "center",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.02em",
    color: "#e8e4dd",
  };
  return (
    <div
      contentEditable={false}
      style={wrap}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0.5"; }}
    >
      <button
        type="button"
        style={btn}
        title={`Decrease ${edge} padding`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStep(-1); }}
      >
        −
      </button>
      <span style={label}>
        {edge === "top" ? "Top" : "Bottom"} {value}px{isSet ? "" : " ·"}
      </span>
      <button
        type="button"
        style={btn}
        title={`Increase ${edge} padding`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStep(1); }}
      >
        +
      </button>
    </div>
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

function DeleteControl({ onRemove }: { onRemove: () => void }) {
  return (
    <div style={CONTROL_WRAP}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        title="Remove this section (reversible)"
        style={{
          padding: "3px 9px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.02em",
          lineHeight: 1.4,
          color: "#f1b0b0",
          background: "transparent",
        }}
      >
        Remove
      </button>
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
