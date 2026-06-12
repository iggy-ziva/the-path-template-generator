"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useEditorOptional } from "./EditorContext";
import { usePageContent } from "./PageContentContext";
import { getAtPath } from "@/lib/content-path";
import ImagePickerModal from "./ImagePickerModal";
import {
  safeUrl,
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

/** Stored overlay strength values — "auto" defers to the theme/base default. */
type OverlayStrength = "auto" | "none" | "light" | "medium" | "heavy";
const OVERLAY_STRENGTHS: { value: OverlayStrength; label: string; opacity: number | null }[] = [
  { value: "auto",   label: "Auto",  opacity: null },
  { value: "none",   label: "None",  opacity: 0 },
  { value: "light",  label: "Light", opacity: 0.35 },
  { value: "medium", label: "Med",   opacity: 0.60 },
  { value: "heavy",  label: "Heavy", opacity: 0.82 },
];

// Quick presets map to focal-point X/Y percentages.
const POSITION_PRESETS: { label: string; x: number; y: number }[] = [
  { label: "Top",    x: 50, y: 0   },
  { label: "Center", x: 50, y: 50  },
  { label: "Bottom", x: 50, y: 100 },
];

function legacyPresetToXY(preset: string | undefined): { x: number; y: number } {
  if (preset === "top") return { x: 50, y: 0 };
  if (preset === "bottom") return { x: 50, y: 100 };
  return { x: 50, y: 50 };
}

// Map a preset strength to an approximate opacity %, used to seed the custom
// opacity slider before the user has dragged it.
function presetToOpacityPct(strength: string | undefined): number {
  const opt = OVERLAY_STRENGTHS.find((o) => o.value === strength);
  if (opt && opt.opacity !== null) return Math.round(opt.opacity * 100);
  return 82; // "auto"/unset → section default scrim strength
}

// Overlay gradient direction. "right" (left→right) is the default — strongest
// scrim on the left where headline/CTA text usually sits, fading across.
type OverlayDirection = "right" | "left" | "bottom" | "top" | "even";
const OVERLAY_DIRECTION_DEFAULT: OverlayDirection = "right";
const OVERLAY_DIRECTIONS: { value: OverlayDirection; label: string; css: string | null }[] = [
  { value: "right",  label: "→",    css: "to right"  },
  { value: "left",   label: "←",    css: "to left"   },
  { value: "bottom", label: "↓",    css: "to bottom" },
  { value: "top",    label: "↑",    css: "to top"    },
  { value: "even",   label: "Even", css: null        },
];

const OVERLAY_CENTER_DEFAULT = 50; // where the fade band is centered (% along axis)

// Build a directional scrim that fades from the chosen opacity (strong end) to
// near-transparent across the direction. `centerPct` positions the middle of the
// fade band along the axis. "even" produces a flat uniform scrim.
function directionalOverlay(
  direction: OverlayDirection,
  opacity: number,
  theme: SectionTheme,
  centerPct: number,
): string {
  const surface = theme === "light" ? "--surface-canvas" : "--surface-inverse";
  const strong = Math.round(Math.min(1, Math.max(0, opacity)) * 100);
  if (direction === "even") {
    return `linear-gradient(color-mix(in srgb, var(${surface}) ${strong}%, transparent), color-mix(in srgb, var(${surface}) ${strong}%, transparent))`;
  }
  const css = OVERLAY_DIRECTIONS.find((d) => d.value === direction)?.css ?? "to right";
  const weak = Math.round(strong * 0.12);
  // A ~50%-wide fade band centered on centerPct: strong holds up to (c-25),
  // fades through to weak by (c+25).
  const c = Math.min(100, Math.max(0, centerPct));
  const holdEnd = Math.max(0, c - 25);
  const fadeEnd = Math.min(100, c + 25);
  return (
    `linear-gradient(${css}, ` +
    `color-mix(in srgb, var(${surface}) ${strong}%, transparent) 0%, ` +
    `color-mix(in srgb, var(${surface}) ${strong}%, transparent) ${holdEnd}%, ` +
    `color-mix(in srgb, var(${surface}) ${weak}%, transparent) ${fadeEnd}%, ` +
    `color-mix(in srgb, var(${surface}) ${weak}%, transparent) 100%)`
  );
}

function buildOverlayGradient(
  strength: string | undefined,
  overlayKind: OverlayKind,
  base: "plain" | "hero" | "encourage" | "final-vp" | undefined,
  theme: SectionTheme,
  customOpacityPct: number | undefined,
  direction: OverlayDirection,
  centerPct: number,
): string | null {
  // Resolve the effective opacity from the custom slider or the preset.
  let opacity: number | null = null;
  if (typeof customOpacityPct === "number") {
    if (customOpacityPct <= 0) return null;
    opacity = customOpacityPct / 100;
  } else if (strength === "none") {
    return null;
  } else if (strength && strength !== "auto") {
    const opt = OVERLAY_STRENGTHS.find((o) => o.value === strength);
    if (opt && opt.opacity !== null) opacity = opt.opacity;
  }
  // "auto"/unset → the section's default scrim strength.
  if (opacity === null) opacity = 0.82;
  return directionalOverlay(direction, opacity, theme, centerPct);
}

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
  /** When true, skip the edit-mode `position: relative` inline override (use for fixed/sticky elements whose CSS position must not be overridden). */
  noPositionOverride?: boolean;
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
  noBackground = false,
  backgroundPath,
  backgroundFallbackUrl,
  backgroundOverlay = "auto",
  bgDimensionHint,
  controlsTopOffset = 8,
  deletable = true,
  noPositionOverride = false,
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
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const bgPath = backgroundPath ?? `sectionBackgrounds.${sectionId}`;
  const mobileBgPath = `sectionBackgroundsMobile.${sectionId}`;
  const bgNoImagePath = `sectionBgNoImage.${sectionId}`;
  const pageContent = usePageContent(pageKey);
  const overrideUrl = safeUrl(getAtPath(pageContent, bgPath) as string | null | undefined);
  const bgNoImage = Boolean(getAtPath(pageContent, bgNoImagePath));
  const bgUrl = bgNoImage ? null : (overrideUrl ?? safeUrl(backgroundFallbackUrl ?? null));
  const mobileBgUrl = safeUrl(getAtPath(pageContent, mobileBgPath) as string | null | undefined);
  const overlayStrength = getAtPath(pageContent, `sectionBgOverlayStrength.${sectionId}`) as string | undefined;
  const overlayOpacityRaw = getAtPath(pageContent, `sectionBgOverlayOpacity.${sectionId}`);
  const overlayOpacity = typeof overlayOpacityRaw === "number" ? overlayOpacityRaw : undefined;
  const overlayDirection = (getAtPath(pageContent, `sectionBgOverlayDirection.${sectionId}`) as OverlayDirection | undefined) ?? OVERLAY_DIRECTION_DEFAULT;
  const overlayCenterRaw = getAtPath(pageContent, `sectionBgOverlayCenter.${sectionId}`);
  const overlayCenter = typeof overlayCenterRaw === "number" ? overlayCenterRaw : OVERLAY_CENTER_DEFAULT;
  const bgPosition = (getAtPath(pageContent, `sectionBgPosition.${sectionId}`) as string | undefined) ?? "center";
  // Granular focal point (0–100%). Falls back to the legacy preset when unset so
  // older funnels keep their chosen Top/Center/Bottom alignment.
  const presetXY = legacyPresetToXY(bgPosition);
  const posXRaw = getAtPath(pageContent, `sectionBgPosX.${sectionId}`);
  const posYRaw = getAtPath(pageContent, `sectionBgPosY.${sectionId}`);
  const posX = typeof posXRaw === "number" ? posXRaw : presetXY.x;
  const posY = typeof posYRaw === "number" ? posYRaw : presetXY.y;

  // Mobile overrides for overlay + focal point. Each falls back to the desktop
  // value when unset, so a section reads identically on phones until the editor
  // explicitly tunes the mobile view (these are stored under *Mobile keys).
  const overlayStrengthMobileRaw = getAtPath(pageContent, `sectionBgOverlayStrengthMobile.${sectionId}`) as string | undefined;
  const overlayStrengthMobile = overlayStrengthMobileRaw ?? overlayStrength;
  const overlayOpacityMobileRaw = getAtPath(pageContent, `sectionBgOverlayOpacityMobile.${sectionId}`);
  const overlayOpacityMobile = typeof overlayOpacityMobileRaw === "number" ? overlayOpacityMobileRaw : undefined;
  const overlayDirectionMobile = (getAtPath(pageContent, `sectionBgOverlayDirectionMobile.${sectionId}`) as OverlayDirection | undefined) ?? overlayDirection;
  const overlayCenterMobileRaw = getAtPath(pageContent, `sectionBgOverlayCenterMobile.${sectionId}`);
  const overlayCenterMobile = typeof overlayCenterMobileRaw === "number" ? overlayCenterMobileRaw : overlayCenter;
  const posXMobileRaw = getAtPath(pageContent, `sectionBgPosXMobile.${sectionId}`);
  const posYMobileRaw = getAtPath(pageContent, `sectionBgPosYMobile.${sectionId}`);
  const posXMobile = typeof posXMobileRaw === "number" ? posXMobileRaw : posX;
  const posYMobile = typeof posYMobileRaw === "number" ? posYMobileRaw : posY;

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
  // Skip for fixed/sticky sections (noPositionOverride) to avoid collapsing them into document flow.
  if (editMode && !noPositionOverride) resolvedStyle.position = resolvedStyle.position ?? "relative";
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

  // Background image layer. Desktop styles live on the base class; a mobile
  // media query overrides the overlay gradient, image (portrait crop) and focal
  // point independently, since framing/overlay that works on wide screens often
  // doesn't translate to a tall phone viewport.
  const bgLayerClass = showsBgImage
    ? `bgl-${pageKey}-${sectionId}`.replace(/[^a-zA-Z0-9_-]/g, "-")
    : "";
  const overlayGradientDesktop = showsBgImage
    ? buildOverlayGradient(overlayStrength, backgroundOverlay, base, theme, overlayOpacity, overlayDirection, overlayCenter)
    : null;
  // Resolve the effective overlay opacity used for the mobile gradient. When the
  // editor explicitly chose a mobile preset (strength set, opacity cleared) we
  // let that preset drive; only when nothing mobile-specific is set do we mirror
  // the desktop custom opacity, so the two views render identically by default.
  const mobileHasOwnOverlay = overlayStrengthMobileRaw !== undefined || overlayOpacityMobile !== undefined;
  const mobileOverlayCustom =
    overlayOpacityMobile !== undefined ? overlayOpacityMobile
    : overlayStrengthMobileRaw !== undefined ? undefined
    : overlayOpacity;
  const overlayGradientMobile = showsBgImage
    ? buildOverlayGradient(overlayStrengthMobile, backgroundOverlay, base, theme, mobileOverlayCustom, overlayDirectionMobile, overlayCenterMobile)
    : null;
  const mobileImgUrl = mobileBgUrl ?? bgUrl;
  const desktopBgImage = showsBgImage
    ? (overlayGradientDesktop ? brandImageBackground(overlayGradientDesktop, bgUrl!) : `url(${bgUrl})`)
    : undefined;
  const mobileBgImage = showsBgImage
    ? (overlayGradientMobile ? brandImageBackground(overlayGradientMobile, mobileImgUrl!) : `url(${mobileImgUrl})`)
    : undefined;

  const bgLayerEl = showsBgImage ? (
    <>
      <style dangerouslySetInnerHTML={{ __html:
        `.${bgLayerClass}{background-image:${desktopBgImage};background-size:cover;background-position:${posX}% ${posY}%}` +
        `@media(max-width:768px){.${bgLayerClass}{background-image:${mobileBgImage};background-position:${posXMobile}% ${posYMobile}%}}`
      }} />
      <div
        aria-hidden
        className={bgLayerClass}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
    </>
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
          hasImage={Boolean(bgUrl) || bgNoImage}
          hasMobileImage={Boolean(mobileBgUrl)}
          desktop={{
            overlayStrength: (overlayStrength as OverlayStrength | undefined) ?? "auto",
            overlayOpacity: overlayOpacity ?? presetToOpacityPct(overlayStrength),
            hasCustomOpacity: overlayOpacity !== undefined,
            overlayDirection,
            overlayCenter,
            posX,
            posY,
          }}
          mobile={{
            overlayStrength: (overlayStrengthMobile as OverlayStrength | undefined) ?? "auto",
            overlayOpacity:
              overlayOpacityMobile !== undefined
                ? overlayOpacityMobile
                : mobileHasOwnOverlay
                  ? presetToOpacityPct(overlayStrengthMobile)
                  : (overlayOpacity ?? presetToOpacityPct(overlayStrength)),
            hasCustomOpacity: mobileHasOwnOverlay ? overlayOpacityMobile !== undefined : overlayOpacity !== undefined,
            overlayDirection: overlayDirectionMobile,
            overlayCenter: overlayCenterMobile,
            posX: posXMobile,
            posY: posYMobile,
          }}
          onOpen={() => setPickerOpen(true)}
          onRemove={() => {
            // Only set the flag — preserve URL so Restore can bring the image back.
            editor.updateField(pageKey, bgNoImagePath, true);
          }}
          onOpenMobile={() => setMobilePickerOpen(true)}
          onRemoveMobile={() => editor.updateField(pageKey, mobileBgPath, null)}
          onOverlayChange={(device, s) => {
            // Selecting a preset clears any custom opacity so presets behave predictably.
            const sfx = device === "mobile" ? "Mobile" : "";
            editor.updateField(pageKey, `sectionBgOverlayStrength${sfx}.${sectionId}`, s);
            editor.updateField(pageKey, `sectionBgOverlayOpacity${sfx}.${sectionId}`, null);
          }}
          onOverlayOpacityChange={(device, o) => editor.updateField(pageKey, `sectionBgOverlayOpacity${device === "mobile" ? "Mobile" : ""}.${sectionId}`, o)}
          onOverlayDirectionChange={(device, d) => editor.updateField(pageKey, `sectionBgOverlayDirection${device === "mobile" ? "Mobile" : ""}.${sectionId}`, d)}
          onOverlayCenterChange={(device, v) => editor.updateField(pageKey, `sectionBgOverlayCenter${device === "mobile" ? "Mobile" : ""}.${sectionId}`, v)}
          onPosXChange={(device, x) => editor.updateField(pageKey, `sectionBgPosX${device === "mobile" ? "Mobile" : ""}.${sectionId}`, x)}
          onPosYChange={(device, y) => editor.updateField(pageKey, `sectionBgPosY${device === "mobile" ? "Mobile" : ""}.${sectionId}`, y)}
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
        canRemove={Boolean(bgUrl) || bgNoImage}
        dimensionHint={bgDimensionHint}
        onSelect={(url) => {
          if (url === null) {
            // Only set the flag — preserve URL so Restore can bring the image back.
            editor.updateField(pageKey, bgNoImagePath, true);
          } else {
            // New image chosen — clear noImage flag and store the URL.
            editor.updateField(pageKey, bgNoImagePath, false);
            editor.updateField(pageKey, bgPath, url);
          }
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    ) : null;

  const mobilePicker =
    mobilePickerOpen && editor ? (
      <ImagePickerModal
        library={editor.imageLibrary}
        currentUrl={mobileBgUrl}
        dimensionHint="Mobile background — recommended: 800×1200px (portrait), under 500 KB."
        onSelect={(url) => {
          editor.updateField(pageKey, mobileBgPath, url);
          setMobilePickerOpen(false);
        }}
        onClose={() => setMobilePickerOpen(false)}
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
    bgLayerEl,
    hidden ? hiddenOverlay : controls,
    hidden ? null : paddingHandles,
    picker,
    mobilePicker,
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

function PositionSlider({
  label,
  leftHint,
  rightHint,
  value,
  onChange,
}: {
  label: string;
  leftHint: string;
  rightHint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(232,228,221,0.6)" }}>
          {label} ({leftHint} ↔ {rightHint})
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#D4A878", minWidth: 28, textAlign: "right" }}>
          {Math.round(value)}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", accentColor: "#D4A878", cursor: "pointer", display: "block" }}
      />
    </div>
  );
}

type BgDevice = "desktop" | "mobile";

type BgDeviceSettings = {
  overlayStrength: OverlayStrength;
  overlayOpacity: number;
  hasCustomOpacity: boolean;
  overlayDirection: OverlayDirection;
  overlayCenter: number;
  posX: number;
  posY: number;
};

function BackgroundControl({
  hasImage,
  hasMobileImage,
  desktop,
  mobile,
  onOpen,
  onRemove,
  onOpenMobile,
  onRemoveMobile,
  onOverlayChange,
  onOverlayOpacityChange,
  onOverlayDirectionChange,
  onOverlayCenterChange,
  onPosXChange,
  onPosYChange,
}: {
  hasImage: boolean;
  hasMobileImage: boolean;
  desktop: BgDeviceSettings;
  mobile: BgDeviceSettings;
  onOpen: () => void;
  onRemove: () => void;
  onOpenMobile: () => void;
  onRemoveMobile: () => void;
  onOverlayChange: (device: BgDevice, s: OverlayStrength) => void;
  onOverlayOpacityChange: (device: BgDevice, o: number) => void;
  onOverlayDirectionChange: (device: BgDevice, d: OverlayDirection) => void;
  onOverlayCenterChange: (device: BgDevice, v: number) => void;
  onPosXChange: (device: BgDevice, x: number) => void;
  onPosYChange: (device: BgDevice, y: number) => void;
}) {
  const [device, setDevice] = useState<BgDevice>("desktop");
  const s = device === "mobile" ? mobile : desktop;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; right: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const openSettings = useCallback(() => {
    if (dotsRef.current) {
      const rect = dotsRef.current.getBoundingClientRect();
      // Clamp into the viewport so the panel is never positioned off-screen
      // (e.g. when the section is scrolled so its controls sit above the fold).
      const top = Math.min(Math.max(rect.bottom + 6, 8), window.innerHeight - 260);
      const right = Math.min(Math.max(window.innerWidth - rect.right, 8), window.innerWidth - 300);
      setPanelPos({ top, right });
    }
    setSettingsOpen(true);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        dotsRef.current && !dotsRef.current.contains(e.target as Node)
      ) setSettingsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [settingsOpen]);

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

  const settingsPanel: React.CSSProperties = {
    position: "fixed",
    top: panelPos?.top ?? 0,
    right: panelPos?.right ?? 0,
    zIndex: 2147483001,
    background: "rgba(20,20,18,0.97)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 10,
    boxShadow: "0 8px 28px rgba(0,0,0,0.55)",
    backdropFilter: "blur(8px)",
    padding: "10px 12px",
    display: "grid",
    gap: 8,
    minWidth: 280,
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  const rowLabel: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "rgba(232,228,221,0.45)",
    marginBottom: 3,
    display: "block",
  };

  const optionBtn = (active: boolean): React.CSSProperties => ({
    padding: "3px 8px",
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1.4,
    color: active ? "#141412" : "#e8e4dd",
    background: active ? "#D4A878" : "transparent",
    transition: "background 100ms ease",
  });

  const panel = mounted && settingsOpen && hasImage && panelPos
    ? createPortal(
        <div ref={ref} style={settingsPanel} onClick={(e) => e.stopPropagation()}>
          {/* Device toggle — overlay & position are tuned independently per device */}
          <div style={{ display: "flex", gap: 2, padding: 2, background: "rgba(255,255,255,0.05)", borderRadius: 7 }}>
            {(["desktop", "mobile"] as BgDevice[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                style={{ ...optionBtn(device === d), flex: 1, padding: "5px 8px", textTransform: "capitalize" }}
              >
                {d === "desktop" ? "Desktop" : "Mobile"}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 9, color: "rgba(232,228,221,0.4)", lineHeight: 1.4, marginTop: -2 }}>
            {device === "mobile"
              ? "Overlay & position below apply to phones (≤768px). Inherits desktop until changed."
              : "Overlay & position below apply to tablets & desktop."}
          </span>

          {/* Overlay strength — quick presets + granular opacity slider */}
          <div>
            <span style={rowLabel}>Overlay</span>
            <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
              {OVERLAY_STRENGTHS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onOverlayChange(device, opt.value)}
                  style={optionBtn(!s.hasCustomOpacity && s.overlayStrength === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <PositionSlider
              label="Opacity"
              leftHint="Clear"
              rightHint="Solid"
              value={s.overlayOpacity}
              onChange={(o) => onOverlayOpacityChange(device, o)}
            />
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(232,228,221,0.6)", display: "block", marginBottom: 3 }}>
                Direction
              </span>
              <div style={{ display: "flex", gap: 2 }}>
                {OVERLAY_DIRECTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onOverlayDirectionChange(device, opt.value)}
                    title={`Fade ${opt.value === "even" ? "evenly" : opt.css?.replace("to ", "toward the ")}`}
                    style={optionBtn(s.overlayDirection === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {s.overlayDirection !== "even" && (
              <div style={{ marginTop: 6 }}>
                <PositionSlider
                  label="Center"
                  leftHint="Start"
                  rightHint="End"
                  value={s.overlayCenter}
                  onChange={(v) => onOverlayCenterChange(device, v)}
                />
              </div>
            )}
          </div>

          {/* Background position — quick presets + granular X/Y focal point */}
          <div>
            <span style={rowLabel}>Position</span>
            <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
              {POSITION_PRESETS.map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => { onPosXChange(device, opt.x); onPosYChange(device, opt.y); }}
                  style={optionBtn(s.posX === opt.x && s.posY === opt.y)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <PositionSlider label="Horizontal" leftHint="Left" rightHint="Right" value={s.posX} onChange={(x) => onPosXChange(device, x)} />
            <PositionSlider label="Vertical" leftHint="Top" rightHint="Bottom" value={s.posY} onChange={(y) => onPosYChange(device, y)} />
          </div>

          {/* Mobile image */}
          <div>
            <span style={rowLabel}>Mobile version</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                type="button"
                onClick={onOpenMobile}
                style={{
                  ...btn,
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  color: hasMobileImage ? "#D4A878" : "#e8e4dd",
                }}
              >
                {hasMobileImage ? "Swap mobile" : "+ Upload mobile"}
              </button>
              {hasMobileImage && (
                <button
                  type="button"
                  onClick={onRemoveMobile}
                  title="Remove mobile background"
                  style={{ ...btn, color: "#f1b0b0", padding: "4px 8px" }}
                >
                  ✕
                </button>
              )}
              {!hasMobileImage && (
                <span style={{ fontSize: 9, color: "rgba(232,228,221,0.35)", lineHeight: 1.4, maxWidth: 130 }}>
                  Portrait crop shown on phones
                </span>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div style={{ position: "relative" }}>
        <div style={CONTROL_WRAP}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen(); }}
            title="Set or swap this section's background image"
            style={btn}
          >
            {hasImage ? "Swap bg" : "+ Image"}
          </button>
          {hasImage && (
            <>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
                title="Remove background image"
                style={{ ...btn, color: "#f1b0b0" }}
              >
                ✕
              </button>
              <button
                ref={dotsRef}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); settingsOpen ? setSettingsOpen(false) : openSettings(); }}
                title="Overlay, gradient, position & mobile image options"
                style={{ ...btn, color: settingsOpen ? "#D4A878" : "#e8e4dd" }}
              >
                Overlay ⋯
              </button>
            </>
          )}
        </div>
      </div>
      {panel}
    </>
  );
}
