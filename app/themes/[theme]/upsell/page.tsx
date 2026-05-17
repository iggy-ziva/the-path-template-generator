import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { Icon } from "@/components/Icon";
import type { IconKey } from "@/components/Icon";

export default async function UpsellPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const { host, content } = theme;
  const c = content.upsell;
  const thankYouHref = `/themes/${theme.slug}/thank-you`;

  return (
    <>
      {/* 01 — Progress Indicator */}
      <header className="progress-bar">
        <div className="inner">
          <div className="progress-logo">{host.name}</div>
          <div className="progress-steps">
            <div className="progress-step step-done">
              <div className="step-number">
                <Icon name="check" size={12} strokeWidth={3} />
              </div>
              <span className="step-label">Registration</span>
            </div>
            <div className="step-divider" />
            <div className="progress-step step-current">
              <div className="step-number">2</div>
              <span className="step-label">Special offer</span>
            </div>
            <div className="step-divider" />
            <div className="progress-step step-pending">
              <div className="step-number">3</div>
              <span className="step-label">Confirmation</span>
            </div>
          </div>
        </div>
      </header>

      {/* 02 — Confirmation banner */}
      <div className="confirm-banner">
        <Icon name="check" size={20} strokeWidth={2.5} />
        {c.confirmBannerText}
      </div>

      {/* 03–08 Upsell body */}
      <main className="upsell-page">
        <div className="offer-eyebrow">{c.bundleEyebrow}</div>
        <h1 className="offer-headline">{c.bundleHeadline}</h1>
        <p className="offer-desc">{c.bundleDescription}</p>

        <hr className="offer-divider" />

        <div className="included-title">{c.includedTitle}</div>
        <div className="included-list">
          {c.bundleItems.map((item, i) => (
            <div key={i} className="included-item">
              <div className="included-icon">
                <Icon name={item.iconKey as IconKey} />
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="offer-quote">
          <span className="quote-glyph">&ldquo;</span>
          <blockquote>{c.testimonial.quote}</blockquote>
          <cite>
            <strong>{c.testimonial.name}</strong>
            {c.testimonial.location && <> · {c.testimonial.location}</>}
            {c.testimonial.context && <> · {c.testimonial.context}</>}
          </cite>
        </div>

        <div className="price-block">
          <p className="price-was">
            Regular value: <s>{c.priceWas}</s>
          </p>
          <div className="price-now">{c.priceNow}</div>
          <div className="price-saving">
            <Icon name="check" size={16} strokeWidth={2} />
            {c.priceSaving}
          </div>
          <p className="price-note">{c.priceNote}</p>
        </div>

        <a href={thankYouHref} className="yes-btn">
          {c.yesCta}
        </a>
        <p className="yes-btn-sub">{c.yesCtaSub}</p>

        <a href={thankYouHref} className="no-link">
          {c.noCta}
        </a>
      </main>

      <footer className="upsell-footer">
        <div className="inner">
          <span className="copy">
            © {new Date().getFullYear()} {host.name} · {host.parentBrand}
          </span>
          <nav className="links">
            <a href="#">Privacy</a>
            <a href="#">Terms of Use</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
