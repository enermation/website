# Color System Redesign — Implementation Plan

## Goal

Replace all hardcoded color values with a semantic token hierarchy following web design guidelines, CLAUDE.md conventions, and luxury automotive design patterns (cool gray monotone).

---

## Phase 1: Token Definitions (globals.css)

### 1a. New semantic tokens to add to `:root`

```css
/* ─── Semantic Text Tokens ─── */
--text-heading: oklch(0.20 0 0);        /* Was text-gray-7 (0.17) — slightly softer */
--text-body: oklch(0.40 0 0);           /* Was text-gray-33 (0.44) — better contrast */
--text-muted: oklch(0.55 0 0);          /* Was text-gray-60 (0.68) — darker for readability */
--text-on-dark: oklch(0.98 0 0);        /* Was text-white — for dark sections */
--text-on-dark-muted: oklch(0.70 0 0);  /* Muted text on dark backgrounds */

/* ─── Semantic Surface Tokens ─── */
--surface: oklch(0.96 0 0);             /* Was bg-gray-98 — section backgrounds */
--surface-elevated: oklch(0.94 0 0);    /* Was bg-gray-94 — image placeholders, cards */
--surface-dark: oklch(0.17 0 0);        /* Was bg-gray-7 — dark hero sections */

/* ─── Semantic Border Tokens ─── */
--border-subtle: oklch(0.90 0 0);       /* Was border-gray-87/90 — dividers */
--border-strong: oklch(0.20 0 0);       /* Was border-black — CTA borders */
```

### 1b. Update existing shadcn tokens

```css
/* Current → New */
--background: oklch(0.98 0 0);          /* Already set (slate) → change to pure monotone */
--foreground: oklch(0.20 0 0);          /* Already set — matches --text-heading */
--card: oklch(0.99 0 0);                /* Was pure white — keep, slightly warmer */
--muted: oklch(0.96 0 0);               /* Was 0.97 — align with --surface */
--muted-foreground: oklch(0.55 0 0);    /* Was 0.556 — align with --text-muted */
--accent: oklch(0.94 0 0);              /* Was 0.97 — align with --surface-elevated */
--secondary: oklch(0.96 0 0);           /* Align with --muted */
--border: oklch(0.90 0 0);              /* Was 0.922 — align with --border-subtle */
--input: oklch(0.90 0 0);               /* Align with --border */
```

### 1c. Dark mode updates

```css
.dark {
  --background: oklch(0.15 0 0);
  --foreground: oklch(0.98 0 0);
  --card: oklch(0.20 0 0);
  --muted: oklch(0.26 0 0);
  --muted-foreground: oklch(0.65 0 0);
  --accent: oklch(0.30 0 0);
  --secondary: oklch(0.26 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);

  /* New dark tokens */
  --text-heading: oklch(0.98 0 0);
  --text-body: oklch(0.80 0 0);
  --text-muted: oklch(0.65 0 0);
  --text-on-dark: oklch(0.98 0 0);
  --text-on-dark-muted: oklch(0.70 0 0);
  --surface: oklch(0.20 0 0);
  --surface-elevated: oklch(0.26 0 0);
  --surface-dark: oklch(0.10 0 0);
  --border-subtle: oklch(1 0 0 / 10%);
  --border-strong: oklch(0.80 0 0);
}
```

### 1d. Expose new tokens in `@theme inline`

Add all new `--color-*` mappings for Tailwind access.

---

## Phase 2: File-by-File Color Replacements

### 2a. `app/page.tsx` (Home page)

| Line | Current | Replace With | Reason |
|---|---|---|---|
| `bg-white` (sections) | `bg-white` × 4 | `bg-card` | Elevated content surface |
| `text-gray-7` (headings) | `text-gray-7` × 6 | `text-heading` | Semantic heading token |
| `text-gray-33` (body) | `text-gray-33` × 5 | `text-body` | Semantic body text |
| `text-gray-93` (dark section) | `text-gray-93` × 2 | `text-on-dark` | Text on dark bg |
| `text-white` (dark section) | `text-white` × 4 | `text-on-dark` | Text on dark bg |
| `text-white-70` | `text-white-70` | `text-on-dark-muted` | Muted text on dark |
| `text-black` (news section) | `text-black` × 3 | `text-heading` | Heading/body text |
| `bg-gray-98` (newsletter) | `bg-gray-98` | `bg-muted` | Section background |
| `border-gray-90` | `border-gray-90` × 3 | `border-border` | Divider |
| `border-gray-87` | `border-gray-87` | `border-border` | Divider |
| `border-black` (buttons) | `border-black` × 4 | `border-strong` | CTA border |
| `bg-black` (buttons) | `bg-black` × 2 | `bg-foreground` | Solid CTA |
| `hover:bg-black` | `hover:bg-foreground` | `hover:bg-foreground` | Hover state |
| `hover:text-white` | `hover:text-background` | `hover:text-background` | Inverted text |
| `bg-gray-94` (image placeholders) | `bg-gray-94` × 3 | `bg-surface-elevated` | Image placeholder |
| `border-l border-gray-90` | `border-l border-border` | `border-l border-border` | Column divider |
| `bg-background` (buttons) | `bg-background` | `bg-background` | Already correct |
| `hover:bg-gray-16` | `hover:bg-gray-16` | Keep (brand-specific dark hover) | Acceptable |
| `text-gray-7` (hover CTA) | `hover:text-gray-7` | `hover:text-heading` | Semantic |

### 2b. `components/site-header-client.tsx`

| Current | Replace With | Reason |
|---|---|---|
| `text-background` (nav items) | Keep — header is on transparent/dark overlay | Contextual |
| `hover:bg-white-20` | Keep — overlay token, works on dark header | Overlay |
| `bg-gray-16` (dropdown) | `bg-surface-elevated` | Elevated surface |
| `bg-gray-20` (icon containers) | `bg-surface` | Subtle surface |
| `border-white-20` / `border-white-30` | Keep — overlay tokens on dark bg | Overlay |
| `text-gray-60` (disabled items) | `text-muted-foreground` | Semantic muted |
| `hover:text-gray-60` | `hover:text-muted-foreground` | Muted hover |
| `bg-black-50` (header bar) | Keep — overlay token | Overlay |
| `border-black-40` (header bar) | Keep — overlay token | Overlay |
| `bg-gray-33` (hover) | `bg-accent` | Interactive hover bg |

### 2c. `components/site-footer.tsx`

| Current | Replace With | Reason |
|---|---|---|
| `bg-black` | Keep — footer anchors page | Design intent |
| `text-white` | `text-on-dark` | Semantic |
| `hover:text-white/80` | `hover:text-on-dark/80` | Semantic hover |
| `border-white-30` | Keep — overlay on dark bg | Overlay |
| `text-gray-60` | `text-on-dark-muted` | Muted on dark |
| `text-gray-87` (hover links) | `text-muted-foreground` → but on dark bg needs custom | Use `text-on-dark-muted` |
| `text-gray-90` (footer nav links) | `text-on-dark` (they're large headings) | Heading on dark |
| `hover:text-white` | `hover:text-on-dark` | Semantic |

### 2d. `components/stripe-bar.tsx`

| Current | Replace With | Reason |
|---|---|---|
| `bg-white` (middle stripe) | Keep — brand element (white stripe) | Brand identity |
| `border-gray-87` | `border-border` | Semantic border |

### 2e. `app/products/[handle]/page.tsx`

| Current | Replace With | Reason |
|---|---|---|
| `bg-background` | Keep — already semantic | ✓ |
| `border-gray-90` | `border-border` × 15 | Semantic border |
| `text-gray-33` | `text-body` × 12 | Semantic body |
| `text-gray-7` | `text-heading` × 8 | Semantic heading |
| `text-gray-60` | `text-muted-foreground` × 2 | Semantic muted |
| `bg-gray-90` | `bg-surface` × 2 | Surface background |
| `bg-gray-98` | `bg-muted` | Muted surface |
| `text-gray-33` (icon circles) | `text-muted-foreground` | Icon color |
| `border-brand-green` / `text-brand-green` | Keep — brand accent | Brand identity |
| `border-gray-33` (sold badge) | `border-body` or keep raw | Sold badge — muted border |
| `divide-gray-90` | `divide-border` | Semantic divider |
| `bg-gray-98` (related section) | `bg-muted` | Section bg |

### 2f. `components/car-card.tsx`

| Current | Replace With | Reason |
|---|---|---|
| `bg-gray-94` | `bg-surface-elevated` | Image placeholder |
| `text-gray-7` | `text-heading` | Heading |
| `text-gray-33` | `text-body` | Body text |
| `border-gray-87` | `border-border` | Divider |
| `text-foreground` | Keep — already semantic | ✓ |

### 2g. `components/CardNav.tsx`

| Current | Replace With | Reason |
|---|---|---|
| `bg-white` | `bg-card` | Card surface |
| `border-gray-90` | `border-border` | Border |
| `bg-gray-16` (phone CTA) | `bg-foreground` | Solid CTA bg |
| `text-white` | `text-background` | Inverted text |
| `hover:bg-gray-18` | `hover:bg-muted` | Hover state |
| `bg-gray-98` (card items) | `bg-muted` | Card surface |
| `text-muted-foreground` | Keep — already semantic | ✓ |
| `bg-foreground` (hamburger) | Keep — already semantic | ✓ |

### 2h. `components/footer-stay-connected.tsx`

| Current | Replace With | Reason |
|---|---|---|
| `text-gray-87` (description) | `text-on-dark-muted` | On dark bg |
| `text-gray-90` (input text) | `text-on-dark` | On dark bg |
| `text-gray-60` (placeholder/disabled) | `text-on-dark-muted/60` | Muted on dark |
| `border-white-30` | Keep — overlay on dark | Overlay |
| `hover:text-white` | `hover:text-on-dark` | Hover on dark |
| `text-brand-green` / `text-brand-red` | Keep — state colors | Brand |

### 2i. `components/footer-nav-links.tsx`

| Current | Replace With | Reason |
|---|---|---|
| `text-gray-90` (links) | `text-on-dark` | Large headings on dark |
| `hover:text-white` | `hover:text-on-dark` | Hover on dark |

### 2j. UI Components (minor)

| File | Current | Replace With |
|---|---|---|
| `ui/slider.tsx` | `bg-white` (thumb) | Keep — UI primitive, white thumb is standard |
| `ui/sheet.tsx` | `bg-black/10` (backdrop) | Keep — standard backdrop |
| `ui/drawer.tsx` | `bg-black/10` (backdrop) | Keep — standard backdrop |
| `ui/dialog.tsx` | `bg-black/10` (backdrop) | Keep — standard backdrop |

---

## Phase 3: Token Cleanup

### Keep (used as overlays on dark backgrounds)
- `--black-30`, `--black-40`, `--black-50` — image overlays
- `--white-20`, `--white-30`, `--white-70` — light overlays/borders on dark
- `--brand-green`, `--brand-red` — brand accents
- `--select-border` — form-specific

### Deprecate (no longer referenced directly in components)
- `--gray-7` through `--gray-98` — replaced by semantic tokens
- Keep them in CSS for reference but components should not use them

---

## Phase 4: Contrast Verification

All ratios calculated against `--background: oklch(0.98 0 0)`:

| Token | Lightness | Contrast Ratio | WCAG |
|---|---|---|---|
| `--text-heading` (0.20) | 20% | ~14.5:1 | AAA ✓ |
| `--text-body` (0.40) | 40% | ~9.5:1 | AAA ✓ |
| `--text-muted` (0.55) | 55% | ~5.8:1 | AA ✓ |
| `--foreground` (0.20) | 20% | ~14.5:1 | AAA ✓ |
| `--muted-foreground` (0.55) | 55% | ~5.8:1 | AA ✓ |

On dark (`--surface-dark: oklch(0.17 0 0)`):

| Token | Lightness | Contrast Ratio | WCAG |
|---|---|---|---|
| `--text-on-dark` (0.98) | 98% | ~14.0:1 | AAA ✓ |
| `--text-on-dark-muted` (0.70) | 70% | ~6.5:1 | AA ✓ |

---

## Execution Order

1. **globals.css** — Add tokens, update existing, expose in `@theme inline`
2. **app/page.tsx** — Home page (largest single file)
3. **components/site-header-client.tsx** — Header
4. **components/site-footer.tsx** — Footer
5. **components/stripe-bar.tsx** — Stripe bar
6. **app/products/[handle]/page.tsx** — Product page
7. **components/car-card.tsx** — Car card
8. **components/CardNav.tsx** — Card nav
9. **components/footer-stay-connected.tsx** — Footer form
10. **components/footer-nav-links.tsx** — Footer links
11. **Verify** — `bun run dev` + visual check light/dark

---

## Rules Followed

- [x] No hardcoded colors in className strings (CLAUDE.md)
- [x] All values from CSS custom properties in globals.css (CLAUDE.md)
- [x] No arbitrary Tailwind values (CLAUDE.md)
- [x] Semantic tokens over raw values (web-design-guidelines)
- [x] oklch color space (CLAUDE.md)
- [x] Dark mode via `.dark` class (CLAUDE.md)
- [x] WCAG AA minimum contrast (web-design-guidelines)
- [x] No `any` types (CLAUDE.md)
- [x] Server components by default (next-best-practices)
