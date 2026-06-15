// ─────────────────────────────────────────────────────────────────────────────
// Validate — turns a CopyDoc + page spec into a machine-readable coverage
// report: which sections/fields were detected, what's required-but-missing, and
// cardinality warnings (e.g. 5 outcomes where 6 are expected). Never blocks on
// optional gaps; surfaces them so the user can fix the document.
// ─────────────────────────────────────────────────────────────────────────────

import type { CopyDoc, CopyPageSpec, CopyValue } from "./copydoc-schema";

export interface FieldReport {
  label: string;
  key: string;
  required: boolean;
  present: boolean;
  /** Cardinality / shape issues (non-fatal warnings). */
  issues: string[];
}

export interface SectionReport {
  id: string;
  heading: string;
  required: boolean;
  present: boolean;
  fields: FieldReport[];
}

export interface CoverageReport {
  page: string;
  ok: boolean;
  sections: SectionReport[];
  /** Flat list of "Section › Field" required items that are missing. */
  requiredMissing: string[];
  /** All non-fatal warnings (cardinality, unrecognised blocks). */
  warnings: string[];
  counts: { sectionsDetected: number; sectionsTotal: number; fieldsDetected: number; fieldsTotal: number };
}

function valueCount(value: CopyValue | undefined): number {
  if (value === undefined) return 0;
  if (Array.isArray(value)) return value.length;
  return value.trim() ? 1 : 0;
}

function isPresent(value: CopyValue | undefined): boolean {
  return valueCount(value) > 0;
}

export function buildCoverageReport(doc: CopyDoc, spec: CopyPageSpec): CoverageReport {
  const byId = new Map(doc.sections.map((s) => [s.id, s]));
  const sections: SectionReport[] = [];
  const requiredMissing: string[] = [];
  const warnings: string[] = [...doc.warnings];

  let sectionsDetected = 0;
  let fieldsDetected = 0;
  let fieldsTotal = 0;

  for (const sec of spec.sections) {
    const got = byId.get(sec.id);
    const present = !!got;
    if (present) sectionsDetected += 1;

    const fields: FieldReport[] = [];
    for (const field of sec.fields) {
      fieldsTotal += 1;
      const value = got?.fields[field.key];
      const fieldPresent = isPresent(value);
      if (fieldPresent) fieldsDetected += 1;

      const issues: string[] = [];
      const count = valueCount(value);
      if (fieldPresent && field.count !== undefined && count !== field.count) {
        issues.push(`expected ${field.count} item(s), found ${count}`);
      }
      if (fieldPresent && field.minCount !== undefined && count < field.minCount) {
        issues.push(`expected at least ${field.minCount} item(s), found ${count}`);
      }
      if (fieldPresent && field.maxCount !== undefined && count > field.maxCount) {
        issues.push(`expected at most ${field.maxCount} item(s), found ${count}`);
      }

      if (field.required && !fieldPresent) {
        requiredMissing.push(`${sec.heading} › ${field.label}`);
      }
      for (const iss of issues) {
        warnings.push(`${sec.heading} › ${field.label}: ${iss}`);
      }

      fields.push({ label: field.label, key: field.key, required: !!field.required, present: fieldPresent, issues });
    }

    if (sec.required && !present) {
      requiredMissing.push(`${sec.heading} (entire section)`);
    }

    sections.push({ id: sec.id, heading: sec.heading, required: !!sec.required, present, fields });
  }

  return {
    page: spec.page,
    ok: requiredMissing.length === 0,
    sections,
    requiredMissing,
    warnings,
    counts: {
      sectionsDetected,
      sectionsTotal: spec.sections.length,
      fieldsDetected,
      fieldsTotal,
    },
  };
}
