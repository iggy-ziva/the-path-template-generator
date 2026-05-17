import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { Icon } from "@/components/Icon";
import ProgramCheckoutClient from "./ProgramCheckoutClient";

export default async function ProgramCheckoutPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const { host, program, content } = theme;
  const c = content.programCheckout;

  return (
    <>
      {/* Header */}
      <header className="co-header">
        <div className="inner">
          <div className="co-logo">{host.name}</div>
          <div className="co-trust">
            <div className="co-trust-item">
              <Icon name="shield" size={16} strokeWidth={2} />
              <span>Secure checkout</span>
            </div>
            <div className="co-trust-item">
              <Icon name="lock" size={16} strokeWidth={2} />
              <span>SSL encrypted</span>
            </div>
            <div className="co-trust-item">
              <Icon name="check" size={16} strokeWidth={2} />
              <span>Instant access</span>
            </div>
          </div>
        </div>
      </header>

      <ProgramCheckoutClient
        themeSlug={theme.slug}
        host={{
          name: host.name,
          email: host.email,
          parentBrand: host.parentBrand,
        }}
        program={{
          name: program.name,
          nameLine1: program.nameLine1,
          nameLine2: program.nameLine2,
          durationLabel: program.durationLabel,
          sessionsCount: program.sessionsCount,
          startDate: program.startDate,
          enrolmentDeadline: program.enrolmentDeadline,
          scheduleLine: program.scheduleLine,
          fullPrice: program.fullPrice,
          spreadPerPayment: program.spreadPerPayment,
          spreadCount: program.spreadCount,
          spreadTotal: program.spreadTotal,
          extendedPerPayment: program.extendedPerPayment,
          extendedCount: program.extendedCount,
          extendedTotal: program.extendedTotal,
        }}
        content={c}
      />

      {/* FTC */}
      <div className="co-ftc">
        <h2>Earnings &amp; results disclaimer</h2>
        <p>{c.ftcText}</p>
      </div>

      <footer className="co-footer">
        <span className="co-footer-copy">
          © {new Date().getFullYear()} {host.name}
        </span>
        <nav className="co-footer-links">
          <a href="#">Privacy policy</a>
          <a href="#">Terms of use</a>
          <a href={`mailto:${host.email}`}>Contact</a>
        </nav>
      </footer>
    </>
  );
}
