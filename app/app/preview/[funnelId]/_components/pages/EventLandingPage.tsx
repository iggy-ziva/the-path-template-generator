"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { EventLandingContent, WizardSnapshot, TestimonialItem } from "../funnel-types";
import { safeUrl } from "../funnel-types";
import { isSameName } from "@/lib/name-match";
import { getEventSessions, formatSession } from "@/lib/event-sessions";
import EditableLogo from "../editor/EditableLogo";
import EditableIcon, { IconContainer } from "../editor/icon-library";
import EditableText from "../editor/EditableText";
import { useEditorOptional } from "../editor/EditorContext";
import { useEditSurface } from "../editor/EditSurfaceContext";
import { PageText, useEditMode } from "../editor/page-editable";
import EditablePressLogos from "../editor/EditablePressLogos";
import EditableSection from "../editor/EditableSection";
import EditableBackgroundImage from "../editor/EditableBackgroundImage";
import { EditableImage } from "../editor/EditableList";
import { resolveSectionTheme, EVENT_LANDING_LEGACY_FIELD, type SectionTheme as SectionThemeT } from "../editor/section-theme";
import {
  defaultHeroTheme,
  defaultRegisterTheme,
  defaultFinalVpTheme,
} from "@/lib/brand-surfaces";

interface Props {
  content: EventLandingContent;
  wizard: WizardSnapshot;
  exportMode?: boolean;
}

/** Inline editor-only pill controls for add/remove rows.
 *  Inlined (not CSS) so they render reliably regardless of stylesheet caching
 *  and never leak into the exported/published page (only mounted in edit mode). */
const EDIT_PILL_REMOVE: CSSProperties = {
  position: "static",
  alignSelf: "center",
  justifySelf: "end",
  flexShrink: 0,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
  background: "color-mix(in srgb, var(--text-primary) 6%, transparent)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 999,
  padding: "4px 10px",
  cursor: "pointer",
  lineHeight: 1,
};
const EDIT_PILL_ADD: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  marginTop: 14,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--accent-secondary-ctx, var(--accent-secondary))",
  background: "none",
  border: "1px dashed var(--border-subtle)",
  borderRadius: 999,
  padding: "6px 14px",
  cursor: "pointer",
  lineHeight: 1,
};

/** Parse wizard date/time strings into a target Date.
 *  eventDate can be "Friday 19 June 2026", "19/06/2026", ISO, etc.
 *  eventTime can be "9:00 AM", "09:00", "9am", etc.
 */
function parseEventDate(dateStr?: string, timeStr?: string, tz?: string): Date | null {
  if (!dateStr) return null;
  try {
    // Normalise ordinal suffixes (e.g. "19th" → "19")
    const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
    const combined = timeStr ? `${cleaned} ${timeStr}` : cleaned;
    const d = new Date(combined);
    if (!isNaN(d.getTime())) return d;
    // Fallback: try just the date
    const d2 = new Date(cleaned);
    return isNaN(d2.getTime()) ? null : d2;
  } catch {
    return null;
  }
}

function useCountdown(target: Date | null, paused = false) {
  const calc = () => {
    if (!target) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);
    return { days, hours, mins, secs, expired: false };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => {
    if (!target || paused) return;
    const id = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.getTime(), paused]);
  return tick;
}

// SVG icons used throughout the page
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, display: "block", flexShrink: 0 }}>
    <circle cx="12" cy="12" r="9"/><path d="M16 8l-4 6-3-2"/>
  </svg>
);

const ChevronDown = () => (
  <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

export default function EventLandingPage({ content: c, wizard: w, exportMode = false }: Props) {
  // Claude's assigned URLs take priority; fall back to wizard arrays; safeUrl guards against instruction strings
  const heroVisualUrl = safeUrl(c.heroVisualImageUrl       ?? w.heroImageUrls?.[0]);
  const lifestyle1Url = safeUrl(c.valuePropImageUrl        ?? w.lifestyleImageUrls?.[0]);
  const outcomes1Url  = safeUrl(c.outcomesImageUrl         ?? w.lifestyleImageUrls?.[1]);
  const bioImageUrl   = safeUrl((c as Record<string, unknown>).bioImageUrl as string | undefined ?? w.hostHeadshotUrl);
  // Facilitators: prefer AI/copy-doc content; fall back to the raw wizard list.
  // The primary host has a dedicated bio section, so never show them here too.
  const facilitatorList = ((c.facilitators && c.facilitators.length ? c.facilitators : w.facilitators) ?? [])
    .filter((f) => !isSameName(f.name, w.hostName) && !isSameName(f.name, c.heroHostName));
  const brandName = w.businessName ?? w.hostName ?? "Your Brand";
  // CTA buttons hold a short label. Guard against a sentence/testimonial that a
  // copy-doc import may have misfiled into a CTA field — a button rendering a
  // wall of text is always wrong, so fall back to the default instead.
  const shortCta = (v?: string) =>
    v && v.trim().length > 0 && v.length <= 48 && !/["“”].*[—–-]\s*\w/.test(v) ? v : undefined;
  const ctaText = shortCta(c.ctaText) ?? shortCta(c.heroCtaText) ?? "Register Now";
  // Prefer Claude-generated price copy; fall back to wizard fields.
  // Fix: wizard saves "pay-what-you-want" (not "pay_what_you_can").
  const priceLabel = c.heroPriceLabel ?? (w.eventPricingModel === "pay-what-you-want" ? "Choose your price" : null);
  const priceValue = c.heroPriceValue ?? (
    w.eventPriceMin && w.eventPriceMax ? `$${w.eventPriceMin} — $${w.eventPriceMax}` :
    w.eventPriceFixed ? `$${w.eventPriceFixed}` : null
  );

  const heroHostName = c.heroHostName ?? w.hostName ?? "";
  const heroHostTitle = c.heroHostTitle ?? w.hostTitle ?? "";
  const heroEventDate = c.heroEventDate ?? w.eventDate ?? "";
  const heroEventTime = c.heroEventTime ?? w.eventTime ?? "";
  const heroEventTimezone = c.heroEventTimezone ?? w.eventTimezone ?? "";

  const pressLogos = c.pressLogos ?? w.pressLogos ?? [];
  const asSeenOnEyebrow = c.asSeenOnEyebrow ?? "As featured in";

  // All sessions (from the wizard — dates are user-entered, not AI-authored).
  // The countdown targets the next upcoming session; extras render in overview.
  const sessions = getEventSessions(w);
  const sessionTargets = sessions
    .map((s) => parseEventDate(s.date, s.time, s.timezone))
    .filter((d): d is Date => d != null)
    .sort((a, b) => a.getTime() - b.getTime());
  const primaryTarget = parseEventDate(heroEventDate, heroEventTime, heroEventTimezone);
  const nextUpcoming = sessionTargets.find((d) => d.getTime() > Date.now());
  const eventTarget = nextUpcoming ?? sessionTargets[0] ?? primaryTarget;
  const additionalSessions = sessions.slice(1).filter((s) => s.date || s.time || s.duration);
  const countdown = useCountdown(eventTarget, exportMode);

  const brandPrimary = w.styleGuide?.brandColors?.primary;
  // Per-section theme resolution: manual override > legacy AI field > default.
  const themeFor = (id: string, fallback: SectionThemeT): SectionThemeT => {
    const legacyField = EVENT_LANDING_LEGACY_FIELD[id];
    const legacy = legacyField ? (c as Record<string, unknown>)[legacyField] : undefined;
    return resolveSectionTheme(id, c.sectionThemes, legacy, fallback);
  };
  const heroTheme = themeFor("hero", defaultHeroTheme(brandPrimary));
  const finalVpTheme = themeFor("finalVp", defaultFinalVpTheme(brandPrimary));
  const registerTheme = themeFor("register", defaultRegisterTheme(brandPrimary));
  const editor = useEditorOptional();
  const editMode = useEditMode();
  const showPriceLine = Boolean(priceValue || priceLabel || editor?.isEditMode);

  const ctaLink = (className: string) => (
    <a
      href="/checkout"
      className={className}
      onClick={(e) => {
        if (editor?.isEditMode) e.preventDefault();
      }}
    >
      <EditableText pageKey="eventLanding" path="ctaText" as="span">{ctaText}</EditableText>
    </a>
  );

  // The sticky CTA bar lives at the bottom of the hero and pins to the bottom of
  // the viewport once the hero scrolls past. Reveal is driven here so it works in
  // both the desktop canvas and the mobile-preview iframe (via ownerDocument).
  // In edit mode we keep it visible so it stays clickable for editing. Exported
  // builds get the same scroll behaviour from public/funnel-nav.js.
  const rootRef = useRef<HTMLDivElement>(null);
  const editorIsEditing = Boolean(editor?.isEditMode);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const doc = root.ownerDocument;
    const win = doc.defaultView;
    const bar = doc.getElementById("stickyBar");
    const hero = doc.getElementById("hero");
    if (!win || !bar || !hero) return;

    if (editorIsEditing) {
      bar.classList.add("is-visible");
      return;
    }

    let ticking = false;
    const apply = () => {
      ticking = false;
      // Reveal once the hero's bottom edge has entered the viewport (i.e. the
      // user has scrolled to the bottom of the hero) and keep it pinned after.
      bar.classList.toggle("is-visible", hero.getBoundingClientRect().bottom < win.innerHeight);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      win.requestAnimationFrame(apply);
    };
    apply();
    win.addEventListener("scroll", onScroll, { passive: true });
    win.addEventListener("resize", onScroll);
    return () => {
      win.removeEventListener("scroll", onScroll);
      win.removeEventListener("resize", onScroll);
    };
  }, [editorIsEditing]);

  return (
    <div ref={rootRef}>
      {/* ── 01 Sticky Bar ── */}
      <EditableSection
        pageKey="eventLanding"
        sectionId="stickyBar"
        theme={themeFor("stickyBar", "dark")}
        base="plain"
        bgViaClass
        deletable={false}
        noPositionOverride
        as="div"
        id="stickyBar"
        className="sticky-bar"
        exportMode={exportMode}
      >
        <div className="container">
          <EditableLogo
            pageKey="eventLanding"
            fallbackUrl={w.logoUrl}
            logoLightUrl={w.logoLightUrl}
            logoDarkUrl={w.logoDarkUrl}
            logoTransparent={w.logoTransparent}
            background={themeFor("stickyBar", "dark")}
            name={brandName}
            className="logo"
            imgStyle={{ height: 96, objectFit: "contain" }}
            exportMode={exportMode}
          />
          <div className="event-title">{w.eventName}</div>
          <div className="countdown" aria-label="Time until event">
            {countdown.expired || !eventTarget ? (
              <>
                <span><b>—</b> Days</span>
                <span><b>—</b> Hours</span>
                <span><b>—</b> Mins</span>
                <span><b>—</b> Secs</span>
              </>
            ) : (
              <>
                <span><b>{countdown.days}</b> Days</span>
                <span><b>{countdown.hours}</b> Hours</span>
                <span><b>{countdown.mins}</b> Mins</span>
                <span><b>{countdown.secs}</b> Secs</span>
              </>
            )}
          </div>
          {ctaLink("btn btn-primary btn-sm")}
        </div>
      </EditableSection>

      {/* ── 02 Hero ── */}
      <EditableSection
        pageKey="eventLanding"
        sectionId="hero"
        theme={heroTheme}
        base="hero"
        id="hero"
        deletable={false}
        exportMode={exportMode}
        backgroundPath="heroBackgroundImageUrl"
        backgroundOverlay="hero"
        backgroundFallbackUrl={safeUrl(w.heroImageUrls?.[0])}
        bgDimensionHint="Recommended: at least 2000×1200px (landscape), under 1MB for fast loading."
        controlsTopOffset={150}
      >
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow hero-eyebrow">
                <span className="dot" aria-hidden="true" />
                LIVE ONLINE
              </span>
              <h1 className="display-hero">
                <EditableText pageKey="eventLanding" path="heroHeadline" as="span">
                  {c.heroHeadline ?? w.eventName ?? ""}
                </EditableText>
              </h1>
              <p className="subtitle">
                <EditableText pageKey="eventLanding" path="heroSubheadline" as="span">
                  {c.heroSubheadline ?? w.eventTagline ?? ""}
                </EditableText>
              </p>

              {showPriceLine && (
                <div className="price-line">
                  {(priceLabel || editor?.isEditMode) && (
                    <span className="price-label">
                      <EditableText pageKey="eventLanding" path="heroPriceLabel" as="span">
                        {priceLabel ?? ""}
                      </EditableText>
                    </span>
                  )}
                  {(priceValue || editor?.isEditMode) && (
                    <span className="price-value">
                      <EditableText pageKey="eventLanding" path="heroPriceValue" as="span">
                        {priceValue ?? ""}
                      </EditableText>
                    </span>
                  )}
                </div>
              )}

              <div className="hero-cta-row">
                {ctaLink("btn btn-primary btn-xl")}
                {c.heroMetaLine && (
                  <span
                    className="meta hero-cta-meta"
                    style={heroTheme === "light" ? { color: "var(--text-secondary)" } : undefined}
                  >
                    <EditableText pageKey="eventLanding" path="heroMetaLine" as="span">{c.heroMetaLine}</EditableText>
                  </span>
                )}
              </div>

              <div
                className="hero-host-badge"
                style={heroTheme === "light" ? { color: "var(--text-secondary)" } : undefined}
              >
                <div className="hero-host-name">
                  With{" "}
                  <strong>
                    <EditableText pageKey="eventLanding" path="heroHostName" as="span">
                      {heroHostName}
                    </EditableText>
                  </strong>
                </div>
                {(heroHostTitle || editor?.isEditMode) && (
                  <span className="hero-host-title">
                    <EditableText pageKey="eventLanding" path="heroHostTitle" as="span">
                      {heroHostTitle}
                    </EditableText>
                  </span>
                )}
              </div>

              {(heroEventDate || heroEventTime || editor?.isEditMode) && (
                <div className="hero-meta">
                  {(heroEventDate || editor?.isEditMode) && (
                    <div>
                      <span className="value">
                        <strong>
                          <EditableText pageKey="eventLanding" path="heroEventDate" as="span">
                            {heroEventDate}
                          </EditableText>
                        </strong>
                      </span>
                    </div>
                  )}
                  {(heroEventTime || heroEventTimezone || editor?.isEditMode) && (
                    <div>
                      <span className="value">
                        <strong>
                          <EditableText pageKey="eventLanding" path="heroEventTime" as="span">
                            {heroEventTime}
                          </EditableText>
                        </strong>{" "}
                        <EditableText pageKey="eventLanding" path="heroEventTimezone" as="span">
                          {heroEventTimezone}
                        </EditableText>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <EditableBackgroundImage
              pageKey="eventLanding"
              path="heroVisualImageUrl"
              className="hero-visual"
              ariaHidden={false}
              hasImage={Boolean(heroVisualUrl)}
              style={heroVisualUrl ? { backgroundImage: `url(${heroVisualUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              {!heroVisualUrl && (
                <div className="hv-label">
                  Hero visual
                  <strong>Your hero image will appear here.</strong>
                </div>
              )}
            </EditableBackgroundImage>
          </div>
        </div>
      </EditableSection>

      {/* ── 03 Credibility 1 ── */}
      {(c.credibilityQuote1 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="credibility1" theme={themeFor("credibility1", "light")} className="credibility" exportMode={exportMode}>
          <div className="container">
            <div className="quote-glyph" aria-hidden="true">&ldquo;</div>
            <blockquote>
              <PageText pageKey="eventLanding" path="credibilityQuote1" as="span">
                {c.credibilityQuote1 ?? ""}
              </PageText>
            </blockquote>
            <cite>
              <PageText pageKey="eventLanding" path="credibilityAttribution1" as="span">
                {c.credibilityAttribution1 ?? ""}
              </PageText>
            </cite>
          </div>
        </EditableSection>
      )}

      {/* ── 04 Video ── */}
      <EditableSection pageKey="eventLanding" sectionId="video" theme={themeFor("video", "light")} className="video-section" exportMode={exportMode}>
        <div className="container">
          <div className="section-header">
            <PageText pageKey="eventLanding" path="videoSectionEyebrow" as="span" className="eyebrow">
              {c.videoSectionEyebrow ?? ""}
            </PageText>
            <h2 className="display-section">
              <EditableText pageKey="eventLanding" path="videoSectionHeading" as="span">
                {c.videoSectionHeading ?? "Watch the invitation"}
              </EditableText>
            </h2>
          </div>
          {c.videoUrl || w.eventVideoUrl ? (
            <div className="video-frame" style={{ cursor: "default" }}>
              <iframe
                src={(c.videoUrl ?? w.eventVideoUrl ?? "").replace("watch?v=", "embed/")}
                style={{ width: "100%", height: "100%", border: "none", position: "absolute", inset: 0 }}
                allowFullScreen
              />
            </div>
          ) : (
            <div className="video-frame" role="button" aria-label="Video placeholder">
              <button className="play-button" aria-label="Play">
                <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 28, height: 28, fill: "var(--text-primary)", marginLeft: 4 }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          )}
          {c.videoCaption && (
            <p className="video-caption">
              <EditableText pageKey="eventLanding" path="videoCaption" as="span">{c.videoCaption}</EditableText>
            </p>
          )}
        </div>
      </EditableSection>

      {/* ── 05 As Seen On ── */}
      <EditablePressLogos
        pageKey="eventLanding"
        eyebrow={asSeenOnEyebrow}
        logos={pressLogos}
        exportMode={exportMode}
      />

      {/* ── 06 Audience Callouts ── */}
      {((c.audienceItems ?? []).length > 0 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="audience" theme={themeFor("audience", "light")} className="audience" exportMode={exportMode}>
          <div className="container">
            <div className="section-header">
              <PageText pageKey="eventLanding" path="audienceEyebrow" as="span" className="eyebrow">
                {c.audienceEyebrow ?? ""}
              </PageText>
              <h2 className="display-section">
                <EditableText pageKey="eventLanding" path="audienceHeading" as="span">
                  {c.audienceHeading ?? "This is for you if\u2026"}
                </EditableText>
              </h2>
            </div>
            <div className="audience-list">
              {(c.audienceItems ?? []).map((item, i) => (
                <div
                  key={i}
                  className="audience-item"
                  style={editMode ? { gridTemplateColumns: "auto 1fr auto", alignItems: "start", columnGap: 16 } : undefined}
                >
                  <IconContainer
                    className="audience-icon"
                    aria-hidden="true"
                    pageKey="eventLanding"
                    path={`audienceItemIcons.${i}`}
                    defaultSize={14}
                    containerPadding={6}
                  >
                    <EditableIcon
                      pageKey="eventLanding"
                      path={`audienceItemIcons.${i}`}
                      fallback={<CheckIcon />}
                      defaultSize={14}
                      exportMode={exportMode}
                      siblingPaths={(c.audienceItems ?? []).map((_, j) => `audienceItemIcons.${j}`)}
                    />
                  </IconContainer>
                  <p>
                    <EditableText pageKey="eventLanding" path={`audienceItems[${i}]`} as="span" html>
                      {item.replace(/<[^>]+>/g, "")}
                    </EditableText>
                  </p>
                  {editMode && editor && (
                    <button
                      type="button"
                      contentEditable={false}
                      title="Remove this row"
                      onClick={() => editor.removeListItem("eventLanding", "audienceItems", i)}
                      style={EDIT_PILL_REMOVE}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {editMode && editor && (
                <button
                  type="button"
                  contentEditable={false}
                  onClick={() =>
                    editor.addListItem("eventLanding", "audienceItems", "New point — describe who this is for")
                  }
                  style={EDIT_PILL_ADD}
                >
                  + Add row
                </button>
              )}
            </div>
            <p className="audience-close">
              <PageText pageKey="eventLanding" path="audienceClosingText" as="span">
                {c.audienceClosingText ?? ""}
              </PageText>
            </p>
            <p className="cta-microcopy">
              <PageText pageKey="eventLanding" path="audienceMicrocopy" as="span">
                {c.audienceMicrocopy ?? ""}
              </PageText>
            </p>
            <div className="cta-row">
              {ctaLink("btn btn-primary btn-xl")}
            </div>
          </div>
        </EditableSection>
      )}

      {/* ── 07 Encourage CTA 1 — text band only, no button ── */}
      {(c.encourageText1 || editMode) && (
        <EditableSection
          pageKey="eventLanding"
          sectionId="encourage1"
          theme={themeFor("encourage1", "dark")}
          base="encourage"
          exportMode={exportMode}
          backgroundPath="encourage1BackgroundUrl"
          backgroundOverlay="section"
        >
          <div className="container">
            <p className="line">
              <PageText pageKey="eventLanding" path="encourageText1" as="span">
                {c.encourageText1 ?? ""}
              </PageText>
            </p>
          </div>
        </EditableSection>
      )}

      {/* ── 08 Value Proposition ── */}
      {(c.vpHeading || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="valueProp" theme={themeFor("valueProp", "light")} exportMode={exportMode}>
          <div className="container">
            <div className="value-prop">
              <div className="vp-text">
                <PageText pageKey="eventLanding" path="vpEyebrow" as="span" className="eyebrow">
                  {c.vpEyebrow ?? ""}
                </PageText>
                <h2 className="h2 display-section" style={{ marginTop: "var(--s-4)" }}>
                  <PageText pageKey="eventLanding" path="vpHeading" as="span">
                    {c.vpHeading ?? ""}
                  </PageText>
                </h2>
                {(c.vpParagraphs ?? []).map((p, i) => (
                  <PageText key={i} pageKey="eventLanding" path={`vpParagraphs[${i}]`} as="p" html>
                    {p}
                  </PageText>
                ))}
                <div className="vp-pull">
                  <p className="pull-quote">
                    <PageText pageKey="eventLanding" path="vpPullQuote" as="span">
                      {c.vpPullQuote ?? ""}
                    </PageText>
                  </p>
                </div>
              </div>
              <div className="vp-image">
                <EditableImage
                  pageKey="eventLanding"
                  path="valuePropImageUrl"
                  url={lifestyle1Url}
                  alt=""
                  imgStyle={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "var(--r-xl)" }}
                >
                  <div className="img-placeholder tint-forest">
                    <span className="img-label">Supporting image · 4:5</span>
                  </div>
                </EditableImage>
              </div>
            </div>
          </div>
        </EditableSection>
      )}

      {/* ── 09 Credibility 2 (inline) ── */}
      {(c.credibilityQuote2 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="credibility2" theme={themeFor("credibility2", "light")} className="credibility inline" style={{ paddingTop: 40, paddingBottom: 40, marginBottom: 40 }} exportMode={exportMode}>
          <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
            <div className="quote-glyph" aria-hidden="true">&ldquo;</div>
            <blockquote>
              <em>
                &ldquo;
                <PageText pageKey="eventLanding" path="credibilityQuote2" as="span">
                  {c.credibilityQuote2 ?? ""}
                </PageText>
                &rdquo;
              </em>
            </blockquote>
            <cite>
              <PageText pageKey="eventLanding" path="credibilityAttribution2" as="span">
                {c.credibilityAttribution2 ?? ""}
              </PageText>
            </cite>
          </div>
        </EditableSection>
      )}

      {/* ── 10 Outcomes (Edward style) ── */}
      {((c.outcomesItems ?? []).length > 0 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="outcomes" theme={themeFor("outcomes", "light")} className="outcomes" exportMode={exportMode}>
          <div className="container">
            <div className="section-header">
              <PageText pageKey="eventLanding" path="outcomesEyebrow" as="span" className="eyebrow">
                {c.outcomesEyebrow ?? ""}
              </PageText>
              <h2 className="display-section">
                <PageText pageKey="eventLanding" path="outcomesHeading" as="span">
                  {c.outcomesHeading ?? "What you'll experience"}
                </PageText>
              </h2>
              <p className="body-lg">
                <PageText pageKey="eventLanding" path="outcomesSubheading" as="span">
                  {c.outcomesSubheading ?? ""}
                </PageText>
              </p>
            </div>
            <div className="outcome-grid">
              {(c.outcomesItems ?? []).map((item, i) => (
                <div key={i} className="outcome">
                  <div className="outcome-icon" aria-hidden="true">
                    <CheckIcon />
                  </div>
                  <p>
                    <PageText pageKey="eventLanding" path={`outcomesItems[${i}].title`} as="strong">
                      {item.title}
                    </PageText>
                    {" "}
                    <PageText pageKey="eventLanding" path={`outcomesItems[${i}].body`} as="span">
                      {item.body ?? ""}
                    </PageText>
                  </p>
                </div>
              ))}
            </div>
            <div className="outcomes-image">
              <EditableImage
                pageKey="eventLanding"
                path="outcomesImageUrl"
                url={outcomes1Url}
                alt=""
                imgStyle={{ width: "100%", aspectRatio: "21/9", objectFit: "cover", borderRadius: "var(--r-xl)" }}
              >
                <div className="img-placeholder tint-stone"><span className="img-label">Supporting image · 21:9</span></div>
              </EditableImage>
            </div>
            <p className="outcomes-close">
              <PageText pageKey="eventLanding" path="outcomesClosingText" as="span">
                {c.outcomesClosingText ?? ""}
              </PageText>
            </p>
            <p className="outcomes-microcopy">
              <PageText pageKey="eventLanding" path="outcomesMicrocopy" as="span">
                {c.outcomesMicrocopy ?? ""}
              </PageText>
            </p>
            <div className="outcomes-cta">
              {ctaLink("btn btn-primary btn-xl")}
            </div>
          </div>
        </EditableSection>
      )}

      {/* ── 11 Personal Message ── */}
      {((c.personalMessageParagraphs ?? []).length > 0 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="personalMessage" theme={themeFor("personalMessage", "light")} className="personal-message" exportMode={exportMode}>
          <div className="container">
            <h2 className="h2">
              <PageText pageKey="eventLanding" path="personalMessageHeading" as="span">
                {c.personalMessageHeading ?? `A note from ${w.hostName}`}
              </PageText>
            </h2>
            <div className="reading">
              <blockquote>
                {(c.personalMessageParagraphs ?? []).map((p, i) => (
                  <PageText key={i} pageKey="eventLanding" path={`personalMessageParagraphs[${i}]`} as="p" html>
                    {p}
                  </PageText>
                ))}
              </blockquote>
              <p className="signature">
                <PageText pageKey="eventLanding" path="personalMessageSignature" as="span">
                  {c.personalMessageSignature ?? ""}
                </PageText>
              </p>
            </div>
          </div>
        </EditableSection>
      )}

      {/* ── Testimonials ── */}
      {(() => {
        const testimonialItems: TestimonialItem[] =
          c.testimonialItems ??
          (w.testimonials ?? []).map((t) => ({
            quote: t.quote,
            name: t.name,
            location: t.location,
            context: t.context,
          }));
        if (testimonialItems.length === 0 && !editMode) return null;
        return (
          <TestimonialCarousel
            items={testimonialItems}
            eyebrow={c.testimonialsEyebrow}
            heading={c.testimonialsHeading ?? "What people say"}
            theme={themeFor("testimonials", "light")}
            exportMode={exportMode}
          />
        );
      })()}

      {/* ── 07b Encourage CTA 2 ── */}
      {(c.encourageText2 || editMode) && (
        <EditableSection
          pageKey="eventLanding"
          sectionId="encourage2"
          theme={themeFor("encourage2", "accent")}
          base="encourage"
          exportMode={exportMode}
          backgroundPath="encourage2BackgroundUrl"
          backgroundOverlay="section"
        >
          <div className="container">
            <p className="line">
              <PageText pageKey="eventLanding" path="encourageText2" as="span">
                {c.encourageText2 ?? ""}
              </PageText>
            </p>
            {ctaLink("btn btn-primary btn-xl")}
          </div>
        </EditableSection>
      )}

      {/* ── 13 How It Works ── */}
      {((c.howItWorksParagraphs ?? []).length > 0 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="howItWorks" theme={themeFor("howItWorks", "light")} className="how-it-works" exportMode={exportMode}>
          <div className="container">
            <h2 className="h2 display-section">
              <PageText pageKey="eventLanding" path="howItWorksHeading" as="span">
                {c.howItWorksHeading ?? "How the session unfolds"}
              </PageText>
            </h2>
            <div className="reading">
              {(c.howItWorksParagraphs ?? []).map((p, i) => (
                <PageText key={i} pageKey="eventLanding" path={`howItWorksParagraphs[${i}]`} as="p" html>
                  {p}
                </PageText>
              ))}
            </div>
            <p className="closing">
              <PageText pageKey="eventLanding" path="howItWorksClosing" as="span">
                {c.howItWorksClosing ?? ""}
              </PageText>
            </p>
          </div>
        </EditableSection>
      )}

      {/* ── 14 Event Overview ── */}
      <EditableSection pageKey="eventLanding" sectionId="eventOverview" theme={themeFor("eventOverview", "light")} className="event-overview" exportMode={exportMode}>
        <div className="container">
          <div className="overview-top">
            <h2 className="h2 display-section">
              <PageText pageKey="eventLanding" path="eventOverviewHeading" as="span">
                {c.eventOverviewHeading ?? "Event overview"}
              </PageText>
            </h2>
            <div className="overview-meta">
              <div className="overview-row">
                <span className="label">Status</span>
                <span className="value">
                  <span className="live-tag"><span className="dot" aria-hidden="true" />Live online</span>
                </span>
              </div>
              {(heroEventDate || editor?.isEditMode) && (
                <div className="overview-row">
                  <span className="label">Date</span>
                  <span className="value">
                    <EditableText pageKey="eventLanding" path="heroEventDate" as="span">
                      {heroEventDate}
                    </EditableText>
                  </span>
                </div>
              )}
              {(heroEventTime || heroEventTimezone || editor?.isEditMode) && (
                <div className="overview-row">
                  <span className="label">Time</span>
                  <span className="value">
                    <EditableText pageKey="eventLanding" path="heroEventTime" as="span">
                      {heroEventTime}
                    </EditableText>
                    {(heroEventTimezone || editor?.isEditMode) && (
                      <> <EditableText pageKey="eventLanding" path="heroEventTimezone" as="span">{heroEventTimezone}</EditableText></>
                    )}
                  </span>
                </div>
              )}
              {(sessions[0]?.duration || w.eventDuration) && (
                <div className="overview-row">
                  <span className="label">Duration</span>
                  <span className="value">{sessions[0]?.duration || w.eventDuration}</span>
                </div>
              )}
              {additionalSessions.map((s, i) => (
                <div className="overview-row" key={i}>
                  <span className="label">{i === 0 ? "Also on" : ""}</span>
                  <span className="value">{formatSession(s)}</span>
                </div>
              ))}
              <p className="recording-note">
                <em>
                  <PageText pageKey="eventLanding" path="recordingNote" as="span">
                    {c.recordingNote ?? ""}
                  </PageText>
                </em>
              </p>
            </div>
          </div>

          <div className="overview-bottom">
            {((c.experienceItems ?? []).length > 0 || editMode) && (
              <div>
                <h3>
                  <PageText pageKey="eventLanding" path="experienceHeading" as="span">
                    {c.experienceHeading ?? "What you'll experience"}
                  </PageText>
                </h3>
                <div className="experience-list">
                  {(c.experienceItems ?? []).map((item, i) => (
                    <div key={i} className="experience-item">
                      <IconContainer
                        className="experience-icon"
                        aria-hidden="true"
                        pageKey="eventLanding"
                        path={`experienceItemIcons.${i}`}
                        defaultSize={18}
                        containerPadding={6}
                      >
                        <EditableIcon
                          pageKey="eventLanding"
                          path={`experienceItemIcons.${i}`}
                          fallback={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                              <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                            </svg>
                          }
                          defaultSize={18}
                          exportMode={exportMode}
                          siblingPaths={(c.experienceItems ?? []).map((_, j) => `experienceItemIcons.${j}`)}
                        />
                      </IconContainer>
                      <p>
                        <PageText pageKey="eventLanding" path={`experienceItems[${i}].title`} as="strong">
                          {item.title}
                        </PageText>
                        {" "}
                        <PageText pageKey="eventLanding" path={`experienceItems[${i}].body`} as="span">
                          {item.body ?? ""}
                        </PageText>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </EditableSection>

      {/* ── 14b Challenges (own section, editable heading) ── */}
      {((c.challengeItems ?? []).length > 0 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="challenges" theme={themeFor("challenges", "light")} exportMode={exportMode}>
          <div className="container">
            <h3 className="display-sub">
              <PageText pageKey="eventLanding" path="challengeHeading" as="span">
                {c.challengeHeading ?? "This session is built to address things like"}
              </PageText>
            </h3>
            <ul className="challenges-list">
              {(c.challengeItems ?? []).map((item, i) => (
                <li key={i}>
                  <PageText pageKey="eventLanding" path={`challengeItems[${i}]`} as="span">
                    {item}
                  </PageText>
                </li>
              ))}
            </ul>
          </div>
        </EditableSection>
      )}

      {/* ── Credibility 3 (post-overview) ── */}
      {(c.credibilityQuote3 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="credibility3" theme={themeFor("credibility3", "light")} className="credibility inline" style={{ paddingTop: 40, paddingBottom: 40, marginBottom: 40 }} exportMode={exportMode}>
          <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
            <div className="quote-glyph" aria-hidden="true">&ldquo;</div>
            <blockquote>
              <em>
                &ldquo;
                <PageText pageKey="eventLanding" path="credibilityQuote3" as="span">
                  {c.credibilityQuote3 ?? ""}
                </PageText>
                &rdquo;
              </em>
            </blockquote>
            <cite>
              <PageText pageKey="eventLanding" path="credibilityAttribution3" as="span">
                {c.credibilityAttribution3 ?? ""}
              </PageText>
            </cite>
          </div>
        </EditableSection>
      )}

      {/* ── 15 Extra VP ── */}
      {(c.extraVpHeading || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="extraVp" theme={themeFor("extraVp", "accent")} className="extra-vp" exportMode={exportMode}>
          <div className="container">
            <h2 className="h2 display-section">
              <PageText pageKey="eventLanding" path="extraVpHeading" as="span">
                {c.extraVpHeading ?? ""}
              </PageText>
            </h2>
            <div className="reading">
              {(c.extraVpParagraphs ?? []).map((p, i) => (
                <PageText key={i} pageKey="eventLanding" path={`extraVpParagraphs[${i}]`} as="p" html>
                  {p}
                </PageText>
              ))}
            </div>
            <p className="closing">
              <PageText pageKey="eventLanding" path="extraVpClosing" as="span">
                {c.extraVpClosing ?? ""}
              </PageText>
            </p>
          </div>
        </EditableSection>
      )}

      {/* ── 07c Encourage CTA 3 ── */}
      {(c.encourageText3 || editMode) && (
        <EditableSection
          pageKey="eventLanding"
          sectionId="encourage3"
          theme={themeFor("encourage3", "light")}
          base="encourage"
          exportMode={exportMode}
          backgroundPath="encourage3BackgroundUrl"
          backgroundOverlay="section"
        >
          <div className="container">
            <p className="line">
              <PageText pageKey="eventLanding" path="encourageText3" as="span">
                {c.encourageText3 ?? ""}
              </PageText>
            </p>
            {ctaLink("btn btn-primary btn-xl")}
          </div>
        </EditableSection>
      )}

      {/* ── 16 Outcomes 2 (icon grid) ── */}
      {((c.outcomes2Items ?? []).length > 0 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="outcomes2" theme={themeFor("outcomes2", "light")} className="outcomes-grid" exportMode={exportMode}>
          <div className="container">
            <div className="section-header">
              <PageText pageKey="eventLanding" path="outcomes2Eyebrow" as="span" className="eyebrow">
                {c.outcomes2Eyebrow ?? ""}
              </PageText>
              <h2 className="display-section">
                <PageText pageKey="eventLanding" path="outcomes2Heading" as="span">
                  {c.outcomes2Heading ?? "What you take home"}
                </PageText>
              </h2>
            </div>
            <div className="outcomes-grid-list">
              {(c.outcomes2Items ?? []).map((item, i) => (
                <div key={i} className="outcomes-grid-item">
                  <svg className="big-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/><path d="M16 8l-4 6-3-2"/>
                  </svg>
                  <div className="outcomes-grid-text">
                    <h3>
                      <PageText pageKey="eventLanding" path={`outcomes2Items[${i}].title`} as="span">
                        {item.title}
                      </PageText>
                    </h3>
                    <p>
                      <PageText pageKey="eventLanding" path={`outcomes2Items[${i}].body`} as="span">
                        {item.body ?? ""}
                      </PageText>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </EditableSection>
      )}

      {/* ── 17 Bio ── */}
      {((c.bioParagraphs ?? []).length > 0 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="bio" theme={themeFor("bio", "light")} exportMode={exportMode}>
          <div className="container">
            <div className="bio">
              <div className="bio-image">
                <EditableImage
                  pageKey="eventLanding"
                  path="bioImageUrl"
                  url={bioImageUrl}
                  alt={w.hostName ?? "Host portrait"}
                  imgStyle={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: "var(--r-xl)" }}
                >
                  <div className="img-placeholder tint-bronze">
                    <span className="img-label">Host portrait · 3:4</span>
                  </div>
                </EditableImage>
              </div>
              <div className="bio-text">
                <PageText pageKey="eventLanding" path="bioEyebrow" as="span" className="eyebrow">
                  {c.bioEyebrow ?? ""}
                </PageText>
                <h2 className="h2 display-section" style={{ marginTop: "var(--s-4)" }}>
                  <PageText pageKey="eventLanding" path="bioHeading" as="span">
                    {c.bioHeading ?? `About ${w.hostName}`}
                  </PageText>
                </h2>
                {(c.bioParagraphs ?? []).map((p, i) => (
                  <PageText key={i} pageKey="eventLanding" path={`bioParagraphs[${i}]`} as="p" html>
                    {p}
                  </PageText>
                ))}
                <p className="signature">
                  <PageText pageKey="eventLanding" path="bioSignature" as="span">
                    {c.bioSignature ?? ""}
                  </PageText>
                </p>
              </div>
            </div>
          </div>
        </EditableSection>
      )}

      {/* ── 17b Facilitators ── */}
      {(facilitatorList.length > 0 || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="facilitators" theme={themeFor("facilitators", "light")} exportMode={exportMode}>
          <div className="container">
            <h2 className="h2 display-section" style={{ textAlign: "center", marginBottom: "var(--s-7)" }}>
              <PageText pageKey="eventLanding" path="facilitatorsHeading" as="span">
                {c.facilitatorsHeading ?? "Your facilitators"}
              </PageText>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--s-6)", maxWidth: 960, margin: "0 auto" }}>
              {facilitatorList.map((f, i) => {
                const photo = safeUrl(f.headshotUrl ?? w.facilitators?.[i]?.headshotUrl);
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "var(--s-3)" }}>
                    <EditableImage
                      pageKey="eventLanding"
                      path={`facilitators[${i}].headshotUrl`}
                      url={photo}
                      alt={f.name ?? "Facilitator"}
                      imgStyle={{ width: 140, height: 140, objectFit: "cover", borderRadius: "50%" }}
                    >
                      <div className="img-placeholder tint-bronze" style={{ width: 140, height: 140, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="img-label">Photo</span>
                      </div>
                    </EditableImage>
                    <div>
                      <div className="h3" style={{ fontFamily: "var(--font-display)", margin: 0 }}>
                        <PageText pageKey="eventLanding" path={`facilitators[${i}].name`} as="span">{f.name ?? ""}</PageText>
                      </div>
                      {(f.title || editMode) && (
                        <span className="eyebrow" style={{ display: "block", marginTop: "var(--s-1)" }}>
                          <PageText pageKey="eventLanding" path={`facilitators[${i}].title`} as="span">{f.title ?? ""}</PageText>
                        </span>
                      )}
                    </div>
                    {(f.bio || editMode) && (
                      <PageText pageKey="eventLanding" path={`facilitators[${i}].bio`} as="p" html>{f.bio ?? ""}</PageText>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </EditableSection>
      )}

      {/* ── 18 Final VP ── */}
      {(c.finalVpHeading || editMode) && (
        <EditableSection pageKey="eventLanding" sectionId="finalVp" theme={finalVpTheme} base="final-vp" exportMode={exportMode}>
          <div className="container">
            <h2>
              <PageText pageKey="eventLanding" path="finalVpHeading" as="span">
                {c.finalVpHeading ?? ""}
              </PageText>
            </h2>
            <div className="reading">
              <PageText pageKey="eventLanding" path="finalVpIntro" as="p" html>
                {c.finalVpIntro ?? ""}
              </PageText>
              {((c.finalVpFromTo ?? []).length > 0 || editMode) && (
                <ul className="from-to">
                  {(c.finalVpFromTo ?? []).map((ft, i) => (
                    <li key={i}>
                      From{" "}
                      <em>
                        &ldquo;
                        <PageText pageKey="eventLanding" path={`finalVpFromTo[${i}].from`} as="span">
                          {ft.from}
                        </PageText>
                        &rdquo;
                      </em>{" "}
                      to{" "}
                      <em>
                        &ldquo;
                        <PageText pageKey="eventLanding" path={`finalVpFromTo[${i}].to`} as="span">
                          {ft.to}
                        </PageText>
                        &rdquo;
                      </em>
                    </li>
                  ))}
                </ul>
              )}
              <PageText pageKey="eventLanding" path="finalVpClosing" as="p" html>
                {c.finalVpClosing ?? ""}
              </PageText>
            </div>
            <div className="cta-block">
              <p className="cta-microcopy">
                <PageText pageKey="eventLanding" path="finalVpCtaMicrocopy" as="span">
                  {c.finalVpCtaMicrocopy ?? ""}
                </PageText>
              </p>
              {ctaLink("btn btn-primary btn-xl")}
            </div>
          </div>
        </EditableSection>
      )}

      {/* ── 19 FAQ ── */}
      {(c.faqItems ?? []).length > 0 && (
        <EditableSection pageKey="eventLanding" sectionId="faq" theme={themeFor("faq", "light")} className="faq" exportMode={exportMode}>
          <div className="container">
            <div className="section-header">
              <PageText pageKey="eventLanding" path="faqEyebrow" as="span" className="eyebrow">
                {c.faqEyebrow ?? ""}
              </PageText>
              <h2 className="display-section">Frequently Asked Questions</h2>
            </div>
            <div className="faq-list">
              {(c.faqItems ?? []).map((faq, i) => (
                <div key={i} className={`faq-item${i === 0 ? " is-open" : ""}`}>
                  <button className="faq-question" aria-expanded={i === 0 ? "true" : "false"}>
                    <span>
                      <EditableText pageKey="eventLanding" path={`faqItems[${i}].question`} as="span">
                        {faq.question}
                      </EditableText>
                    </span>
                    <ChevronDown />
                  </button>
                  <div className="faq-answer">
                    <div className="faq-answer-inner">
                      <EditableText pageKey="eventLanding" path={`faqItems[${i}].answer`} as="span">
                        {faq.answer}
                      </EditableText>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </EditableSection>
      )}

      {/* ── Final CTA (dark) ── */}
      <EditableSection pageKey="eventLanding" sectionId="register" theme={registerTheme} base="encourage" id="register" deletable={false} exportMode={exportMode}>
        <div className="container">
          <p className="line">
            <EditableText pageKey="eventLanding" path="finalCtaLine" as="span">
              {c.finalCtaLine ?? w.eventName ?? ""}
            </EditableText>
          </p>
          <a href="/checkout" className="btn btn-primary btn-xl">
            <EditableText pageKey="eventLanding" path="finalCtaText" as="span">
              {shortCta(c.finalCtaText) ?? ctaText}
            </EditableText>
          </a>
        </div>
      </EditableSection>

      {/* ── 20 FTC ── */}
      {c.ftcDisclaimer && (
        <EditableSection pageKey="eventLanding" sectionId="ftc" theme={themeFor("ftc", "light")} className="ftc" exportMode={exportMode}>
          <div className="container">
            <h2>FTC Disclaimer</h2>
            <div className="reading">
              <p>
                <EditableText pageKey="eventLanding" path="ftcDisclaimer" as="span">{c.ftcDisclaimer}</EditableText>
              </p>
            </div>
          </div>
        </EditableSection>
      )}

      {/* ── 21 Footer ── */}
      <footer className="ty-footer">
        <div className="inner">
          <div className="ty-footer-left">
            <EditableLogo
              pageKey="eventLanding"
              fallbackUrl={w.logoUrl}
              logoLightUrl={w.logoLightUrl}
              logoDarkUrl={w.logoDarkUrl}
              logoTransparent={w.logoTransparent}
              background="dark"
              name={brandName}
              className="ty-footer-brand"
              imgStyle={{ maxHeight: "168px", maxWidth: "540px", width: "100%", objectFit: "contain", display: "block" }}
              exportMode={exportMode}
            />
            <span className="ty-footer-copy">&copy; {new Date().getFullYear()} {brandName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--s-5)", flexWrap: "wrap" }}>
            <nav className="ty-footer-links">
              <a href={w.privacyPolicyUrl ?? "#"}>Privacy</a>
              <a href={w.termsOfUseUrl ?? "#"}>Terms of Use</a>
            </nav>
            {ctaLink("btn btn-primary")}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Testimonial carousel — always 3 visible, circular navigation ───────────
function testimonialHeading(t: TestimonialItem): string {
  if (t.heading && t.heading.trim()) return t.heading;
  return t.quote.length > 60 ? t.quote.slice(0, 60) + "…" : t.quote;
}

function TestimonialCarousel({
  items, eyebrow, heading, theme, exportMode,
}: {
  items: TestimonialItem[];
  eyebrow?: string;
  heading: string;
  theme: SectionThemeT;
  exportMode?: boolean;
}) {
  const editor = useEditorOptional();
  const editMode = !exportMode && Boolean(editor?.isEditMode);
  const n = items.length;
  const [start, setStart] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function navigate(dir: 1 | -1) {
    setStart(s => (s + dir + n) % n);
    setAnimKey(k => k + 1);
  }

  // Whole-array writes seed `testimonialItems` from the wizard fallback on first
  // edit (the page passes the merged list as `items`), avoiding sparse arrays.
  function writeItems(next: TestimonialItem[]) {
    editor?.updateField("eventLanding", "testimonialItems", next);
  }
  function updateItem(i: number, patch: Partial<TestimonialItem>) {
    writeItems(items.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function removeItem(i: number) {
    writeItems(items.filter((_, idx) => idx !== i));
  }
  function addItem() {
    const next = [...items, { quote: "", name: "" }];
    writeItems(next);
    setEditingIndex(next.length - 1);
  }

  // Always pick exactly 3 cards, wrapping circularly so no slide is ever short
  const visible = n <= 3
    ? items
    : [0, 1, 2].map(offset => items[(start + offset) % n]);

  const showControls = n > 3;

  return (
    <EditableSection pageKey="eventLanding" sectionId="testimonials" theme={theme} className="testimonials" exportMode={exportMode}>
      <div className="container">
        <div className="section-header">
          <PageText pageKey="eventLanding" path="testimonialsEyebrow" as="span" className="eyebrow">
            {eyebrow ?? ""}
          </PageText>
          <h2 className="display-section">
            <PageText pageKey="eventLanding" path="testimonialsHeading" as="span">
              {heading}
            </PageText>
          </h2>
        </div>

        {editMode ? (
          <div contentEditable={false}>
            {items.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-tertiary)", fontSize: 14, marginBottom: 16 }}>
                No testimonials yet — add your first one below.
              </p>
            ) : (
              <div
                className="testimonial-track"
                style={{ animation: "none", marginBottom: 20 }}
              >
                {items.map((t, i) => (
                  <TestimonialCardHoverable
                    key={i}
                    item={t}
                    onEdit={() => setEditingIndex(i)}
                  />
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={addItem}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  borderRadius: 999,
                  border: "1.5px dashed var(--border-subtle)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.03em",
                }}
              >
                + Add testimonial
              </button>
            </div>
            {editingIndex !== null && editingIndex < items.length && (
              <TestimonialEditDialog
                index={editingIndex}
                item={items[editingIndex]}
                onChange={(patch) => updateItem(editingIndex, patch)}
                onRemove={() => { removeItem(editingIndex); setEditingIndex(null); }}
                onClose={() => setEditingIndex(null)}
                onAddNew={addItem}
              />
            )}
          </div>
        ) : (
          <>
            {/* key change triggers the fade-in animation on each navigation */}
            <div key={animKey} className="testimonial-track">
              {visible.map((t, i) => (
                <article key={i} className="testimonial-card">
                  <h3 className="h3">&ldquo;{testimonialHeading(t)}&rdquo;</h3>
                  <p className="quote">{t.quote}</p>
                  <div className="attrib">
                    <span className="name">{t.name}</span>
                    {(t.location || t.context) && (
                      <span className="loc">{[t.location, t.context].filter(Boolean).join(" · ")}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {showControls && (
              <div className="carousel-controls">
                <button onClick={() => navigate(-1)} aria-label="Previous testimonials">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>

                <div className="carousel-dots" role="tablist">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === start}
                      aria-label={`Testimonial ${i + 1}`}
                      className={`dot${i === start ? " active" : ""}`}
                      onClick={() => { setStart(i); setAnimKey(k => k + 1); }}
                    />
                  ))}
                </div>

                <button onClick={() => navigate(1)} aria-label="Next testimonials">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </EditableSection>
  );
}

/** A testimonial card shown in edit mode — identical to the published card but
 *  with a hover overlay that reveals the Edit button. */
function TestimonialCardHoverable({
  item, onEdit,
}: {
  item: TestimonialItem;
  onEdit: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      className="testimonial-card"
      style={{ position: "relative", cursor: "default" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h3 className="h3">&ldquo;{testimonialHeading(item)}&rdquo;</h3>
      <p className="quote">{item.quote || <em style={{ opacity: 0.4 }}>No quote yet</em>}</p>
      <div className="attrib">
        <span className="name">{item.name || <em style={{ opacity: 0.4 }}>No name</em>}</span>
        {(item.location || item.context) && (
          <span className="loc">{[item.location, item.context].filter(Boolean).join(" · ")}</span>
        )}
      </div>
      {hovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}
        >
          <button
            type="button"
            onClick={onEdit}
            style={{
              padding: "9px 22px",
              borderRadius: 999,
              background: "#fff",
              color: "#111",
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Edit
          </button>
        </div>
      )}
    </article>
  );
}

/** Portal-based dialog for editing a single testimonial card. */
function TestimonialEditDialog({
  index, item, onChange, onRemove, onClose, onAddNew,
}: {
  index: number;
  item: TestimonialItem;
  onChange: (patch: Partial<TestimonialItem>) => void;
  onRemove: () => void;
  onClose: () => void;
  onAddNew: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const surface = useEditSurface();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    surface.doc.addEventListener("keydown", onKey);
    return () => surface.doc.removeEventListener("keydown", onKey);
  }, [onClose, surface]);

  if (typeof document === "undefined") return null;

  const field: CSSProperties = {
    width: "100%",
    padding: "9px 11px",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
    color: "#e8e4dd",
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  };
  const label: CSSProperties = {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "rgba(232,228,221,0.5)",
    marginBottom: 5,
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 9998,
          backdropFilter: "blur(3px)",
        }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={ref}
        contentEditable={false}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "min(520px, 92vw)",
          background: "#1c1c1a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "22px 24px",
          display: "grid",
          gap: 14,
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#D4A878" }}>
            Testimonial {index + 1}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(232,228,221,0.5)", fontSize: 20, lineHeight: 1, cursor: "pointer", padding: "0 2px" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Fields */}
        <div>
          <span style={label}>Headline (optional)</span>
          <input
            style={field}
            value={item.heading ?? ""}
            placeholder="Short pull-quote shown above the testimonial"
            onChange={(e) => onChange({ heading: e.target.value })}
          />
        </div>
        <div>
          <span style={label}>Quote</span>
          <textarea
            style={{ ...field, minHeight: 90, resize: "vertical" }}
            value={item.quote}
            placeholder="The full testimonial text"
            onChange={(e) => onChange({ quote: e.target.value })}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <span style={label}>Name</span>
            <input
              style={field}
              value={item.name}
              placeholder="e.g. Sarah M."
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div>
            <span style={label}>Location</span>
            <input
              style={field}
              value={item.location ?? ""}
              placeholder="e.g. London"
              onChange={(e) => onChange({ location: e.target.value })}
            />
          </div>
        </div>
        <div>
          <span style={label}>Context (optional)</span>
          <input
            style={field}
            value={item.context ?? ""}
            placeholder="e.g. Cohort 3 graduate"
            onChange={(e) => onChange({ context: e.target.value })}
          />
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 2 }}>
          <button
            type="button"
            onClick={onRemove}
            style={{ background: "none", border: "none", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}
          >
            Remove testimonial
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onAddNew}
              style={{ background: "none", border: "1px solid rgba(212,168,120,0.4)", color: "#D4A878", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "7px 16px" }}
            >
              + Add another
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: "#D4A878", border: "none", color: "#141412", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "7px 16px" }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>,
    surface.doc.body,
  );
}
