# The Path — Launch Templates

White-labeled Figma templates for ZIVA's launch system: long-form pages used by spiritual teachers, healers, and conscious-business leaders to convert audiences into live events and program enrolments.

This repo contains the **specification, content, and design-system foundation** that the Figma file is built against. The Figma file is the deliverable; these documents are the source of truth.

---

## Aesthetic direction

**"Grounded and Cinematic"** — atmospheric, restrained, premium. Warm earth tones, generous negative space, high-contrast display typography, subtle photographic backdrops. The opposite of the over-busy, gradient-heavy spiritual aesthetic. White-label by default; brand identity is introduced through Variables (color, type) and Modes (light / dark / brand).

Visual reference for tone: [ziva.marketing](https://ziva.marketing/) — heart-led, professional, atmospheric.

Structural reference: [Lisa Barnett — Unchain Your Galactic Soul](https://unchain.akashicknowing.com/) (14.5% conversion — ZIVA's top-performing event landing page). The template adopts its **structure**, never its visual style.

---

## Scope (Phase 1 — current)

**One template type only: Event Landing Page.**

This is the highest-leverage page in the funnel. Once it's locked, the rest of the system (Checkout, Upsell, Thank You, Replay, Program Landing, Program Checkout, Program Thank You) reuses the same component library and design tokens, so each subsequent page is a fraction of the work.

Phase 2 (later): Checkout (with Choose Your Price), One-Click Upsell, Event Thank You.
Phase 3 (later): Replay, Program Landing, Program Checkout, Program Thank You.

---

## File map

```text
/specs
  event-landing-page-spec.md       The canonical section-by-section formula
  design-system.md                 Color, type, spacing, modes — the foundation
  component-inventory.md           Every Figma component with its variants
  
/copy
  dummy-content.md                 White-labeled populated copy for every section
  
/figma-handoff
  cover-page.md                    What goes on the Figma file's first frame
  how-to-use-this-template.md      Internal docs that live inside the file
  
/source-materials                  Original inputs (kept for reference)
  Lisa Barnett Live Event LP copy_21 July 2025 [LB-DEV-LPAR].pdf
  Meeting started 2026_04_16 14_13 SAST - Notes by Gemini (1).rtf
```

---

## Methodology

We are not building a design system from scratch. We are **codifying the structural formula** that ZIVA already proves wins (via Lisa Barnett's page) and applying a **disciplined, white-label aesthetic** so the template ships clients a foundation rather than a brand.

The template's job is to enforce the **formula** Michael Glover laid out in the 16 April 2026 UX meeting:

1. Section order is fixed (clients can hide sections, not reorder them without breaking the funnel logic).
2. Every section has a strict formula (component count, content slots, emphasis rules).
3. Lists are always 3s or 6s.
4. Important benefit words are bolded for skim readers.
5. Credibility statements never exceed 2 lines.
6. Every section ends with an emphasized line that drives toward the next CTA.

Treating these as design constraints — not stylistic suggestions — is what makes the template senior-quality and what makes it client-proof.

---

## Senior-designer signals

Every artifact in this repo is here to make the Figma file read as the work of a disciplined senior designer:

- **Variables** for colors and typography across light/dark modes.
- **Components** for every reusable element with sensible variants.
- **Auto Layout** end-to-end so resizing and reflow Just Works.
- **Realistic populated content** (no Lorem Ipsum — see `/copy/dummy-content.md`).
- **Thoughtful documentation** inside the file (cover page, component inventory page, how-to page).
- **A clear taxonomy** — every section has a name and a job, drawn from the UX meeting.
