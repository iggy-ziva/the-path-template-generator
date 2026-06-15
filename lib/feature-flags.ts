// ─────────────────────────────────────────────────────────────────────────────
// Lightweight, env-driven feature flags.
//
// The copy-document page/layout engine is GA: enabled by default. A kill switch
// remains for operational safety — set COPY_DOC_ENGINE (server) and/or
// NEXT_PUBLIC_COPY_DOC_ENGINE (client) to one of "off", "false", "0", "no" to
// disable. IMPORTANT: the copy_documents table + columns migration
// (supabase/migrations/20260615_copy_doc_engine.sql) must be applied before the
// feature is used in an environment.
// ─────────────────────────────────────────────────────────────────────────────

function isDisabled(value: string | undefined): boolean {
  if (!value) return false;
  return ["0", "false", "off", "no"].includes(value.trim().toLowerCase());
}

/** Server-side: is the copy-document page/layout engine enabled? (default: on) */
export function isCopyDocEngineEnabled(): boolean {
  return !isDisabled(process.env.COPY_DOC_ENGINE) && !isDisabled(process.env.NEXT_PUBLIC_COPY_DOC_ENGINE);
}

/**
 * Client-safe accessor. Next.js inlines `NEXT_PUBLIC_*` at build time, so this
 * must reference the literal env key (no dynamic indexing) to be replaced.
 * Default: on; set NEXT_PUBLIC_COPY_DOC_ENGINE to a falsy value to disable.
 */
export function isCopyDocEngineEnabledClient(): boolean {
  return !isDisabled(process.env.NEXT_PUBLIC_COPY_DOC_ENGINE);
}
