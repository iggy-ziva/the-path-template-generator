import React from "react";
import type { FunnelContent, WizardSnapshot } from "@/app/app/preview/[funnelId]/_components/funnel-types";
import { brandVarsStyle, computeBrandTokens } from "@/lib/brand-tokens";
import EventLandingPage from "@/app/app/preview/[funnelId]/_components/pages/EventLandingPage";
import EventCheckoutPage from "@/app/app/preview/[funnelId]/_components/pages/EventCheckoutPage";
import UpsellPage from "@/app/app/preview/[funnelId]/_components/pages/UpsellPage";
import EventThankYouPage from "@/app/app/preview/[funnelId]/_components/pages/EventThankYouPage";
import ReplayPage from "@/app/app/preview/[funnelId]/_components/pages/ReplayPage";
import ProgrammeLandingPage from "@/app/app/preview/[funnelId]/_components/pages/ProgrammeLandingPage";
import ProgrammeCheckoutPage from "@/app/app/preview/[funnelId]/_components/pages/ProgrammeCheckoutPage";
import ProgrammeThankYouPage from "@/app/app/preview/[funnelId]/_components/pages/ProgrammeThankYouPage";
import { FUNNEL_PAGES, rewriteExportLinks, type FunnelPageKey } from "./config";

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

export function renderPageElement(
  pageKey: FunnelPageKey,
  content: FunnelContent,
  wizard: WizardSnapshot,
): React.ReactNode {
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
    <PageShell pageKey={pageKey} wizard={wizard}>
      {inner}
    </PageShell>
  );
}

export function buildFunnelPageHtml(
  pageKey: FunnelPageKey,
  content: FunnelContent,
  wizard: WizardSnapshot,
  title: string,
  bodyMarkup: string,
): string {
  const rewritten = rewriteExportLinks(bodyMarkup);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="funnel-style.css" />
  <link rel="stylesheet" href="funnel-pages.css" />
  <link rel="stylesheet" href="brand.css" />
</head>
<body>
${rewritten}
</body>
</html>`;
}

export function getFunnelPageTitles(
  wizard: WizardSnapshot,
): Record<FunnelPageKey, string> {
  const eventName = wizard.eventName ?? "Event";
  const programName = wizard.programName ?? "Programme";
  return {
    eventLanding: eventName,
    eventCheckout: `Checkout — ${eventName}`,
    upsell: "Special Offer",
    eventThankYou: `Thank You — ${eventName}`,
    replay: `Replay — ${eventName}`,
    programmeLanding: programName,
    programmeCheckout: `Enrol — ${programName}`,
    programmeThankYou: `Welcome — ${programName}`,
  };
}

export { FUNNEL_PAGES };

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
