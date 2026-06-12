"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  width: number;
  height: number;
  brandCSS: string;
  fontImport: string | null;
  overrideCSS: string;
  brandVars: React.CSSProperties;
  /** Mirrors clicks on internal funnel links so the parent can switch pages. */
  onInternalLink?: (href: string) => void;
  children: React.ReactNode;
}

/**
 * Renders its children inside a phone-width <iframe> so real CSS media queries
 * (e.g. @media max-width:768px in funnel-style.css plus the per-section mobile
 * background overrides) evaluate against an actual narrow viewport. React
 * context is preserved across createPortal, so the portaled page components keep
 * reading live draft content from the EditorProvider — this stays view-only.
 */
export default function MobilePreviewFrame({
  width,
  height,
  brandCSS,
  fontImport,
  overrideCSS,
  brandVars,
  onInternalLink,
  children,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [doc, setDoc] = useState<Document | null>(null);

  // Capture the iframe document once it has loaded its (blank) srcDoc.
  const handleLoad = () => {
    const d = iframeRef.current?.contentDocument ?? null;
    setDoc(d);
  };

  // Some browsers fire load before React attaches onLoad; grab the doc on mount
  // too in case it is already available.
  useEffect(() => {
    if (!doc && iframeRef.current?.contentDocument) {
      setDoc(iframeRef.current.contentDocument);
    }
  }, [doc]);

  // Intercept clicks on internal funnel links inside the iframe and bubble them
  // up so the parent's page switcher handles navigation (the page switch happens
  // via the top bar in mobile mode).
  useEffect(() => {
    if (!doc || !onInternalLink) return;
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) return;
      e.preventDefault();
      onInternalLink(href);
    };
    doc.addEventListener("click", handler);
    return () => doc.removeEventListener("click", handler);
  }, [doc, onInternalLink]);

  const bodyCSS = `html,body{margin:0;padding:0}
body{
  background: var(--surface-canvas) !important;
  color: var(--text-primary) !important;
  font-family: var(--font-body) !important;
}`;

  const availableHeight = `calc(100vh - 52px - 48px)`;
  const frameHeight = `min(${height}px, ${availableHeight})`;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 52px)",
        padding: "24px 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        overflow: "auto",
      }}
    >
      <div
        style={{
          width,
          maxWidth: "100%",
          height: frameHeight,
          borderRadius: 28,
          border: "10px solid #1c1c1a",
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          overflow: "hidden",
          background: "#000",
          flexShrink: 0,
        }}
      >
        <iframe
          ref={iframeRef}
          onLoad={handleLoad}
          title="Mobile preview"
          srcDoc="<!DOCTYPE html><html><head></head><body></body></html>"
          style={{ width: "100%", height: "100%", border: "none", display: "block", background: "var(--surface-canvas)" }}
        />
      </div>

      {doc &&
        createPortal(
          <>
            <link rel="stylesheet" href="/funnel-style.css" />
            <link rel="stylesheet" href="/funnel-pages.css" />
            <style dangerouslySetInnerHTML={{ __html: bodyCSS }} />
            <style dangerouslySetInnerHTML={{ __html: brandCSS }} />
            {fontImport && <style dangerouslySetInnerHTML={{ __html: fontImport }} />}
            <style dangerouslySetInnerHTML={{ __html: overrideCSS }} />
          </>,
          doc.head,
        )}

      {doc &&
        createPortal(
          <div style={brandVars}>{children}</div>,
          doc.body,
        )}
    </div>
  );
}
