"use client";

import React from "react";
import type { FunnelContent, WizardSnapshot } from "./funnel-types";
import { brandVarsStyle, computeBrandTokens } from "@/lib/brand-tokens";
import EventLandingPage from "./pages/EventLandingPage";
import EventCheckoutPage from "./pages/EventCheckoutPage";
import UpsellPage from "./pages/UpsellPage";
import EventThankYouPage from "./pages/EventThankYouPage";
import ReplayPage from "./pages/ReplayPage";
import ProgrammeLandingPage from "./pages/ProgrammeLandingPage";
import ProgrammeCheckoutPage from "./pages/ProgrammeCheckoutPage";
import ProgrammeThankYouPage from "./pages/ProgrammeThankYouPage";
import { PageContentContext } from "./editor/PageContentContext";
import type { FunnelPageKey } from "@/lib/funnel-export/config";

function PageShell({
  pageKey,
  children,
  wizard,
}: {
  pageKey: FunnelPageKey;
  children: React.ReactNode;
  wizard: WizardSnapshot;
}) {
  const tokens = computeBrandTokens(wizard);
  const vars = brandVarsStyle(tokens);
  const isProgrammeCheckout = pageKey === "programmeCheckout";

  return (
    <div
      className="theme-root"
      style={{
        ...vars,
        background: isProgrammeCheckout ? "var(--surface-inverse)" : "var(--surface-canvas)",
        color: isProgrammeCheckout ? "var(--text-inverse)" : "var(--text-primary)",
        fontFamily: "var(--font-body)",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Renders a single funnel page for static export. This is a Client Component on
 * purpose: the static export route handler is a server module and cannot use a
 * React Context Provider directly (the "use client" context would be handed to
 * it as a client reference with no usable `.Provider`). By wrapping the Provider
 * here, `renderToStaticMarkup` runs it inside the client-SSR boundary where the
 * context object is real and propagates to `usePageContent`.
 */
export default function ExportPageRenderer({
  pageKey,
  content,
  wizard,
}: {
  pageKey: FunnelPageKey;
  content: FunnelContent;
  wizard: WizardSnapshot;
}) {
  let inner: React.ReactNode = null;
  switch (pageKey) {
    case "eventLanding":
      inner = content.eventLanding ? (
        <EventLandingPage content={content.eventLanding} wizard={wizard} exportMode />
      ) : null;
      break;
    case "eventCheckout":
      inner = content.eventCheckout ? (
        <EventCheckoutPage content={content.eventCheckout} wizard={wizard} exportMode />
      ) : null;
      break;
    case "upsell":
      inner = content.upsell ? (
        <UpsellPage content={content.upsell} wizard={wizard} exportMode />
      ) : null;
      break;
    case "eventThankYou":
      inner = content.eventThankYou ? (
        <EventThankYouPage content={content.eventThankYou} wizard={wizard} exportMode />
      ) : null;
      break;
    case "replay":
      inner = content.replay ? (
        <ReplayPage content={content.replay} wizard={wizard} exportMode />
      ) : null;
      break;
    case "programmeLanding":
      inner = content.programmeLanding ? (
        <ProgrammeLandingPage content={content.programmeLanding} wizard={wizard} exportMode />
      ) : null;
      break;
    case "programmeCheckout":
      inner = content.programmeCheckout ? (
        <ProgrammeCheckoutPage content={content.programmeCheckout} wizard={wizard} exportMode />
      ) : null;
      break;
    case "programmeThankYou":
      inner = content.programmeThankYou ? (
        <ProgrammeThankYouPage content={content.programmeThankYou} wizard={wizard} exportMode />
      ) : null;
      break;
  }

  return (
    <PageContentContext.Provider value={content}>
      <PageShell pageKey={pageKey} wizard={wizard}>
        {inner}
      </PageShell>
    </PageContentContext.Provider>
  );
}
