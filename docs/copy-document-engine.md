# Copy-Document Page & Layout Engine

Generate a funnel from a finished **copy document** instead of having the AI write
the copy. Your words are placed **verbatim**; the engine handles layout, section
themes, image placement, and design.

There are two generation modes:

| Mode | What it does |
|---|---|
| **Let AI write the copy** (`ai_copy`, default) | Claude writes every page from your wizard inputs, bio, and materials. |
| **Start from a copy document** (`copy_doc`) | You upload a `.docx`; we place the copy verbatim and only handle design. |

---

## For end users

### 1. Download the template

In the wizard, open **Step 7 — Your Story**, choose **Start from a copy
document**, and click **Download template**. Templates also live at:

- `public/templates/landing-page-copy-template.md` (Event Landing)
- `public/templates/programme-landing-copy-template.md` (Programme Landing)

### 2. Write your copy

Fill in the template and export from Word as **.docx** using **Heading styles**:

- **Heading 1** — the page (leave the title as provided).
- **Heading 2** — a section. Keep the section names exactly.
- **Heading 3** — a field inside a section.
- **Bulleted / numbered lists** become arrays (one item per bullet).
- For **Items** with a title + body, bold the title: `**Clear direction.** You'll …`
- For **FAQ** items, start with `**Q: question?**` then the answer.
- For **From/To** pairs, write: `From "old story" to "new story"`.
- Delete any optional section you don't want — the page adapts.

Only the **copy** comes from the document. Brand colours, fonts, host details,
event dates, prices and images still come from the wizard.

### 3. Upload and review the coverage report

Uploading parses the document and shows a **coverage report**:

- ✅ all required sections detected, or ⚠️ what's missing,
- per-section detection, and
- cardinality warnings (e.g. "expected 6 items, found 5").

Fix anything flagged as **required** in your document and re-upload. Warnings are
optional — you can generate with them.

### 4. Generate

On **Step 11 — Review & Generate**, click **Build my funnel from the document**.
Regenerating after edits offers to **keep your previous layout edits** (section
themes, images, logo, icons); copy is always re-read from the document.

---

## How it works (engineering)

Pipeline: **parse → segment → (AI fallback) → validate → map → layout → store**.

```
.docx ──mammoth──▶ HTML ──parse-blocks──▶ blocks
blocks ──segment(spec)──▶ CopyDoc + unmatched
unmatched + missing ──ai-fallback (classify-only, verbatim)──▶ CopyDoc
CopyDoc ──validate(spec)──▶ coverage report
CopyDoc ──map-to-content(spec)──▶ verbatim copy fields
copy + wizard snapshot ──guardFunnelThemes──▶ generated_funnels.content
```

Key modules (`lib/copydoc/`):

- `copydoc-schema.ts` — CopyDoc types + the canonical section→content mapping
  tables for Event and Programme Landing.
- `parse-blocks.ts` — HTML (mammoth) and Markdown front-ends → semantic blocks.
- `parse-docx.ts` — mammoth wrapper.
- `segment.ts` — deterministic heading-driven segmentation; returns leftover
  blocks for the fallback.
- `ai-fallback.ts` — Claude classifies leftover blocks **by index only**, so the
  text that lands is always verbatim; a normalised guard enforces this.
- `validate.ts` — required-section + cardinality checks → coverage report.
- `map-to-content.ts` — pure CopyDoc → copy fields (generic across pages).
- `merge.ts` — regeneration edit-preservation (copy from doc; layout from prior).
- `index.ts` — orchestrator (`buildCopyDocFromDocx`, `buildCopyDocFromMarkdown`).

### API

- `POST /api/wizard/upload` (bucket `copy-docs`) → uploads the raw `.docx`.
- `POST /api/wizard/copy-doc` → parses + stores a `copy_documents` row, returns
  the coverage report. `GET` returns the latest doc for a submission.
- `POST /api/wizard/generate-from-doc` → maps copy verbatim, applies the theme
  guard, freezes the wizard snapshot, and inserts a `generated_funnels` row with
  `generation_mode = 'copy_doc'`, `source_document_id`, `copy_doc_version`.
  Accepts `previousFunnelId` to preserve layout edits on regeneration.

### Data model

- New table `copy_documents` (id, user_id, submission_id, storage_path,
  file_name, page_key, parsed_json, parse_status, parse_report, version…).
- `generated_funnels`: `generation_mode`, `source_document_id`, `copy_doc_version`.
- `wizard_submissions`: `generation_mode`, `active_copy_document_id`.
- Private storage bucket `copy-docs` (copy is client IP — never public).

### Verify the engine

```
npx tsx scripts/verify-copydoc.mts
```

Parses both Markdown templates and prints coverage + sample mapped content.

---

## Operations

- **Migration required:** apply
  `supabase/migrations/20260615_copy_doc_engine.sql` (new table, columns, and the
  private `copy-docs` bucket) before using the feature in any environment.
- **GA + kill switch:** the engine is on by default. To disable, set
  `COPY_DOC_ENGINE` (server) and `NEXT_PUBLIC_COPY_DOC_ENGINE` (client) to one of
  `off` / `false` / `0` / `no`.
- **Model:** the AI fallback uses `ANTHROPIC_CLASSIFY_MODEL` (falls back to
  `ANTHROPIC_GENERATION_MODEL`, then `claude-sonnet-4-5`). It only runs when
  required copy is missing and there are unplaced blocks.

## Current scope & follow-ups

- Event Landing and Programme Landing copy are fully supported by the engine.
- The wizard upload currently targets the Event Landing page. Multi-document
  funnels (event + programme in one build) and deriving the remaining pages
  (checkout / upsell / thank-you / replay) from wizard facts are the next steps;
  in `copy_doc` mode those pages fall back to the wizard snapshot.
