// Verifies the copy-doc engine against the markdown template.
// Run: npx tsx scripts/verify-copydoc.mts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildCopyDocFromMarkdown } from "../lib/copydoc/index";

const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, "..", "templates", "landing-page-copy-template.md"), "utf8");

const { copyDoc, report, content } = buildCopyDocFromMarkdown(md, "eventLanding");

// Programme template
const progMd = readFileSync(join(here, "..", "templates", "programme-landing-copy-template.md"), "utf8");
const prog = buildCopyDocFromMarkdown(progMd, "programmeLanding");
console.log("=== Programme coverage ===");
console.log(
  `sections ${prog.report.counts.sectionsDetected}/${prog.report.counts.sectionsTotal}, ` +
    `fields ${prog.report.counts.fieldsDetected}/${prog.report.counts.fieldsTotal}, ok=${prog.report.ok}`,
);
console.log("prog required missing:", prog.report.requiredMissing);
const pc = prog.content as Record<string, unknown>;
console.log("prog heroHeadline:", pc.heroHeadline);
console.log("prog includesItems[0]:", JSON.stringify((pc.includesItems as unknown[])?.[0]));
console.log("");

console.log("=== Coverage ===");
console.log(
  `sections ${report.counts.sectionsDetected}/${report.counts.sectionsTotal}, ` +
    `fields ${report.counts.fieldsDetected}/${report.counts.fieldsTotal}, ok=${report.ok}`,
);
console.log("required missing:", report.requiredMissing);
console.log("warnings:", report.warnings);

console.log("\n=== Sample mapped content ===");
const c = content as Record<string, unknown>;
console.log("heroHeadline:", c.heroHeadline);
console.log("audienceItems:", (c.audienceItems as string[])?.length, "items");
console.log("outcomesItems[0]:", JSON.stringify((c.outcomesItems as unknown[])?.[0]));
console.log("faqItems[0]:", JSON.stringify((c.faqItems as unknown[])?.[0]));
console.log("finalVpFromTo[0]:", JSON.stringify((c.finalVpFromTo as unknown[])?.[0]));
console.log("testimonialItems[0]:", JSON.stringify((c.testimonialItems as unknown[])?.[0]));
console.log("sections detected:", copyDoc.sections.map((s) => s.id).join(", "));
