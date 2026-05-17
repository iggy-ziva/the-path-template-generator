import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { Icon } from "@/components/Icon";
import type { IconKey } from "@/components/Icon";
import StickyBar from "./_components/StickyBar";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const { host, event, content } = theme;
  const c = content.landing;
  const checkoutHref = `/themes/${theme.slug}/checkout`;

  return (
    <>
      {/* 01 — Sticky Bar */}
      <StickyBar
        hostName={host.name}
        eventName={event.name}
        days={event.countdownDays}
        hours={event.countdownHours}
        mins={event.countdownMins}
        ctaText="Register Now"
        ctaHref={checkoutHref}
      />

      {/* 02 — Hero */}
      <section className="hero on-dark" id="hero">
        <span className="section-marker">02 — Hero</span>
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow hero-eyebrow">
                <span className="dot" aria-hidden="true" />
                {c.heroEyebrow}
              </span>
              <h1 className="display-hero">{event.name}</h1>
              <p className="subtitle">{c.heroSubtitle}</p>

              <div
                className="hero-host-badge"
                dangerouslySetInnerHTML={{ __html: c.heroHostBadge }}
              />

              <div className="hero-meta">
                <div>
                  <span className="label">Date</span>
                  <span className="value">
                    <strong>{event.date}</strong>
                  </span>
                </div>
                <div>
                  <span className="label">Time</span>
                  <span className="value">
                    <strong>{event.dayOfWeek} {event.time}</strong> {event.timezone}
                  </span>
                </div>
              </div>

              <div className="price-line">
                <span className="price-label">{c.heroPriceLabel}</span>
                <span className="price-value">{c.heroPriceValue}</span>
              </div>

              <div className="hero-cta-row">
                <a href={checkoutHref} className="btn btn-primary btn-xl">
                  {event.ctaText}
                </a>
                <span className="meta" style={{ color: "rgba(245,241,234,0.55)" }}>
                  {c.heroCtaMicrocopy}
                </span>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="false">
              <div className="hv-label">
                Hero visual
                <strong>{c.heroVisualDescription}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — Credibility statement (under hero) */}
      <CredibilityBlock t={c.credibilityHero} />

      {/* 04 — Video */}
      <section className="video-section" style={{ background: "var(--surface-sunken)" }}>
        <span className="section-marker">04 — Video</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.videoEyebrow}</span>
            <h2 className="display-section">{c.videoHeadline}</h2>
          </div>
          <div className="video-frame" role="button" aria-label="Play video">
            <button className="play-button" aria-label="Play">
              <Icon name="play" size={28} />
            </button>
          </div>
          <p className="video-caption">{c.videoCaption}</p>
        </div>
      </section>

      {/* 05 — As Seen On */}
      <section className="as-seen-on">
        <span className="section-marker">05 — As seen on</span>
        <div className="container">
          <span className="eyebrow">{c.asSeenOnEyebrow}</span>
          <div className="logo-wall" aria-label="Press logos">
            {c.pressLogos.map((logo, i) => (
              <div
                key={i}
                className={`logo-slot${logo.variant ? " " + logo.variant : ""}`}
              >
                {logo.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — Audience Callouts */}
      <section className="audience">
        <span className="section-marker">06 — Audience callouts</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.audienceEyebrow}</span>
            <h2
              className="display-section"
              dangerouslySetInnerHTML={{ __html: c.audienceHeadline }}
            />
          </div>
          <div className="audience-list">
            {c.audience.map((item, i) => (
              <div key={i} className="audience-item">
                <div className="audience-icon" aria-hidden="true">
                  <Icon name={item.iconKey as IconKey} />
                </div>
                <p dangerouslySetInnerHTML={{ __html: item.html }} />
              </div>
            ))}
          </div>
          <p className="audience-close">{c.audienceClose}</p>
          <p className="cta-microcopy">{c.audienceCtaMicrocopy}</p>
          <div className="cta-row">
            <a href={checkoutHref} className="btn btn-primary btn-xl">
              {event.ctaText}
            </a>
          </div>
        </div>
      </section>

      {/* 07 — Encouragement (dark) */}
      <EncourageBlock variant="dark" line={c.encourageDarkLine} href={checkoutHref} cta={event.ctaText} />

      {/* 08 — Value Proposition */}
      <section>
        <span className="section-marker">08 — Value proposition · image right</span>
        <div className="container">
          <div className="value-prop">
            <div className="vp-text">
              <span className="eyebrow">{c.vpEyebrow}</span>
              <h2 className="h2 display-section" style={{ marginTop: "var(--s-4)" }}>
                {c.vpHeadline}
              </h2>
              {c.vpParagraphs.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
              <div className="vp-pull">
                <p className="pull-quote">{c.vpPullQuote}</p>
              </div>
            </div>
            <div className="vp-image">
              <div className="img-placeholder tint-forest">
                <span className="img-label">
                  Supporting image · 4:5
                  <strong>{c.vpImageDescription}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 — Credibility (inline) */}
      <CredibilityBlock t={c.credibilityInline} inline />

      {/* 10 — Outcomes (Edward style) */}
      <section className="outcomes" style={{ background: "var(--surface-sunken)" }}>
        <span className="section-marker">10 — Outcomes</span>
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
          <div className="outcomes-image">
            <div className="img-placeholder tint-stone">
              <span className="img-label">
                Supporting image · 21:9
                <strong>{c.outcomesImageDescription}</strong>
              </span>
            </div>
          </div>
          <p className="outcomes-close">{c.outcomesClose}</p>
          <p className="outcomes-microcopy">{c.outcomesMicrocopy}</p>
          <div className="outcomes-cta">
            <a href={checkoutHref} className="btn btn-primary btn-xl">
              {event.ctaText}
            </a>
          </div>
        </div>
      </section>

      {/* 11 — Personal message */}
      <section className="personal-message">
        <span className="section-marker">11 — Personal message</span>
        <div className="container">
          <h2 className="h2">{c.personalMessageHeadline}</h2>
          <div className="reading">
            <blockquote>
              {c.personalMessage.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </blockquote>
            <p className="signature">{c.personalMessageSignature}</p>
          </div>
        </div>
      </section>

      {/* 12 — Testimonials */}
      <section className="testimonials">
        <span className="section-marker">12 — Testimonials carousel</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.testimonialsEyebrow}</span>
            <h2 className="display-section">{c.testimonialsHeadline}</h2>
          </div>
          <div className="testimonial-track">
            {c.testimonials.map((t, i) => (
              <article key={i} className="testimonial-card">
                {t.headline && <h3 className="h3">&ldquo;{t.headline}&rdquo;</h3>}
                <p className="quote">{t.quote}</p>
                <div className="attrib">
                  <span className="name">{t.name}</span>
                  {t.location && <span className="loc">{t.location}</span>}
                </div>
              </article>
            ))}
          </div>
          <div className="carousel-controls">
            <button aria-label="Previous">
              <Icon name="chevron-left" size={16} strokeWidth={1.8} />
            </button>
            <div className="carousel-dots" role="tablist">
              {c.testimonials.map((_, i) => (
                <span key={i} className={`dot${i === 0 ? " active" : ""}`} />
              ))}
            </div>
            <button aria-label="Next">
              <Icon name="chevron-right" size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </section>

      {/* 07b — Encouragement (accent) */}
      <EncourageBlock variant="accent" line={c.encourageAccentLine} href={checkoutHref} cta={event.ctaText} />

      {/* 13 — How It Works */}
      <section className="how-it-works">
        <span className="section-marker">13 — How it works</span>
        <div className="container">
          <h2 className="h2 display-section">{c.howHeadline}</h2>
          <div className="reading">
            {c.howParagraphs.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
          <p className="closing">{c.howClosing}</p>
        </div>
      </section>

      {/* 14 — Event Overview */}
      <section className="event-overview">
        <span className="section-marker">14 — Event overview</span>
        <div className="container">
          <div className="overview-top">
            <h2 className="h2 display-section">{c.overviewHeadline}</h2>
            <div className="overview-meta">
              <div className="overview-row">
                <span className="label">Status</span>
                <span className="value">
                  <span className="live-tag">
                    <span className="dot" aria-hidden="true" />
                    Live online
                  </span>
                </span>
              </div>
              <div className="overview-row">
                <span className="label">Date</span>
                <span className="value">{event.date}</span>
              </div>
              <div className="overview-row">
                <span className="label">Time</span>
                <span className="value">
                  {event.dayOfWeek} {event.time} {event.timezone}
                </span>
              </div>
              <div className="overview-row">
                <span className="label">Duration</span>
                <span className="value">{event.duration}</span>
              </div>
              <p className="recording-note">
                <em>
                  {event.name} will be recorded, so you are welcome to register
                  even if you cannot attend live.
                </em>
              </p>
            </div>
          </div>
          <div className="overview-bottom">
            <div>
              <h3>{c.overviewExperienceTitle}</h3>
              <div className="experience-list">
                {c.overviewExperience.map((e, i) => (
                  <div key={i} className="experience-item">
                    <div className="experience-icon">
                      <Icon name={e.iconKey as IconKey} />
                    </div>
                    <p>
                      <strong>{e.strong}</strong> {e.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3>{c.overviewChallengesTitle}</h3>
              <ul className="challenges-list">
                {c.overviewChallenges.map((ch, i) => (
                  <li key={i}>{ch}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 09b — Credibility (post-overview) */}
      <CredibilityBlock t={c.credibilityOverview} inline />

      {/* 15 — Extra VP (on-dark) */}
      <section className="extra-vp on-dark">
        <span className="section-marker">15 — Extra value proposition</span>
        <div className="container">
          <h2 className="h2 display-section">{c.extraVpHeadline}</h2>
          <div className="reading">
            {c.extraVpParagraphs.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
          <p className="closing">{c.extraVpClosing}</p>
        </div>
      </section>

      {/* 07c — Encouragement (sunken) */}
      <EncourageBlock variant="sunken" line={c.encourageSunkenLine} href={checkoutHref} cta={event.ctaText} />

      {/* 16 — Outcomes 2 */}
      <section className="outcomes-grid">
        <span className="section-marker">16 — Outcomes 2 · full-width icon grid</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">{c.outcomesGridEyebrow}</span>
            <h2 className="display-section">{c.outcomesGridHeadline}</h2>
          </div>
          <div className="outcomes-grid-list">
            {c.outcomesGrid.map((g, i) => (
              <div key={i} className="outcomes-grid-item">
                <span className="big-icon">
                  <Icon name={g.iconKey as IconKey} size={32} />
                </span>
                <div className="outcomes-grid-text">
                  <h3>{g.title}</h3>
                  <p>{g.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 17 — Bio */}
      <section style={{ background: "var(--surface-sunken)" }}>
        <span className="section-marker">17 — Bio</span>
        <div className="container">
          <div className="bio">
            <div className="bio-image">
              <div className="img-placeholder tint-bronze ratio-3-4">
                <span className="img-label">
                  Host portrait · 3:4
                  <strong>{host.bioImageDescription}</strong>
                </span>
              </div>
            </div>
            <div className="bio-text">
              <span className="eyebrow">{c.bioEyebrow}</span>
              <h2 className="h2 display-section" style={{ marginTop: "var(--s-4)" }}>
                {c.bioHeadline}
              </h2>
              {host.bio.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
              {host.bookTitle && (
                <p>
                  I write about all of this in my book, <em>{host.bookTitle}</em>,
                  and quietly, in a monthly letter, to a small audience.
                </p>
              )}
              <p className="signature">{host.signaturePhrase}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 18 — Final VP */}
      <section className="final-vp on-dark">
        <span className="section-marker">18 — Final value proposition</span>
        <div className="container">
          <h2>{c.finalVpHeadline}</h2>
          <div className="reading">
            {c.finalVpParagraphs.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
            <ul className="from-to">
              {c.fromTo.map((ft, i) => (
                <li key={i}>
                  From <em>&ldquo;{ft.from}&rdquo;</em> to <em>&ldquo;{ft.to}&rdquo;</em>
                </li>
              ))}
            </ul>
          </div>
          <div className="cta-block">
            <p className="cta-microcopy">{c.finalVpMicrocopy}</p>
            <a href={checkoutHref} className="btn btn-primary btn-xl">
              {event.ctaText}
            </a>
          </div>
        </div>
      </section>

      {/* 19 — FAQ */}
      <section className="faq">
        <span className="section-marker">19 — FAQ</span>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Questions</span>
            <h2 className="display-section">Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {c.faq.map((f, i) => (
              <details key={i} className={`faq-item${i === 0 ? " is-open" : ""}`} open={i === 0}>
                <summary className="faq-question">
                  <span>{f.q}</span>
                  <Icon name="chevron-down" size={20} className="chevron" />
                </summary>
                <div className="faq-answer">
                  <div className="faq-answer-inner">{f.a}</div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 07d — Encouragement (final) */}
      <EncourageBlock variant="dark" line={c.encourageFinalLine} href={checkoutHref} cta={event.ctaText} idAttr="register" />

      {/* 20 — FTC */}
      <section className="ftc">
        <span className="section-marker">20 — FTC disclaimer</span>
        <div className="container">
          <h2>FTC Disclaimer</h2>
          <div className="reading">
            {c.ftcParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 21 — Footer */}
      <footer>
        <span className="section-marker">21 — Footer</span>
        <div className="container">
          <div>
            <div className="brand">{host.name}</div>
            <div className="copy">
              © {new Date().getFullYear()} {host.name} · {host.parentBrand} | All Rights Reserved
            </div>
          </div>
          <div className="right">
            <div className="links">
              <a href="#">Privacy</a>
              <a href="#">Terms of Use</a>
            </div>
            <a href={checkoutHref} className="btn btn-primary">
              {event.ctaText}
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ============================================================ */

function CredibilityBlock({
  t,
  inline,
}: {
  t: { quote: string; name: string; location?: string };
  inline?: boolean;
}) {
  return (
    <section className={inline ? "credibility inline" : "credibility"}>
      <span className="section-marker">— Credibility statement</span>
      <div className="container">
        <div className="quote-glyph" aria-hidden="true">&ldquo;</div>
        <blockquote>{inline ? <em>&ldquo;{t.quote}&rdquo;</em> : t.quote}</blockquote>
        <cite>
          <strong>{t.name}</strong>
          {t.location && <> · {t.location}</>}
        </cite>
      </div>
    </section>
  );
}

function EncourageBlock({
  variant,
  line,
  href,
  cta,
  idAttr,
}: {
  variant: "dark" | "accent" | "sunken";
  line: string;
  href: string;
  cta: string;
  idAttr?: string;
}) {
  const cls =
    variant === "dark"
      ? "encourage dark-bg on-dark"
      : variant === "accent"
        ? "encourage accent-bg on-dark"
        : "encourage sunken-bg";
  return (
    <section className={cls} {...(idAttr ? { id: idAttr } : {})}>
      <span className="section-marker">07 — Encouragement CTA</span>
      <div className="container">
        <p className="line">{line}</p>
        <a href={href} className="btn btn-primary btn-xl">
          {cta}
        </a>
      </div>
    </section>
  );
}
