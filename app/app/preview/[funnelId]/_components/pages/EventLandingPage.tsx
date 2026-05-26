import { useState, useEffect } from "react";
import type { EventLandingContent, WizardSnapshot } from "../funnel-types";
import { safeUrl } from "../funnel-types";

interface Props {
  content: EventLandingContent;
  wizard: WizardSnapshot;
}

/** Parse wizard date/time strings into a target Date.
 *  eventDate can be "Friday 19 June 2026", "19/06/2026", ISO, etc.
 *  eventTime can be "9:00 AM", "09:00", "9am", etc.
 */
function parseEventDate(dateStr?: string, timeStr?: string, tz?: string): Date | null {
  if (!dateStr) return null;
  try {
    // Normalise ordinal suffixes (e.g. "19th" → "19")
    const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
    const combined = timeStr ? `${cleaned} ${timeStr}` : cleaned;
    const d = new Date(combined);
    if (!isNaN(d.getTime())) return d;
    // Fallback: try just the date
    const d2 = new Date(cleaned);
    return isNaN(d2.getTime()) ? null : d2;
  } catch {
    return null;
  }
}

function useCountdown(target: Date | null) {
  const calc = () => {
    if (!target) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);
    return { days, hours, mins, secs, expired: false };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.getTime()]);
  return tick;
}

// SVG icons used throughout the page
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="M16 8l-4 6-3-2"/>
  </svg>
);

const ChevronDown = () => (
  <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

/** Map a SectionTheme to the CSS class string for an encourage section */
function encourageClass(theme?: string, defaultTheme = "dark"): string {
  const t = theme ?? defaultTheme;
  if (t === "dark")   return "encourage dark-bg on-dark";
  if (t === "accent") return "encourage accent-bg on-dark";
  return "encourage sunken-bg";  // light — matches mockup section 07c (.encourage.sunken-bg)
}

export default function EventLandingPage({ content: c, wizard: w }: Props) {
  // Claude's assigned URLs take priority; fall back to wizard arrays; safeUrl guards against instruction strings
  const hero1Url      = safeUrl(c.heroBackgroundImageUrl  ?? w.heroImageUrls?.[0]);
  const lifestyle1Url = safeUrl(c.valuePropImageUrl        ?? w.lifestyleImageUrls?.[0]);
  const outcomes1Url  = safeUrl(c.outcomesImageUrl         ?? w.lifestyleImageUrls?.[1]);
  const brandName = w.businessName ?? w.hostName ?? "Your Brand";
  const ctaText = c.ctaText ?? c.heroCtaText ?? "Register Now";
  // Prefer Claude-generated price copy; fall back to wizard fields.
  // Fix: wizard saves "pay-what-you-want" (not "pay_what_you_can").
  const priceLabel = c.heroPriceLabel ?? (w.eventPricingModel === "pay-what-you-want" ? "Choose your price" : null);
  const priceValue = c.heroPriceValue ?? (
    w.eventPriceMin && w.eventPriceMax ? `$${w.eventPriceMin} — $${w.eventPriceMax}` :
    w.eventPriceFixed ? `$${w.eventPriceFixed}` : null
  );

  const eventTarget = parseEventDate(w.eventDate, w.eventTime, w.eventTimezone);
  const countdown = useCountdown(eventTarget);

  return (
    <div>
      {/* ── 01 Sticky Bar ── */}
      <div className="sticky-bar is-visible" id="stickyBar" aria-label="Registration bar">
        <div className="container">
          {w.logoUrl
            ? <img src={w.logoUrl} alt={brandName} style={{ height: 96, objectFit: "contain" }} />
            : <div className="logo">{brandName}</div>
          }
          <div className="event-title">{w.eventName}</div>
          <div className="countdown" aria-label="Time until event">
            {countdown.expired || !eventTarget ? (
              <>
                <span><b>—</b> Days</span>
                <span><b>—</b> Hours</span>
                <span><b>—</b> Mins</span>
                <span><b>—</b> Secs</span>
              </>
            ) : (
              <>
                <span><b>{countdown.days}</b> Days</span>
                <span><b>{countdown.hours}</b> Hours</span>
                <span><b>{countdown.mins}</b> Mins</span>
                <span><b>{countdown.secs}</b> Secs</span>
              </>
            )}
          </div>
          <a href="/checkout" className="btn btn-primary btn-sm">{ctaText}</a>
        </div>
      </div>

      {/* ── 02 Hero ── */}
      <section
        className="hero on-dark"
        id="hero"
        style={hero1Url ? {
          backgroundImage: `linear-gradient(to right, rgba(15,14,12,0.95) 40%, rgba(15,14,12,0.4) 100%), url(${hero1Url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow hero-eyebrow">
                <span className="dot" aria-hidden="true" />
                LIVE ONLINE
              </span>
              <h1 className="display-hero">{c.heroHeadline ?? w.eventName}</h1>
              <p className="subtitle">{c.heroSubheadline ?? w.eventTagline}</p>

              {priceValue && (
                <div className="price-line">
                  {priceLabel && <span className="price-label">{priceLabel}</span>}
                  <span className="price-value">{priceValue}</span>
                </div>
              )}

              <div className="hero-cta-row">
                <a href="/checkout" className="btn btn-primary btn-xl">{ctaText}</a>
                {c.heroMetaLine && (
                  <span className="meta" style={{ color: "color-mix(in srgb, var(--text-inverse) 55%, transparent)" }}>{c.heroMetaLine}</span>
                )}
              </div>

              <div className="hero-host-badge">
                <div className="hero-host-name">With <strong>{w.hostName}</strong></div>
                {w.hostTitle && (
                  <span className="hero-host-title">{w.hostTitle}</span>
                )}
              </div>

              <div className="hero-meta">
                {w.eventDate && (
                  <div>
                    <span className="label">Date</span>
                    <span className="value"><strong>{w.eventDate}</strong></span>
                  </div>
                )}
                {w.eventTime && (
                  <div>
                    <span className="label">Time</span>
                    <span className="value">
                      <strong>{w.eventTime}</strong> {w.eventTimezone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              className="hero-visual"
              aria-hidden="false"
              style={hero1Url ? { backgroundImage: `url(${hero1Url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              {!hero1Url && (
                <div className="hv-label">
                  Hero visual
                  <strong>Your hero image will appear here.</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 Credibility 1 ── */}
      {c.credibilityQuote1 && (
        <section className="credibility">
          <div className="container">
            <div className="quote-glyph" aria-hidden="true">&ldquo;</div>
            <blockquote>{c.credibilityQuote1}</blockquote>
            {c.credibilityAttribution1 && (
              <cite>
                <strong>{c.credibilityAttribution1.split("·")[0]?.trim()}</strong>
                {c.credibilityAttribution1.includes("·") ? ` · ${c.credibilityAttribution1.split("·").slice(1).join("·").trim()}` : ""}
              </cite>
            )}
          </div>
        </section>
      )}

      {/* ── 04 Video ── */}
      <section className="video-section" style={{ background: "var(--surface-sunken)" }}>
        <div className="container">
          <div className="section-header">
            {c.videoSectionEyebrow && <span className="eyebrow">{c.videoSectionEyebrow}</span>}
            <h2 className="display-section">{c.videoSectionHeading ?? "Watch the invitation"}</h2>
          </div>
          {c.videoUrl || w.eventVideoUrl ? (
            <div className="video-frame" style={{ cursor: "default" }}>
              <iframe
                src={(c.videoUrl ?? w.eventVideoUrl ?? "").replace("watch?v=", "embed/")}
                style={{ width: "100%", height: "100%", border: "none", position: "absolute", inset: 0 }}
                allowFullScreen
              />
            </div>
          ) : (
            <div className="video-frame" role="button" aria-label="Video placeholder">
              <button className="play-button" aria-label="Play">
                <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 28, height: 28, fill: "var(--text-primary)", marginLeft: 4 }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          )}
          {c.videoCaption && <p className="video-caption">{c.videoCaption}</p>}
        </div>
      </section>

      {/* ── 05 As Seen On ── */}
      {(w.pressLogos ?? []).length > 0 && (
        <section className="as-seen-on">
          <div className="container">
            <span className="eyebrow">As featured in</span>
            <div className="logo-wall" aria-label="Press logos">
              {(w.pressLogos ?? []).filter(p => p.name || p.logoUrl).map((p, i) => (
                p.logoUrl
                  ? <div key={i} className="logo-slot" style={{ minWidth: 120 }}>
                      <img src={p.logoUrl} alt={p.name} style={{ height: 52, minWidth: 100, maxWidth: "100%", objectFit: "contain", display: "block" }} />
                    </div>
                  : <div key={i} className="logo-slot">{p.name}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 06 Audience Callouts ── */}
      {(c.audienceItems ?? []).length > 0 && (
        <section className="audience">
          <div className="container">
            <div className="section-header">
              {c.audienceEyebrow && <span className="eyebrow">{c.audienceEyebrow}</span>}
              <h2 className="display-section">{c.audienceHeading ?? "This is for you if\u2026"}</h2>
            </div>
            <div className="audience-list">
              {(c.audienceItems ?? []).map((item, i) => (
                <div key={i} className="audience-item">
                  <div className="audience-icon" aria-hidden="true">
                    <CheckIcon />
                  </div>
                  <p dangerouslySetInnerHTML={{ __html: item }} />
                </div>
              ))}
            </div>
            {c.audienceClosingText && <p className="audience-close">{c.audienceClosingText}</p>}
            {c.audienceMicrocopy && <p className="cta-microcopy">{c.audienceMicrocopy}</p>}
            <div className="cta-row">
              <a href="/checkout" className="btn btn-primary btn-xl">{ctaText}</a>
            </div>
          </div>
        </section>
      )}

      {/* ── 07 Encourage CTA 1 — text band only, no button ── */}
      {c.encourageText1 && (
        <section
          className={encourageClass(c.encourage1Theme, "dark")}
          style={safeUrl(c.encourage1BackgroundUrl) ? { backgroundImage: `linear-gradient(rgba(15,14,12,0.82),rgba(15,14,12,0.82)), url(${safeUrl(c.encourage1BackgroundUrl)})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          <div className="container">
            <p className="line">{c.encourageText1}</p>
          </div>
        </section>
      )}

      {/* ── 08 Value Proposition ── */}
      {c.vpHeading && (
        <section>
          <div className="container">
            <div className="value-prop">
              <div className="vp-text">
                {c.vpEyebrow && <span className="eyebrow">{c.vpEyebrow}</span>}
                <h2 className="h2 display-section" style={{ marginTop: "var(--s-4)" }}>{c.vpHeading}</h2>
                {(c.vpParagraphs ?? []).map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
                {c.vpPullQuote && (
                  <div className="vp-pull">
                    <p className="pull-quote">{c.vpPullQuote}</p>
                  </div>
                )}
              </div>
              <div className="vp-image">
                {lifestyle1Url
                  ? <img src={lifestyle1Url} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "var(--r-xl)" }} />
                  : <div className="img-placeholder tint-forest">
                      <span className="img-label">Supporting image · 4:5</span>
                    </div>
                }
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 09 Credibility 2 (inline) ── */}
      {c.credibilityQuote2 && (
        <section className="credibility inline" style={{ paddingTop: 40, paddingBottom: 40, marginBottom: 40 }}>
          <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
            <div className="quote-glyph" aria-hidden="true">&ldquo;</div>
            <blockquote><em>&ldquo;{c.credibilityQuote2}&rdquo;</em></blockquote>
            {c.credibilityAttribution2 && (
              <cite>
                <strong>{c.credibilityAttribution2.split("·")[0]?.trim()}</strong>
                {c.credibilityAttribution2.includes("·") ? ` · ${c.credibilityAttribution2.split("·").slice(1).join("·").trim()}` : ""}
              </cite>
            )}
          </div>
        </section>
      )}

      {/* ── 10 Outcomes (Edward style) ── */}
      {(c.outcomesItems ?? []).length > 0 && (
        <section className="outcomes" style={{ background: "var(--surface-sunken)" }}>
          <div className="container">
            <div className="section-header">
              {c.outcomesEyebrow && <span className="eyebrow">{c.outcomesEyebrow}</span>}
              <h2 className="display-section">{c.outcomesHeading ?? "What you'll experience"}</h2>
              {c.outcomesSubheading && <p className="body-lg">{c.outcomesSubheading}</p>}
            </div>
            <div className="outcome-grid">
              {(c.outcomesItems ?? []).map((item, i) => (
                <div key={i} className="outcome">
                  <div className="outcome-icon" aria-hidden="true">
                    <CheckIcon />
                  </div>
                  <p>
                    <strong>{item.title}</strong>
                    {item.body ? ` ${item.body}` : ""}
                  </p>
                </div>
              ))}
            </div>
            <div className="outcomes-image">
              {outcomes1Url
                ? <img src={outcomes1Url} alt="" style={{ width: "100%", aspectRatio: "21/9", objectFit: "cover", borderRadius: "var(--r-xl)" }} />
                : <div className="img-placeholder tint-stone"><span className="img-label">Supporting image · 21:9</span></div>
              }
            </div>
            {c.outcomesClosingText && <p className="outcomes-close">{c.outcomesClosingText}</p>}
            {c.outcomesMicrocopy && <p className="outcomes-microcopy">{c.outcomesMicrocopy}</p>}
            <div className="outcomes-cta">
              <a href="/checkout" className="btn btn-primary btn-xl">{ctaText}</a>
            </div>
          </div>
        </section>
      )}

      {/* ── 11 Personal Message ── */}
      {(c.personalMessageParagraphs ?? []).length > 0 && (
        <section className="personal-message">
          <div className="container">
            <h2 className="h2">{c.personalMessageHeading ?? `A note from ${w.hostName}`}</h2>
            <div className="reading">
              <blockquote>
                {(c.personalMessageParagraphs ?? []).map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </blockquote>
              {c.personalMessageSignature && (
                <p className="signature">{c.personalMessageSignature}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {(w.testimonials ?? []).length > 0 && (
        <TestimonialCarousel
          testimonials={w.testimonials ?? []}
          eyebrow={c.testimonialsEyebrow}
          heading={c.testimonialsHeading ?? "What people say"}
        />
      )}

      {/* ── 07b Encourage CTA 2 ── */}
      {c.encourageText2 && (
        <section
          className={encourageClass(c.encourage2Theme, "accent")}
          style={safeUrl(c.encourage2BackgroundUrl) ? { backgroundImage: `linear-gradient(rgba(15,14,12,0.82),rgba(15,14,12,0.82)), url(${safeUrl(c.encourage2BackgroundUrl)})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          <div className="container">
            <p className="line">{c.encourageText2}</p>
            <a href="/checkout" className="btn btn-primary btn-xl">{ctaText}</a>
          </div>
        </section>
      )}

      {/* ── 13 How It Works ── */}
      {(c.howItWorksParagraphs ?? []).length > 0 && (
        <section className="how-it-works">
          <div className="container">
            <h2 className="h2 display-section">{c.howItWorksHeading ?? "How the session unfolds"}</h2>
            <div className="reading">
              {(c.howItWorksParagraphs ?? []).map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
            {c.howItWorksClosing && <p className="closing">{c.howItWorksClosing}</p>}
          </div>
        </section>
      )}

      {/* ── 14 Event Overview ── */}
      <section className="event-overview">
        <div className="container">
          <div className="overview-top">
            <h2 className="h2 display-section">{c.eventOverviewHeading ?? "Event overview"}</h2>
            <div className="overview-meta">
              <div className="overview-row">
                <span className="label">Status</span>
                <span className="value">
                  <span className="live-tag"><span className="dot" aria-hidden="true" />Live online</span>
                </span>
              </div>
              {w.eventDate && (
                <div className="overview-row">
                  <span className="label">Date</span>
                  <span className="value">{w.eventDate}</span>
                </div>
              )}
              {w.eventTime && (
                <div className="overview-row">
                  <span className="label">Time</span>
                  <span className="value">{w.eventTime} {w.eventTimezone}</span>
                </div>
              )}
              {w.eventDuration && (
                <div className="overview-row">
                  <span className="label">Duration</span>
                  <span className="value">{w.eventDuration}</span>
                </div>
              )}
              {c.recordingNote && (
                <p className="recording-note"><em>{c.recordingNote}</em></p>
              )}
            </div>
          </div>

          <div className="overview-bottom">
            {(c.experienceItems ?? []).length > 0 && (
              <div>
                <h3>What you&apos;ll experience</h3>
                <div className="experience-list">
                  {(c.experienceItems ?? []).map((item, i) => (
                    <div key={i} className="experience-item">
                      <div className="experience-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                          <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                        </svg>
                      </div>
                      <p dangerouslySetInnerHTML={{ __html: `<strong>${item.title}</strong> ${item.body}` }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(c.challengeItems ?? []).length > 0 && (
              <div>
                <h3>This session is built to address things like</h3>
                <ul className="challenges-list">
                  {(c.challengeItems ?? []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Credibility 3 (post-overview) ── */}
      {c.credibilityQuote3 && (
        <section className="credibility inline" style={{ paddingTop: 40, paddingBottom: 40, marginBottom: 40 }}>
          <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
            <div className="quote-glyph" aria-hidden="true">&ldquo;</div>
            <blockquote><em>&ldquo;{c.credibilityQuote3}&rdquo;</em></blockquote>
            {c.credibilityAttribution3 && (
              <cite>
                <strong>{c.credibilityAttribution3.split("·")[0]?.trim()}</strong>
                {c.credibilityAttribution3.includes("·") ? ` · ${c.credibilityAttribution3.split("·").slice(1).join("·").trim()}` : ""}
              </cite>
            )}
          </div>
        </section>
      )}

      {/* ── 15 Extra VP ── */}
      {c.extraVpHeading && (
        <section className="extra-vp on-dark">
          <div className="container">
            <h2 className="h2 display-section">{c.extraVpHeading}</h2>
            <div className="reading">
              {(c.extraVpParagraphs ?? []).map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
            {c.extraVpClosing && <p className="closing">{c.extraVpClosing}</p>}
          </div>
        </section>
      )}

      {/* ── 07c Encourage CTA 3 ── */}
      {c.encourageText3 && (
        <section
          className={encourageClass(c.encourage3Theme, "light")}
          style={safeUrl(c.encourage3BackgroundUrl) ? { backgroundImage: `linear-gradient(rgba(15,14,12,0.82),rgba(15,14,12,0.82)), url(${safeUrl(c.encourage3BackgroundUrl)})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          <div className="container">
            <p className="line">{c.encourageText3}</p>
            <a href="/checkout" className="btn btn-primary btn-xl">{ctaText}</a>
          </div>
        </section>
      )}

      {/* ── 16 Outcomes 2 (icon grid) ── */}
      {(c.outcomes2Items ?? []).length > 0 && (
        <section className="outcomes-grid">
          <div className="container">
            <div className="section-header">
              {c.outcomes2Eyebrow && <span className="eyebrow">{c.outcomes2Eyebrow}</span>}
              <h2 className="display-section">{c.outcomes2Heading ?? "What you take home"}</h2>
            </div>
            <div className="outcomes-grid-list">
              {(c.outcomes2Items ?? []).map((item, i) => (
                <div key={i} className="outcomes-grid-item">
                  <svg className="big-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/><path d="M16 8l-4 6-3-2"/>
                  </svg>
                  <div className="outcomes-grid-text">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 17 Bio ── */}
      {(c.bioParagraphs ?? []).length > 0 && (
        <section style={{ background: "var(--surface-sunken)" }}>
          <div className="container">
            <div className="bio">
              <div className="bio-image">
                {w.hostHeadshotUrl
                  ? <img src={w.hostHeadshotUrl} alt={w.hostName} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: "var(--r-xl)" }} />
                  : <div className="img-placeholder tint-bronze ratio-3-4">
                      <span className="img-label">Host portrait · 3:4</span>
                    </div>
                }
              </div>
              <div className="bio-text">
                {c.bioEyebrow && <span className="eyebrow">{c.bioEyebrow}</span>}
                <h2 className="h2 display-section" style={{ marginTop: "var(--s-4)" }}>
                  {c.bioHeading ?? `About ${w.hostName}`}
                </h2>
                {(c.bioParagraphs ?? []).map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
                {c.bioSignature && <p className="signature">{c.bioSignature}</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 18 Final VP ── */}
      {c.finalVpHeading && (
        <section className="final-vp on-dark">
          <div className="container">
            <h2>{c.finalVpHeading}</h2>
            <div className="reading">
              {c.finalVpIntro && <p dangerouslySetInnerHTML={{ __html: c.finalVpIntro }} />}
              {(c.finalVpFromTo ?? []).length > 0 && (
                <ul className="from-to">
                  {(c.finalVpFromTo ?? []).map((ft, i) => (
                    <li key={i}>
                      From <em>&ldquo;{ft.from}&rdquo;</em> to <em>&ldquo;{ft.to}&rdquo;</em>
                    </li>
                  ))}
                </ul>
              )}
              {c.finalVpClosing && <p dangerouslySetInnerHTML={{ __html: c.finalVpClosing }} />}
            </div>
            <div className="cta-block">
              {c.finalVpCtaMicrocopy && <p className="cta-microcopy">{c.finalVpCtaMicrocopy}</p>}
              <a href="/checkout" className="btn btn-primary btn-xl">{ctaText}</a>
            </div>
          </div>
        </section>
      )}

      {/* ── 19 FAQ ── */}
      {(c.faqItems ?? []).length > 0 && (
        <section className="faq">
          <div className="container">
            <div className="section-header">
              {c.faqEyebrow && <span className="eyebrow">{c.faqEyebrow}</span>}
              <h2 className="display-section">Frequently Asked Questions</h2>
            </div>
            <div className="faq-list">
              {(c.faqItems ?? []).map((faq, i) => (
                <div key={i} className={`faq-item${i === 0 ? " is-open" : ""}`}>
                  <button className="faq-question" aria-expanded={i === 0 ? "true" : "false"}>
                    <span>{faq.question}</span>
                    <ChevronDown />
                  </button>
                  <div className="faq-answer">
                    <div className="faq-answer-inner">{faq.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA (dark) ── */}
      <section className="encourage dark-bg on-dark" id="register">
        <div className="container">
          <p className="line">{c.finalCtaLine ?? w.eventName}</p>
          <a href="/checkout" className="btn btn-primary btn-xl">{c.finalCtaText ?? ctaText}</a>
        </div>
      </section>

      {/* ── 20 FTC ── */}
      {c.ftcDisclaimer && (
        <section className="ftc">
          <div className="container">
            <h2>FTC Disclaimer</h2>
            <div className="reading">
              <p>{c.ftcDisclaimer}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── 21 Footer ── */}
      <footer>
        <div className="container">
          <div>
            <div className="brand">{brandName}</div>
            <div className="copy">© {new Date().getFullYear()} {brandName} · All Rights Reserved</div>
          </div>
          <div className="right">
            <div className="links">
              {w.instagramUrl && (
                <a href={w.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              )}
              {w.linkedinUrl && (
                <a href={w.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              )}
              {w.facebookUrl && (
                <a href={w.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
              {w.youtubeUrl && (
                <a href={w.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                  </svg>
                </a>
              )}
              {w.tiktokUrl && (
                <a href={w.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.84a8.16 8.16 0 0 0 4.77 1.52V6.91a4.85 4.85 0 0 1-1-.22z"/>
                  </svg>
                </a>
              )}
              {w.websiteUrl && (
                <a href={w.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label="Website">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </a>
              )}
              <a href="#">Privacy</a>
              <a href="#">Terms of Use</a>
            </div>
            <a href="/checkout" className="btn btn-primary">{ctaText}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Testimonial carousel — always 3 visible, circular navigation ───────────
interface Testimonial { quote: string; name: string; location?: string; context?: string; }

function TestimonialCarousel({
  testimonials, eyebrow, heading,
}: {
  testimonials: Testimonial[];
  perSlide?: number;
  totalSlides?: number;
  eyebrow?: string;
  heading: string;
}) {
  const n = testimonials.length;
  const [start, setStart] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  function navigate(dir: 1 | -1) {
    setStart(s => (s + dir + n) % n);
    setAnimKey(k => k + 1);
  }

  // Always pick exactly 3 cards, wrapping circularly so no slide is ever short
  const visible = n <= 3
    ? testimonials
    : [0, 1, 2].map(offset => testimonials[(start + offset) % n]);

  const showControls = n > 3;

  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 className="display-section">{heading}</h2>
        </div>

        {/* key change triggers the fade-in animation on each navigation */}
        <div key={animKey} className="testimonial-track">
          {visible.map((t, i) => (
            <article key={i} className="testimonial-card">
              <h3 className="h3">&ldquo;{t.quote.length > 60 ? t.quote.slice(0, 60) + "…" : t.quote}&rdquo;</h3>
              <p className="quote">{t.quote}</p>
              <div className="attrib">
                <span className="name">{t.name}</span>
                {(t.location || t.context) && (
                  <span className="loc">{[t.location, t.context].filter(Boolean).join(" · ")}</span>
                )}
              </div>
            </article>
          ))}
        </div>

        {showControls && (
          <div className="carousel-controls">
            <button onClick={() => navigate(-1)} aria-label="Previous testimonials">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            <div className="carousel-dots" role="tablist">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === start}
                  aria-label={`Testimonial ${i + 1}`}
                  className={`dot${i === start ? " active" : ""}`}
                  onClick={() => { setStart(i); setAnimKey(k => k + 1); }}
                />
              ))}
            </div>

            <button onClick={() => navigate(1)} aria-label="Next testimonials">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
