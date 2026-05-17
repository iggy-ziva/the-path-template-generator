# Event Landing Page — Master Specification

This is the canonical structure for all event landing pages built from this template. It is reconciled from:

1. The `Lisa Barnett Live Event LP copy_21 July 2025 [LB-DEV-LPAR]` UX layout document.
2. The 16 April 2026 UX meeting between Iggy Vermaak and Michael Glover.
3. The live, currently-deployed top-performing page at [unchain.akashicknowing.com](https://unchain.akashicknowing.com/) (14.5% conversion).

Where the three sources disagreed, **the meeting transcript wins** — Michael's commentary is the most current canonical guidance. Specific deviations from the PDF are flagged inline.

---

## Universal rules (apply everywhere)

These are non-negotiable design laws for the whole template. They come directly from the UX meeting.

| Rule | Source | Why |
|---|---|---|
| **List cadence is always 3 or 6** | Michael: *"lists are almost always threes and sixes"* | Visual rhythm, scannability, fits common grid layouts. |
| **Text-left / image-right on desktop** | Michael: *"text on the left, image on the right because English audiences read from left to right"* | Reading order primes content before visual. |
| **Bold the benefit word in skim-list items** | Michael: *"the benefit is emboldened so that skim readers can see it"* | Skim readers harvest the bolded keywords. |
| **Credibility statements never exceed 2 lines** | Michael: *"these long credibility statements are pointless... I don't think there should ever be more than two lines"* | Long quotes don't get read. |
| **Credibility statements logically connect to the section above** | Michael: *"a credibility statement that connects logically to the thing you've just spoken about"* | Acts as evidence for the claim just made. |
| **Every section ends with an emphasized line** | Pattern observed throughout PDF | Drives the reader's eye toward the next CTA. |
| **CTA microcopy precedes every CTA button** | Michael: *"it's like the copy that goes just above a CTA which is like tightening the screws of the argument"* | Closes the persuasion loop before the click. |
| **Icons accompany every list with desired-state outcomes** | Michael: *"icons connect to bullet point lists because that just is found to be very effective... it's enhances understanding, interpretation"* | Visual learners; comprehension; aesthetic anchor. |

---

## Section order (canonical)

Sections in this fixed order. Clients may hide a section but never reorder. Numbers are reference IDs only — they don't appear in the file.

| # | Section | Repeats? | Required? |
|---|---|---|---|
| 01 | Sticky Bar | Persistent | Yes |
| 02 | Hero | Once | Yes |
| 03 | Credibility Statement (under hero) | Once | Yes |
| 04 | Video | Once | Optional |
| 05 | As Seen On (logo wall) | Once | Optional |
| 06 | Audience Callouts ("This Is For You If") | Once | Yes |
| 07 | Encouragement CTA | Throughout | Yes |
| 08 | Value Proposition (text-left, image-right) | 1–3× | Yes |
| 09 | Credibility Statement | Throughout | Yes |
| 10 | Outcomes / Desired States — Edward style | Once | Yes |
| 11 | Personal Message to Audience | Once | Optional |
| 12 | Text Testimonials Carousel | Once | Yes |
| 13 | How It Works | Once | Yes |
| 14 | Event Overview | Once | Yes |
| 15 | Extra Value Proposition | 0–1× | Optional |
| 16 | Outcomes / Desired States 2 — full-width icon grid | 0–1× | Optional |
| 17 | Bio / About You | Once | Yes |
| 18 | Final Value Proposition (closing) | Once | Yes |
| 19 | FAQ | Once | Yes |
| 20 | FTC Disclaimer | Once | Yes |
| 21 | Footer | Once | Yes |

**Encouragement CTAs** are interspersed throughout — typically every 2–3 sections. The template should include one component used 5–7 times.

---

## Section formulas

Each section below is a strict formula. Build each one as a Figma component (or component set with variants for layout direction). Clients fill content slots, never restructure.

---

### 01 — Sticky Bar

**Purpose**: Always-visible registration prompt with urgency.

**Behaviour**:
- Desktop: appears after user scrolls past the hero CTA.
- Mobile: visible permanently from page load.

**Slots**:
- Logo (left)
- Event title (centre, truncate on small screens)
- Mini countdown (D : H : M, optional on desktop, hide on mobile)
- Primary CTA button (right)

**Variants**:
- `desktop` / `mobile`
- `with-countdown` / `without-countdown`

---

### 02 — Hero

**Purpose**: Communicate event identity, value promise, and key meta in one fold.

**Slots** (in vertical order):
1. **Eyebrow tag** — `LIVE ONLINE` (uppercase, letter-spaced)
2. **Title** — display serif, 2–3 lines max
3. **Subtitle** — single sentence describing the transformation
4. **Host attribution** — `With [Host Name] — [Credential / Honorific]`
5. **Date** — formatted: `February 24, 2026`
6. **Time** — formatted: `Tuesday 10am – 2pm Pacific Time`
7. **Price line** — `Choose your price: $X to $Y` (the bespoke pricing module)
8. **Primary CTA button** — `Register Now`
9. **Hero visual** — atmospheric image or short looping video, full-bleed background OR right-side composition

**Layout variants**:
- `centered` (text centred, full-bleed background visual) — default for cinematic feel
- `split` (text left, visual right) — for client preference

**Notes**:
- The hero visual should NEVER be a stock smiling-photo of the host. It should be atmospheric — clouds, light, water, landscape, abstract. The host's face appears in the Bio section.
- This is where the cinematic feel is established. Use the dark atmospheric mode for hero by default and lighten the page below.

---

### 03 — Credibility Statement (under hero)

**Purpose**: Prove the host's claims immediately, before reader scepticism kicks in.

**Source**: Michael's best practice — *"if it were me, I would pop in a credibility statement right underneath the hero"*.

**Slots**:
- **Quote** — max 2 lines, ~140 characters
- **Author name**
- **Author location** (optional)

**Visual treatment**: Spacious, single-column centred. Generous whitespace above and below. Use a quote glyph or typographic flourish — this is the only section where ornament is welcome.

**Variants**:
- `with-author-photo` / `text-only`

---

### 04 — Video

**Purpose**: Let the host speak directly to the audience; introduce the energetic quality of the event.

**Slots**:
- **Section heading** — short, often a desired-state phrase pulled from the page (e.g. *"Access to your Akashic Record is your birthright"*)
- **Video player** — 16:9, with custom poster image
- **Optional caption** below video

**Variants**:
- `heading-above-video` / `heading-beside-video`

---

### 05 — As Seen On

**Purpose**: Borrowed authority from media outlets the host has appeared on.

**Source**: Mentioned by Michael in the meeting — *"as seen on section. This is where you have these little logos of TEDx and GIA and whatever"*.

**Slots**:
- **Section eyebrow** — `As seen on` or `As featured in`
- **Logo wall** — 4 to 8 monochrome logos in a single row (mobile: 2-up grid)

**Variants**:
- `4-logos`, `6-logos`, `8-logos`

**Hide-when-empty rule**: If the client has fewer than 3 logos, this section is hidden entirely. Don't show 1–2 logos floating awkwardly.

---

### 06 — Audience Callouts ("This Is For You If")

**Purpose**: Qualify the audience; make the right people feel seen and self-select in.

**Source**: Michael — *"typically six this is for you ifs. These are types of audience call outs"*.

**Slots**:
- **Section heading** — `This is for you if…`
- **6 callout items** — each is a single-sentence pain point describing the audience's current state. Bold the emotional hook word.
- **Emphasized closing line** — drives into CTA. Pattern: `Now is your time to [transformation outcome]`.
- **CTA microcopy + Encouragement CTA**

**Layout**: Single column, centred, large legible body type. Each callout item gets a subtle leading bullet or icon (heart, spark, eye — restrained, line-style icons only).

**Item count**: Strictly 6. (Michael's rule of 3s and 6s.)

---

### 07 — Encouragement CTA *(reusable section)*

**Purpose**: Standalone short invitation + button that breaks up long content.

**Source**: Michael & Iggy renamed this in the meeting — was incorrectly classified as a credibility statement in the original PDF. Iggy: *"Why don't we call it Encouraged CTA because that's what it is. It's an encouragement and a CTA button and that's a section."*

**Slots**:
- **Encouragement sentence** — 1 line, ~80 characters max. Tone: invitational, not pushy.
- **Primary CTA button** — `Register Now`

**Layout**: Centred, single column, vertical rhythm tightened. Background can be a muted accent color to create visual breaks.

**Variants**:
- `light-bg` / `dark-bg` / `accent-bg`

**Frequency**: Used 5–7 times across the page (after Hero, after Audience Callouts, after Outcomes, after Testimonials, after Extra VP, after FAQ, etc.).

---

### 08 — Value Proposition

**Purpose**: Make a structured argument for the event's transformation. Multiple instances per page.

**Slots**:
- **Section heading** — bold, declarative (e.g. *"The Record Keepers are waiting for you"*)
- **Body copy** — 2–4 paragraphs. Use **bolded important words** for skim readers.
- **Emphasized closing line** — pulled-out, larger type, italic or distinct treatment. Pattern: a sentence that summarises the section's promise.
- **Supporting image** — right side on desktop, top on mobile

**Layout**: Text left (~60% width), image right (~40% width) on desktop. Stack on mobile.

**Variants**:
- `image-right` (default) / `image-left` (alternate to break monotony when used multiple times)
- `with-pull-quote` / `without-pull-quote`

**Number per page**: 1–3 instances. Each subsequent instance should alternate `image-right` / `image-left` for visual rhythm.

---

### 09 — Credibility Statement *(reusable)*

Same component as #03, used throughout the page.

**Placement principle**: Place a Credibility Statement immediately after each Value Proposition or Outcomes section so the quote acts as evidence for the claim just made.

**Variants**:
- `inline` (smaller, between sections) / `featured` (larger, dedicated band)

---

### 10 — Outcomes / Desired States — Edward Style *(THE CRITICAL SECTION)*

**Purpose**: The single most important section on the page. Communicates the post-event transformation.

**Source**: Michael & Iggy explicitly chose Edward Mannix's layout over Lisa's during the meeting. *"For the outcome section, I think we should agree to use the Edward outline."* — Iggy. *"100%."* — Michael.

**Slots**:
1. **Section heading** — `Outcomes` (or `What you'll experience`)
2. **Subtitle sentence** — one line, leads into the list. Pattern: `Your life after [the transformation event]`.
3. **6 outcome items**, each containing:
   - **Icon** (line-style, custom-drawn, ~32px) — non-negotiable
   - **Bolded benefit word/phrase** at the start of the sentence
   - **Single sentence** describing the outcome
4. **Supporting image** beneath the outcome list (Michael: *"end with an image beneath... Edward's landing page is probably a great example of that"*)
5. **Emphasized closing line** — pulled-out type
6. **CTA microcopy**
7. **Encouragement CTA**

**Layout**: Two columns of 3 outcomes each on desktop; single column on mobile. Image spans full width below the grid.

**Variants** (for the second outcomes section if used):
- `2-column-text` (this one — primary)
- `full-width-icon-grid` (alternate — see section 16)

---

### 11 — Personal Message to Audience

**Purpose**: A direct, emotional, personal communication from the host to the reader. Distinct from value proposition — this is the host's voice, not the marketing voice.

**Source**: Renamed from "Credibility Statement 4" in the PDF during the meeting. Iggy: *"I think this is not a value proposition. It's sort of like a personal manifesto or like a personal message."* Michael: *"Personal message to audience."*

**Slots**:
- **Section heading** — typically frames who the message is from (e.g. *"A message channelled for you from the Akashic Record Keepers"*)
- **Long-form quoted body** — 1–2 paragraphs of intimate, personal copy. Treated typographically as a quote.
- **Author signature** — `— [Host Name]` or `Channelled by [Host Name]`

**Visual treatment**: Block-quote styling. Larger body type than usual. Italic or distinct serif. Generous margins.

**Optional**: When the client doesn't have personal message content, this section is hidden entirely. Do not force generic copy here.

---

### 12 — Text Testimonials Carousel

**Purpose**: Volume of social proof.

**Slots** (per testimonial card):
- **Headline** — short, punchy phrase (e.g. *"Grey cloud over my head, gone!"*)
- **Quote body** — 3–6 lines max (PDF examples are too long; trim them in real use)
- **Author name**
- **Author location**

**Carousel behaviour**: 3 visible at once on desktop, 1 on mobile. Auto-rotate every 7 seconds. Manual nav arrows. Pagination dots.

**Number of testimonials in template**: 6 (use the 3s/6s rule).

**Variants**:
- `with-headlines` / `quotes-only`

---

### 13 — How It Works

**Purpose**: Demystify the mechanism. Reduce anxiety about the unknown.

**Slots**:
- **Section heading** — question-form (e.g. *"Who and what awaits you inside the [thing]?"*)
- **Body copy** — 3–5 paragraphs explaining the experiential mechanic
- **Emphasized closing line** — pulled-out type. Pattern: `It could be the most [superlative] [transformation] you've ever [experienced]`.
- **Optional supporting image** — atmospheric, full-width

**Layout**: Single column, centred, comfortable reading width (~720px max).

---

### 14 — Event Overview

**Purpose**: Concrete logistical info + tangible takeaways. Resolves the *"what will I actually get?"* objection.

**Slots**:
- **Section heading** — `Event overview`
- **Live status tag** — `LIVE ONLINE`
- **Date** — formatted
- **Time** — formatted with timezone
- **Recording note** — `[Event] will be recorded, so you're welcome to register even if you can't attend live` (resolves objection)
- **"What you'll experience" subhead**
- **4 experience bullets** — each with an icon, single-sentence outcome
- **"Together we'll address challenges like:" subhead**
- **Challenges list** — 8–10 items, single column or 2-column grid

**Layout**: Two-zone. Top zone is logistical info (compact, info-dense). Bottom zone is the bullet experience list (icon-led).

---

### 15 — Extra Value Proposition

**Purpose**: A late-page differentiator that re-engages readers who've drifted. Reframes the opportunity.

**Source**: PDF section "Extra Value Proposition" — *"Can you ask your goosebumps questions?"*

**Slots**:
- **Section heading** — provocative question
- **Body** — 2–3 paragraphs reframing the opportunity at a deeper level
- **Emphasized closing line** — the reframe payoff
- **Optional supporting image**

**Layout**: Single column, centred, comfortable reading width. Distinct background colour from surrounding sections to mark it as a secondary frame.

---

### 16 — Outcomes / Desired States 2 — Full-Width Icon Grid

**Purpose**: Reinforces the outcome promise with a different visual treatment, late in the page.

**Source**: Michael — *"the style has been mixed up a bit where it's instead of them listed on the left and an image on the right, now it's six of them with icons taking up the whole screen"*.

**Slots**:
- **Section heading**
- **6 outcomes**, each with: icon (larger, ~64px), short title (bolded benefit), single sentence body

**Layout**: 3-column × 2-row grid on desktop. 2-column × 3-row on tablet. 1-column on mobile.

**Use this section sparingly** — only when the page is long and a different visual treatment is needed to maintain interest. Optional.

---

### 17 — Bio / About You

**Purpose**: Humanise the host. Establish authority through story.

**Slots**:
- **Section heading** — typically positions the host (e.g. *"Meet the [credential]"*)
- **Host portrait** — single, well-shot photograph. NOT a logo wall, NOT a collage. Michael: *"this Akashic Knowing all these images on the right we don't normally do that. Typically not because not everyone's written four books"*.
- **Body** — 4–7 paragraphs, host's first-person story. Origin → mission → invitation.
- **Closing line** — `I can't wait to finally meet you` or similar warm sign-off

**Layout**: Image left (~40%), text right (~60%) on desktop. Stack on mobile with image on top.

---

### 18 — Final Value Proposition

**Purpose**: The closing emotional argument. Last chance to convert readers who scrolled deep.

**Slots**:
- **Section heading** — declarative, lifts the reader's purpose
- **Body** — 4–6 short paragraphs, escalating emotional stakes
- **Pattern: "From X to Y" reframings** — 2–3 of these in body, formatted as pulled-out lines:
  > From *"I have a hunch"* to *"I know my soul's plan for this lifetime."*
- **Closing invitation** — direct, warm, personal
- **CTA microcopy**
- **Encouragement CTA**

**Layout**: Single column, centred, comfortable reading width.

---

### 19 — FAQ

**Purpose**: Resolve final objections.

**Slots**:
- **Section heading** — `Frequently Asked Questions`
- **6 FAQ items**, each:
  - **Question** — phrased exactly as the audience would ask
  - **Answer** — 2–4 sentences

**Behaviour**: Accordion. First question open by default; rest collapsed. Single-open OR multi-open behaviour both acceptable — multi-open preferred for desktop.

**Layout**: Single column, max width ~720px, centred.

---

### 20 — FTC Disclaimer

**Purpose**: Legal compliance. Non-negotiable.

**Slots**:
- **Heading** — `FTC Disclaimer`
- **Disclaimer body** — 3–4 paragraphs (the standard ZIVA boilerplate, with `[Host Name]` and `[School Name]` as variables)

**Visual treatment**: Smaller body type (~14px). Muted color. Comfortable reading width. NOT hidden or buried — but visually de-emphasised.

---

### 21 — Footer

**Slots**:
- **Logo or wordmark** (left)
- **Copyright line** — `©2026 [Brand Name] / [Host Name] | All Rights Reserved`
- **Links** — `Privacy` · `Terms of Use`
- **Final CTA repeated** — `Register Now` (mobile sticky bar lives here)

**Layout**: Two-zone. Left: brand + copyright. Right: links + CTA.

---

## Mobile considerations

- Every section must have a mobile variant. Build in Figma at 1440 desktop and 390 mobile.
- Sticky bar: simplified to logo + CTA only on mobile (no countdown, no event title).
- Hero: stack everything; reduce display type by ~30%.
- Two-column sections (Value Prop, Outcomes, Bio): stack with image first or text first based on per-section judgement.
- Carousels: 1-up on mobile.
- Tap targets: 48px minimum.

---

## Accessibility notes (so the file looks senior)

- Annotate accessible color contrast on the design system page (4.5:1 min for body text).
- Use semantic heading scale: H1 (Hero only), H2 (each section heading), H3 (subsections).
- Icons must always be paired with text — never icon-only navigation.
- Focus states on all interactive elements (CTA buttons especially).
- Document these as annotations in a dedicated "Accessibility" page in the Figma file.

---

## What NOT to include

These were considered and explicitly excluded for Phase 1:

- ❌ Pricing tier comparison tables — that's program-page territory, not events.
- ❌ Multi-presenter sections — events have one host.
- ❌ Schedule / agenda sections — events are short enough to not need an agenda.
- ❌ Post-event content (recordings access info) — that lives on the Replay page.

These will be added when the Program Landing template is built in Phase 3.
