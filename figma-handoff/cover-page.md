# Figma File Cover Page

The first thing anyone sees when they open the Figma file. **This is the single highest-leverage thumbnail in the project** — it's what your boss will see first, what a client will see first, and what a senior designer would judge the file by within three seconds.

## Cover frame specs

- **Frame size**: 1920 × 1080 (Figma renders this as the file thumbnail)
- **Background**: `surface/canvas` in Dark mode (`#0F0E0C`)
- **Treatment**: Subtle film grain overlay at 8% opacity. Deep vignette.
- **Optional**: Atmospheric photographic backdrop at 15% opacity (e.g. mountain ridge silhouette, ocean horizon at dawn).

## Cover frame content

Compose vertically, centred. Typography pulls from the Design System.

```
[Display serif eyebrow, type style: eyebrow, color: text/accent, letter-spacing 8%]

THE PATH · LAUNCH TEMPLATES

[Display serif primary title, type style: display/hero, color: text/inverse]

Event Landing Page

[Body sans subtitle, type style: body/lg, color: text/secondary]

A white-label Figma template for ZIVA's launch system —
designed for spiritual teachers, healers, and conscious-business leaders
to convert audiences into live online events.

[Meta line, type style: meta, color: text/tertiary]

Version 1.0 · Phase 1 of 3 · October 2026

[Footer-style brand mark, type style: meta, color: text/tertiary]

ZIVA Marketing
```

### Recommended typographic hierarchy on the frame

| Element | Style | Color | Position |
|---|---|---|---|
| Eyebrow | `eyebrow` | `text/accent` | Top, ~15% from top |
| Primary title | `display/hero` | `text/inverse` | Centred vertical |
| Subtitle | `body/lg` | `text/secondary` | Below title, max width 720px |
| Meta line | `meta` | `text/tertiary` | ~80% from top |
| Brand mark | `meta` | `text/tertiary` | Bottom, ~92% from top |

Generous space between elements. The cover should feel uncluttered — almost like a film title card.

---

# Page index frame (sits next to the cover)

A second 1920 × 1080 frame, light mode, listing every page in the file. Clients use this to navigate.

```
[Eyebrow]
INSIDE THIS FILE

[Display sub heading]
Pages

[Two-column list, body/lg, with arrow icons]

📐  Design System          → Variables, type, color, spacing
🧩  Components              → All reusable components & variants
📄  Event Landing — Desktop → The full page assembled (1440px)
📱  Event Landing — Mobile  → The mobile variant (390px)
📚  Component Showcase      → Every component with variants captioned
✏️   How To Use This Template → Population guide for clients
♿   Accessibility Notes    → Contrast, motion, hierarchy notes
🎬  Imagery Direction       → Photo treatment + visual rules
```

(The emoji prefixes match the Figma page names, so this frame mirrors the left sidebar exactly.)

---

# Bottom-of-frame: credit & version block

A small block at the bottom-right of the cover frame. Builds trust and signals seniority.

```
Designed by [Your Name] · ZIVA Marketing
Source materials: Lisa Barnett UX layout (July 2025), UX meeting (April 2026)
Built October 2026 · v1.0
Questions: [your-email@ziva.marketing]
```

Typography: `meta` style, `text/tertiary` color, right-aligned.

---

# Why this matters

A blank page named "Page 1" with a hero frame floating on it is the single biggest junior tell in a Figma file. A composed, considered cover page — even a simple one — flips the impression instantly.

A senior designer reviewing this file will spend three seconds on the cover and form an opinion. Spend twenty minutes here. It's the highest-ROI work you'll do.
