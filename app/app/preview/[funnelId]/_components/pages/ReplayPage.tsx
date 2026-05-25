import type { ReplayContent, WizardSnapshot } from "../funnel-types";
import { safeUrl } from "../funnel-types";

interface Props {
  content: ReplayContent;
  wizard: WizardSnapshot;
}

export default function ReplayPage({ content: c, wizard: w }: Props) {
  const hostName     = w.hostName ?? w.businessName ?? "";
  const businessName = w.businessName ?? hostName;
  const eventName    = w.eventName ?? "Event";
  const programName  = w.programName ?? c.programCtaHeadline ?? "";
  const contactEmail = w.contactEmail ?? "";

  const offerBarLabel   = c.offerBarLabel ?? "Special offer for attendees";
  const offerBarTitle   = c.offerBarTitle ?? programName;
  const offerBarUrgency = c.offerBarUrgency ?? "";
  const offerBarPrice   = c.offerBarPrice ?? (w.programPriceFull ? `$${w.programPriceFull}` : "");

  const eyebrow   = c.eyebrow ?? "Replay \u00b7 Live event recording";
  const headline  = c.headline ?? eventName;
  const subtitle  = c.subtitle ?? "Your recordings are ready. Watch at your own pace — all recordings and resources are below.";
  const metaRecordings = c.metaRecordings ?? `${(c.videos ?? []).length || 1} recording${(c.videos ?? []).length !== 1 ? "s" : ""}`;
  const metaAccess     = c.metaAccess ?? "Available for 30 days";

  const resourcesLabel = c.resourcesLabel ?? "Your take-home resources";
  const resources      = c.resources ?? [];
  const videos         = c.videos ?? [];
  const comments       = c.comments ?? [];

  const programCtaLabel       = c.programCtaLabel ?? "The next step";
  const programCtaHeadline    = c.programCtaHeadline ?? programName;
  const programCtaDescription = c.programCtaDescription ?? "";
  const programCtaBenefits    = c.programCtaBenefits ?? [];
  const programCtaPrice       = c.programCtaPrice ?? (w.programPriceFull ? `$${w.programPriceFull}` : "");
  const programCtaPlanText    = c.programCtaPlanText ?? "";
  const programCtaUrgency     = c.programCtaUrgency ?? "";
  const programCtaEnrolText   = c.programCtaEnrolText ?? (programName ? `Enrol in ${programName}` : "Enrol now");
  const ftcText               = c.ftcText ?? "These recordings are for the personal use of registered attendees only and may not be shared, redistributed, or reproduced in any form. Content is provided for educational and personal development purposes. Results are individual and are not guaranteed.";

  return (
    <div className="theme-root">

      {/* 01 — Sticky Offer Bar */}
      <div className="replay-offer-bar">
        <div className="inner">
          <div className="offer-bar-left">
            <span className="offer-bar-label">{offerBarLabel}</span>
            {offerBarTitle && <span className="offer-bar-title">{offerBarTitle}</span>}
            {offerBarUrgency && <span className="offer-bar-urgency">{offerBarUrgency}</span>}
          </div>
          <div className="offer-bar-right">
            {offerBarPrice && (
              <div className="offer-bar-price">
                <span className="offer-bar-price-main">{offerBarPrice}</span>
                {programCtaPlanText && (
                  <span className="offer-bar-price-plan">{programCtaPlanText}</span>
                )}
              </div>
            )}
            <a href="#program-cta" className="offer-bar-cta">Learn more &rarr;</a>
          </div>
        </div>
      </div>

      {/* 02 — Page Header */}
      <header
        className={`replay-header${safeUrl(c.heroBackgroundImageUrl ?? w.heroImageUrls?.[1] ?? w.heroImageUrls?.[0]) ? " on-dark" : ""}`}
        style={safeUrl(c.heroBackgroundImageUrl ?? w.heroImageUrls?.[1] ?? w.heroImageUrls?.[0]) ? {
          backgroundImage: `linear-gradient(rgba(15,14,12,0.92),rgba(15,14,12,0.92)), url(${safeUrl(c.heroBackgroundImageUrl ?? w.heroImageUrls?.[1] ?? w.heroImageUrls![0])})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        <div className="container">
          {safeUrl(c.logoUrl ?? w.logoUrl) && (
            <img src={safeUrl(c.logoUrl ?? w.logoUrl)!} alt={businessName || hostName} style={{ height: "96px", objectFit: "contain", display: "block", marginBottom: "28px", marginInline: "auto" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <p className="replay-eyebrow">{eyebrow}</p>
          <h1 className="replay-event-title">{headline}</h1>
          <p className="replay-subtitle">{subtitle}</p>
          <div className="replay-meta">
            {hostName && <span>Hosted by {hostName}</span>}
            {hostName && <span className="replay-meta-dot" />}
            <span>{metaRecordings}</span>
            <span className="replay-meta-dot" />
            <span>{metaAccess}</span>
          </div>
        </div>
      </header>

      {/* 03 — Resource Downloads */}
      {resources.length > 0 && (
        <section className="resources-section">
          <div className="container">
            <p className="resources-label">{resourcesLabel}</p>
            <div className="resources-list">
              {resources.map((resource, i) => (
                <a key={i} href="#" className="resource-btn">
                  <div className="resource-btn-icon">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M8 1v9M4.5 6.5 8 10l3.5-3.5M2 13h12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <div className="resource-btn-text">
                    <span className="resource-btn-name">{resource.name}</span>
                    <span className="resource-btn-size">
                      {resource.fileType}{resource.fileSize ? ` \u00b7 ${resource.fileSize}` : ""}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 04 — Video Parts */}
      {videos.length > 0 && (
        <section className="videos-section">
          <div className="container">
            {videos.map((video, i) => (
              <article key={i} className="video-part">
                {i > 0 && <div className="part-divider" />}
                <div className="video-part-header">
                  <div className={`video-part-num${i === 0 ? " active" : ""}`}>{i + 1}</div>
                  <div className="video-part-meta">
                    <p className="video-part-label">{video.partLabel}</p>
                    <h2 className="video-part-title">{video.title}</h2>
                    <p className="video-part-desc">{video.description}</p>
                    {video.duration && (
                      <p className="video-part-duration">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M6 3v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        {video.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="video-player">
                  <div className="video-player-inner">
                    <span className="video-player-label">Part {i + 1} &middot; Video</span>
                    <button className="video-play-btn" aria-label="Play video">
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5.5v13l11-6.5L8 5.5z" fill="currentColor" />
                      </svg>
                    </button>
                    <p className="video-player-title">{video.title}</p>
                  </div>
                </div>

                {video.quotes.length > 0 && (
                  <div className="part-quotes">
                    {video.quotes.map((q, qi) => (
                      <div key={qi} className="part-quote-item">
                        <p className="part-quote-text">&ldquo;{q.text}&rdquo;</p>
                        <span className="part-quote-author">&mdash; {q.author}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 05 — Live Chat Comments */}
      {comments.length > 0 && (
        <section className="live-comments-section">
          <div className="container">
            <div className="live-comments-header">
              <p className="live-comments-eyebrow">{c.commentsEyebrow ?? "From the live chat"}</p>
              <h2 className="live-comments-title">
                {c.commentsTitle ?? "What people said during the event"}
              </h2>
            </div>
            <div className="comments-track">
              {comments.map((comment, i) => (
                <div key={i} className="comment-card">
                  <p className="comment-bubble">{comment.bubble}</p>
                  <span className="comment-name">
                    <span className="comment-dot" />
                    {comment.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 06 — Programme CTA */}
      {(programCtaHeadline || programCtaDescription) && (
        <section className="program-cta-section" id="program-cta">
          <div className="container">
            <div className="program-cta-inner">

              <div className="program-cta-content">
                <p className="program-cta-label">{programCtaLabel}</p>
                <h2 className="program-cta-headline">{programCtaHeadline}</h2>
                {programCtaDescription && (
                  <p className="program-cta-desc">{programCtaDescription}</p>
                )}
                {programCtaBenefits.length > 0 && (
                  <ul className="program-cta-benefits">
                    {programCtaBenefits.map((benefit, i) => (
                      <li key={i}>
                        <span className="benefit-check">
                          <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M1.5 5l2.5 2.5 4.5-4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="program-price-block">
                {programName && <span className="program-name">{programName}</span>}
                <div className="program-price-divider" />
                <span className="program-price-label">One payment</span>
                {programCtaPrice && (
                  <span className="program-price-main">{programCtaPrice}</span>
                )}
                {programCtaPlanText && (
                  <p className="program-price-plan">{programCtaPlanText}</p>
                )}
                {programCtaUrgency && (
                  <span className="program-urgency">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M5 2.5v3l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {programCtaUrgency}
                  </span>
                )}
                <a href="/program" className="program-cta-btn">{programCtaEnrolText}</a>
                {contactEmail && (
                  <p className="program-cta-sub">
                    Secure checkout &middot; Instant access &middot; Questions?{" "}
                    <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                  </p>
                )}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 07 — Disclaimer */}
      <div className="replay-disclaimer">
        <div className="container">
          <p className="disclaimer-text">{ftcText}</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="replay-footer">
        <div className="container">
          <span className="footer-logo">{businessName || hostName}</span>
          <nav className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Refund Policy</a>
            {contactEmail && <a href={`mailto:${contactEmail}`}>Contact</a>}
          </nav>
        </div>
      </footer>

    </div>
  );
}
