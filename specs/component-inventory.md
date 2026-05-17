# Component Inventory

Every Figma component you need to build, organised by atomic level. Build in this order: atoms → molecules → organisms. Build each component once, with all variants in a single component set.

**Senior-designer rule applied here**: Don't over-componentise. If something is used once, it doesn't need to be a component. Only the items below are worth componentising.

---

## Atoms

The smallest reusable elements. Build first.

### Button
The most-used component on the page. Get this right and everything else clicks into place.

| Property | Values |
|---|---|
| `variant` | `primary` · `secondary` · `tertiary` · `link` |
| `size` | `sm` · `md` · `lg` · `xl` (xl reserved for hero) |
| `state` | `default` · `hover` · `pressed` · `focus` · `disabled` · `loading` |
| `icon` | `none` · `leading` · `trailing` · `only` |
| `mode` | `light` · `dark` (auto via Variable mode) |

**Slots**: Label text, optional icon.
**Behaviour**: Auto Layout horizontal, internal padding `space/3` / `space/5`, icon-text gap `space/2`, radius `radius/md`, height fixed per size.

### Icon
Single component, exposes the Phosphor icon set. Build with a `name` property bound to a swappable icon library OR import individually.

| Property | Values |
|---|---|
| `name` | `arrow-right`, `check`, `play`, `quote`, `star`, `heart`, `sparkle`, `eye`, `compass`, `infinity`, `sun`, `moon`, `leaf`, `drop`, `wave`, `flame`, `mountain`, `tree`, ...etc |
| `size` | `xs` · `sm` · `md` · `lg` · `xl` |
| `weight` | `regular` · `bold` |

### Badge / Tag
Small inline pill for eyebrows, status indicators, "LIVE ONLINE" label.

| Property | Values |
|---|---|
| `variant` | `solid` · `subtle` · `outline` |
| `tone` | `default` · `accent` · `success` · `warning` |
| `size` | `sm` · `md` |
| `with-dot` | `true` · `false` |

### Eyebrow
A typographic atom. Just a styled text label (not a frame).

- Style: `eyebrow` text style
- Use: section labels, "LIVE ONLINE", "AS SEEN ON"

### Avatar
For testimonial cards (when used) and host portrait composition.

| Property | Values |
|---|---|
| `size` | `sm` (32px) · `md` (48px) · `lg` (64px) · `xl` (96px) |
| `shape` | `circle` · `square` |
| `with-image` | `true` · `false` (initials fallback) |

### Input field
For the hero / encouragement CTA email-capture variant (if used). Even if not currently used, build it — clients ask for it.

| Property | Values |
|---|---|
| `state` | `default` · `focus` · `error` · `disabled` |
| `with-label` | `true` · `false` |
| `with-helper` | `true` · `false` |

### Logo placeholder
A wordmark + symbol composition with editable text and replaceable mark. Used for:
- Site logo (header / footer / sticky bar)
- Brand mark in cover page

Build as a component with: mark slot + wordmark text slot, with horizontal and stacked variants.

### Pull-quote glyph
A typographic decoration (single quote-mark glyph or open-quote glyph) used as ornament above credibility statements. Tiny detail that signals senior craft.

---

## Molecules

Combinations of atoms. Build second.

### Section header
A reusable wrapper that prepends most sections.

**Composition**:
- Optional eyebrow
- Section heading (display serif, h2 or section style)
- Optional subtitle (body lg)

| Property | Values |
|---|---|
| `alignment` | `left` · `center` |
| `with-eyebrow` | `true` · `false` |
| `with-subtitle` | `true` · `false` |

### CTA microcopy + button group
The pair that closes a section's argument.

**Composition**:
- Pull-out emphasized line (display serif sub or pull-quote style)
- Primary button beneath

Used inline within sections (not as the standalone Encouragement CTA section, which has its own component).

### Outcome list item (Edward style)
The most important molecule. Used 6× in the primary outcomes section.

**Composition**:
- Icon (lg, 32px)
- Outcome sentence with **bolded benefit phrase** at start

| Property | Values |
|---|---|
| `icon-position` | `leading` · `top` |

### Audience callout item
**Composition**:
- Subtle leading icon or bullet
- Single sentence with bolded emotional hook word

### Testimonial card
**Composition**:
- Optional headline (heading h3)
- Quote body (body lg, max ~6 lines)
- Author name (heading h4)
- Author location (meta)
- Optional avatar

| Property | Values |
|---|---|
| `with-headline` | `true` · `false` |
| `with-avatar` | `true` · `false` |
| `layout` | `vertical` · `horizontal` |

### FAQ item
**Composition**:
- Question (heading h3, with chevron icon trailing)
- Answer (body md, hidden by default)

| Property | Values |
|---|---|
| `state` | `collapsed` · `expanded` |

### Countdown unit
Reusable digit pair with label.

**Composition**:
- Number (numerals or display sub style)
- Label (body xs, uppercase)

Used 4× in countdown timer (Days · Hours · Mins · Secs).

### Logo wall item
A single grayscale logo slot, with consistent height.

| Property | Values |
|---|---|
| `aspect` | `wide` · `tall` · `square` |

### Footer link
Simple text link with hover state.

### Image with treatment
A wrapper component that applies the cinematic treatment (film grain overlay + optional vignette) to any image.

| Property | Values |
|---|---|
| `treatment` | `none` · `grain` · `grain+vignette` · `vignette` |
| `aspect` | `16:9` · `4:3` · `1:1` · `3:4` |

This is the component you use everywhere instead of raw images. It's the secret weapon for visual consistency.

---

## Organisms (sections)

Each section in `event-landing-page-spec.md` becomes a component. Build third.

| Section | Component name | Variants |
|---|---|---|
| Sticky Bar | `Section/StickyBar` | `desktop` · `mobile`, `with-countdown` · `without-countdown` |
| Hero | `Section/Hero` | `centered` · `split` |
| Credibility Statement | `Section/CredibilityStatement` | `under-hero` · `inline` · `featured`, `with-photo` · `text-only` |
| Video | `Section/Video` | `heading-above` · `heading-beside` |
| As Seen On | `Section/AsSeenOn` | `4-logos` · `6-logos` · `8-logos` |
| Audience Callouts | `Section/AudienceCallouts` | `left-aligned` · `centered` |
| Encouragement CTA | `Section/EncouragementCTA` | `light-bg` · `dark-bg` · `accent-bg` |
| Value Proposition | `Section/ValueProposition` | `image-right` · `image-left` · `with-pull-quote` · `without-pull-quote` |
| Outcomes (primary) | `Section/Outcomes` | `2-column-list` (Edward style) |
| Outcomes (alternate) | `Section/OutcomesGrid` | `full-width-icon-grid` |
| Personal Message | `Section/PersonalMessage` | (single variant) |
| Text Testimonials | `Section/Testimonials` | `with-headlines` · `quotes-only` |
| How It Works | `Section/HowItWorks` | `with-image` · `text-only` |
| Event Overview | `Section/EventOverview` | (single variant) |
| Extra Value Proposition | `Section/ExtraValueProposition` | (single variant) |
| Bio | `Section/Bio` | `image-left` (default) · `image-right` |
| Final Value Proposition | `Section/FinalValueProposition` | (single variant) |
| FAQ | `Section/FAQ` | (single variant) |
| FTC Disclaimer | `Section/FTCDisclaimer` | (single variant) |
| Footer | `Section/Footer` | (single variant) |

**Naming convention**: `Section/[Name]` — slash creates a folder grouping in Figma's component panel. Makes the asset library scannable.

---

## What NOT to componentise

These are sometimes tempting but should be left as plain Auto Layout frames inside their parent component:

- ❌ Section padding wrappers — handle via Auto Layout properties on the section frame
- ❌ Heading + body pairings — too generic, just use text styles
- ❌ One-off decorative elements — only on a single page
- ❌ The page-level frame itself — that's a frame, not a component

---

## Build order (recommended)

This order minimises rework. Don't skip ahead.

1. **Variables** (color modes, type styles, spacing) — `design-system.md`
2. **Atoms** — Button, Icon, Badge, Eyebrow, Avatar
3. **Molecules** — Section header, CTA microcopy group, Outcome item, Testimonial card, FAQ item
4. **Organisms** — Build sections in this order:
   1. Footer (smallest, easiest, gets you a win)
   2. Encouragement CTA (used 5–7× — high leverage)
   3. Credibility Statement (also reused)
   4. FAQ (single instance but easy)
   5. FTC (also easy)
   6. Audience Callouts
   7. Value Proposition (the workhorse layout)
   8. Outcomes (the most important section — invest time here)
   9. Personal Message
   10. Testimonials
   11. How It Works
   12. Event Overview
   13. Extra Value Proposition
   14. Bio
   15. Final Value Proposition
   16. Sticky Bar
   17. Video
   18. As Seen On
   19. **Hero last** — leave it til last, you'll have all the patterns down
5. **Page assembly** — drop all sections into a single Auto Layout vertical frame
6. **Mobile pass** — duplicate the desktop page, swap to mobile variant of every section

---

## Senior-designer details (worth the time)

These small touches separate junior work from senior work. Most take 5 minutes each but compound to enormous effect:

- ✓ Use **descriptive component property names** — `image-position` not `Property 1`
- ✓ Add **descriptions to every component** in Figma's component description field
- ✓ Use the **dot notation for component variants** — `Section/Hero` reads as a hierarchy
- ✓ **Pin a thumbnail** to each component variant (Figma will auto-show it in the asset panel)
- ✓ **Group related variables** with slash notation — `text/primary`, `surface/canvas`
- ✓ Add an **emoji prefix** to top-level pages in the file (📐 Design System, 🧩 Components, 📄 Event Landing — Desktop, 📱 Event Landing — Mobile)
- ✓ Build a **dedicated "Component Showcase" page** showing every component with all variants, captioned. This is a portfolio-level move and takes 30 minutes.
- ✓ Set up **proper layer naming** at least at the section level — `01 — Sticky Bar`, `02 — Hero`, etc.
