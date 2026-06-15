"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { EditorValueProvider, type EditorContextValue } from "./editor/EditorContext";
import { EditSurfaceProvider, type EditSurface } from "./editor/EditSurfaceContext";

interface Props {
  width: number;
  height: number;
  brandCSS: string;
  fontImport: string | null;
  overrideCSS: string;
  brandVars: React.CSSProperties;
  /** When true the frame becomes an interactive editing surface (own React root). */
  editable?: boolean;
  /** Editor state to bridge into the iframe's React root (required when editable). */
  editorValue?: EditorContextValue | null;
  /** Mirrors clicks on internal funnel links so the parent can switch pages (view-only). */
  onInternalLink?: (href: string) => void;
  children: React.ReactNode;
}

const EDITABLE_HOVER_CSS = `.editable-field:not(.is-editing):hover { outline: 1px dashed var(--accent-secondary-on-dark) !important; outline-offset: 2px; }`;

/**
 * Renders its children inside a phone-width <iframe> so real CSS media queries
 * (e.g. @media max-width:768px) evaluate against an actual narrow viewport.
 *
 * View-only mode portals the children into the iframe (React context is
 * preserved, but DOM events are not delivered across the boundary, so internal
 * links are intercepted with a native listener).
 *
 * Editable mode instead mounts a SEPARATE React root inside the iframe and
 * re-provides the live editor state into it. React only delivers synthetic
 * events to the root that owns the container, so a real editing surface needs
 * its own root in the iframe document. All editor popovers/modals target the
 * iframe document via EditSurfaceProvider.
 */
export default function MobilePreviewFrame({
  width,
  height,
  brandCSS,
  fontImport,
  overrideCSS,
  brandVars,
  editable = false,
  editorValue,
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

  // ── View-only: intercept internal link clicks and bubble them up. ──
  useEffect(() => {
    if (!doc || editable || !onInternalLink) return;
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
  }, [doc, editable, onInternalLink]);

  // ── Editable: prevent internal links from navigating the iframe away. ──
  useEffect(() => {
    if (!doc || !editable) return;
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
      // Keep editing interactions from triggering a full navigation inside the frame.
      e.preventDefault();
    };
    doc.addEventListener("click", handler);
    return () => doc.removeEventListener("click", handler);
  }, [doc, editable]);

  // ── Editable: own React root mounted inside the iframe body. ──
  const rootRef = useRef<Root | null>(null);
  const rootElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!doc || !editable) return;
    const container = doc.createElement("div");
    doc.body.appendChild(container);
    rootElRef.current = container;
    const root = createRoot(container);
    rootRef.current = root;
    return () => {
      root.unmount();
      container.remove();
      rootRef.current = null;
      rootElRef.current = null;
    };
  }, [doc, editable]);

  // Stable surface identity per document so editor effects (selection,
  // outside-click) inside the iframe don't re-run on every keystroke/edit.
  const surface = useMemo<EditSurface | null>(
    () => (doc ? { doc, win: doc.defaultView ?? window } : null),
    [doc],
  );

  // Push the latest editor state + children into the iframe root on every render
  // so edits stay live (this is the single source of truth, bridged across roots).
  useEffect(() => {
    if (!editable || !doc || !rootRef.current || !editorValue || !surface) return;
    rootRef.current.render(
      <EditorValueProvider value={editorValue}>
        <EditSurfaceProvider value={surface}>
          <div style={brandVars}>{children}</div>
        </EditSurfaceProvider>
      </EditorValueProvider>,
    );
  });

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
            {editable && <style dangerouslySetInnerHTML={{ __html: EDITABLE_HOVER_CSS }} />}
          </>,
          doc.head,
        )}

      {/* View-only renders via portal (preserves context, no events needed). */}
      {doc && !editable &&
        createPortal(
          <div style={brandVars}>{children}</div>,
          doc.body,
        )}
    </div>
  );
}
