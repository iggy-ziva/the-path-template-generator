/** Key stored alongside generated page content — frozen wizard state at generation time. */
export const WIZARD_SNAPSHOT_KEY = "_wizardSnapshot";

export function withWizardSnapshot(
  pageContent: Record<string, unknown>,
  wizard: Record<string, unknown>,
): Record<string, unknown> {
  return { [WIZARD_SNAPSHOT_KEY]: wizard, ...pageContent };
}

export function splitFunnelContent(raw: Record<string, unknown> | null | undefined): {
  pageContent: Record<string, unknown>;
  wizardSnapshot?: Record<string, unknown>;
} {
  if (!raw || typeof raw !== "object") {
    return { pageContent: {} };
  }
  const { [WIZARD_SNAPSHOT_KEY]: snapshot, ...pageContent } = raw;
  return {
    pageContent,
    wizardSnapshot:
      snapshot && typeof snapshot === "object"
        ? (snapshot as Record<string, unknown>)
        : undefined,
  };
}
