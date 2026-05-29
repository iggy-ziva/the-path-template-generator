"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { FunnelContent, WizardSnapshot } from "./funnel-types";
import { computeBrandTokens, buildBrandCSS, brandVarsStyle } from "@/lib/brand-tokens";
import { EditorProvider, useEditor } from "./editor/EditorContext";
import EventLandingPage from "./pages/EventLandingPage";
import EventCheckoutPage from "./pages/EventCheckoutPage";
import UpsellPage from "./pages/UpsellPage";
import EventThankYouPage from "./pages/EventThankYouPage";
import ReplayPage from "./pages/ReplayPage";
import ProgrammeLandingPage from "./pages/ProgrammeLandingPage";
import ProgrammeCheckoutPage from "./pages/ProgrammeCheckoutPage";
import ProgrammeThankYouPage from "./pages/ProgrammeThankYouPage";

const PAGES = [
  { key: "eventLanding",       label: "Event Landing",     file: "index.html" },
  { key: "eventCheckout",      label: "Event Checkout",    file: "event-checkout.html" },
  { key: "upsell",             label: "Upsell",            file: "upsell.html" },
  { key: "eventThankYou",      label: "Event Thank-You",   file: "event-thank-you.html" },
  { key: "replay",             label: "Replay",            file: "replay.html" },
  { key: "programmeLanding",   label: "Programme LP",      file: "programme.html" },
  { key: "programmeCheckout",  label: "Prog. Checkout",    file: "programme-checkout.html" },
  { key: "programmeThankYou",  label: "Prog. Thank-You",   file: "programme-thank-you.html" },
] as const;

type PageKey = typeof PAGES[number]["key"];

interface Props {
  funnelId: string;
  content: Record<string, unknown>;
  themeSlug: string | null;
  createdAt: string;
  updatedAt: string | null;
  wizardData: Record<string, unknown>;
}

export default function PreviewClient(props: Props) {
  return (
    <EditorProvider funnelId={props.funnelId} initialContent={props.content as FunnelContent}>
      <PreviewClientInner {...props} />
    </EditorProvider>
  );
}

function PreviewClientInner({ funnelId, themeSlug, createdAt, updatedAt: serverUpdatedAt, wizardData }: Props) {
  const editor = useEditor();
  const [activePage, setActivePage] = useState<PageKey>("eventLanding");
  const [downloading, setDownloading] = useState(false);

  const fc = editor.draftContent;
  const wizard = wizardData as WizardSnapshot;

  const tokens = computeBrandTokens(wizard);
  const {
    primary, accentSecondaryOnDark, textOnSecondary, fontImport,
  } = tokens;

  const brandCSS = buildBrandCSS(tokens);
  const brandVars = brandVarsStyle(tokens) as React.CSSProperties;

  const lastSavedLabel = editor.lastSavedAt ?? serverUpdatedAt;

  useEffect(() => {
    setActivePage("eventLanding");
  }, [funnelId]);

  useEffect(() => {
    const styleId = `preview-brand-${funnelId}`;
    const css = `${brandCSS}
body {
  background: var(--surface-canvas) !important;
  color: var(--text-primary) !important;
  font-family: var(--font-body) !important;
}`;

    document.querySelectorAll('style[id^="preview-brand-"]').forEach((node) => {
      if (node.id !== styleId) node.remove();
    });

    let el = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = styleId;
      document.head.appendChild(el);
    }
    el.textContent = css;

    return () => { el?.remove(); };
  }, [funnelId, brandCSS]);

  useEffect(() => {
    if (!editor.isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [editor.isDirty]);

  const FUNNEL_LINKS: Partial<Record<string, PageKey>> = {
    "/checkout":          "eventCheckout",
    "/upsell":            "upsell",
    "/thank-you":         "eventThankYou",
    "/replay":            "replay",
    "/program":           "programmeLanding",
    "/program-checkout":  "programmeCheckout",
    "/program-thank-you": "programmeThankYou",
  };

  const switchPage = useCallback((key: PageKey) => {
    if (editor.isDirty) {
      const ok = window.confirm("You have unsaved changes. Switch pages anyway?");
      if (!ok) return;
    }
    setActivePage(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [editor.isDirty]);

  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    if (editor.isEditMode) return;
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href) return;
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) return;
    const target = FUNNEL_LINKS[href];
    if (target) {
      e.preventDefault();
      switchPage(target);
    }
  }

  async function handleDownload() {
    if (editor.isDirty) {
      const saveFirst = window.confirm("Save your edits before downloading?");
      if (saveFirst) {
        const ok = await editor.save();
        if (!ok) return;
      }
    }
    setDownloading(true);
    try {
      const res = await fetch(`/api/wizard/export/${funnelId}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `funnel-${funnelId.slice(0, 8)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed — please try again");
    } finally {
      setDownloading(false);
    }
  }

  function pageComponent(key: PageKey) {
    switch (key) {
      case "eventLanding":      return fc.eventLanding      ? <EventLandingPage content={fc.eventLanding} wizard={wizard} />           : <EmptyPage pageName="Event Landing" />;
      case "eventCheckout":     return fc.eventCheckout     ? <EventCheckoutPage content={fc.eventCheckout} wizard={wizard} />         : <EmptyPage pageName="Event Checkout" />;
      case "upsell":            return fc.upsell            ? <UpsellPage content={fc.upsell} wizard={wizard} />                       : <EmptyPage pageName="Upsell" />;
      case "eventThankYou":     return fc.eventThankYou     ? <EventThankYouPage content={fc.eventThankYou} wizard={wizard} />         : <EmptyPage pageName="Event Thank-You" />;
      case "replay":            return fc.replay            ? <ReplayPage content={fc.replay} wizard={wizard} />                       : <EmptyPage pageName="Replay" />;
      case "programmeLanding":  return fc.programmeLanding  ? <ProgrammeLandingPage content={fc.programmeLanding} wizard={wizard} />   : <EmptyPage pageName="Programme Landing" />;
      case "programmeCheckout": return fc.programmeCheckout ? <ProgrammeCheckoutPage content={fc.programmeCheckout} wizard={wizard} /> : <EmptyPage pageName="Programme Checkout" />;
      case "programmeThankYou": return fc.programmeThankYou ? <ProgrammeThankYouPage content={fc.programmeThankYou} wizard={wizard} /> : <EmptyPage pageName="Programme Thank-You" />;
    }
  }

  return (
    <>
      <link rel="stylesheet" href="/funnel-style.css" />
      <link rel="stylesheet" href="/funnel-pages.css" />
      {fontImport && <style dangerouslySetInnerHTML={{ __html: fontImport }} />}
      <style dangerouslySetInnerHTML={{ __html: `
        #stickyBar.is-visible { top: 52px !important; }
        section.credibility.inline { padding: 40px 0 !important; border: none !important; margin-bottom: 40px !important; }
        section.credibility.inline .quote-glyph { font-size: 64px !important; line-height: 1 !important; margin-bottom: 16px !important; }
        .editable-field:not(.is-editing):hover { outline: 1px dashed var(--accent-secondary-on-dark) !important; outline-offset: 2px; }
      ` }} />

      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
        background: "#141412", borderBottom: "1px solid #2a2926",
        padding: "0 20px", display: "flex", alignItems: "center", gap: 12,
        height: 52,
      }}>
        <Link
          href="/app/wizard"
          onClick={(e) => {
            if (editor.isDirty && !window.confirm("You have unsaved changes. Leave preview?")) {
              e.preventDefault();
            }
          }}
          style={{ color: "#9a9390", textDecoration: "none", fontSize: 12, fontWeight: 600, flexShrink: 0 }}
        >
          ← Wizard
        </Link>

        <div style={{ flex: 1, display: "flex", gap: 3, overflowX: "auto" }}>
          {PAGES.map((p) => (
            <button
              key={p.key}
              onClick={() => switchPage(p.key)}
              style={{
                padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: activePage === p.key ? accentSecondaryOnDark : "transparent",
                color: activePage === p.key ? textOnSecondary : "#9a9390",
                fontWeight: activePage === p.key ? 700 : 500,
                fontSize: 11, whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "#888", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
          {editor.isEditMode && (
            <span style={{ color: "#D4A878", fontWeight: 700 }}>Editing</span>
          )}
          {lastSavedLabel && (
            <span title={lastSavedLabel} suppressHydrationWarning>
              Saved {new Date(lastSavedLabel).toLocaleString("en-GB")}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: primary }} />
            <span>{primary}</span>
          </div>
          {themeSlug && <span>{themeSlug}</span>}
        </div>

        <button
          onClick={() => editor.setEditMode(!editor.isEditMode)}
          style={{
            padding: "6px 12px", background: editor.isEditMode ? "#D4A878" : "transparent",
            border: "1px solid #444", borderRadius: 6,
            color: editor.isEditMode ? "#141412" : "#ccc",
            cursor: "pointer", fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}
        >
          {editor.isEditMode ? "Done editing" : "Edit"}
        </button>

        {editor.isEditMode && (
          <>
            <button
              onClick={() => editor.discard()}
              disabled={!editor.isDirty}
              style={{
                padding: "6px 12px", background: "transparent", border: "1px solid #444",
                borderRadius: 6, color: editor.isDirty ? "#ccc" : "#555",
                cursor: editor.isDirty ? "pointer" : "not-allowed",
                fontSize: 11, fontWeight: 600, flexShrink: 0,
              }}
            >
              Discard
            </button>
            <button
              onClick={() => editor.save()}
              disabled={!editor.isDirty || editor.isSaving}
              style={{
                padding: "6px 12px", background: editor.isDirty ? accentSecondaryOnDark : "#333",
                border: "none", borderRadius: 6, color: textOnSecondary,
                cursor: editor.isDirty && !editor.isSaving ? "pointer" : "not-allowed",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                opacity: editor.isSaving ? 0.6 : 1,
              }}
            >
              {editor.isSaving ? "Saving…" : "Save"}
            </button>
          </>
        )}

        <button
          onClick={handleDownload}
          disabled={downloading}
          title="Download HTML, CSS, and JS — matches this preview exactly"
          style={{
            padding: "6px 14px", background: accentSecondaryOnDark,
            border: "none", borderRadius: 6, color: textOnSecondary,
            cursor: downloading ? "not-allowed" : "pointer",
            fontSize: 11, fontWeight: 700, opacity: downloading ? 0.6 : 1, flexShrink: 0,
          }}
        >
          {downloading ? "…" : "↓ ZIP"}
        </button>
      </div>

      <div onClick={handlePreviewClick} style={{ paddingTop: 52, ...brandVars }}>
        <div
          key={activePage}
          data-page={activePage}
          style={{
            background: activePage === "programmeCheckout" ? "var(--surface-inverse)" : "var(--surface-canvas)",
            color: activePage === "programmeCheckout" ? "var(--text-inverse)" : "var(--text-primary)",
            fontFamily: "var(--font-body)",
            minHeight: "calc(100vh - 52px)",
          }}
        >
          {pageComponent(activePage)}
        </div>
      </div>
    </>
  );
}

function EmptyPage({ pageName }: { pageName: string }) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#444" }}>
      <div style={{ fontSize: 40 }}>📄</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{pageName}</div>
      <div style={{ fontSize: 13 }}>No content generated for this page yet.</div>
    </div>
  );
}
