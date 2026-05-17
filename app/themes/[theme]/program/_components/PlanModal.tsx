"use client";

import { useEffect, useState } from "react";

interface Plan {
  label: string;
  price: string;
  cadence: string;
  saving?: string;
  ctaText: string;
  href: string;
  featured?: boolean;
  badge?: string;
  outline?: boolean;
}

interface Props {
  triggers?: string[]; // ignored - kept for compat
  plans: Plan[];
  hostEmail: string;
}

let opener: (() => void) | null = null;
export function openPlans() {
  if (opener) opener();
}

export default function PlanModal({ plans, hostEmail }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    opener = () => setOpen(true);
    return () => {
      opener = null;
    };
  }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <div
      id="plans-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Payment plans"
      aria-hidden={!open}
      className={open ? "open" : ""}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div id="plans-modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Payment Plans</div>
            <div className="modal-sub">Choose the option that works for you. Same program, same access.</div>
          </div>
          <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="plans-grid">
          {plans.map((p, i) => (
            <div key={i} className={`plan-col${p.featured ? " featured" : ""}`}>
              {p.badge && <span className="plan-badge">{p.badge}</span>}
              <span className="plan-label">{p.label}</span>
              <span className="plan-price">
                <sup>$</sup>
                {p.price.replace("$", "")}
              </span>
              <span className="plan-cadence" dangerouslySetInnerHTML={{ __html: p.cadence }} />
              {p.saving && <span className="plan-saving">{p.saving}</span>}
              <a
                className={`plan-enrol ${p.outline ? "plan-enrol-outline" : "plan-enrol-filled"}`}
                href={p.href}
              >
                {p.ctaText}
              </a>
            </div>
          ))}
        </div>
        <p className="modal-footer-note">
          Secure checkout via Stripe · All major cards accepted · Questions?{" "}
          <a href={`mailto:${hostEmail}`} style={{ color: "var(--accent-primary)" }}>
            Email us
          </a>
        </p>
      </div>
    </div>
  );
}

export function PlanButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={openPlans}>
      {children}
    </button>
  );
}
