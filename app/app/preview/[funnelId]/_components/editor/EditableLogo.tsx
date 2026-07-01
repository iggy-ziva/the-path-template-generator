"use client";

import React, { useState, type CSSProperties } from "react";
import type { SectionTheme } from "@/lib/brand-surfaces";
import { useEditorOptional } from "./EditorContext";
import { usePageContent } from "./PageContentContext";
import { getAtPath } from "@/lib/content-path";
import { safeUrl } from "../funnel-types";
import BrandLogo from "../BrandLogo";
import ImagePickerModal from "./ImagePickerModal";
import type { FunnelPageKey } from "@/lib/funnel-export/config";

interface Props {
  pageKey: FunnelPageKey;
  /** Content path holding the logo override. Defaults to "logoUrl". */
  path?: string;
  /** Wizard logo URL used when no override is set. */
  fallbackUrl?: string | null;
  /** Light-coloured logo variant — used on dark/accent backgrounds. */
  logoLightUrl?: string | null;
  /** Dark-coloured logo variant — used on light backgrounds. */
  logoDarkUrl?: string | null;
  logoTransparent?: boolean;
  /** Background this logo sits on — drives light-vs-dark variant selection. */
  background?: SectionTheme;
  /** Business name — text fallback when there is no logo image. */
  name: string;
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  exportMode?: boolean;
}

/**
 * Logo with editor swap/remove. Reads `c.<path> ?? fallbackUrl`; an explicit
 * null override removes the image so BrandLogo shows the business-name text.
 * When there is no manual override, light/dark variants are selected based on
 * the section background.
 */
export default function EditableLogo({
  pageKey,
  path = "logoUrl",
  fallbackUrl,
  logoLightUrl,
  logoDarkUrl,
  logoTransparent,
  background,
  name,
  className,
  style,
  imgStyle,
  exportMode = false,
}: Props) {
  const editor = useEditorOptional();
  const editMode = !exportMode && Boolean(editor?.isEditMode);
  const pageContent = usePageContent(pageKey);
  const [pickerOpen, setPickerOpen] = useState(false);

  const raw = getAtPath(pageContent, path);
  // An explicit editor override (string) or removal (null) wins and disables
  // automatic variant selection; only the wizard fallback uses light/dark logic.
  const hasOverride = raw === null || typeof raw === "string";
  const effectiveUrl =
    raw === null
      ? null
      : typeof raw === "string"
        ? safeUrl(raw)
        : (fallbackUrl ?? null);

  const logo = (
    <BrandLogo
      logoUrl={effectiveUrl}
      logoLightUrl={hasOverride ? undefined : logoLightUrl}
      logoDarkUrl={hasOverride ? undefined : logoDarkUrl}
      logoTransparent={logoTransparent}
      background={background}
      name={name}
      className={className}
      style={style}
      imgStyle={imgStyle}
    />
  );

  if (!editMode || !editor) return logo;

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      {logo}
      <button
        type="button"
        contentEditable={false}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPickerOpen(true); }}
        title="Swap or remove logo"
        style={{
          position: "absolute",
          top: -8,
          right: -8,
          zIndex: 130,
          padding: "2px 7px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(20, 20, 18, 0.82)",
          color: "#e8e4dd",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.02em",
          cursor: "pointer",
        }}
      >
        Logo
      </button>
      {pickerOpen && (
        <ImagePickerModal
          library={editor.imageLibrary}
          currentUrl={effectiveUrl}
          dimensionHint="Recommended: transparent PNG/SVG, height ~96px."
          onSelect={(url) => {
            editor.updateField(pageKey, path, url);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </span>
  );
}
