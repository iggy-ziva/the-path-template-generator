"use client";
import { useState } from "react";
import type { ProgrammeLandingContent, WizardSnapshot, SectionTheme } from "../funnel-types";
import { safeUrl } from "../funnel-types";

function themeClasses(theme?: SectionTheme, defaultTheme: SectionTheme = "dark"): string {
  const t = theme ?? defaultTheme;
  if (t === "dark")   return "dark-bg on-dark";
  if (t === "accent") return "accent-bg on-dark";
  return "";  // light
}

interface Props {
  content: ProgrammeLandingContent;
  wizard: WizardSnapshot;
}

const StarIcon = () => (
  <svg className="testimonial-star" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1l1.55 3.14L12 4.8l-2.5 2.43.59 3.44L7 9l-3.09 1.67.59-3.44L2 4.8l3.45-.66L7 1z" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3v6M3 6h6" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function ProgrammeLandingPage({ content: c, wizard: w }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [openWeek, setOpenWeek] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const programName = c.heroHeadline ?? w.programName ?? "The Programme";
  const hostName = c.bioName ?? w.hostName ?? "Your Host";
  const priceFull = w.programPriceFull ?? 1997;
  const priceFrom = c.heroPriceFrom ?? (w.programPaymentPlans?.[0] ? `$${w.programPaymentPlans[0].amountPerInstallment}` : `$${priceFull}`);
  const checkoutHref = "/program-checkout";

  const sessionWeeks = c.sessionWeeks ?? w.curriculumWeeks?.map((wk, i) => ({
    num: `Week ${i + 1}`,
    title: wk.title,
    dates: wk.description,
    points: [wk.description],
  }));

  const testimonials = w.testimonials ?? [];
  const videoUrls = w.videoTestimonialUrls ?? [];
  const bonuses = c.bonusesItems ?? w.bonuses?.map((b, i) => ({
    num: `Bonus ${i + 1}`,
    title: b.title,
    description: b.description,
    value: b.value,
  }));

  const paymentPlans = w.programPaymentPlans ?? [];

  // Claude's assigned URLs take priority; fall back to wizard arrays; safeUrl guards against instruction strings
  const heroImageUrl         = safeUrl(c.heroBackgroundImageUrl   ?? w.heroImageUrls?.[0]);
  const programmeFeatureUrl  = safeUrl(c.programmeFeatureImageUrl ?? w.lifestyleImageUrls?.[0]);
  const finalCtaBgUrl        = safeUrl(c.finalCtaBackgroundUrl);

  return (
    <>
      {/* ── 01 HERO ── */}
      <section
        className="prog-hero"
        style={heroImageUrl ? {
          backgroundImage: `linear-gradient(to right, rgba(15,14,12,0.92) 45%, rgba(15,14,12,0.5) 100%), url(${heroImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        <div className="container">
          <div className="prog-hero-main">
            {c.heroEyebrow && <p className="prog-hero-eyebrow">{c.heroEyebrow}</p>}
            <h1 className="prog-hero-title">{programName}</h1>
            {c.heroSubheadline && <p className="prog-hero-sub">{c.heroSubheadline}</p>}
            {(c.heroMeta ?? []).length > 0 && (
              <div className="prog-hero-meta">
                {(c.heroMeta ?? []).map((item, i) => (
                  <span key={i} className="prog-hero-meta-item" dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </div>
            )}
            <a href={checkoutHref} className="prog-hero-cta" onClick={(e) => { e.preventDefault(); setModalOpen(true); }}>
              {c.heroCtaText ?? "Enrol now"} →
            </a>
          </div>

          <div className="prog-hero-price-card">
            <span className="hero-price-label">Starting from</span>
            <span className="hero-price-main">{priceFrom}</span>
            {paymentPlans.length > 0 && (
              <span className="hero-price-plan">
                per month<br />
                or <button onClick={() => setModalOpen(true)}>see all payment plans</button>
              </span>
            )}
            <div className="hero-price-divider" />
            <button className="hero-enrol-btn" onClick={() => setModalOpen(true)}>Choose my plan</button>
            {c.heroUrgency && <p className="hero-urgency">{c.heroUrgency}</p>}
          </div>
        </div>
      </section>

      {/* ── 02 VISION ── */}
      {(c.visionEyebrow || c.visionHeading || (c.visionItems ?? []).length > 0) && (
        <section className="vision">
          <div className="container">
            <div className="section-header">
              {c.visionEyebrow && <span className="eyebrow">{c.visionEyebrow}</span>}
              {c.visionHeading && <h2 className="display-section">{c.visionHeading}</h2>}
            </div>
            <div className="vision-grid">
              {(c.visionItems ?? []).map((item, i) => (
                <div key={i} className="vision-item">
                  <span className="vision-bullet" />
                  <p dangerouslySetInnerHTML={{ __html: item }} />
                </div>
              ))}
            </div>
            {c.visionCtaText && (
              <div className="vision-cta">
                <a href={checkoutHref} className="btn btn-primary" onClick={(e) => { e.preventDefault(); setModalOpen(true); }}>
                  {c.visionCtaText}
                </a>
                {c.visionCtaNote && <span className="vision-cta-note">{c.visionCtaNote}</span>}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 03 ALREADY TRIED ── */}
      {(c.alreadyTriedHeading || (c.alreadyTriedTags ?? []).length > 0) && (
        <section className={`already-tried ${themeClasses(c.alreadyTriedTheme, "dark")}`}>
          <div className="container">
            <div className="already-tried-inner">
              <div>
                {c.alreadyTriedEyebrow && <p className="already-tried-eyebrow">{c.alreadyTriedEyebrow}</p>}
                {c.alreadyTriedHeading && <h2 className="already-tried-headline">{c.alreadyTriedHeading}</h2>}
                {(c.alreadyTriedBody ?? []).map((para, i) => (
                  <p key={i} className="already-tried-body">{para}</p>
                ))}
              </div>
              <div className="tried-cloud">
                {(c.alreadyTriedTags ?? []).map((tag, i) => (
                  <span key={i} className="tried-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 04 PROMISE ── */}
      {(c.promiseHeading || (c.promiseBullets ?? []).length > 0) && (
        <section className="promise">
          <div className="container">
            <div className="promise-left">
              {c.promiseHeading && <h2 className="promise-headline">{c.promiseHeading}</h2>}
              {(c.promiseBody ?? []).map((para, i) => (
                <p key={i} className="promise-body">{para}</p>
              ))}
            </div>
            <ul className="promise-list">
              {(c.promiseBullets ?? []).map((item, i) => (
                <li key={i} className="promise-list-item">
                  <span className="promise-check">
                    <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 5l2.5 2.5 4.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Programme feature image ── */}
      {programmeFeatureUrl && (
        <div style={{ padding: "0", lineHeight: 0, overflow: "hidden", maxHeight: "480px" }}>
          <img
            src={programmeFeatureUrl}
            alt=""
            style={{ width: "100%", height: "480px", objectFit: "cover", objectPosition: "center 30%", display: "block" }}
          />
        </div>
      )}

      {/* ── 05 INCLUDES ── */}
      {(c.includesHeading || (c.includesItems ?? []).length > 0) && (
        <section className="includes">
          <div className="container">
            <div className="section-header">
              {c.includesEyebrow && <span className="eyebrow">{c.includesEyebrow}</span>}
              {c.includesHeading && <h2 className="display-section">{c.includesHeading}</h2>}
            </div>
            <div className="includes-grid">
              {(c.includesItems ?? []).map((item, i) => (
                <div key={i} className="includes-item">
                  <div className="includes-item-num">{item.num}</div>
                  <div className="includes-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.tag && <span className="includes-item-tag">{item.tag}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 06 SESSION BREAKDOWN ── */}
      {(c.sessionHeading || (sessionWeeks ?? []).length > 0) && (
        <section className="session-breakdown">
          <div className="container">
            <div className="section-header">
              {c.sessionEyebrow && <span className="eyebrow">{c.sessionEyebrow}</span>}
              {c.sessionHeading && <h2 className="display-section">{c.sessionHeading}</h2>}
            </div>
            <div className="week-list">
              {(sessionWeeks ?? []).map((week, i) => (
                <div key={i} className={`week-item${openWeek === i ? " open" : ""}`}>
                  <button
                    className="week-trigger"
                    aria-expanded={openWeek === i}
                    onClick={() => setOpenWeek(openWeek === i ? null : i)}
                  >
                    <span className="week-num">{week.num}</span>
                    <span className="week-title">{week.title}</span>
                    {week.dates && <span className="week-date">{week.dates}</span>}
                    <span className="week-icon"><PlusIcon /></span>
                  </button>
                  <div className="week-body">
                    <div className="week-body-inner">
                      <ul className="week-points">
                        {(week.points ?? []).map((pt, j) => (
                          <li key={j}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 07 VIDEO TESTIMONIALS ── */}
      {(c.videoTestimonialsHeading || videoUrls.length > 0) && (
        <section className="video-testimonials">
          <div className="container">
            <div className="section-header">
              {c.videoTestimonialsEyebrow && <span className="eyebrow">{c.videoTestimonialsEyebrow}</span>}
              {c.videoTestimonialsHeading && <h2 className="display-section">{c.videoTestimonialsHeading}</h2>}
            </div>
            <div className="vt-track">
              {videoUrls.length > 0
                ? videoUrls.map((url, i) => (
                    <div key={i} className="vt-card">
                      <div className="vt-thumb">
                        <button className="vt-play" aria-label="Play testimonial">
                          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5.5v13l11-6.5L8 5.5z" />
                          </svg>
                        </button>
                      </div>
                      <div className="vt-info">
                        <p className="vt-quote">{url}</p>
                      </div>
                    </div>
                  ))
                : [0, 1, 2].map((i) => (
                    <div key={i} className="vt-card">
                      <div className="vt-thumb">
                        <button className="vt-play" aria-label="Play testimonial">
                          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5.5v13l11-6.5L8 5.5z" />
                          </svg>
                        </button>
                      </div>
                      <div className="vt-info">
                        <p className="vt-quote">{testimonials[i]?.quote ?? ""}</p>
                        {testimonials[i] && (
                          <span className="vt-author">
                            {testimonials[i].name}
                            {testimonials[i].location ? ` · ${testimonials[i].location}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 08 CREDIBILITY PULL QUOTE ── */}
      {(c.credibilityQuote || c.credibilityAttribution) && (
        <section className="credibility">
          <div className="container">
            <div className="quote-glyph" aria-hidden="true">"</div>
            <blockquote>{c.credibilityQuote}</blockquote>
            {c.credibilityAttribution && <cite><strong>{c.credibilityAttribution}</strong></cite>}
          </div>
        </section>
      )}

      {/* ── 09 BONUSES ── */}
      {(c.bonusesHeading || (bonuses ?? []).length > 0) && (
        <section className="bonuses">
          <div className="container">
            <div className="section-header">
              {c.bonusesEyebrow && <span className="eyebrow">{c.bonusesEyebrow}</span>}
              {c.bonusesHeading && <h2 className="display-section">{c.bonusesHeading}</h2>}
            </div>
            <div className="bonus-list">
              {(bonuses ?? []).map((bonus, i) => (
                <div key={i} className="bonus-card">
                  <span className="bonus-num">{bonus.num}</span>
                  <div className="bonus-content">
                    <h3 className="bonus-title">{bonus.title}</h3>
                    <p className="bonus-desc">{bonus.description}</p>
                  </div>
                  {bonus.value && <span className="bonus-value">{bonus.value}</span>}
                </div>
              ))}
            </div>
            {c.bonusesTotal && (
              <div className="bonus-total">
                <p className="bonus-total-label">Total bonus value</p>
                <p className="bonus-total-value">{c.bonusesTotal}</p>
                <p className="bonus-total-note">Included with every enrolment. No code required.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 10 PRICE REPEAT ── */}
      {(c.midPriceLabel || c.midPriceCtaText) && (
        <section className="price-repeat">
          <div className="container">
            {c.midPriceLabel && <span className="price-repeat-label">{c.midPriceLabel}</span>}
            <h2 className="price-repeat-name">{programName}</h2>
            <span className="price-repeat-amount">
              <sup>$</sup>{priceFull.toLocaleString()}
            </span>
            {paymentPlans.length > 0 && (
              <p className="price-repeat-plan">
                one payment — or <button onClick={() => setModalOpen(true)}>see payment plans</button>
              </p>
            )}
            {c.midPriceCtaText && (
              <button className="price-repeat-btn" onClick={() => setModalOpen(true)}>
                {c.midPriceCtaText}
              </button>
            )}
            {c.midPriceUrgency && <p className="price-repeat-urgency">{c.midPriceUrgency}</p>}
          </div>
        </section>
      )}

      {/* ── 11 OUTCOMES ── */}
      {(c.outcomesHeading || (c.outcomesItems ?? []).length > 0) && (
        <section className="outcomes" style={{ background: "var(--surface-sunken)" }}>
          <div className="container">
            <div className="section-header">
              {c.outcomesEyebrow && <span className="eyebrow">{c.outcomesEyebrow}</span>}
              {c.outcomesHeading && <h2 className="display-section">{c.outcomesHeading}</h2>}
              {c.outcomesBody && <p className="body-lg">{c.outcomesBody}</p>}
            </div>
            <div className="outcome-grid">
              {(c.outcomesItems ?? []).map((item, i) => (
                <div key={i} className="outcome">
                  <div className="outcome-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" /><path d="M16 8l-4 6-3-2" />
                    </svg>
                  </div>
                  <p>
                    <strong>{item.before}</strong>{item.after ? ` ${item.after}` : ""}
                  </p>
                </div>
              ))}
            </div>
            {c.outcomesCtaText && (
              <div className="prog-outcomes-cta">
                <a href={checkoutHref} className="btn btn-primary btn-xl" onClick={(e) => { e.preventDefault(); setModalOpen(true); }}>
                  {c.outcomesCtaText}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 12 TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="testimonials">
          <div className="container">
            <div className="section-header">
              {c.testimonialsEyebrow && <span className="eyebrow">{c.testimonialsEyebrow}</span>}
              {c.testimonialsHeading && <h2 className="display-section">{c.testimonialsHeading}</h2>}
            </div>
            <div className="testimonials-carousel">
              <div className="testimonials-track" id="testimonials-track">
                {testimonials.map((t, i) => (
                  <div key={i} className="testimonial-card">
                    <div className="testimonial-stars">
                      {[0, 1, 2, 3, 4].map((s) => <StarIcon key={s} />)}
                    </div>
                    <p className="testimonial-body">"{t.quote}"</p>
                    <div className="testimonial-author">
                      <span className="testimonial-name">{t.name}</span>
                      <span className="testimonial-handle">
                        {t.context ? `${t.context} · ` : ""}{t.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="testimonials-nav">
                <button className="testimonials-nav-btn" aria-label="Previous testimonials">
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12L6 8l4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="testimonials-nav-btn" aria-label="Next testimonials">
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12l4-4-4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 13 PRICING ── */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-header">
            {c.pricingEyebrow && <span className="eyebrow">{c.pricingEyebrow}</span>}
            {c.pricingHeading && <h2 className="display-section">{c.pricingHeading}</h2>}
            {c.pricingSubheading && <p className="body-lg">{c.pricingSubheading}</p>}
          </div>
          <div className="pricing-card">
            <span className="pricing-program-name">{programName}</span>
            <div className="pricing-divider" />
            <span className="pricing-label">Pay in full</span>
            <span className="pricing-amount"><sup>$</sup>{priceFull.toLocaleString()}</span>
            {paymentPlans.length > 0 && <p className="pricing-or-plans">or choose a payment plan</p>}
            {paymentPlans.length > 0 && (
              <button className="pricing-plans-trigger" onClick={() => setModalOpen(true)}>
                See all payment plans →
              </button>
            )}
            <button className="pricing-enrol-btn" onClick={() => setModalOpen(true)}>
              {c.pricingCtaText ?? "Enrol now"}
            </button>
            <p className="pricing-fine-print">
              Secure checkout · Instant access
              {w.contactEmail && (
                <> · Questions? <a href={`mailto:${w.contactEmail}`}>{w.contactEmail}</a></>
              )}
            </p>
          </div>
          {c.pricingUrgency && (
            <p className="pricing-urgency">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 3v3.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {c.pricingUrgency}
            </p>
          )}
        </div>
      </section>

      {/* ── 14 HOST ── */}
      {(c.bioName ?? w.hostName) && (
        <section className="host">
          <div className="container">
            <div className="host-photo">
              {w.hostHeadshotUrl ? (
                <img src={w.hostHeadshotUrl} alt={hostName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div className="host-photo-inner">
                  <p className="host-photo-label">Host photo<br />3:4 portrait</p>
                </div>
              )}
            </div>
            <div className="host-content">
              {c.bioEyebrow && <p className="host-eyebrow">{c.bioEyebrow}</p>}
              <h2 className="host-name">{hostName}</h2>
              {(c.bioParagraphs ?? (w.hostBio ? [w.hostBio] : [])).map((para, i) => (
                <p key={i} className="host-bio">{para}</p>
              ))}
              {(c.bioCredentials ?? []).length > 0 && (
                <ul className="host-credentials">
                  {(c.bioCredentials ?? []).map((cred, i) => (
                    <li key={i}>
                      <span className="host-cred-dot" />
                      {cred}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 15 FAQ ── */}
      {(c.faqItems ?? []).length > 0 && (
        <section className="faq">
          <div className="container">
            <div className="section-header">
              {c.faqEyebrow && <span className="eyebrow">{c.faqEyebrow}</span>}
              <h2 className="display-section">Things people ask before enrolling</h2>
            </div>
            <div className="faq-list">
              {(c.faqItems ?? []).map((item, i) => (
                <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
                  <button
                    className="faq-question"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {item.question}
                    <span className="faq-icon">
                      <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 3v6M3 6h6" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <div className="faq-answer">
                    <div className="faq-answer-inner">{item.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 16 FINAL CTA ── */}
      {(c.finalCtaHeadline || c.finalCtaText) && (
        <section
          className={`final-cta ${themeClasses(c.finalCtaTheme, "dark")}`}
          style={finalCtaBgUrl ? { backgroundImage: `linear-gradient(rgba(15,14,12,0.88),rgba(15,14,12,0.88)), url(${finalCtaBgUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          <div className="container">
            {c.finalCtaHeadline && <h2 className="final-cta-headline">{c.finalCtaHeadline}</h2>}
            {c.finalCtaBody && <p className="final-cta-body">{c.finalCtaBody}</p>}
            {c.finalCtaText && (
              <button className="final-cta-btn" onClick={() => setModalOpen(true)}>
                {c.finalCtaText}
              </button>
            )}
            {c.finalCtaDeadline && <p className="final-cta-deadline">{c.finalCtaDeadline}</p>}
          </div>
        </section>
      )}

      {/* ── DISCLAIMER + FOOTER ── */}
      {c.ftcDisclaimer && (
        <div className="prog-disclaimer">
          <div className="container">
            <p>{c.ftcDisclaimer}</p>
          </div>
        </div>
      )}

      <footer className="prog-footer">
        <div className="container">
          <span className="prog-footer-logo">{hostName}</span>
          <nav className="prog-footer-links">
            {w.websiteUrl && <a href={w.websiteUrl}>Privacy Policy</a>}
            <a href="#">Terms of Use</a>
            {w.contactEmail && <a href={`mailto:${w.contactEmail}`}>Contact</a>}
          </nav>
        </div>
      </footer>

      {/* ── PAYMENT PLANS MODAL ── */}
      {paymentPlans.length > 0 && (
        <div
          id="plans-modal-backdrop"
          className={modalOpen ? "open" : ""}
          role="dialog"
          aria-modal={true}
          aria-label="Payment plans"
          aria-hidden={!modalOpen}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div id="plans-modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">Payment Plans</div>
                <div className="modal-sub">Choose the option that works for you. Same program, same access.</div>
              </div>
              <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="plans-grid">
              {/* Pay in full is always first and always featured — best value, lowest total */}
              <div className="plan-col featured">
                <span className="plan-badge">Best value</span>
                <span className="plan-label">Pay in full</span>
                <span className="plan-price"><sup>$</sup>{priceFull.toLocaleString()}</span>
                <span className="plan-cadence">One payment</span>
                <a href={checkoutHref} className="plan-enrol plan-enrol-filled">Enrol now</a>
              </div>
              {/* Payment plans — none can be featured; only one badge is allowed and it belongs to pay-in-full */}
              {paymentPlans.map((plan, i) => (
                <div key={i} className="plan-col">
                  <span className="plan-label">{plan.cadence}</span>
                  <span className="plan-price"><sup>$</sup>{plan.amountPerInstallment.toLocaleString()}</span>
                  <span className="plan-cadence">
                    × {plan.installments} {plan.cadence} payments<br />
                    Total ${(plan.installments * plan.amountPerInstallment).toLocaleString()}
                  </span>
                  <a href={checkoutHref} className="plan-enrol plan-enrol-outline">Enrol now</a>
                </div>
              ))}
            </div>
            <p className="modal-footer-note">
              Secure checkout via Stripe · All major cards accepted
              {w.contactEmail && (
                <> · Questions? <a href={`mailto:${w.contactEmail}`} style={{ color: "var(--accent-primary)" }}>Email us</a></>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
