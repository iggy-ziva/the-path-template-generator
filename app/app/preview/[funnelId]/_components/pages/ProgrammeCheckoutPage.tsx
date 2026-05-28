"use client";
import { useState } from "react";
import type { ProgrammeCheckoutContent, WizardSnapshot } from "../funnel-types";
import { safeUrl } from "../funnel-types";
import BrandLogo from "../BrandLogo";

interface Props {
  content: ProgrammeCheckoutContent;
  wizard: WizardSnapshot;
}

type PlanId = string;

export default function ProgrammeCheckoutPage({ content: c, wizard: w }: Props) {
  const programName = c.programName ?? w.programName ?? "The Programme";
  const hostName = w.hostName ?? "Your Host";
  const year = new Date().getFullYear();

  // Build plans from content or wizard.
  // Pay-in-full is ALWAYS first and ALWAYS the default selected plan.
  // Payment plans (installments) follow and are never featured.
  const fullPlan = {
    id: "full",
    name: "Pay in full",
    amount: `$${(w.programPriceFull ?? 1997).toLocaleString()}`,
    schedule: "One payment\nBest value",
    isFeatured: true,
  };
  const installmentPlans = w.programPaymentPlans?.map((p, i) => ({
    id: `plan-${i}`,
    name: i === 0 ? "3 payments" : i === 1 ? "6 payments" : `${p.installments} payments`,
    amount: `$${p.amountPerInstallment.toLocaleString()}`,
    schedule: `× ${p.installments} ${p.cadence}\nTotal $${(p.installments * p.amountPerInstallment).toLocaleString()}`,
    isFeatured: false,
  })) ?? [];

  const rawPlans = c.plans
    ? c.plans.map((p, i) => ({ ...p, isFeatured: i === 0 })) // first plan from schema is always featured
    : [fullPlan, ...installmentPlans];

  const defaultPlanId: PlanId = rawPlans.find((p) => p.isFeatured)?.id ?? rawPlans[0]?.id ?? "";
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(defaultPlanId);

  const activePlan = rawPlans.find((p) => p.id === selectedPlan) ?? rawPlans[0];

  const benefits = c.benefits ?? [];
  const chips = c.programChips ?? (w.programDuration ? [w.programDuration] : []);

  return (
    <div className="programme-checkout-page" style={{ background: "var(--surface-inverse)", color: "var(--text-inverse)", minHeight: "100%" }}>
      {/* ── HEADER ── */}
      <header className="co-header">
        <div className="inner">
          <div className="co-logo">
            <BrandLogo
              logoUrl={c.logoUrl ?? w.logoUrl}
              logoTransparent={w.logoTransparent}
              name={hostName}
              imgStyle={{ height: "64px", objectFit: "contain" }}
            />
          </div>
          <div className="co-trust">
            <div className="co-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Secure checkout</span>
            </div>
            <div className="co-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>SSL encrypted</span>
            </div>
            <div className="co-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Instant access</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="co-wrap">

        {/* ── LEFT: FORM BOX ── */}
        <div className="form-box">

          {/* Contact details */}
          <div className="form-section">
            <p className="form-section-title">Your details</p>
            <div className="field-grid">
              <div className="field-row">
                <div className="field">
                  <label htmlFor="fname">First name</label>
                  <input type="text" id="fname" placeholder="First name" autoComplete="given-name" />
                </div>
                <div className="field">
                  <label htmlFor="lname">Last name</label>
                  <input type="text" id="lname" placeholder="Last name" autoComplete="family-name" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input type="email" id="email" placeholder="you@example.com" autoComplete="email" />
              </div>
            </div>
          </div>

          {/* Payment plan selector */}
          {rawPlans.length > 1 && (
            <div className="form-section">
              <p className="form-section-title">Choose your payment option</p>
              <div className="plan-card-grid">
                {rawPlans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  const lines = (plan.schedule ?? "").split("\n");
                  return (
                    <button
                      key={plan.id}
                      className={[
                        "plan-card",
                        plan.isFeatured ? "plan-card-featured" : "",
                        isSelected ? "selected" : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => setSelectedPlan(plan.id)}
                      aria-pressed={isSelected}
                    >
                      {plan.isFeatured && <span className="plan-card-badge">Most popular</span>}
                      <span className="plan-card-label">{plan.name}</span>
                      <span className="plan-card-price">
                        {plan.amount}
                      </span>
                      {lines.map((line, i) => (
                        <span key={i} className="plan-card-cadence">{line}</span>
                      ))}
                      <span className="plan-card-selector">
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="2 6 5 9 10 3" />
                        </svg>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Contextual note per selected plan */}
              {activePlan && (
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>
                  {activePlan.isFeatured
                    ? <>Your first charge is <strong style={{ color: "var(--text-primary)" }}>{activePlan.amount} today</strong>, then {activePlan.amount} on the same date each month.</>
                    : <>A single charge of <strong style={{ color: "var(--text-primary)" }}>{activePlan.amount}</strong> to your card today.</>
                  }
                </p>
              )}
            </div>
          )}

          {/* Card details */}
          <div className="form-section">
            <p className="form-section-title">Card details</p>
            <div style={{ display: "grid", gap: "var(--s-4)" }}>
              <div className="field">
                <label>Card number</label>
                <div className="stripe-field">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="stripe-field-label">MM / YY</span>
                  </div>
                </div>
                <div className="field">
                  <label>Security code</label>
                  <div className="stripe-field">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span className="stripe-field-label">CVC</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="stripe-branding">
              <svg viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="18" fontFamily="sans-serif" fontSize="14" fontWeight="600" fill="currentColor">stripe</text>
              </svg>
              <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Payments processed securely by Stripe</span>
            </div>
          </div>

          {/* Submit */}
          <div className="submit-section">
            <button className="submit-btn">
              {c.ctaText ?? `Enrol now — ${activePlan?.amount ?? ""}`}
            </button>
            <div className="payment-divider">or pay with</div>
            <button className="paypal-btn" type="button">
              <svg height="20" viewBox="0 0 101 32" xmlns="http://www.w3.org/2000/svg" aria-label="PayPal">
                <path fill="#003087" d="M12.237 2.8C11.4 2.8 10.679 3.388 10.542 4.22L7.328 23.485c-.1.617.374 1.178 1 1.178h4.34c.837 0 1.558-.588 1.695-1.42l.875-5.55a1.72 1.72 0 0 1 1.695-1.42h2.764c4.836 0 8.468-2.34 9.548-7.198.424-1.875.018-3.354-.933-4.41-1.048-1.16-2.896-1.785-5.222-1.785H12.237z" />
              </svg>
              <span>Pay with PayPal</span>
            </button>
            <div className="submit-security">
              <div className="submit-security-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Secure checkout</span>
              </div>
              <div className="submit-security-sep" />
              <div className="submit-security-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{c.guaranteeTitle ?? "30-day money-back guarantee"}</span>
              </div>
              <div className="submit-security-sep" />
              <div className="submit-security-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>SSL encrypted</span>
              </div>
            </div>
          </div>

        </div>{/* /form-box */}

        {/* ── RIGHT: ORDER SUMMARY ── */}
        <aside className="order-col">

          {safeUrl(c.programmeImageUrl ?? w.lifestyleImageUrls?.[0]) && (
            <img
              src={safeUrl(c.programmeImageUrl ?? w.lifestyleImageUrls![0])!}
              alt=""
              style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "var(--r-lg)", marginBottom: "16px", display: "block" }}
            />
          )}
          {c.programEyebrow && <p className="order-eyebrow">{c.programEyebrow}</p>}
          <h2 className="order-program-name">{programName}</h2>

          {chips.length > 0 && (
            <div className="order-meta">
              {chips.map((chip, i) => (
                <span key={i} className="order-meta-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {chip}
                </span>
              ))}
              {w.programStartDate && (
                <span className="order-meta-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Starts {w.programStartDate}
                </span>
              )}
            </div>
          )}

          {/* Order summary */}
          <div className="order-summary">
            <div className="order-summary-header">Order summary — {activePlan?.name ?? "Pay in full"}</div>
            <div className="order-line">
              <div className="order-line-label">
                {programName}
                {w.programDuration && <span className="sub">{w.programDuration}</span>}
              </div>
              <div className="order-line-value">{activePlan?.amount}</div>
            </div>
            <div className="order-total">
              <span className="order-total-label">Due today</span>
              <span className="order-total-value">{activePlan?.amount}</span>
            </div>
          </div>

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="order-benefits">
              <p className="order-benefits-title">Everything included</p>
              {benefits.map((benefit, i) => (
                <div key={i} className="order-benefit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span dangerouslySetInnerHTML={{ __html: benefit }} />
                </div>
              ))}
            </div>
          )}

          {/* Guarantee */}
          {(c.guaranteeText ?? w.programGuarantee) && (
            <div className="order-guarantee">
              <div className="guarantee-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="guarantee-text">
                <h4>{c.guaranteeTitle ?? "Money-back guarantee"}</h4>
                <p>{c.guaranteeText ?? w.programGuarantee}</p>
              </div>
            </div>
          )}

          <p className="order-attribution">
            Designed and led by <strong>{hostName}</strong>.
            {w.hostTitle ? ` ${w.hostTitle}.` : ""}
          </p>

        </aside>

      </main>

      {/* ── FTC ── */}
      {c.ftcDisclaimer && (
        <div className="co-ftc">
          <h2>Earnings &amp; results disclaimer</h2>
          <p>{c.ftcDisclaimer}</p>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="ty-footer">
        <div className="inner">
          <div className="ty-footer-left">
            <BrandLogo
              logoUrl={c.logoUrl ?? w.logoUrl}
              logoTransparent={w.logoTransparent}
              name={hostName}
              className="ty-footer-brand"
              imgStyle={{ maxHeight: "168px", maxWidth: "540px", width: "100%", objectFit: "contain", display: "block" }}
            />
            <span className="ty-footer-copy">&copy; {year} {hostName}</span>
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
