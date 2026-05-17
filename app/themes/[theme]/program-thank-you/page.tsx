import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { Icon } from "@/components/Icon";
import type { IconKey } from "@/components/Icon";

export default async function ProgramThankYouPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const { host, program, content } = theme;
  const c = content.programThankYou;

  return (
    <>
      {/* 01 — Confirmation hero */}
      <section className="ty-hero">
        <div className="inner">
          <div className="ty-celebration">
            <div className="ty-celebration-ring" />
            <div className="ty-celebration-ring" />
            <div className="ty-celebration-ring" />
            <div className="ty-celebration-check">
              <Icon name="check" size={36} strokeWidth={2.5} />
            </div>
          </div>

          <p className="ty-label">{c.label}</p>
          <h1 className="ty-headline">{c.headline}</h1>
          <p className="ty-subheadline">{c.subheadline}</p>

          <div className="ty-chips">
            {c.chips.map((chip, i) => (
              <span key={i} className={`ty-chip${i === 0 ? " gold" : ""}`}>
                <Icon name={i === 0 ? "calendar" : i === 1 ? "clock" : "group"} size={14} strokeWidth={2} />
                {chip}
              </span>
            ))}
          </div>

          <div className="ty-email-note">
            <Icon name="mail" size={18} strokeWidth={2} />
            <span>{c.emailNote}</span>
          </div>
        </div>
      </section>

      {/* 02 — What happens next */}
      <section className="next-section">
        <div className="ty-content">
          <p className="ty-section-label">{c.nextStepsLabel}</p>
          <h2 className="next-headline">{c.nextStepsHeadline}</h2>
          <div className="steps-list">
            {c.nextSteps.map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="step-content">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  {s.tag && (
                    <span className="step-tag">
                      {s.tagIconKey && <Icon name={s.tagIconKey as IconKey} size={11} strokeWidth={2} />}
                      {s.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — Schedule preview */}
      <section className="schedule-section">
        <div className="ty-content">
          <div className="schedule-intro">
            <p className="ty-section-label">{c.scheduleLabel}</p>
            <h2 className="schedule-headline">{c.scheduleHeadline}</h2>
            <p className="schedule-sub">{c.scheduleSub}</p>
          </div>

          <div className="schedule-grid">
            <div className="schedule-header">
              <div>Week</div>
              <div>Focus</div>
              <div className="col-protocol">Dates</div>
            </div>
            {c.scheduleRows.map((r, i) => (
              <div
                key={i}
                className={`schedule-row${r.upcoming ? " upcoming" : ""}${r.locked ? " locked" : ""}`}
              >
                <div className="col-week">{String(i + 1).padStart(2, "0")}</div>
                <div className="col-title">{r.title}</div>
                <div className="col-protocol">{r.dates}</div>
              </div>
            ))}
          </div>

          <div className="schedule-dates">
            {c.scheduleDates.map((d, i) => (
              <div key={i} className="schedule-dates-item">
                <Icon name={i === 0 ? "clock" : i === 1 ? "library" : "calendar"} size={14} strokeWidth={2} />
                {d}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — Personal note */}
      <section className="note-section">
        <div className="ty-content">
          <p className="note-eyebrow">{c.noteEyebrow}</p>
          <div className="note-body">
            {c.note.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="note-signature">
            <div className="note-signature-name">{host.name}</div>
            <div className="note-signature-title">{c.noteSignatureTitle}</div>
          </div>
        </div>
      </section>

      {/* 05 — Commitment */}
      <section className="commitment-section">
        <div className="ty-content">
          <p className="ty-section-label">{c.commitmentLabel}</p>
          <h2 className="commitment-headline">{c.commitmentHeadline}</h2>
          <div className="commitment-list">
            {c.commitmentItems.map((item, i) => (
              <div key={i} className="commitment-item">
                <div className="commitment-marker">
                  <Icon name="check" size={10} strokeWidth={1.5} />
                </div>
                <p className="commitment-item-text">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — Access card */}
      <section className="access-section">
        <div className="ty-content">
          <div className="access-card">
            <div className="access-card-inner">
              <p className="access-card-eyebrow">{c.accessEyebrow}</p>
              <h3 className="access-card-headline">{program.name}</h3>
              <div className="access-details">
                {c.accessRows.map((r, i) => (
                  <div key={i} className="access-detail-row">
                    <span className="access-detail-label">{r.label}</span>
                    <span className="access-detail-value">{r.value}</span>
                  </div>
                ))}
                <div className="access-detail-row">
                  <span className="access-detail-label">Questions</span>
                  <span className="access-detail-value">
                    <a href={`mailto:${host.email}`} style={{ color: "var(--accent-primary-light)", textDecoration: "underline" }}>
                      {host.email}
                    </a>
                  </span>
                </div>
              </div>
              <div className="access-note">{c.accessNote}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ty-footer">
        <div className="inner">
          <div className="ty-footer-brand">{host.name}</div>
          <nav className="ty-footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href={`mailto:${host.email}`}>Contact</a>
          </nav>
          <span className="ty-footer-copy">
            © {new Date().getFullYear()} {host.name}
          </span>
        </div>
      </footer>
    </>
  );
}
