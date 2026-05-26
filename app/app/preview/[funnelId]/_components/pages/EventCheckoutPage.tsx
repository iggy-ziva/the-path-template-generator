"use client";

import { useState } from "react";
import type { EventCheckoutContent, WizardSnapshot } from "../funnel-types";
import { safeUrl } from "../funnel-types";

interface Props {
  content: EventCheckoutContent;
  wizard: WizardSnapshot;
}

function getCountdown(eventDate?: string): { days: string; hrs: string; mins: string } {
  if (!eventDate) return { days: "--", hrs: "--", mins: "--" };
  try {
    const diff = new Date(eventDate).getTime() - Date.now();
    if (diff <= 0) return { days: "00", hrs: "00", mins: "00" };
    return {
      days: String(Math.floor(diff / 86_400_000)).padStart(2, "0"),
      hrs: String(Math.floor((diff % 86_400_000) / 3_600_000)).padStart(2, "0"),
      mins: String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0"),
    };
  } catch {
    return { days: "--", hrs: "--", mins: "--" };
  }
}

export default function EventCheckoutPage({ content: c, wizard: w }: Props) {
  const priceMin = c.priceMin ?? w.eventPriceMin ?? 11;
  const priceMax = c.priceMax ?? w.eventPriceMax ?? 111;
  const priceDefault =
    c.priceDefault ?? w.eventPriceFixed ?? Math.round(priceMin + (priceMax - priceMin) * 0.65);

  const defaultTiers = (() => {
    const spread = priceMax - priceMin;
    return [
      { tier: 1, amount: priceMin,                                   label: `$${priceMin}` },
      { tier: 2, amount: Math.round(priceMin + spread * 0.25),       label: `$${Math.round(priceMin + spread * 0.25)}` },
      { tier: 3, amount: Math.round(priceMin + spread * 0.4),        label: `$${Math.round(priceMin + spread * 0.4)}` },
      { tier: 4, amount: Math.round(priceMin + spread * 0.65),       label: `$${Math.round(priceMin + spread * 0.65)}` },
      { tier: 5, amount: priceMax,                                   label: `$${priceMax}` },
    ];
  })();
  const tiers = c.priceTiers ?? defaultTiers;

  const [price, setPrice]         = useState(priceDefault);
  const [tab, setTab]             = useState<"card" | "paypal">("card");
  const [orderOpen, setOrderOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const formattedPrice = price.toFixed(2);
  const countdown      = getCountdown(w.eventDate);

  const hostName     = w.hostName ?? w.businessName ?? "";
  const businessName = w.businessName ?? hostName;
  const eventName    = w.eventName ?? "Event";
  const eventTagline = w.eventTagline ?? "";
  const eventDate    = w.eventDate ?? "";
  const eventTime    = w.eventTime ?? "";
  const eventTz      = w.eventTimezone ?? "";
  const eventPlatform = w.eventPlatform ?? "Zoom";
  const benefits     = c.benefits ?? [];
  const ctaText      = c.ctaText ?? `Register Now — $${price}.00`;
  const guaranteeText = c.guaranteeText ?? "No prerequisites · Recording included · No refunds on donation-based events";

  return (
    <div className="theme-root">

      {/* 01 — Checkout Header */}
      <header className="checkout-header">
        <div className="inner">
          <div className="logo">
            {safeUrl(c.logoUrl ?? w.logoUrl)
              ? <img
                  src={safeUrl(c.logoUrl ?? w.logoUrl)!}
                  alt={businessName || hostName}
                  style={{ height: "96px", objectFit: "contain" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.textContent = businessName || hostName; }}
                />
              : (businessName || hostName)
            }
          </div>
          <div className="trust-badges">
            <div className="trust-badge">
              <div className="trust-badge-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span>Safe &amp; Secure</span>
            </div>
            <div className="trust-badge">
              <div className="trust-badge-icon">
                <svg viewBox="0 0 24 24">
                  <rect
                    x="3" y="11" width="18" height="11" rx="2" ry="2"
                    fill="none" strokeWidth="2.5" strokeLinejoin="round"
                  />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    fill="none" strokeWidth="2.5" strokeLinecap="round"
                  />
                </svg>
              </div>
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile summary toggle */}
      <div className="mobile-summary-wrap">
        <button
          className={`mobile-summary-toggle${mobileOpen ? " open" : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
        >
          <span>{mobileOpen ? "Hide what you're getting" : "Show what you're getting"}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Main two-column layout */}
      <main className="checkout-wrap">

        {/* ===== FORM COLUMN ===== */}
        <div className="form-col">

          {/* 02 — Choose Your Price */}
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Choose your price</h2>
            </div>
            <div className="form-card-body">
              <p className="price-range-label">
                {c.priceRangeCopy ?? (
                  <>
                    Pay any amount from <strong>${priceMin}</strong> to the regular full price
                    of <strong>${priceMax}</strong>. Pay what is genuinely accessible and meaningful for you.
                  </>
                )}
              </p>
              <div className="price-input-wrap">
                <span className="price-currency">$</span>
                <input
                  className="price-input"
                  type="number"
                  value={price}
                  min={priceMin}
                  max={priceMax}
                  aria-label="Enter your price"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) setPrice(v);
                  }}
                />
              </div>
              <p className="price-hint">Minimum ${priceMin} &middot; Full price ${priceMax}</p>
              <div className="price-presets">
                {tiers.map((t) => (
                  <button
                    key={t.tier}
                    className={`price-preset${price === t.amount ? " active" : ""}`}
                    data-tier={t.tier}
                    onClick={() => setPrice(t.amount)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 03 — Order Summary */}
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Order summary</h2>
              <button
                className={`order-summary-toggle${orderOpen ? " open" : ""}`}
                onClick={() => setOrderOpen(!orderOpen)}
                aria-expanded={orderOpen}
              >
                {orderOpen ? "Hide" : "Show"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            </div>
            {orderOpen && (
              <div className="form-card-body">
                <table className="order-table">
                  <tbody>
                    <tr>
                      <td>
                        {eventName}
                        {(eventDate || hostName) && (
                          <><br /><span>{[eventDate, hostName ? `With ${hostName}` : ""].filter(Boolean).join(" · ")}</span></>
                        )}
                      </td>
                      <td>${formattedPrice}</td>
                    </tr>
                    <tr>
                      <td>Subtotal</td>
                      <td>${formattedPrice}</td>
                    </tr>
                    <tr className="total-row">
                      <td>Total</td>
                      <td>${formattedPrice}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="coupon-row">
                  <input
                    className="coupon-input"
                    type="text"
                    placeholder="Coupon code"
                    aria-label="Coupon code"
                  />
                  <button className="coupon-btn">Apply</button>
                </div>
              </div>
            )}
          </div>

          {/* 04 — Customer Information */}
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Customer information</h2>
            </div>
            <div className="form-card-body">
              <div className="field-group">
                <div className="field">
                  <label htmlFor="co-email">Email address</label>
                  <input
                    type="email"
                    id="co-email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 05 — Billing Details */}
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Billing details</h2>
            </div>
            <div className="form-card-body">
              <div className="field-group">
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="co-firstName">First name</label>
                    <input
                      type="text"
                      id="co-firstName"
                      name="first_name"
                      placeholder="First"
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="co-lastName">Last name</label>
                    <input
                      type="text"
                      id="co-lastName"
                      name="last_name"
                      placeholder="Last"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 06 — Payment Methods */}
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Payment</h2>
            </div>
            <div className="form-card-body">
              <div className="payment-tabs">
                <button
                  className={`payment-tab${tab === "card" ? " active" : ""}`}
                  onClick={() => setTab("card")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Credit / Debit Card
                </button>
                <button
                  className={`payment-tab${tab === "paypal" ? " active" : ""}`}
                  onClick={() => setTab("paypal")}
                >
                  PayPal
                </button>
              </div>

              {tab === "card" && (
                <div className="card-fields">
                  <div className="field">
                    <label htmlFor="co-cardNumber">Card number</label>
                    <div className="card-number-wrap">
                      <input
                        type="text"
                        id="co-cardNumber"
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                      />
                      <div className="card-number-icons">
                        <div className="card-icon">VISA</div>
                        <div className="card-icon">MC</div>
                      </div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="co-expiry">Expiry date</label>
                      <input
                        type="text"
                        id="co-expiry"
                        placeholder="MM / YY"
                        inputMode="numeric"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="co-cvv">Security code</label>
                      <input
                        type="text"
                        id="co-cvv"
                        placeholder="CVV"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </div>
              )}

              {tab === "paypal" && (
                <div className="paypal-option">
                  <p>You&apos;ll be redirected to PayPal to complete your payment securely.</p>
                  <button className="paypal-btn">Pay with PayPal</button>
                </div>
              )}
            </div>
          </div>

          {/* 07 — Privacy Notice + Submit */}
          <div className="form-card">
            <div className="form-card-body">
              <p className="privacy-notice">
                Your personal data will be used to process your order and support your experience
                throughout this website, as described in our <a href="#">Privacy Policy</a>. We do
                not store your card details and we will never share or sell your data.
              </p>
              <div>
                <button className="submit-btn">
                  {ctaText.includes("${price}") || ctaText.includes("$price")
                    ? `Register Now — $${price}.00`
                    : ctaText}
                </button>
                <p className="submit-guarantee">{guaranteeText}</p>
              </div>
            </div>
          </div>

        </div>{/* /form-col */}

        {/* ===== SALES COLUMN ===== */}
        <aside className="sales-col">
          <div className={`sales-card${mobileOpen ? " is-open" : ""}`}>

            {/* Sidebar feature image */}
            {safeUrl(c.checkoutSidebarImageUrl ?? w.lifestyleImageUrls?.[0]) && (
              <img
                src={safeUrl(c.checkoutSidebarImageUrl ?? w.lifestyleImageUrls![0])!}
                alt=""
                style={{ width: "100%", aspectRatio: "16/7", objectFit: "cover", borderRadius: "var(--r-lg) var(--r-lg) 0 0", display: "block", marginBottom: 0 }}
              />
            )}

            {/* Event identity */}
            <div className="sales-card-hero">
              <div className="sales-live-tag">
                <span className="dot" />
                Live Online
              </div>
              <h2 className="sales-event-name">{eventName}</h2>
              {eventTagline && <p className="sales-tagline">{eventTagline}</p>}
            </div>

            {/* Event details */}
            <div className="sales-details">
              {eventDate && (
                <div className="sales-detail-row">
                  <span className="sales-detail-label">Date</span>
                  <span className="sales-detail-value">
                    <strong>{eventDate}</strong>
                  </span>
                </div>
              )}
              {(eventTime || eventTz) && (
                <div className="sales-detail-row">
                  <span className="sales-detail-label">Time</span>
                  <span className="sales-detail-value">
                    {[eventTime, eventTz].filter(Boolean).join(" ")}
                  </span>
                </div>
              )}
              <div className="sales-detail-row">
                <span className="sales-detail-label">Format</span>
                <span className="sales-detail-value">
                  Live online via {eventPlatform} &middot; Recording included
                </span>
              </div>
              {hostName && (
                <div className="sales-detail-row">
                  <span className="sales-detail-label">Host</span>
                  <span className="sales-detail-value">{hostName}</span>
                </div>
              )}
            </div>

            {/* Countdown */}
            <div className="sales-countdown">
              <span className="sales-countdown-label">Starts in</span>
              <div className="countdown-units">
                <div className="countdown-unit">
                  <span className="countdown-number">{countdown.days}</span>
                  <span className="countdown-label">Days</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-number">{countdown.hrs}</span>
                  <span className="countdown-label">Hrs</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-number">{countdown.mins}</span>
                  <span className="countdown-label">Mins</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="sales-price">
              <div className="sales-price-label">Your contribution</div>
              <div className="sales-price-value">${price} &mdash; pay what feels right</div>
            </div>

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="sales-benefits">
                <div className="sales-benefits-title">What you&apos;ll experience</div>
                <div className="sales-benefit-list">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="sales-benefit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {/* Benefits may contain <strong> tags from AI generation */}
                      <span dangerouslySetInnerHTML={{ __html: benefit }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>{/* /sales-card */}
        </aside>

      </main>{/* /checkout-wrap */}

      {/* FTC Disclaimer */}
      <div className="checkout-ftc">
        <h2>FTC Disclaimer</h2>
        <p>
          {c.ftcDisclaimer ??
            `The information provided by ${hostName || "the host"} is for educational and personal-development purposes only. It is not intended or implied to be a substitute for professional medical, psychological, or financial advice, diagnosis, or treatment. All testimonials are genuine. Individual results may vary. This is a donation-based offering; no refunds will be issued.`}
        </p>
      </div>

      {/* Footer */}
      <footer className="ty-footer">
        <div className="inner">
          <div className="ty-footer-left">
            {safeUrl(c.logoUrl ?? w.logoUrl)
              ? <img src={safeUrl(c.logoUrl ?? w.logoUrl)!} alt={businessName || hostName} style={{ maxHeight: "168px", maxWidth: "540px", width: "100%", objectFit: "contain", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              : <div className="ty-footer-brand">{businessName || hostName}</div>
            }
            <span className="ty-footer-copy">&copy; {new Date().getFullYear()} {businessName || hostName}</span>
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
