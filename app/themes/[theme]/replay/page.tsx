import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { Icon } from "@/components/Icon";

export default async function ReplayPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const { host, event, program, content } = theme;
  const c = content.replay;
  const programHref = `/themes/${theme.slug}/program`;

  return (
    <>
      {/* 01 — Sticky offer bar */}
      <div className="replay-offer-bar">
        <div className="inner">
          <div className="offer-bar-left">
            <span className="offer-bar-label">{c.offerLabel}</span>
            <span className="offer-bar-title">{c.offerTitle}</span>
            <span className="offer-bar-urgency">{c.offerUrgency}</span>
          </div>
          <div className="offer-bar-right">
            <div className="offer-bar-price">
              <span className="offer-bar-price-main">{program.fullPriceLabel}</span>
              <span className="offer-bar-price-plan">or {program.spreadLabel}</span>
            </div>
            <a href={programHref} className="offer-bar-cta">
              {c.offerCtaText}
            </a>
          </div>
        </div>
      </div>

      {/* 02 — Header */}
      <header className="replay-header">
        <div className="container">
          <p className="replay-eyebrow">{c.pageEyebrow}</p>
          <h1 className="replay-event-title">{event.name}</h1>
          <p className="replay-subtitle">{c.pageSubtitle}</p>
          <div className="replay-meta">
            {c.metaItems.map((m, i) => (
              <span key={i}>
                {i > 0 && <span className="replay-meta-dot" />}
                {i === 0 ? `Hosted by ${host.name}` : m}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* 03 — Resources */}
      <section className="resources-section">
        <div className="container">
          <p className="resources-label">{c.resourcesLabel}</p>
          <div className="resources-list">
            {c.resources.map((r, i) => (
              <a key={i} href="#" className="resource-btn">
                <div className="resource-btn-icon">
                  <Icon name="paper" size={20} />
                </div>
                <div className="resource-btn-text">
                  <span className="resource-btn-name">{r.name}</span>
                  <span className="resource-btn-size">{r.size}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — Video parts */}
      <section className="videos-section">
        <div className="container">
          {c.parts.map((p, i) => (
            <div key={i}>
              <article className="video-part">
                <div className="video-part-header">
                  <div className={`video-part-num${i === 0 ? " active" : ""}`}>{i + 1}</div>
                  <div className="video-part-meta">
                    <p className="video-part-label">{p.label}</p>
                    <h2 className="video-part-title">{p.title}</h2>
                    <p className="video-part-desc">{p.description}</p>
                    <p className="video-part-duration">
                      <Icon name="clock" size={12} strokeWidth={1.2} />
                      {p.duration}
                    </p>
                  </div>
                </div>
                <div className="video-player">
                  <div className="video-player-inner">
                    <span className="video-player-label">{p.label} · Video placeholder</span>
                    <button className="video-play-btn" aria-label="Play video">
                      <Icon name="play" size={24} />
                    </button>
                    <p className="video-player-title">{p.title}</p>
                  </div>
                </div>
                <div className="part-quotes">
                  {p.quotes.map((q, qi) => (
                    <div key={qi} className="part-quote-item">
                      <p className="part-quote-text">&ldquo;{q.text}&rdquo;</p>
                      <span className="part-quote-author">— {q.author}</span>
                    </div>
                  ))}
                </div>
              </article>
              {i < c.parts.length - 1 && <div className="part-divider" />}
            </div>
          ))}
        </div>
      </section>

      {/* 05 — Live chat comments */}
      <section className="live-comments-section">
        <div className="container">
          <div className="live-comments-header">
            <p className="live-comments-eyebrow">{c.chatEyebrow}</p>
            <h2 className="live-comments-title">{c.chatHeadline}</h2>
          </div>
          <div className="comments-track">
            {c.chatComments.map((cmt, i) => (
              <div key={i} className="comment-card">
                <p className="comment-bubble">{cmt.text}</p>
                <span className="comment-name">
                  <span className="comment-dot" /> {cmt.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — Program CTA */}
      <section className="program-cta-section">
        <div className="container">
          <div className="program-cta-inner">
            <div className="program-cta-content">
              <p className="program-cta-label">{c.programCtaLabel}</p>
              <h2 className="program-cta-headline">
                {program.nameLine1}
                <br />
                {program.nameLine2}
              </h2>
              <p className="program-cta-desc">{c.programCtaDescription}</p>
              <ul className="program-cta-benefits">
                {c.programCtaBenefits.map((b, i) => (
                  <li key={i}>
                    <span className="benefit-check">
                      <Icon name="check" size={10} strokeWidth={1.5} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="program-price-block">
              <span className="program-name">{program.name}</span>
              <div className="program-price-divider" />
              <span className="program-price-label">One payment</span>
              <span className="program-price-main">
                <sup>$</sup>
                {program.fullPriceLabel.replace("$", "")}
              </span>
              <p className="program-price-plan">
                or <strong>{program.spreadLabel}</strong>
                <br />
                No hidden fees. Cancel before month 2.
              </p>
              <span className="program-urgency">
                <Icon name="clock" size={10} strokeWidth={1.2} />
                {c.programUrgency}
              </span>
              <a href={programHref} className="program-cta-btn">
                {program.enrolCtaText}
              </a>
              <p className="program-cta-sub">
                Secure checkout · Instant access · Questions?{" "}
                <a href={`mailto:${host.email}`} style={{ color: "rgba(245,241,234,0.45)", textDecoration: "underline" }}>
                  Email us
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 07 — Disclaimer + footer */}
      <div className="replay-disclaimer">
        <div className="container">
          <h2 className="disclaimer-heading">{c.disclaimerHeading ?? "Important disclaimer"}</h2>
          <p className="disclaimer-text">{c.disclaimerText}</p>
        </div>
      </div>

      <footer className="replay-footer">
        <div className="container">
          <span className="footer-logo">{host.name}</span>
          <nav className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Refund Policy</a>
            <a href={`mailto:${host.email}`}>Contact</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
