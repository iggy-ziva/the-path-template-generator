import React from "react";
import type { FunnelContent, WizardSnapshot } from "@/app/app/preview/[funnelId]/_components/funnel-types";
import ExportPageRenderer from "@/app/app/preview/[funnelId]/_components/ExportPageRenderer";
import { FUNNEL_PAGES, rewriteExportLinks, type FunnelPageKey } from "./config";

export function renderPageElement(
  pageKey: FunnelPageKey,
  content: FunnelContent,
  wizard: WizardSnapshot,
): React.ReactNode {
  return <ExportPageRenderer pageKey={pageKey} content={content} wizard={wizard} />;
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
