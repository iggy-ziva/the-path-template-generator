"use client";

import { useState } from "react";
import type { EventThankYouContent, WizardSnapshot } from "../funnel-types";
import { safeUrl, brandSectionOverlay, brandImageBackground } from "../funnel-types";
import BrandLogo from "../BrandLogo";

import EditableText from "../editor/EditableText";
import { PageText } from "../editor/page-editable";

interface Props {
  content: EventThankYouContent;
  wizard: WizardSnapshot;
  exportMode?: boolean;
}

export default function EventThankYouPage({ content: c, wizard: w, exportMode = false }: Props) {
  const [copied, setCopied] = useState(false);

  const hostName     = w.hostName ?? w.businessName ?? "";
  const businessName = w.businessName ?? hostName;
  const eventName    = w.eventName ?? "Event";
  const eventDate    = w.eventDate ?? "";
  const eventTime    = w.eventTime ?? "";
  const eventTz      = w.eventTimezone ?? "";
  const eventPlatform = w.eventPlatform ?? "Zoom";
  const contactEmail = w.contactEmail ?? "";
  const shareUrl     = c.shareUrl ?? (exportMode ? "#" : (typeof window !== "undefined" ? window.location.origin : "#"));

  const headline         = c.headline ?? "You're in.";
  const subheadline      = c.subheadline ?? `${eventName}${hostName ? ` — with ${hostName}` : ""}`;
  const emailNote        = c.emailNote ?? (contactEmail
    ? `A confirmation email is on its way. Check your inbox — including your spam folder — for ${contactEmail}.`
    : "A confirmation email is on its way. Check your inbox — including your spam folder.");
  const nextStepsHeading = c.nextStepsHeading ?? "What happens next";
  const nextSteps        = c.nextSteps ?? [];
  const calendarHeading  = c.calendarHeading ?? "Save the date now.";
  const calendarSub      = c.calendarSub ?? `Add ${eventName} to your calendar so ${eventDate || "the date"} is protected.`;
  const detailRows       = c.detailRows ?? [];
  const zoomNote         = c.zoomNote ?? "";
  const shareHeading     = c.shareHeading ?? "";
  const shareSub         = c.shareSub ?? "";
  const personalNoteHeadline = c.personalNoteHeadline ?? (hostName ? `A note from ${hostName}` : "");
  const personalNoteParagraphs = c.personalNoteParagraphs ?? [];
  const personalNoteSignature  = c.personalNoteSignature ?? (hostName ? `— ${hostName}` : "");

  function handleCopyLink() {
    const url = shareUrl || (typeof window !== "undefined" ? window.location.origin : "");
    if (url && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  }

  return (
    <div className="theme-root">

      {/* 01 — Confirmation Hero */}
      <section
        className="ty-hero on-dark"
        style={safeUrl(c.backgroundImageUrl ?? w.heroImageUrls?.[0]) ? {
          backgroundImage: brandImageBackground(brandSectionOverlay(0.88), safeUrl(c.backgroundImageUrl ?? w.heroImageUrls![0])!),
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        <div className="inner">
          <div className="ty-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          {c.label && (
            <PageText pageKey="eventThankYou" path="label" as="p" className="ty-label" forceShow>
              {c.label}
            </PageText>
          )}
          <h1 className="ty-headline">
            <EditableText pageKey="eventThankYou" path="headline" as="span">{headline}</EditableText>
          </h1>
          <p className="ty-event-name">
            <EditableText pageKey="eventThankYou" path="subheadline" as="span">{subheadline}</EditableText>
          </p>
          <div className="ty-event-details">
            {eventDate && <span>{eventDate}</span>}
            {eventDate && (eventTime || eventPlatform) && <span className="sep" />}
            {eventTime && (
              <span>{eventTime}{eventTz ? ` ${eventTz}` : ""}</span>
            )}
            {(eventDate || eventTime) && eventPlatform && <span className="sep" />}
            {eventPlatform && <span>Live Online &middot; {eventPlatform}</span>}
          </div>
          {emailNote && (
            <div className="ty-email-note">
              <PageText pageKey="eventThankYou" path="emailNote" as="span" forceShow>
                {emailNote}
              </PageText>
            </div>
          )}
        </div>
      </section>

      {/* 02 — What happens next */}
      {nextSteps.length > 0 && (
        <section className="next-steps-section">
          <div className="ty-content">
            <PageText pageKey="eventThankYou" path="nextStepsHeading" as="p" className="section-title">
              {nextStepsHeading}
            </PageText>
            <div className="steps-list">
              {nextSteps.map((step, i) => (
                <div key={i} className="step-item">
                  <div className="step-num">{step.step}</div>
                  <div className="step-content">
                    <h3>
                      <EditableText pageKey="eventThankYou" path={`nextSteps[${i}].title`} as="span">{step.title}</EditableText>
                    </h3>
                    <EditableText pageKey="eventThankYou" path={`nextSteps[${i}].body`} as="p" html>{step.body}</EditableText>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 03 — Add to Calendar */}
      <section className="calendar-section">
        <div className="ty-content">
          <div className="calendar-inner">
            <PageText pageKey="eventThankYou" path="calendarHeading" as="h2" className="calendar-headline">
              {calendarHeading}
            </PageText>
            <PageText pageKey="eventThankYou" path="calendarSub" as="p" className="calendar-sub">
              {calendarSub}
            </PageText>
            <div className="calendar-fallback">
              <a className="cal-btn" href="#" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Google Calendar
              </a>
              <a className="cal-btn" href="#" download>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Apple Calendar
              </a>
              <a className="cal-btn" href="#" download>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Outlook / iCal
              </a>
            </div>
            {(eventDate || c.timezoneNote) && (
              <div className="calendar-date-reminder">
                {eventDate && (
                  <strong>
                    {eventDate}{eventTime ? ` \u00b7 ${eventTime}` : ""}{eventTz ? ` ${eventTz}` : ""}
                  </strong>
                )}
                {c.timezoneNote && (
                  <>{eventDate ? <br /> : null}{c.timezoneNote}</>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 04 — Event Details */}
      {(detailRows.length > 0 || zoomNote) && (
        <section className="details-section">
          <div className="ty-content">
            <p className="section-title">Your event details</p>
            {detailRows.length > 0 && (
              <div className="details-grid">
                {detailRows.map((row, i) => (
                  <div key={i} className="detail-row">
                    <span className="detail-label">{row.label}</span>
                    <span className="detail-value">
                      {row.isLive ? (
                        <>
                          <span className="live-badge">
                            <span className="dot" />
                            {row.value}
                          </span>
                        </>
                      ) : (
                        row.value
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {zoomNote && (
              <PageText pageKey="eventThankYou" path="zoomNote" as="p" className="zoom-note">
                {zoomNote}
              </PageText>
            )}
          </div>
        </section>
      )}

      {/* 05 — Share */}
      {(shareHeading || shareSub) && (
        <section className="share-section">
          <div className="ty-content">
            {shareHeading && (
              <PageText pageKey="eventThankYou" path="shareHeading" as="h2" className="share-headline">
                {shareHeading}
              </PageText>
            )}
            {shareSub && (
              <PageText pageKey="eventThankYou" path="shareSub" as="p" className="share-sub">
                {shareSub}
              </PageText>
            )}
            <div className="share-buttons">
              <a
                href={`mailto:?subject=${encodeURIComponent(eventName)}&body=${encodeURIComponent(`I just registered for this and thought of you: ${shareUrl}`)}`}
                className="share-btn share-email"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email a friend
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn share-facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Share on Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`I just registered for ${eventName}${hostName ? ` with ${hostName}` : ""}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn share-x"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </a>
              <button className="share-btn share-copy" onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 06 — Personal Note */}
      {(personalNoteHeadline || personalNoteParagraphs.length > 0) && (
        <section className="personal-note-section">
          <div className="ty-content">
            {personalNoteHeadline && (
              <PageText pageKey="eventThankYou" path="personalNoteHeadline" as="h2" className="note-headline">
                {personalNoteHeadline}
              </PageText>
            )}
            {personalNoteParagraphs.length > 0 && (
              <blockquote>
                {personalNoteParagraphs.map((para, i) => (
                  <EditableText key={i} pageKey="eventThankYou" path={`personalNoteParagraphs[${i}]`} as="p">
                    {para}
                  </EditableText>
                ))}
              </blockquote>
            )}
            {personalNoteSignature && (
              <PageText pageKey="eventThankYou" path="personalNoteSignature" as="div" className="signature">
                {personalNoteSignature}
              </PageText>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="ty-footer">
        <div className="inner">
          <div className="ty-footer-left">
            <BrandLogo
              logoUrl={c.logoUrl ?? w.logoUrl}
              logoTransparent={w.logoTransparent}
              name={businessName || hostName}
              className="ty-footer-brand"
              imgStyle={{ maxHeight: "168px", maxWidth: "540px", width: "100%", objectFit: "contain", display: "block" }}
            />
            <span className="ty-footer-copy">&copy; {new Date().getFullYear()} {businessName || hostName}</span>
          </div>
          <nav className="ty-footer-links">
            <a href={w.privacyPolicyUrl ?? "#"}>Privacy</a>
            <a href={w.termsOfUseUrl ?? "#"}>Terms of Use</a>
          </nav>
        </div>
      </footer>

    </div>
  );
}
