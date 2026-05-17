import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { Icon } from "@/components/Icon";
import type { IconKey } from "@/components/Icon";
import PlanModal, { PlanButton } from "./_components/PlanModal";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const { host, program, content } = theme;
  const c = content.program;
  const checkoutHref = `/themes/${theme.slug}/program-checkout`;

  const plans = [
    {
      label: "Extended",
      price: program.extendedPerPayment.toString(),
      cadence: `× ${program.extendedCount} monthly payments<br>Total $${program.extendedTotal.toLocaleString()}`,
      ctaText: "Enrol now",
      href: checkoutHref,
      outline: true,
    },
    {
      label: "Spread",
      price: program.spreadPerPayment.toString(),
      cadence: `× ${program.spreadCount} monthly payments<br>Total $${program.spreadTotal.toLocaleString()}`,
      ctaText: "Enrol now",
      href: checkoutHref,
      featured: true,
      badge: "Most popular",
    },
    {
      label: "Pay in full",
      price: program.fullPrice.toLocaleString(),
      cadence: `One payment<br>Save $${(program.spreadTotal - program.fullPrice).toLocaleString()} vs spread`,
      saving: "+ Includes 1:1 onboarding call",
      ctaText: "Enrol now",
      href: checkoutHref,
      outline: true,
    },
  ];

  return (
    <>
      {/* 01 — Hero */}
      <section className="prog-hero">
        <span className="section-marker">01 — Hero</span>
        <div className="container">
          <div className="prog-hero-main">
            <p className="prog-hero-eyebrow">{c.heroEyebrow}</p>
            <h1 className="prog-hero-title">
              {program.nameLine1}
              <br />
              {program.nameLine2}
            </h1>
            <p className="prog-hero-sub">{program.tagline}</p>
            <div className="prog-hero-meta">
              <span className="prog-hero-meta-item">
                <strong>{program.durationLabel}</strong>
              </span>
              <span className="prog-hero-meta-dot" />
              <span className="prog-hero-meta-item">
                <strong>Live online</strong> · 2 sessions per week
              </span>
              <span className="prog-hero-meta-dot" />
              <span className="prog-hero-meta-item">
                Starts <strong>{program.startDate}</strong>
              </span>
            </div>
            <PlanButton className="prog-hero-cta">Enrol now →</PlanButton>
          </div>
          <div className="prog-hero-price-card">
            <span className="hero-price-label">Starting from</span>
            <span className="hero-price-main">
              <sup>$</sup>
              {program.extendedPerPayment}
            </span>
            <span className="hero-price-plan">
              per month
              <br />
              or <PlanButton>see all payment plans</PlanButton>
            </span>
            <div className="hero-price-divider" />
            <PlanButton className="hero-enrol-btn">Choose my plan</PlanButton>
            <p className="hero-urgency">Enrolment closes {program.enrolmentDeadline}</p>
          </div>
        </div>
      </section>

      {/* 02 — Vision */}
      <section className="vision">
        <span className="section-marker">02 — Vision</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.visionEyebrow}</span>
            <h2 className="display-section">{c.visionHeadline}</h2>
          </div>
          <div className="vision-grid">
            {c.vision.map((v, i) => (
              <div key={i} className="vision-item">
                <span className="vision-bullet" />
                <p>
                  <strong>{v.strong}</strong> — {v.rest}
                </p>
              </div>
            ))}
          </div>
          <div className="vision-cta">
            <PlanButton className="btn btn-primary">{program.enrolCtaText}</PlanButton>
            <span className="vision-cta-note">
              Payment plans available · Enrolment closes {program.enrolmentDeadline}
            </span>
          </div>
        </div>
      </section>

      {/* 03 — Already tried */}
      <section className="already-tried">
        <span className="section-marker">03 — Already tried</span>
        <div className="container">
          <div className="already-tried-inner">
            <div>
              <p className="already-tried-eyebrow">{c.alreadyTriedEyebrow}</p>
              <h2 className="already-tried-headline">{c.alreadyTriedHeadline}</h2>
              {c.alreadyTriedBody.map((p, i) => (
                <p
                  key={i}
                  className="already-tried-body"
                  style={i > 0 ? { marginTop: "var(--s-4)" } : undefined}
                >
                  {p}
                </p>
              ))}
            </div>
            <div className="tried-cloud">
              {c.triedTags.map((t, i) => (
                <span key={i} className="tried-tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04 — Promise */}
      <section className="promise">
        <span className="section-marker">04 — Promise</span>
        <div className="container">
          <div className="promise-left">
            <h2 className="promise-headline">{c.promiseHeadline}</h2>
            <p className="promise-body">{c.promiseBody}</p>
          </div>
          <ul className="promise-list">
            {c.promiseItems.map((p, i) => (
              <li key={i} className="promise-list-item">
                <span className="promise-check">
                  <Icon name="check" size={10} strokeWidth={1.5} />
                </span>
                <p>
                  <strong>{p.strong}</strong> {p.rest}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 05 — Includes */}
      <section className="includes">
        <span className="section-marker">05 — Includes</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.includesEyebrow}</span>
            <h2 className="display-section">{c.includesHeadline}</h2>
            <p className="body-lg">{c.includesSubline}</p>
          </div>
          <div className="includes-grid">
            {c.includes.map((item, i) => (
              <div key={i} className="includes-item">
                <div className="includes-item-num">{item.num}</div>
                <div className="includes-item-icon">
                  <Icon name={item.iconKey as IconKey} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="includes-item-tag">{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — Session breakdown */}
      <section className="session-breakdown">
        <span className="section-marker">06 — Session breakdown</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.sessionEyebrow}</span>
            <h2 className="display-section">{c.sessionHeadline}</h2>
            <p className="body-lg">{c.sessionSubline}</p>
          </div>
          <div className="week-list">
            {c.weeks.map((w, i) => (
              <details key={i} className={`week-item${i === 0 ? " open" : ""}`} open={i === 0}>
                <summary className="week-trigger">
                  <span className="week-num">Week {w.week}</span>
                  <span className="week-title">{w.title}</span>
                  <span className="week-date">{w.dates}</span>
                  <span className="week-icon">
                    <Icon name="plus" size={12} strokeWidth={1.5} />
                  </span>
                </summary>
                <div className="week-body">
                  <div className="week-body-inner">
                    <ul className="week-points">
                      {w.points.map((pt, pi) => (
                        <li key={pi}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 07 — Video testimonials */}
      <section className="video-testimonials">
        <span className="section-marker">07 — Video testimonials</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.videoTestimonialsEyebrow}</span>
            <h2 className="display-section">{c.videoTestimonialsHeadline}</h2>
          </div>
          <div className="vt-track">
            {c.videoTestimonials.map((t, i) => (
              <div key={i} className="vt-card">
                <div className="vt-thumb">
                  <button className="vt-play" aria-label="Play testimonial">
                    <Icon name="play" size={24} />
                  </button>
                  <span className="vt-duration">{t.duration}</span>
                </div>
                <div className="vt-info">
                  <p className="vt-quote">&ldquo;{t.quote}&rdquo;</p>
                  <span className="vt-author">{t.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — Credibility */}
      <section className="credibility">
        <span className="section-marker">08 — Credibility</span>
        <div className="container">
          <div className="quote-glyph" aria-hidden="true">&ldquo;</div>
          <blockquote>{c.credibilityProgram.quote}</blockquote>
          <cite>
            <strong>{c.credibilityProgram.name}</strong>
            {c.credibilityProgram.location && <> · {c.credibilityProgram.location}</>}
          </cite>
        </div>
      </section>

      {/* 09 — Bonuses */}
      <section className="bonuses">
        <span className="section-marker">09 — Bonuses</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.bonusesEyebrow}</span>
            <h2 className="display-section">{c.bonusesHeadline}</h2>
          </div>
          <div className="bonus-list">
            {c.bonuses.map((b, i) => (
              <div key={i} className="bonus-card">
                <span className="bonus-num">Bonus {i + 1}</span>
                <div className="bonus-content">
                  <h3 className="bonus-title">
                    {b.title}
                    {b.restriction && (
                      <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-tertiary)" }}>
                        {" "}({b.restriction})
                      </span>
                    )}
                  </h3>
                  <p className="bonus-desc">{b.description}</p>
                </div>
                <span className="bonus-value">{b.value}</span>
              </div>
            ))}
          </div>
          <div className="bonus-total">
            <p className="bonus-total-label">Total bonus value</p>
            <p className="bonus-total-value">{program.bonusTotalValue}</p>
            <p className="bonus-total-note">{c.bonusTotalNote}</p>
          </div>
        </div>
      </section>

      {/* 10 — Mid-page price repeat */}
      <section className="price-repeat">
        <span className="section-marker">10 — Mid-page price repeat</span>
        <div className="container">
          <span className="price-repeat-label">{c.priceRepeatLabel}</span>
          <h2 className="price-repeat-name">{program.name}</h2>
          <span className="price-repeat-amount">
            <sup>$</sup>
            {program.fullPrice.toLocaleString()}
          </span>
          <p className="price-repeat-plan">
            one payment — or <PlanButton>see payment plans</PlanButton>
          </p>
          <PlanButton className="price-repeat-btn">Enrol now</PlanButton>
          <p className="price-repeat-urgency">{c.priceRepeatUrgency}</p>
        </div>
      </section>

      {/* 11 — Outcomes */}
      <section className="outcomes" style={{ background: "var(--surface-sunken)" }}>
        <span className="section-marker">11 — Outcomes</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.outcomesEyebrow}</span>
            <h2 className="display-section">{c.outcomesHeadline}</h2>
            <p className="body-lg">{c.outcomesSubline}</p>
          </div>
          <div className="outcome-grid">
            {c.outcomes.map((o, i) => (
              <div key={i} className="outcome">
                <div className="outcome-icon">
                  <Icon name={o.iconKey as IconKey} />
                </div>
                <p>
                  <strong>{o.strong}</strong> {o.rest}
                </p>
              </div>
            ))}
          </div>
          <div className="prog-outcomes-cta">
            <PlanButton className="btn btn-primary btn-xl">{program.enrolCtaText}</PlanButton>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)" }}>
              Payment plans available · Enrolment closes {program.enrolmentDeadline}
            </p>
          </div>
        </div>
      </section>

      {/* 12 — Written testimonials */}
      <section className="testimonials">
        <span className="section-marker">12 — Written testimonials</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.writtenEyebrow}</span>
            <h2 className="display-section">{c.writtenHeadline}</h2>
          </div>
          <div className="testimonials-carousel">
            <div className="testimonials-track">
              {c.writtenTestimonials.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="testimonial-stars">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Icon key={si} name="star" size={14} />
                    ))}
                  </div>
                  <p className="testimonial-body">&ldquo;{t.body}&rdquo;</p>
                  <div className="testimonial-author">
                    <span className="testimonial-name">{t.name}</span>
                    <span className="testimonial-handle">{t.handle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 13 — Pricing */}
      <section className="pricing" id="pricing">
        <span className="section-marker">13 — Pricing</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.pricingEyebrow}</span>
            <h2 className="display-section">{c.pricingHeadline}</h2>
            <p className="body-lg">{c.pricingSubline}</p>
          </div>
          <div className="pricing-card">
            <span className="pricing-program-name">{program.name}</span>
            <div className="pricing-divider" />
            <span className="pricing-label">Pay in full</span>
            <span className="pricing-amount">
              <sup>$</sup>
              {program.fullPrice.toLocaleString()}
            </span>
            <p className="pricing-or-plans">or choose a payment plan</p>
            <PlanButton className="pricing-plans-trigger">See all payment plans →</PlanButton>
            <PlanButton className="pricing-enrol-btn">Enrol now</PlanButton>
            <p className="pricing-fine-print">
              Secure checkout · Instant access · Questions?{" "}
              <a href={`mailto:${host.email}`} style={{ color: "rgba(245,241,234,0.45)", textDecoration: "underline" }}>
                Email us
              </a>
            </p>
          </div>
          <p className="pricing-urgency">
            <Icon name="clock" size={12} strokeWidth={1.2} />
            {c.pricingUrgency}
          </p>
        </div>
      </section>

      {/* 14 — Host */}
      <section className="host">
        <span className="section-marker">14 — Host</span>
        <div className="container">
          <div className="host-photo">
            <div className="host-photo-inner">
              <p className="host-photo-label">
                Host photo
                <br />
                3:4 portrait
              </p>
            </div>
          </div>
          <div className="host-content">
            <p className="host-eyebrow">{c.hostEyebrow}</p>
            <h2 className="host-name">{host.name}</h2>
            {host.bio.map((p, i) => (
              <p key={i} className="host-bio" dangerouslySetInnerHTML={{ __html: p }} />
            ))}
            <ul className="host-credentials">
              {host.credentials.map((cred, i) => (
                <li key={i}>
                  <span className="host-cred-dot" />
                  {cred}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 15 — FAQ */}
      <section className="faq">
        <span className="section-marker">15 — FAQ</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Questions</span>
            <h2 className="display-section">{c.faqHeadline}</h2>
          </div>
          <div className="faq-list">
            {c.faq.map((f, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">
                  {f.q}
                  <span className="faq-icon">
                    <Icon name="plus" size={12} strokeWidth={1.5} />
                  </span>
                </summary>
                <div className="faq-answer">
                  <div className="faq-answer-inner">{f.a}</div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 16 — Final CTA */}
      <section className="final-cta">
        <span className="section-marker">16 — Final CTA</span>
        <div className="container">
          <h2 className="final-cta-headline">{c.finalCtaHeadline}</h2>
          <p className="final-cta-body">{c.finalCtaBody}</p>
          <PlanButton className="final-cta-btn">{program.enrolCtaText}</PlanButton>
          <p className="final-cta-deadline">{c.finalCtaDeadline}</p>
        </div>
      </section>

      {/* 17 — Disclaimer + footer */}
      <div className="prog-disclaimer">
        <div className="container">
          <p>{c.disclaimerText}</p>
        </div>
      </div>

      <footer className="prog-footer">
        <div className="container">
          <span className="prog-footer-logo">{host.name}</span>
          <nav className="prog-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Refund Policy</a>
            <a href={`mailto:${host.email}`}>Contact</a>
          </nav>
        </div>
      </footer>

      {/* Payment plan modal */}
      <PlanModal plans={plans} hostEmail={host.email} />
    </>
  );
}
