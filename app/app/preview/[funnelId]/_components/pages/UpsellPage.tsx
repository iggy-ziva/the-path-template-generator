"use client";

import type { UpsellContent, WizardSnapshot } from "../funnel-types";
import { safeUrl } from "../funnel-types";
import BrandLogo from "../BrandLogo";
import { distillUpsellDescription } from "@/lib/upsell-copy";
import EditableText from "../editor/EditableText";
import { PageLink, PageText } from "../editor/page-editable";

interface Props {
  content: UpsellContent;
  wizard: WizardSnapshot;
  exportMode?: boolean;
}

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function resolveUpsellQuotes(
  w: WizardSnapshot,
  c: UpsellContent,
): { quote: string; attribution?: string }[] {
  const fromWizard = w.upsellQuotes?.filter((q) => q.quote?.trim()) ?? [];
  if (fromWizard.length > 0) return fromWizard;

  if (w.upsellQuote?.trim()) {
    return [{ quote: w.upsellQuote, attribution: w.upsellQuoteAttribution }];
  }

  const fromContent = c.testimonialQuotes?.filter((q) => q.quote?.trim()) ?? [];
  if (fromContent.length > 0) return fromContent;

  if (c.testimonialQuote?.trim()) {
    return [{ quote: c.testimonialQuote, attribution: c.testimonialAttribution }];
  }

  return [];
}

export default function UpsellPage({ content: c, wizard: w, exportMode = false }: Props) {
  const brandName = w.businessName ?? w.hostName ?? "Your Brand";

  // Product name stays from wizard; tagline + description prefer AI-distilled generated copy
  const offerName    = w.upsellOfferName ?? "";
  const tagline      = c.headline ?? w.upsellHeadline ?? "";
  const description  = c.description
    ?? (w.upsellDescription ? distillUpsellDescription(w.upsellDescription) : "");
  const offerPrice   = w.upsellOfferPrice  ?? c.offerPrice  ?? "$97";
  const regularValue = w.upsellRegularValue ?? c.regularPrice ?? "$297";
  const yesCtaText   = w.upsellCtaText     ?? c.yesCtaText  ?? "Yes — add this to my order";
  const yesSubText   = w.upsellCtaSubText  ?? c.yesCtaSubText ?? "Charged to the same card. No extra form to fill.";
  const declineText  = w.upsellDeclineText ?? c.declineText ?? "No thanks — I'll pass and go to my confirmation.";
  const includedTitle = c.includedTitle ?? "What's in the bundle";
  const confirmationBannerText = c.confirmationBannerText ?? `Your spot for ${w.eventName} is confirmed — one more thing before you go.`;
  const eyebrowText = c.eyebrow ?? "One-time offer · Step 2 of 2";
  const savingAmount = c.savingAmount ?? "";
  const urgencyNote = w.upsellPriceNote ?? c.urgencyNote ?? "";

  const usingContentItems = !(w.upsellIncludedItems ?? []).length;
  const items = usingContentItems
    ? (c.includedItems ?? [])
    : w.upsellIncludedItems!;

  const usingContentQuotes = !(w.upsellQuotes?.filter((q) => q.quote?.trim()) ?? []).length
    && !w.upsellQuote?.trim();
  const testimonialQuotes = resolveUpsellQuotes(w, c);

  return (
    <div style={{ background: "var(--surface-canvas)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>

      {/* ── 01 Progress bar ── */}
      <header className="progress-bar">
        <div className="inner">
          <div className="progress-logo">{brandName}</div>
          <div className="progress-steps">
            <div className="progress-step step-done">
              <div className="step-number"><CheckSvg /></div>
              <span className="step-label">Registration</span>
            </div>
            <div className="step-divider" />
            <div className="progress-step step-current">
              <div className="step-number">2</div>
              <span className="step-label">Special offer</span>
            </div>
            <div className="step-divider" />
            <div className="progress-step step-pending">
              <div className="step-number">3</div>
              <span className="step-label">Confirmation</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── 02 Confirmation banner ── */}
      <div className="confirm-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16, flexShrink: 0 }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <PageText pageKey="upsell" path="confirmationBannerText" as="span">
          {confirmationBannerText}
        </PageText>
      </div>

      {/* ── 03–08 Offer body ── */}
      <main className="upsell-page">

        {/* Product feature image */}
        {safeUrl(c.productImageUrl ?? w.additionalImageUrls?.[0] ?? w.lifestyleImageUrls?.[1] ?? w.lifestyleImageUrls?.[0]) && (
          <div style={{ width: "100%", maxWidth: "560px", margin: "0 auto 32px", borderRadius: "var(--r-xl)", overflow: "hidden", lineHeight: 0 }}>
            <img
              src={safeUrl(c.productImageUrl ?? w.additionalImageUrls?.[0] ?? w.lifestyleImageUrls?.[1] ?? w.lifestyleImageUrls?.[0])!}
              alt=""
              style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
            />
          </div>
        )}

        <PageText pageKey="upsell" path="eyebrow" as="div" className="offer-eyebrow">
          {eyebrowText}
        </PageText>

        {offerName ? (
          <>
            <h1 className="offer-title">{offerName}</h1>
            {tagline && (
              <p className="offer-tagline">
                <EditableText pageKey="upsell" path="headline" as="span">{tagline}</EditableText>
              </p>
            )}
          </>
        ) : tagline ? (
          <h1 className="offer-title">
            <EditableText pageKey="upsell" path="headline" as="span">{tagline}</EditableText>
          </h1>
        ) : null}

        {description && (
          <p className="offer-desc">
            <EditableText pageKey="upsell" path="description" as="span">{description}</EditableText>
          </p>
        )}

        <hr className="offer-divider" />

        {/* What's included */}
        <PageText pageKey="upsell" path="includedTitle" as="div" className="included-title">
          {includedTitle}
        </PageText>
        <div className="included-list">
          {items.map((item, i) => (
            <div key={i} className="included-item">
              <div className="included-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6M9 13h6M9 17h6"/>
                </svg>
              </div>
              <div>
                <h3>
                  {usingContentItems ? (
                    <EditableText pageKey="upsell" path={`includedItems[${i}].title`} as="span">{item.title}</EditableText>
                  ) : item.title}
                </h3>
                <p>
                  {usingContentItems ? (
                    <EditableText pageKey="upsell" path={`includedItems[${i}].description`} as="span">{item.description}</EditableText>
                  ) : item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        {testimonialQuotes.length > 0 && (
          <div className="offer-quotes">
            {testimonialQuotes.map((t, i) => (
              <div key={i} className="offer-quote">
                <span className="quote-glyph">&ldquo;</span>
                <blockquote>
                  {usingContentQuotes ? (
                    <EditableText pageKey="upsell" path={`testimonialQuotes[${i}].quote`} as="span">{t.quote}</EditableText>
                  ) : t.quote}
                </blockquote>
                {t.attribution && (
                  <cite>
                    <strong>{t.attribution.split("·")[0]?.trim()}</strong>
                    {t.attribution.includes("·") ? ` · ${t.attribution.split("·").slice(1).join("·").trim()}` : ""}
                  </cite>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Price block */}
        <div className="price-block">
          <p className="price-was">Regular value: <s>{regularValue}</s></p>
          <div className="price-now">{offerPrice}</div>
          {savingAmount && (
            <div className="price-saving">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <PageText pageKey="upsell" path="savingAmount" as="span">{savingAmount}</PageText>
            </div>
          )}
          {urgencyNote && (
            <PageText pageKey="upsell" path="urgencyNote" as="p" className="price-note" html forceShow>
              {urgencyNote}
            </PageText>
          )}
        </div>

        {/* CTA */}
        <PageLink pageKey="upsell" path="yesCtaText" href="/thank-you" className="yes-btn">
          {yesCtaText}
        </PageLink>
        {yesSubText && (
          <PageText pageKey="upsell" path="yesCtaSubText" as="p" className="yes-btn-sub">
            {c.yesCtaSubText ?? yesSubText}
          </PageText>
        )}

        <PageLink pageKey="upsell" path="declineText" href="/thank-you" className="no-link">
          {declineText}
        </PageLink>
      </main>

      {/* Footer */}
      <footer className="ty-footer">
        <div className="inner">
          <div className="ty-footer-left">
            <BrandLogo
              logoUrl={w.logoUrl}
              logoTransparent={w.logoTransparent}
              name={brandName}
              className="ty-footer-brand"
              imgStyle={{ maxHeight: "168px", maxWidth: "540px", width: "100%", objectFit: "contain", display: "block" }}
            />
            <span className="ty-footer-copy">&copy; {new Date().getFullYear()} {brandName}</span>
          </div>
          <nav className="ty-footer-links">
            <a href={w.privacyPolicyUrl ?? "#"}>Privacy</a>
            <a href={w.termsOfUseUrl ?? "#"}>Terms of Use</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
