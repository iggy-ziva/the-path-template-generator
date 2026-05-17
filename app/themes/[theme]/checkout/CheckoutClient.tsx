"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { CheckoutContent } from "@/lib/themes/types";

interface Props {
  themeSlug: string;
  host: {
    name: string;
    email: string;
    legalEntity: string;
    parentBrand: string;
  };
  event: {
    name: string;
    tagline: string;
    date: string;
    dayOfWeek: string;
    time: string;
    timezone: string;
    platform: string;
    priceMin: number;
    priceMax: number;
    priceDefault: number;
    pricePresets: number[];
    countdownDays: string;
    countdownHours: string;
    countdownMins: string;
    ctaText: string;
  };
  content: CheckoutContent;
}

export default function CheckoutClient({ themeSlug, host, event, content: c }: Props) {
  const [price, setPrice] = useState(event.priceDefault);
  const [tab, setTab] = useState<"card" | "paypal">("card");
  const [orderOpen, setOrderOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const upsellHref = `/themes/${themeSlug}/upsell`;
  const presets = event.pricePresets;
  const formattedPrice = price.toFixed(2);

  return (
    <>
      {/* Mobile summary toggle */}
      <div style={{ maxWidth: 1100, marginInline: "auto", padding: "var(--s-4) var(--s-5) 0" }}>
        <button
          className="mobile-summary-toggle"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span>{mobileOpen ? "Hide what you're getting" : "Show what you're getting"}</span>
          <Icon name="chevron-down" size={16} strokeWidth={2} />
        </button>
      </div>

      <main className="checkout-wrap">
        <div className="form-col">
          {/* 02 — Choose Your Price */}
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">{c.priceCardTitle}</h2>
            </div>
            <div className="form-card-body">
              <p className="price-range-label">
                Pay any amount from <strong>${event.priceMin}</strong> to the full price of{" "}
                <strong>${event.priceMax}</strong>. {c.priceCardDescription}
              </p>
              <div className="price-input-wrap">
                <span className="price-currency">$</span>
                <input
                  className="price-input"
                  type="number"
                  value={price}
                  min={event.priceMin}
                  max={event.priceMax}
                  aria-label="Enter your price"
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <p className="price-hint">
                Minimum ${event.priceMin} · Full price ${event.priceMax}
              </p>
              <div className="price-presets">
                {presets.map((p, i) => (
                  <button
                    key={p}
                    className={`price-preset${price === p ? " active" : ""}`}
                    data-tier={i + 1}
                    onClick={() => setPrice(p)}
                    type="button"
                  >
                    ${p}
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
                aria-expanded={orderOpen}
                onClick={() => setOrderOpen((o) => !o)}
                type="button"
              >
                {orderOpen ? "Hide" : "Show"}
                <Icon name="chevron-down" size={14} strokeWidth={2} />
              </button>
            </div>
            {orderOpen && (
              <div className="form-card-body">
                <table className="order-table">
                  <tbody>
                    <tr>
                      <td>
                        {c.orderItemDescription}
                        <br />
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                          {c.orderItemSubtitle}
                        </span>
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
                  <input className="coupon-input" type="text" placeholder="Coupon code" aria-label="Coupon code" />
                  <button className="coupon-btn" type="button">
                    Apply
                  </button>
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
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
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
                    <label htmlFor="firstName">First name</label>
                    <input type="text" id="firstName" name="first_name" autoComplete="given-name" />
                  </div>
                  <div className="field">
                    <label htmlFor="lastName">Last name</label>
                    <input type="text" id="lastName" name="last_name" autoComplete="family-name" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 06 — Payment */}
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Payment</h2>
            </div>
            <div className="form-card-body">
              <div className="payment-tabs">
                <button
                  className={`payment-tab${tab === "card" ? " active" : ""}`}
                  onClick={() => setTab("card")}
                  type="button"
                >
                  <Icon name="card" size={16} strokeWidth={2} />
                  Credit / Debit Card
                </button>
                <button
                  className={`payment-tab${tab === "paypal" ? " active" : ""}`}
                  onClick={() => setTab("paypal")}
                  type="button"
                >
                  PayPal
                </button>
              </div>

              {tab === "card" ? (
                <div className="card-fields">
                  <div className="field">
                    <label htmlFor="cardNumber">Card number</label>
                    <div className="card-number-wrap">
                      <input
                        type="text"
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                        style={{ paddingRight: 90 }}
                      />
                      <div className="card-number-icons">
                        <div className="card-icon">VISA</div>
                        <div className="card-icon">MC</div>
                      </div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="expiry">Expiry date</label>
                      <input type="text" id="expiry" placeholder="MM / YY" inputMode="numeric" />
                    </div>
                    <div className="field">
                      <label htmlFor="cvv">Security code</label>
                      <input type="text" id="cvv" placeholder="CVV" inputMode="numeric" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="paypal-option">
                  <p>You&apos;ll be redirected to PayPal to complete your payment securely.</p>
                  <a className="paypal-btn" href={upsellHref}>
                    Pay with PayPal
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 07 — Submit */}
          <div className="form-card">
            <div className="form-card-body">
              <p className="privacy-notice">
                Your personal data will be used to process your order and support your experience throughout
                this website, as described in our <a href="#">Privacy Policy</a>. We do not store your card
                details and we will never share or sell your data.
              </p>
              <div style={{ marginTop: "var(--s-5)" }}>
                <a className="submit-btn" href={upsellHref}>
                  {event.ctaText} — ${price.toFixed(0)}.00
                </a>
                <p className="submit-guarantee">
                  No prerequisites · Recording included · Refundable within 7 days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SALES COLUMN */}
        <aside className="sales-col">
          <div className={`sales-card${mobileOpen ? " is-open" : ""}`}>
            <div className="sales-card-hero">
              <div className="sales-live-tag">
                <span className="dot" />
                Live Online
              </div>
              <h2 className="sales-event-name">{event.name}</h2>
              <p className="sales-tagline">{c.salesEventTagline}</p>
            </div>

            <div className="sales-details">
              <div className="sales-detail-row">
                <span className="sales-detail-label">Date</span>
                <span className="sales-detail-value">
                  <strong>{event.date}</strong>
                </span>
              </div>
              <div className="sales-detail-row">
                <span className="sales-detail-label">Time</span>
                <span className="sales-detail-value">
                  {event.dayOfWeek} {event.time} {event.timezone}
                </span>
              </div>
              <div className="sales-detail-row">
                <span className="sales-detail-label">Format</span>
                <span className="sales-detail-value">Live online via {event.platform} · Recording included</span>
              </div>
              <div className="sales-detail-row">
                <span className="sales-detail-label">Host</span>
                <span className="sales-detail-value">{host.name}</span>
              </div>
            </div>

            <div className="sales-countdown">
              <span className="sales-countdown-label">Starts in</span>
              <div className="countdown-units">
                <div className="countdown-unit">
                  <span className="countdown-number">{event.countdownDays}</span>
                  <span className="countdown-label">Days</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-number">{event.countdownHours}</span>
                  <span className="countdown-label">Hrs</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-number">{event.countdownMins}</span>
                  <span className="countdown-label">Mins</span>
                </div>
              </div>
            </div>

            <div className="sales-price">
              <div className="sales-price-label">Your contribution</div>
              <div className="sales-price-value">
                ${price} — {c.salesPriceDescriptor}
              </div>
            </div>

            <div className="sales-benefits">
              <div className="sales-benefits-title">What you&apos;ll experience</div>
              <div className="sales-benefit-list">
                {c.salesBenefits.map((b, i) => (
                  <div key={i} className="sales-benefit">
                    <Icon name="check" size={16} strokeWidth={2} />
                    <span>
                      <strong>{b.title}</strong> {b.rest}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}
