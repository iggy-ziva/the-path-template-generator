# Design System Foundation

The visual and tokenised foundation for the template. Build these as Figma **Variables** and **Variable Modes** so clients can re-skin the entire template by swapping a single mode.

The aesthetic target is **Grounded and Cinematic**:

- **Grounded** — warm, earthen, restrained. Neutrals do the heavy lifting. The page feels like it could exist in 2026 or 2050 — timeless, not trendy.
- **Cinematic** — atmospheric depth, generous negative space, high-contrast display typography, moody photographic backdrops. Think A24-film aesthetic, not stock-photo wellness aesthetic.

White-label by default. Clients get a foundation, not a brand.

---

## Variable architecture

Build three Variable Collections in Figma:

1. **Color** — semantic tokens with light / dark / brand modes
2. **Typography** — type styles
3. **Spacing & Layout** — scale tokens

Reference these throughout via styles. **Never** hardcode a value on a layer.

---

## 1. Color

### Modes

| Mode | When used |
|---|---|
| **Light** | Default. Most page sections. Warm off-white background. |
| **Dark** | Hero section by default. Selected accent sections. Atmospheric. |
| **Brand** | Per-client override. Same token names, different hex values. |

### Token list (semantic, not literal)

Use these token names on every layer. The mode swap then re-skins everything.

#### Surfaces
| Token | Light | Dark | Notes |
|---|---|---|---|
| `surface/canvas` | `#F5F1EA` | `#0F0E0C` | Page background. Warm off-white / deep ink. |
| `surface/raised` | `#FFFFFF` | `#1A1816` | Card backgrounds, raised panels. |
| `surface/sunken` | `#EDE6DA` | `#080706` | Insets, code blocks, subtle backgrounds. |
| `surface/accent` | `#1F2A2A` | `#2A3A3A` | Hero, encouragement CTAs, distinct frames. |
| `surface/inverse` | `#0F0E0C` | `#F5F1EA` | When you want max contrast |

#### Text
| Token | Light | Dark | Notes |
|---|---|---|---|
| `text/primary` | `#0F0E0C` | `#F5F1EA` | Body, headings. |
| `text/secondary` | `#3D3A36` | `#C7C0B4` | Subheadings, captions. |
| `text/tertiary` | `#6B665E` | `#8A8378` | Meta, labels, fine print. |
| `text/inverse` | `#F5F1EA` | `#0F0E0C` | Text on dark surfaces in light mode (and vice versa). |
| `text/accent` | `#7A4A28` | `#D4A878` | Emphasis, pull-quotes, links. |

#### Brand accents (the palette swap clients customise)
| Token | Default light | Default dark | Notes |
|---|---|---|---|
| `accent/primary` | `#7A4A28` | `#D4A878` | Bronze / warm gold. Primary CTA bg, key emphasis. |
| `accent/primary-hover` | `#5C3A20` | `#E8C896` | Hover/pressed state. |
| `accent/secondary` | `#3A4A3F` | `#7A9080` | Sage / forest. Secondary buttons, accent fills. |
| `accent/tertiary` | `#9C5C3F` | `#C28A6A` | Terracotta. Sparingly — for variety badges, tags. |

#### Functional
| Token | Light | Dark |
|---|---|---|
| `border/subtle` | `#D9D2C5` | `#2A2724` |
| `border/strong` | `#0F0E0C` | `#F5F1EA` |
| `success` | `#5C7A4F` | `#9CB890` |
| `warning` | `#B8843A` | `#D4A865` |
| `error` | `#9C3F3F` | `#C26A6A` |

### Color philosophy

- **No pure black, no pure white.** Pure values feel digital. We're cinematic — soft warm ink (`#0F0E0C`) and warm cream (`#F5F1EA`) carry far more texture.
- **Bronze, sage, terracotta** are the only chromatic options. They're earthy, gendered-neutral, and read as wisdom-tradition without being woo-woo.
- **Brand mode** is what clients customise. They re-bind `accent/primary`, `accent/secondary`, `accent/tertiary` to their own brand colors. Everything else stays.

---

## 2. Typography

### Font selection

Three font families. The third is optional.

#### Display — high-contrast serif

Use for hero titles, section headings, pull-quotes.

**Recommended primary**: **Tiempos Headline** (paid, Klim Type Foundry) — the gold standard for cinematic editorial display.

**Free alternatives** (in priority order):
1. **Source Serif 4** (Adobe / Google Fonts) — closest free equivalent to Tiempos
2. **Cormorant Garamond** (Google Fonts) — more delicate, romantic, slightly more "spiritual"
3. **GT Sectra** if you have a license — beautiful but paid

**Avoid**: Playfair Display. It's overused and reads as "wedding website".

#### Body — humanist sans-serif

Use for body copy, UI, navigation, meta.

**Recommended primary**: **Söhne** (paid, Klim) — same foundry as Tiempos, designed to pair.

**Free alternatives**:
1. **Inter** (free, Rasmus Andersson) — neutral, technical, reads modern
2. **Manrope** (free, Google Fonts) — slightly warmer than Inter, good alternative

#### Meta / Numerals — monospace (optional)

Use for countdown timer numerals, prices, code-like UI elements.

**Recommended**: **JetBrains Mono** (free) or **IBM Plex Mono** (free).

### Type scale

Build these as Figma text styles.

| Style | Font | Size (desktop) | Size (mobile) | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|---|
| `display/hero` | Display serif | 80px | 48px | 400 | 1.05 | -2% |
| `display/section` | Display serif | 56px | 36px | 400 | 1.1 | -1.5% |
| `display/sub` | Display serif | 40px | 28px | 400 | 1.15 | -1% |
| `heading/h1` | Display serif | 48px | 32px | 400 | 1.15 | -1% |
| `heading/h2` | Display serif | 36px | 26px | 400 | 1.2 | -0.5% |
| `heading/h3` | Body sans | 24px | 20px | 600 | 1.3 | 0 |
| `heading/h4` | Body sans | 18px | 16px | 600 | 1.4 | 0 |
| `body/lg` | Body sans | 20px | 18px | 400 | 1.55 | 0 |
| `body/md` | Body sans | 17px | 16px | 400 | 1.6 | 0 |
| `body/sm` | Body sans | 15px | 14px | 400 | 1.6 | 0 |
| `body/xs` | Body sans | 13px | 12px | 400 | 1.5 | 0 |
| `eyebrow` | Body sans | 13px | 12px | 600 | 1.4 | +8% (uppercase) |
| `pull-quote` | Display serif | 32px | 24px | 400 *italic* | 1.35 | -0.5% |
| `meta` | Body sans | 14px | 13px | 500 | 1.4 | 0 |
| `numerals` | Mono (optional) | 32px | 24px | 500 | 1 | 0 |

### Type pairings & rules

- **Pull-quotes use display serif italic.** It's the cinematic move — turns a quote into a moment.
- **Section headings use display serif.** Body sans is for body, UI, and small meta only.
- **Eyebrows are uppercase, letter-spaced.** Use them sparingly — once per major section at most.
- **Bold benefit words in body copy** by switching to weight 600 inside running paragraphs (not bold-italic, not all-caps).

---

## 3. Spacing & layout

### Spacing scale (multiples of 4)

| Token | Value | Use |
|---|---|---|
| `space/0` | 0 |  |
| `space/1` | 4px | Hairline |
| `space/2` | 8px | Tight pairs |
| `space/3` | 12px | Inline gaps |
| `space/4` | 16px | Default small |
| `space/5` | 24px | Default medium |
| `space/6` | 32px | Component internal |
| `space/7` | 48px | Component-to-component |
| `space/8` | 64px | Subsection |
| `space/9` | 96px | Section padding (mobile) |
| `space/10` | 128px | Section padding (desktop) |
| `space/11` | 160px | Hero / hero-adjacent generous breathing room |

### Section vertical rhythm

- **Section padding desktop**: top and bottom `space/10` (128px).
- **Section padding mobile**: top and bottom `space/9` (96px).
- **Hero**: top `space/11` (160px), bottom `space/10` (128px).
- **Inside a section**: components use `space/7` (48px) between siblings.
- **Inside a component**: subgroups use `space/5` (24px); related elements use `space/4` (16px).

This gives the page a **cinematic generous rhythm** — never cramped.

### Grid

- **Desktop**: 12-column, `1280px` content max-width, `120px` gutter from viewport edge, `24px` column gap.
- **Tablet**: 8-column, `100%` width with `48px` side padding, `20px` column gap.
- **Mobile**: 4-column, `100%` width with `24px` side padding, `16px` column gap.

Build these as Figma layout grids on the page-level frames.

### Border radius scale

| Token | Value | Use |
|---|---|---|
| `radius/none` | 0 | Sharp containers, FTC, footers |
| `radius/sm` | 4px | Small UI elements |
| `radius/md` | 8px | Buttons, inputs |
| `radius/lg` | 16px | Cards |
| `radius/xl` | 24px | Featured cards, hero CTAs |
| `radius/full` | 9999px | Pills, avatars, eyebrow tags |

**Rule**: The default for most elements is `radius/md`. Generous radius is reserved for accents — over-rounded UI reads as cute, not cinematic.

### Shadow scale

Use very sparingly. Cinematic depth comes from photographic backdrops, not box-shadow.

| Token | Value |
|---|---|
| `shadow/sm` | `0 1px 2px rgba(15, 14, 12, 0.05)` |
| `shadow/md` | `0 4px 12px rgba(15, 14, 12, 0.08)` |
| `shadow/lg` | `0 12px 32px rgba(15, 14, 12, 0.12)` |
| `shadow/inset` | `inset 0 1px 2px rgba(15, 14, 12, 0.06)` |

**Default for cards is no shadow** — use `border/subtle` instead. Reserve shadows for hover states and floating elements (sticky bar, modals).

---

## 4. Iconography

- **Style**: Line-style, 1.5px stroke weight, rounded line caps, 24×24 viewbox.
- **Library to start from**: [Phosphor Icons](https://phosphoricons.com/) (`Regular` weight) — extensive, free, MIT license, has spiritual/wellness icons (compass, infinity, sun, moon, sparkle, eye, leaf, drop, wave) without being kitsch.
- **Custom icons**: For desired-state outcomes specifically, draw 6 custom icons that match the host's transformation language. Custom icons are a senior-designer signal.

**Sizes**:
- `icon/xs`: 16px (inline with body text)
- `icon/sm`: 20px (in lists, secondary)
- `icon/md`: 24px (default)
- `icon/lg`: 32px (outcome list items, Edward style)
- `icon/xl`: 64px (full-width icon grid, alternate outcomes)

**Color**: `text/primary` by default. `accent/primary` for emphasis. NEVER multi-color.

---

## 5. Imagery direction

This is what gives the template its cinematic quality. Document these rules on a Figma "Imagery" reference page.

### Photography
- **Atmospheric** over portrait. Landscapes, light through trees, water surfaces, fog, dawn light, abstract textures.
- **Desaturated** by ~15%. Lower-contrast, painterly. NOT high-saturation Instagram look.
- **Warm-bias** color grade. Slightly orange/gold rather than blue/cool.
- **No people in stock-photo arrangements.** People appear only in the Bio section, and only the host themselves (real, well-shot portrait).

### What to avoid (the "spiritual marketing" cliché trap)
- ❌ Lens flares
- ❌ Mandala / sacred-geometry overlays
- ❌ Crystal photography
- ❌ Stock photos of women meditating in white clothing
- ❌ Purple/galaxy gradients
- ❌ Glowing orbs / chakra colors
- ❌ Pastel sunset gradients

### What to use
- ✅ Mountain ridge silhouettes
- ✅ Ocean horizon at dawn / dusk
- ✅ Forest light
- ✅ Stone, water, smoke textures
- ✅ Single subject in landscape (small human figure in vast landscape — cinematic scale)
- ✅ Abstract texture overlays (paper grain, subtle film grain)

### Image treatments
- All hero/feature images get a subtle **film grain overlay** (`opacity 8%`). This is a signature cinematic move.
- Dark sections get a subtle **vignette** to deepen the cinematic feel.
- Apply consistently — document the treatment as a Figma component.

---

## 6. Motion (for Figma prototype hand-off)

When the file goes to development, motion specs travel with it. Document these in a Motion page in Figma.

- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (smooth ease-in-out) for most. `cubic-bezier(0.16, 1, 0.3, 1)` (cinematic ease-out) for hero entrances.
- **Durations**: `200ms` micro-interactions, `400ms` section reveals, `600ms` hero entrance, `800ms` hero photographic fade.
- **Patterns**:
  - Section reveal on scroll: 24px `translateY` + opacity, 400ms.
  - Hero text: stagger by 100ms across eyebrow → title → subtitle → meta → CTA.
  - Sticky bar entrance: slide in from top, 300ms.
  - Carousel: smooth scroll, 600ms with cinematic easing.
- **No bouncy / springy motion.** Cinematic = smooth, weighted, intentional.

---

## 7. Modes — practical setup in Figma

In Figma, set up your Variable Collections like this:

### Color collection
- 3 modes: `Light`, `Dark`, `Brand`
- All color tokens vary by mode

### Typography collection
- 1 mode initially (`Default`)
- If you want light/dark type-weight shifts (sometimes display serif at lighter weight on dark bg), add modes later

### Spacing collection
- 1 mode (spacing doesn't vary)

### Page-level mode binding
- Assign a Mode to each top-level page frame.
- Default: most sections in `Light`, the Hero in `Dark`, and Encouragement CTAs alternate.
- Document which sections use which mode on the design system page in Figma.

---

## 8. Brand customisation guide (for clients)

When handing the template to a client, this is the customisation surface they get:

1. **Swap the brand mode color values** — `accent/primary`, `accent/secondary`, `accent/tertiary`. Everything else recolors automatically.
2. **Replace the host portrait** in the Bio section.
3. **Replace 4–8 "As Seen On" logos**.
4. **Replace hero atmospheric image** (must follow imagery direction rules — provide examples).
5. **Replace 6 custom outcome icons** with their custom set OR use the default set provided.
6. **Fill content slots** in every section (no structural changes permitted).

That's it. Six dimensions of customisation. Anything else is out of scope and routes back to ZIVA.
