# How to Use This Template

This document lives **inside the Figma file** as a dedicated page (`✏️ How To Use This Template`). It is what makes this template usable by a client (or by another designer at ZIVA) without you in the room.

Build this as a Figma frame at 1920 × 2400 (vertically scrolling), light mode. Use callout boxes, screenshots, and arrows pointing to specific elements as needed. The content below is the copy that goes on it.

---

## Page composition

The page has six zones, top to bottom:

1. **Welcome & overview** (the orientation)
2. **Customisation surface** (what you can change, what you can't)
3. **Variable swap guide** (the colors and fonts you'll re-bind)
4. **Section-by-section population guide** (every section, every slot)
5. **Imagery rules** (what photographs work, what doesn't)
6. **Hand-off checklist** (the "before you give it back to ZIVA" list)

---

# Zone 1 — Welcome & overview

```
[Eyebrow]
WELCOME

[Display section]
This is your event landing page template.

[Body lg]
This Figma file contains a complete, ready-to-customise event landing page,
built around the structure that converts at 14.5% in production. It is designed
to be populated, not redesigned.

The next two screen-heights walk you through everything you can customise,
how to do it, and what to avoid.
```

---

# Zone 2 — Customisation surface

A two-column comparison.

**Left column heading**: `What you can change`

- Brand colors (one operation: swap the Brand Mode color values)
- Fonts (replace the typeface in two text styles)
- Host portrait
- Hero atmospheric image
- "As Seen On" logos
- All copy in every content slot
- The 6 outcome icons (replace with custom set, or use defaults)
- Hide/show optional sections (Video, As Seen On, Personal Message, Outcomes 2)

**Right column heading**: `What you cannot change`

- The order of sections
- The structure inside any section (slot count, layout direction, list count)
- The list cadence (3 or 6 items — never other numbers)
- Spacing scale
- Type scale relationships (you can swap the typeface, not the size relationships)
- Required sections (Hero, Audience Callouts, Outcomes, Bio, FTC, Footer)

> **Why these rules?** Every constraint here exists because Lisa Barnett's page converts at 14.5%. We are duplicating the conditions of that conversion, not the design. Reordering or restructuring breaks the funnel logic.

---

# Zone 3 — Variable swap guide

```
[Heading h2]
Step 1 — Customise your brand

[Body md]
This template uses Figma Variables in three Modes: Light, Dark, and Brand.
The Brand mode is yours to customise. Re-bind these values and the entire
template re-skins automatically.
```

A table with screenshots showing where each variable is set:

| Variable | Default value | Where to change | What it affects |
|---|---|---|---|
| `accent/primary` | Bronze `#7A4A28` | Variables panel → Brand mode | All primary buttons, key emphasis text, eyebrow tags |
| `accent/primary-hover` | Deeper bronze `#5C3A20` | Variables panel → Brand mode | Hover/pressed button states |
| `accent/secondary` | Sage `#3A4A3F` | Variables panel → Brand mode | Secondary buttons, accent fills |
| `accent/tertiary` | Terracotta `#9C5C3F` | Variables panel → Brand mode | Variety badges, tags (use sparingly) |

```
[Heading h2]
Step 2 — Customise your typography

[Body md]
Two text styles need updating to swap the brand typeface:

  • display/hero — the display serif (currently Source Serif)
  • body/md     — the body sans (currently Inter)

Replace the font family in these two styles, and every other text style
inherits automatically.

If you don't have a brand typeface yet, leave the defaults — they are
high-quality free fonts (Source Serif from Adobe, Inter from Rasmus
Andersson) and they are intentional choices.
```

---

# Zone 4 — Section population guide

The biggest zone. A scrollable, anchored list of every section with population instructions.

For each section, the format is:

```
[Section thumbnail screenshot — small, ~400px wide]

[Heading h3]
Section name (e.g. Hero)

[Body sm — instructions]
What this section does and why it exists.

[Body sm — slot list]
Slots to fill:
  • [Slot name]: [What goes here] — [character/length guidance]
  • [Slot name]: [What goes here] — [character/length guidance]
  ...

[Body xs — rules]
Rules:
  • [Constraint]
  • [Constraint]
```

I'll write the population guide for every section below. Drop these directly into the Figma frame as separate sub-sections.

---

## Section: Hero

**What it does**: Establishes the event identity, value promise, and key meta in one fold. Sets the cinematic tone for the entire page.

**Slots**:
- **Eyebrow tag**: Always `LIVE ONLINE` for live events. Don't change.
- **Title**: Event name. Display serif, 2–3 lines max. Aim for 4–8 words. Examples: *"Threshold"*, *"The Quiet Path"*, *"Unchain Your Galactic Soul"*.
- **Subtitle**: One sentence describing the transformation. ~120 characters.
- **Host attribution**: `With [Host Full Name] — [Credential or Honorific]`.
- **Date**: Format as `Month Day, Year` (e.g. `October 14, 2026`).
- **Time**: Format as `Day Xam – Ypm Timezone` (e.g. `Wednesday 9am – 1pm Pacific Time`).
- **Price line**: `Choose your price: $X to $Y` — set the min and max.
- **CTA button**: Always `Register Now`.
- **Hero visual**: Atmospheric image. NEVER a portrait of the host. See "Imagery Rules" zone.

**Rules**:
- Hero uses the Dark Mode of the design system. Don't switch to Light.
- Title must fit in 3 lines maximum on desktop. If it doesn't, the title is too long.
- Don't replace the eyebrow with creative variations — `LIVE ONLINE` is intentional and converts.

---

## Section: Credibility Statement (under hero)

**What it does**: Proves the host's claims immediately, before scepticism kicks in. Best practice from UX: a credibility statement directly under the hero is the single highest-leverage testimonial placement.

**Slots**:
- **Quote**: Maximum 2 lines, ~140 characters. NEVER longer.
- **Author name**: Full name preferred.
- **Author location**: City, country. Optional but recommended for credibility.

**Rules**:
- If your only testimonials are paragraph-long, edit them down. A 1-sentence quote that mentions a specific outcome beats a 5-sentence quote every time.
- Don't use anonymous testimonials. If you must, hide this section instead.

---

## Section: Audience Callouts ("This Is For You If")

**What it does**: Qualifies the audience. Makes the right people feel seen and self-select in.

**Slots**:
- **Heading**: Always `This is for you if...` (or your localised equivalent).
- **6 callout items**: Each is a single-sentence pain point describing the audience's current state. Bold the emotional hook word (in Figma, switch the bolded portion to weight 600).
- **Emphasized closing line**: A summary sentence that drives into the CTA. Pattern: `Now is your time to [transformation outcome]`.

**Rules**:
- Strictly 6 items. Not 5, not 7.
- Each item describes the audience's *current* state, not the future state. (Future states go in the Outcomes section.)
- Bolded words should be specific and emotionally charged: *afraid*, *trapped*, *exhausted*, *quietly*, *finally*.

---

## Section: Encouragement CTA

**What it does**: A standalone short invitation + button that breaks up long content.

**Slots**:
- **Encouragement sentence**: 1 line, ~80 characters. Tone: invitational, not pushy.
- **CTA button**: Always `Register Now`.

**Rules**:
- Used 5–7 times across the page. This component is meant to repeat.
- Each instance can have a slightly different sentence. Keep them varied.
- Background can be `light-bg`, `dark-bg`, or `accent-bg` — alternate to break visual monotony.

---

## Section: Value Proposition

**What it does**: Makes a structured argument for the event's transformation. Multiple instances per page.

**Slots**:
- **Section heading**: Bold, declarative (e.g. *"A different kind of clarity"*).
- **Body copy**: 2–4 paragraphs. Use **bolded important words** for skim readers.
- **Optional pull quote**: A pulled-out, larger sentence that summarises the section.
- **Supporting image**: Right side on desktop, top on mobile.

**Rules**:
- 1–3 instances per page. Each subsequent instance alternates `image-right` / `image-left` for visual rhythm.
- Keep paragraphs short. 3 sentences maximum per paragraph.
- Bold 2–4 words per paragraph — not more.

---

## Section: Outcomes / Desired States (Edward style)

**What it does**: The single most important section on the page. Communicates the post-event transformation.

**Slots**:
- **Section heading**: `Outcomes` (or `What you'll experience`).
- **Subtitle sentence**: One line, leads into the list.
- **6 outcome items**: Each is `[icon] + [bolded benefit phrase] + [single sentence]`.
- **Supporting image**: Beneath the outcome list, full-width.
- **Emphasized closing line**: Pulled-out type.
- **CTA microcopy + Encouragement CTA**.

**Rules**:
- Strictly 6 outcomes.
- Each outcome starts with a bolded benefit phrase (e.g. *"Clear direction."*) followed by a single sentence.
- Icons must be present on every outcome. Icon-less outcomes break the formula.
- Replace with custom icons if available; otherwise use the default Phosphor icon set already placed.

---

## Section: Personal Message to Audience

**What it does**: A direct, emotional, personal communication from the host to the reader. Distinct from value proposition — this is the host's voice, not the marketing voice.

**Slots**:
- **Section heading**: Frames who the message is from.
- **Long-form quoted body**: 1–2 paragraphs of intimate, personal copy.
- **Author signature**: `— [Host Name]` or `Channelled by [Host Name]`.

**Rules**:
- Optional section. If the host doesn't have personal-message content, hide this section entirely. Do not force generic copy here.
- Treat typographically as a quote — italic display serif or distinct treatment.

---

## Section: Text Testimonials Carousel

**Slots** (per testimonial):
- **Headline**: Short, punchy phrase.
- **Quote body**: 3–6 lines max.
- **Author name**.
- **Author location**.

**Rules**:
- 6 testimonials minimum (use the 3s/6s rule).
- Trim long testimonials. If a testimonial is paragraph-length, find the strongest 3 lines and use only those.
- Use real testimonials. Anonymous = hide.

---

## Section: How It Works

**Slots**:
- **Section heading**: Question form (*"Who and what awaits you inside [the thing]?"*).
- **Body**: 3–5 paragraphs explaining the experiential mechanic.
- **Emphasized closing line**.
- **Optional supporting image**.

**Rules**:
- Demystify, don't mystify further. Plain language wins here.
- This section addresses the reader's anxiety about the unknown — speak to that anxiety directly.

---

## Section: Event Overview

**Slots**:
- **Date, Time, Recording note**.
- **4 experience bullets** (each with icon).
- **8–10 challenges to address**.

**Rules**:
- The recording note is non-negotiable — it resolves the *"what if I can't attend live?"* objection inline.
- Challenges list is single column or 2-column grid. Keep items punchy: 2–4 words each.

---

## Section: Bio / About You

**Slots**:
- **Heading**: Positions the host (*"Meet the [credential]"*).
- **Host portrait**: Single, well-shot photograph.
- **Body**: 4–7 paragraphs, host's first-person story.
- **Closing line**: Warm sign-off (*"I can't wait to finally meet you"*).

**Rules**:
- One portrait. Not a logo wall. Not a collage of book covers.
- First-person voice throughout.
- The bio should establish authority through *story*, not credentials list.

---

## Section: Final Value Proposition

**Slots**:
- **Heading**: Lifts the reader's purpose.
- **Body**: 4–6 short paragraphs, escalating emotional stakes.
- **2–3 "From X to Y" reframings** as pulled-out lines.
- **Closing invitation**.
- **CTA microcopy + Encouragement CTA**.

**Rules**:
- This is the closing emotional argument. Don't be afraid to be direct here.
- The "From X to Y" reframings are signature — keep this pattern.

---

## Section: FAQ

**Slots**:
- **6 question/answer pairs**.

**Rules**:
- Phrase questions as the audience would actually ask them (not as the host would answer them).
- Answers: 2–4 sentences. Resolve the objection directly.

---

# Zone 5 — Imagery rules

```
[Eyebrow]
PHOTOGRAPHY

[Heading h2]
What images work — and what to avoid

[Body md]
The cinematic feel of this template depends on the imagery. Substituting
in the wrong photographs is the fastest way to break it.
```

A two-column grid of yes/no examples. Show actual image examples in Figma.

**Use** (✓):
- Mountain ridge silhouettes
- Ocean horizon at dawn or dusk
- Forest light streaming through trees
- Stone, water, smoke textures
- Single small human figure in vast landscape (cinematic scale)
- Abstract paper grain, film grain overlays

**Avoid** (✗):
- Lens flares
- Mandala / sacred-geometry overlays
- Crystal photography
- Stock photos of women meditating in white clothing
- Purple / galaxy gradients
- Glowing orbs / chakra colors
- Pastel sunset gradients

```
[Body md]
All hero and feature images get a film grain overlay (8% opacity) and a
subtle vignette. This is built into the "Image with treatment" component —
use that component for every photographic placement, not raw images.
```

---

# Zone 6 — Hand-off checklist

```
[Eyebrow]
BEFORE YOU SHIP

[Heading h2]
Pre-handover checklist
```

A checklist (Figma checkboxes work as visual elements):

- [ ] Brand mode color values updated (4 accent variables)
- [ ] Two typefaces updated in `display/hero` and `body/md` styles
- [ ] All `[HOST_FIRST_NAME]`, `[HOST_FULL_NAME]`, `[EVENT_TITLE]` etc. replaced
- [ ] Hero atmospheric image replaced (following imagery rules)
- [ ] Host portrait replaced in Bio section
- [ ] At least 4 "As Seen On" logos placed (or section hidden if fewer than 3)
- [ ] All 6 outcome items written (in Edward-style format with bolded benefit phrase)
- [ ] At least 4 short testimonials populated (each ≤2 lines)
- [ ] FAQ all 6 questions answered
- [ ] FTC disclaimer customised with client's `[BRAND_NAME]` and `[SCHOOL_NAME]`
- [ ] Footer copyright year + brand updated
- [ ] Mobile variant pages reviewed page by page (every section)
- [ ] Accessibility check: contrast on all text (4.5:1 min for body)
- [ ] Optional sections decided: Video, As Seen On, Personal Message, Outcomes 2 (kept or hidden)
- [ ] Cover page updated with version, date, designer name
- [ ] File renamed to `[Client Name] — Event Landing — v1.0`

---

## Final note for clients

```
[Body md italic]
This template represents about 80% of the work. The remaining 20% — the
specifics of your voice, your story, your audience — is yours to bring.

If you're stuck on copy, the dummy content in this file is a useful
reference for tone and structure. Read it, then write your own.

If you want a second pair of eyes before going live, ZIVA is a message away.
```
