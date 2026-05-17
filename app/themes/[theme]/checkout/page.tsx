import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { Icon } from "@/components/Icon";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const { host, event, content } = theme;
  const c = content.checkout;

  return (
    <>
      {/* 01 — Checkout Header */}
      <header className="checkout-header">
        <div className="inner">
          <div className="logo">{host.name}</div>
          <div className="trust-badges">
            <div className="trust-badge">
              <div className="trust-badge-icon">
                <Icon name="shield" size={13} strokeWidth={2} />
              </div>
              <span>Safe &amp; Secure</span>
            </div>
            <div className="trust-badge">
              <div className="trust-badge-icon">
                <Icon name="lock" size={13} strokeWidth={2} />
              </div>
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </header>

      <CheckoutClient
        themeSlug={theme.slug}
        host={{
          name: host.name,
          email: host.email,
          legalEntity: host.legalEntity,
          parentBrand: host.parentBrand,
        }}
        event={{
          name: event.name,
          tagline: event.tagline,
          date: event.date,
          dayOfWeek: event.dayOfWeek,
          time: event.time,
          timezone: event.timezone,
          platform: event.platform,
          priceMin: event.priceMin,
          priceMax: event.priceMax,
          priceDefault: event.priceDefault,
          pricePresets: event.pricePresets,
          countdownDays: event.countdownDays,
          countdownHours: event.countdownHours,
          countdownMins: event.countdownMins,
          ctaText: event.ctaText,
        }}
        content={c}
      />

      {/* FTC */}
      <div className="checkout-ftc">
        <h2>FTC Disclaimer</h2>
        <p>{c.ftcParagraph}</p>
      </div>

      {/* Footer */}
      <footer className="checkout-footer">
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
