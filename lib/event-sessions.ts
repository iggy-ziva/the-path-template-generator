import type { EventSession, WizardData } from "@/lib/wizard-types";

/**
 * The canonical list of event sessions. Falls back to the legacy flat
 * eventDate/eventTime/… fields when no sessions array is present, so older
 * funnels and single-date events keep working.
 */
export function getEventSessions(
  w: Pick<WizardData, "eventSessions" | "eventDate" | "eventTime" | "eventTimezone" | "eventDuration">,
): EventSession[] {
  const sessions = (w.eventSessions ?? []).filter(
    (s) => s.date || s.time || s.timezone || s.duration,
  );
  if (sessions.length) return sessions;
  if (w.eventDate || w.eventTime || w.eventTimezone || w.eventDuration) {
    return [{ date: w.eventDate, time: w.eventTime, timezone: w.eventTimezone, duration: w.eventDuration }];
  }
  return [];
}

/**
 * Given the edited sessions, produce the patch to persist — the sessions array
 * plus the first session mirrored onto the legacy flat fields that the rest of
 * the app (AI prompt, checkout, thank-you, countdown) still reads.
 */
export function sessionsPatch(sessions: EventSession[]): Partial<WizardData> {
  const first = sessions[0] ?? {};
  return {
    eventSessions: sessions,
    eventDate: first.date ?? "",
    eventTime: first.time ?? "",
    eventTimezone: first.timezone ?? "",
    eventDuration: first.duration ?? "",
  };
}

/** Human-readable one-liner for a session, e.g. "Fri 19 June · 9:00 AM ET · 3 hours". */
export function formatSession(s: EventSession): string {
  return [s.date, s.time, s.timezone].filter(Boolean).join(" · ") +
    (s.duration ? ` · ${s.duration}` : "");
}
