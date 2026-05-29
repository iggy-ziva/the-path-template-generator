import type { FunnelContent, WizardSnapshot } from "@/app/app/preview/[funnelId]/_components/funnel-types";

export const FUNNEL_PAGES = [
  { key: "eventLanding",       label: "Event Landing",     file: "index.html" },
  { key: "eventCheckout",      label: "Event Checkout",    file: "event-checkout.html" },
  { key: "upsell",             label: "Upsell",            file: "upsell.html" },
  { key: "eventThankYou",      label: "Event Thank-You",   file: "event-thank-you.html" },
  { key: "replay",             label: "Replay",            file: "replay.html" },
  { key: "programmeLanding",   label: "Programme LP",      file: "programme.html" },
  { key: "programmeCheckout",  label: "Prog. Checkout",    file: "programme-checkout.html" },
  { key: "programmeThankYou",  label: "Prog. Thank-You",   file: "programme-thank-you.html" },
] as const;

export type FunnelPageKey = (typeof FUNNEL_PAGES)[number]["key"];

/** Rewrite in-preview paths to relative HTML files in exported ZIP. */
export const EXPORT_LINK_REWRITES: Record<string, string> = {
  'href="/checkout"': 'href="event-checkout.html"',
  "href='/checkout'": "href='event-checkout.html'",
  'href="/upsell"': 'href="upsell.html"',
  "href='/upsell'": "href='upsell.html'",
  'href="/thank-you"': 'href="event-thank-you.html"',
  "href='/thank-you'": "href='event-thank-you.html'",
  'href="/replay"': 'href="replay.html"',
  "href='/replay'": "href='replay.html'",
  'href="/program"': 'href="programme.html"',
  "href='/program'": "href='programme.html'",
  'href="/program-checkout"': 'href="programme-checkout.html"',
  "href='/program-checkout'": "href='programme-checkout.html'",
  'href="/program-thank-you"': 'href="programme-thank-you.html"',
  "href='/program-thank-you'": "href='programme-thank-you.html'",
  'href="#program-cta"': 'href="programme.html"',
};

export function rewriteExportLinks(html: string): string {
  let out = html;
  for (const [from, to] of Object.entries(EXPORT_LINK_REWRITES)) {
    out = out.split(from).join(to);
  }
  return out;
}

export type FunnelRenderInput = {
  pageContent: FunnelContent;
  wizard: WizardSnapshot;
};
