import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { Icon } from "@/components/Icon";

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const { host, event, content } = theme;
  const c = content.thankYou;

  return (
    <>
      {/* 01 — Confirmation Hero */}
      <section className="ty-hero">
        <div className="inner">
          <div className="ty-check" aria-hidden="true">
            <Icon name="check" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="ty-headline">{c.headline}</h1>
          <p className="ty-event-name">{c.eventNameLine}</p>
          <div className="ty-event-details">
            {c.eventDetails.map((d, i) => (
              <span key={i}>
                {d}
                {i < c.eventDetails.length - 1 && <span className="sep" />}
              </span>
            ))}
          </div>
          <div className="ty-email-note">
            {c.emailNote.split(host.email).map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <strong>{host.email}</strong>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 02 — What happens next */}
      <section className="next-steps-section">
        <div className="ty-content">
          <p className="section-title">{c.nextStepsLabel}</p>
          <div className="steps-list">
            {c.nextSteps.map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{i + 1}</div>
                <div className="step-content">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — Calendar */}
      <section className="calendar-section">
        <div className="ty-content">
          <div className="calendar-inner">
            <h2 className="calendar-headline">{c.calendarHeadline}</h2>
            <p className="calendar-sub">{c.calendarSub}</p>

            <div className="calendar-fallback">
              <a className="cal-btn" href="#" target="_blank" rel="noopener">
                <Icon name="calendar" size={16} strokeWidth={2} />
                Google Calendar
              </a>
              <a className="cal-btn" href="#" download="event.ics">
                <Icon name="calendar" size={16} strokeWidth={2} />
                Apple Calendar
              </a>
              <a className="cal-btn" href="#" download="event.ics">
                <Icon name="calendar" size={16} strokeWidth={2} />
                Outlook / iCal
              </a>
            </div>

            <div className="calendar-date-reminder">
              <strong>{c.calendarReminder}</strong>
              <br />
              {c.calendarReminderSub}
            </div>
          </div>
        </div>
      </section>

      {/* 04 — Event details */}
      <section className="details-section">
        <div className="ty-content">
          <p className="section-title">{c.detailsLabel}</p>
          <div className="details-grid">
            {c.detailsRows.map((r, i) => (
              <div key={i} className="detail-row">
                <span className="detail-label">{r.label}</span>
                <span className="detail-value">{r.value}</span>
              </div>
            ))}
          </div>
          <p className="zoom-note">
            {c.zoomNote}{" "}
            <a href={`mailto:${host.email}`} style={{ color: "var(--accent-primary)" }}>
              {host.email}
            </a>
          </p>
        </div>
      </section>

      {/* 05 — Share */}
      <section className="share-section">
        <div className="ty-content">
          <h2 className="share-headline">{c.shareHeadline}</h2>
          <p className="share-sub">{c.shareSub}</p>
          <div className="share-buttons">
            <a href={`mailto:?subject=${encodeURIComponent(event.name)}`} className="share-btn share-email">
              <Icon name="mail" size={16} strokeWidth={2} />
              Email a friend
            </a>
            <a href="#" className="share-btn share-facebook">
              Share on Facebook
            </a>
            <a href="#" className="share-btn share-x">
              Share on X
            </a>
          </div>
        </div>
      </section>

      {/* 06 — Personal note */}
      <section className="personal-note-section">
        <div className="ty-content">
          <h2 className="note-headline">{c.personalNoteHeadline}</h2>
          <blockquote>
            {c.personalNote.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </blockquote>
          <div className="signature">{c.personalNoteSignature}</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ty-footer">
        <div className="inner">
          <div>
            <div className="brand">{host.name}</div>
            <div className="copy">
              © {new Date().getFullYear()} {host.name} · {host.parentBrand} · All Rights Reserved
            </div>
          </div>
          <nav className="links">
            <a href="#">Privacy</a>
            <a href="#">Terms of Use</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
