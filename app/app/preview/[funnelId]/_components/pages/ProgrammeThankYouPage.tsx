"use client";

import type { ProgrammeThankYouContent, WizardSnapshot } from "../funnel-types";
import { safeUrl, brandSectionOverlay, brandImageBackground } from "../funnel-types";
import BrandLogo from "../BrandLogo";
import EditableText from "../editor/EditableText";
import { PageText } from "../editor/page-editable";

interface Props {
  content: ProgrammeThankYouContent;
  wizard: WizardSnapshot;
  exportMode?: boolean;
}

export default function ProgrammeThankYouPage({ content: c, wizard: w, exportMode = false }: Props) {
  const hostName = w.hostName ?? "Your Host";
  const programName = w.programName ?? "The Programme";
  const year = new Date().getFullYear();
  const welcomeMessage = (c as ProgrammeThankYouContent & { welcomeMessage?: string }).welcomeMessage;

  return (
    <>
      {/* ── 01 CONFIRMATION HERO ── */}
      <section
        className="ty-hero on-dark"
        style={safeUrl(c.backgroundImageUrl ?? w.heroImageUrls?.[0]) ? {
          backgroundImage: brandImageBackground(brandSectionOverlay(0.88), safeUrl(c.backgroundImageUrl ?? w.heroImageUrls![0])!),
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        <div className="inner">

          <div className="ty-celebration">
            <div className="ty-celebration-ring" />
            <div className="ty-celebration-ring" />
            <div className="ty-celebration-ring" />
            <div className="ty-celebration-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          {c.label && (
            <PageText pageKey="programmeThankYou" path="label" as="p" className="ty-label" forceShow>
              {c.label}
            </PageText>
          )}

          <h1 className="ty-headline">
            <EditableText pageKey="programmeThankYou" path="headline" as="span">{c.headline ?? "You're in."}</EditableText>
          </h1>

          {welcomeMessage ? (
            <p className="ty-subheadline">
              <PageText pageKey="programmeThankYou" path="welcomeMessage" as="span">{welcomeMessage}</PageText>
            </p>
          ) : c.subheadline ? (
            <p className="ty-subheadline">
              <EditableText pageKey="programmeThankYou" path="subheadline" as="span">{c.subheadline}</EditableText>
            </p>
          ) : null}

          {(c.chips ?? []).length > 0 && (
            <div className="ty-chips">
              {(c.chips ?? []).map((chip, i) => (
                <span key={i} className={i === 0 ? "ty-chip gold" : "ty-chip"}>
                  {i === 0 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  )}
                  {i === 2 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  )}
                  {chip}
                </span>
              ))}
            </div>
          )}

          {c.emailNote && (
            <div className="ty-email-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <PageText pageKey="programmeThankYou" path="emailNote" as="span" html forceShow>
                {c.emailNote}
              </PageText>
            </div>
          )}

        </div>
      </section>

      {/* ── 02 WHAT HAPPENS NEXT ── */}
      {((c.steps ?? []).length > 0 || c.nextHeadline) && (
        <section className="next-section">
          <div className="ty-content">

            <p className="ty-section-label">What happens next</p>
            {c.nextHeadline && (
              <PageText pageKey="programmeThankYou" path="nextHeadline" as="h2" className="next-headline">
                {c.nextHeadline}
              </PageText>
            )}

            <div className="steps-list">
              {(c.steps ?? []).map((step, i) => (
                <div key={i} className="step-item">
                  <div className="step-num">{step.num}</div>
                  <div className="step-content">
                    <h3>
                      <EditableText pageKey="programmeThankYou" path={`steps[${i}].title`} as="span">{step.title}</EditableText>
                    </h3>
                    <EditableText pageKey="programmeThankYou" path={`steps[${i}].body`} as="p">{step.body}</EditableText>
                    {step.tag && (
                      <span className="step-tag">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "11px", height: "11px" }}>
                          <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
                        </svg>
                        {step.tag}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── 03 SCHEDULE PREVIEW ── */}
      {(c.scheduleRows ?? []).length > 0 && (
        <section className="schedule-section">
          <div className="ty-content">

            <div className="schedule-intro">
              <p className="ty-section-label">Your schedule</p>
              {c.scheduleIntro && (
                <PageText pageKey="programmeThankYou" path="scheduleIntro" as="h2" className="schedule-headline">
                  {c.scheduleIntro}
                </PageText>
              )}
            </div>

            <div className="schedule-grid">
              <div className="schedule-header">
                <div>Week</div>
                <div>Focus</div>
                <div className="col-protocol">Dates</div>
              </div>
              {(c.scheduleRows ?? []).map((row, i) => (
                <div key={i} className={`schedule-row${row.locked ? " locked" : ""}${i === 0 ? " upcoming" : ""}`}>
                  <div className="col-week">{row.week}</div>
                  <div className="col-title">
                    {row.focus}
                  </div>
                  <div className="col-protocol">{row.dates}</div>
                </div>
              ))}
            </div>

            {c.scheduleDatesNote && (
              <div className="schedule-dates">
                <div className="schedule-dates-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {c.scheduleDatesNote}
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* ── 04 PERSONAL NOTE ── */}
      {(c.noteParagraphs ?? []).length > 0 && (
        <section className="note-section">
          <div className="ty-content">

            {c.noteEyebrow && <p className="note-eyebrow">{c.noteEyebrow}</p>}

            <div className="note-body">
              {(c.noteParagraphs ?? []).map((para, i) => (
                <EditableText key={i} pageKey="programmeThankYou" path={`noteParagraphs[${i}]`} as="p">
                  {para}
                </EditableText>
              ))}
            </div>

            {c.noteSignature && (
              <div className="note-signature">
                <div className="note-signature-name">{hostName}</div>
                <div className="note-signature-title">{c.noteSignature}</div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* ── 05 COMMITMENT ── */}
      {(c.commitmentItems ?? []).length > 0 && (
        <section className="commitment-section">
          <div className="ty-content">

            {c.commitmentLabel && <p className="ty-section-label">{c.commitmentLabel}</p>}
            {c.commitmentHeadline && (
              <PageText pageKey="programmeThankYou" path="commitmentHeadline" as="h2" className="commitment-headline">
                {c.commitmentHeadline}
              </PageText>
            )}

            <div className="commitment-list">
              {(c.commitmentItems ?? []).map((item, i) => (
                <div key={i} className="commitment-item">
                  <div className="commitment-marker">
                    <svg viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <EditableText pageKey="programmeThankYou" path={`commitmentItems[${i}]`} as="p" className="commitment-item-text">
                    {item}
                  </EditableText>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── 06 ACCESS CARD ── */}
      {(c.accessCardTitle || (c.accessRows ?? []).length > 0) && (
        <section className="access-section">
          <div className="ty-content">

            <div className="access-card">
              <div className="access-card-inner">
                <p className="access-card-eyebrow">Your program details</p>
                <h3 className="access-card-headline">
                  <PageText pageKey="programmeThankYou" path="accessCardTitle" as="span">
                    {c.accessCardTitle ?? programName}
                  </PageText>
                </h3>
                <div className="access-details">
                  {(c.accessRows ?? [])
                    .filter(row => !/question/i.test(row.label))
                    .map((row, i) => (
                    <div key={i} className="access-detail-row">
                      <span className="access-detail-label">{row.label}</span>
                      <span className="access-detail-value" dangerouslySetInnerHTML={{ __html: row.value }} />
                    </div>
                  ))}
                  {w.contactEmail && (
                    <div className="access-detail-row">
                      <span className="access-detail-label">Questions</span>
                      <span className="access-detail-value">
                        <a href={`mailto:${w.contactEmail}`} style={{ color: "var(--accent-secondary-on-dark)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                          {w.contactEmail}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
                {c.accessNote && (
                  <div className="access-note">
                    <span dangerouslySetInnerHTML={{ __html: c.accessNote }} />
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="ty-footer">
        <div className="inner">
          <div className="ty-footer-left">
            <BrandLogo
              logoUrl={c.logoUrl ?? w.logoUrl}
              logoTransparent={w.logoTransparent}
              name={hostName}
              className="ty-footer-brand"
              imgStyle={{ maxHeight: "168px", maxWidth: "540px", width: "100%", objectFit: "contain", display: "block" }}
            />
            <span className="ty-footer-copy">&copy; {year} {hostName}</span>
          </div>
          <nav className="ty-footer-links">
            <a href={w.privacyPolicyUrl ?? "#"}>Privacy</a>
            <a href={w.termsOfUseUrl ?? "#"}>Terms of Use</a>
            {w.contactEmail && <a href={`mailto:${w.contactEmail}`} style={{ color: "var(--accent-secondary-on-dark)", textDecoration: "underline", textUnderlineOffset: "2px" }}>Contact</a>}
          </nav>
        </div>
      </footer>
    </>
  );
}
