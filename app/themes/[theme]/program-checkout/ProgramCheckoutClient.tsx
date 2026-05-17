"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { ProgramCheckoutContent } from "@/lib/themes/types";

type PlanKey = "extended" | "spread" | "full";

interface Props {
  themeSlug: string;
  host: { name: string; email: string; parentBrand: string };
  program: {
    name: string;
    nameLine1: string;
    nameLine2: string;
    durationLabel: string;
    sessionsCount: number;
    startDate: string;
    enrolmentDeadline: string;
    scheduleLine: string;
    fullPrice: number;
    spreadPerPayment: number;
    spreadCount: number;
    spreadTotal: number;
    extendedPerPayment: number;
    extendedCount: number;
    extendedTotal: number;
  };
  content: ProgramCheckoutContent;
}

export default function ProgramCheckoutClient({ themeSlug, host, program, content: c }: Props) {
  const [plan, setPlan] = useState<PlanKey>("spread");
  const thankYouHref = `/themes/${themeSlug}/program-thank-you`;

  const dueToday =
    plan === "full"
      ? `$${program.fullPrice.toLocaleString()}`
      : plan === "spread"
        ? `$${program.spreadPerPayment.toLocaleString()}`
        : `$${program.extendedPerPayment.toLocaleString()}`;

  const submitText =
    plan === "full"
      ? `Enrol now — $${program.fullPrice.toLocaleString()}`
      : plan === "spread"
        ? `Start with $${program.spreadPerPayment} today`
        : `Start with $${program.extendedPerPayment} today`;

  return (
    <main className="co-wrap">
      {/* FORM */}
      <div className="form-box">
        <div className="form-section">
          <p className="form-section-title">Your details</p>
          <div className="field-grid">
            <div className="field-row">
              <div className="field">
                <label htmlFor="fname">First name</label>
                <input type="text" id="fname" autoComplete="given-name" />
              </div>
              <div className="field">
                <label htmlFor="lname">Last name</label>
                <input type="text" id="lname" autoComplete="family-name" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input type="email" id="email" autoComplete="email" />
            </div>
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Choose your payment option</p>
          <div className="plan-card-grid">
            <button
              type="button"
              className={`plan-card${plan === "extended" ? " selected" : ""}`}
              onClick={() => setPlan("extended")}
              aria-pressed={plan === "extended"}
            >
              <span className="plan-card-label">Extended</span>
              <span className="plan-card-price">
                <sup>$</sup>
                {program.extendedPerPayment}
              </span>
              <span className="plan-card-cadence">
                × {program.extendedCount} monthly
                <br />
                Total ${program.extendedTotal.toLocaleString()}
              </span>
              <span className="plan-card-selector">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
            </button>

            <button
              type="button"
              className={`plan-card plan-card-featured${plan === "spread" ? " selected" : ""}`}
              onClick={() => setPlan("spread")}
              aria-pressed={plan === "spread"}
            >
              <span className="plan-card-badge">Most popular</span>
              <span className="plan-card-label">Spread</span>
              <span className="plan-card-price">
                <sup>$</sup>
                {program.spreadPerPayment}
              </span>
              <span className="plan-card-cadence">
                × {program.spreadCount} monthly
                <br />
                Total ${program.spreadTotal.toLocaleString()}
              </span>
              <span className="plan-card-selector">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
            </button>

            <button
              type="button"
              className={`plan-card${plan === "full" ? " selected" : ""}`}
              onClick={() => setPlan("full")}
              aria-pressed={plan === "full"}
            >
              <span className="plan-card-label">Pay in full</span>
              <span className="plan-card-price">
                <sup>$</sup>
                {program.fullPrice.toLocaleString()}
              </span>
              <span className="plan-card-cadence">
                One payment
                <br />
                Save ${(program.spreadTotal - program.fullPrice).toLocaleString()}
              </span>
              <span className="plan-card-saving">+ 1:1 onboarding call</span>
              <span className="plan-card-selector">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
            </button>
          </div>

          <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0 }}>
            {plan === "full" && (
              <>
                A single charge of <strong style={{ color: "var(--text-primary)" }}>${program.fullPrice.toLocaleString()}</strong>{" "}
                to your card today. No further charges. Includes a 1:1 onboarding call with {host.name.split(" ")[0]}.
              </>
            )}
            {plan === "spread" && (
              <>
                Your first charge is <strong style={{ color: "var(--text-primary)" }}>${program.spreadPerPayment} today</strong>, then ${program.spreadPerPayment} each month for {program.spreadCount - 1} more months.
              </>
            )}
            {plan === "extended" && (
              <>
                Your first charge is <strong style={{ color: "var(--text-primary)" }}>${program.extendedPerPayment} today</strong>, then ${program.extendedPerPayment} each month for {program.extendedCount - 1} more months.
              </>
            )}
          </p>
        </div>

        <div className="form-section">
          <p className="form-section-title">Card details</p>
          <div style={{ display: "grid", gap: "var(--s-4)" }}>
            <div className="field">
              <label>Card number</label>
              <div className="stripe-field">
                <Icon name="card" size={18} strokeWidth={1.5} />
                <span className="stripe-field-label">Card number</span>
                <span className="stripe-pill">STRIPE</span>
              </div>
              <div className="card-icons">
                <div className="card-chip visa">VISA</div>
                <div className="card-chip mc">MC</div>
                <div className="card-chip amex">AMEX</div>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Expiry date</label>
                <div className="stripe-field">
                  <Icon name="calendar" size={18} strokeWidth={1.5} />
                  <span className="stripe-field-label">MM / YY</span>
                </div>
              </div>
              <div className="field">
                <label>Security code</label>
                <div className="stripe-field">
                  <Icon name="shield" size={18} strokeWidth={1.5} />
                  <span className="stripe-field-label">CVC</span>
                </div>
              </div>
            </div>
          </div>
          <div className="stripe-branding">
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              Payments processed securely by Stripe
            </span>
          </div>
        </div>

        <div className="submit-section">
          <a className="submit-btn" href={thankYouHref}>
            {submitText}
          </a>
          <div className="payment-divider">or pay with</div>
          <button className="paypal-btn" type="button">
            <span>Pay with PayPal</span>
          </button>
          <div className="submit-security">
            <div className="submit-security-item">
              <Icon name="shield" size={14} strokeWidth={2.5} />
              <span>Secure checkout</span>
            </div>
            <div className="submit-security-sep" />
            <div className="submit-security-item">
              <Icon name="check" size={14} strokeWidth={2.5} />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="submit-security-sep" />
            <div className="submit-security-item">
              <Icon name="lock" size={14} strokeWidth={2.5} />
              <span>SSL encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* ORDER */}
      <aside className="order-col">
        <p className="order-eyebrow">A program by {host.name}</p>
        <h2 className="order-program-name">
          {program.nameLine1}
          <br />
          {program.nameLine2}
        </h2>
        <div className="order-meta">
          <span className="order-meta-chip">
            <Icon name="clock" size={14} strokeWidth={2} />
            {program.durationLabel}
          </span>
          <span className="order-meta-chip">
            <Icon name="calendar" size={14} strokeWidth={2} />
            Starts {program.startDate}
          </span>
          <span className="order-meta-chip">
            <Icon name="group" size={14} strokeWidth={2} />
            Live online · 2 sessions/week
          </span>
        </div>

        <div className="order-summary">
          <div className="order-summary-header">
            Order summary — {plan === "full" ? "Pay in full" : plan === "spread" ? "Spread plan" : "Extended plan"}
          </div>
          <div className="order-line">
            <div className="order-line-label">
              {program.name}
              <span className="sub">{c.programDescription}</span>
            </div>
            <div className="order-line-value">
              ${plan === "full" ? program.fullPrice.toLocaleString() : plan === "spread" ? program.spreadTotal.toLocaleString() : program.extendedTotal.toLocaleString()}
            </div>
          </div>
          <div className="order-line">
            <div className="order-line-label">All bonuses included</div>
            <div className="order-line-value" style={{ color: "rgba(156,196,138,0.9)", fontSize: 13 }}>
              Included
            </div>
          </div>
          <div className="order-total">
            <span className="order-total-label">Due today</span>
            <span className="order-total-value">{dueToday}</span>
          </div>
        </div>

        <div className="order-benefits">
          <p className="order-benefits-title">Everything included</p>
          {c.programIncludes.map((b, i) => (
            <div key={i} className="order-benefit">
              <Icon name="check" size={14} strokeWidth={2} />
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div className="order-guarantee">
          <div className="guarantee-icon">
            <Icon name="shield" size={20} strokeWidth={2} />
          </div>
          <div className="guarantee-text">
            <h4>{c.guaranteeHeadline}</h4>
            <p>{c.guaranteeBody}</p>
          </div>
        </div>

        <p className="order-attribution">{c.orderAttribution}</p>
      </aside>
    </main>
  );
}
