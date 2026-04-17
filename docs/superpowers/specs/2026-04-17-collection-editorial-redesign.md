# Collection Page — Editorial Redesign Spec

**Date:** 2026-04-17
**Status:** Approved
**Type:** Visual/Editorial Enhancement

---

## Overview

Three cohesive changes bring the collection page in line with the product page's editorial luxury redesign:

1. **Editorial hero block** — Split image/text panel between the sub-nav and filter bar, with the collection title floating over the atmospheric image
2. **Elevated filter bar** — Desktop filter bar restyled as a rounded card with `surface-elevated` background to match the product page sidebar
3. **Related editorial section** — Below the product grid, an editorial block surfacing curated brand/lifestyle stories

---

## Change 1: Editorial Hero Block

### Layout
- Full-width strip, `min-height: 420px`, **2-column split grid**
- **Left panel (50%):** Shopify collection image, fills panel, `object-fit: cover`. Vertical gradient scrim (transparent → `rgba(0,0,0,0.7)`) from bottom. Title and brand divider bars float over the bottom-left of the image.
- **Right panel (50%):** `surface-dark` background (`#1c1c1c`). Collection description, tagline, vehicle count. Green accent rule top-left corner.

### Typography — Floating Title
- Title: `font-display`, `text-banner` (42.8px equivalent), `uppercase`, `tracking-widest`, white, `font-normal`
- Brand divider bars below title: three bars (green / border-only / brand-red) — same as the existing title section
- Tagline: `font-display`, 26px, `font-normal`, white
- Description: `font-body`, 14px, `text-on-dark-muted`
- "About This Collection" label: `font-heading`, 11px, uppercase, `tracking-widest`, `text-on-dark-muted`
- Vehicle count badge: green accent, 11px uppercase

### Animation
- Title and divider bars fade+translateY in on page load (CSS animation, 0.5s cubic-bezier)
- Editorial text panel has a subtle entrance: opacity 0→1, 400ms, 100ms delay

### Fallbacks
- If `collection.image` is null: left panel shows a dark placeholder using `surface-dark` with the same gradient scrim, title still floats over it
- If `collection.description` is empty or null: right panel shows the collection title as a tagline in larger type instead

### Existing Title Bar — Removed
The standalone `collection-title-in` section (`py-10 bg-background border-b border-border`) is **removed**. Its content (title + divider bars) is now the floating hero overlay. The sub-nav remains.

---

## Change 2: Elevated Filter Bar (Desktop)

### Current State
Horizontal flex row with labels, Selects, and outline Buttons. Plain `bg-background` with bottom `border-b border-border`.

### New State
Same 3-region layout (Make | Sort | Action buttons) but wrapped in a **rounded card** with:
- `bg-surface-elevated` background
- `border border-border`
- `rounded-xl` corners
- `shadow-sm` or `box-shadow` using `--black-10` / `--black-20` tokens
- Internal padding: `px-6 py-5`
- Subtle top border accent: `border-t-2 border-brand-green` (2px brand-green top border)

This matches the product page sidebar card treatment:
```tsx
rounded-2xl border border-border border-t-2 bg-surface-elevated p-6
```

### Mobile
The mobile filter bar (Sheet-based) keeps its existing dark overlay treatment. No changes to mobile.

---

## Change 3: Related Editorial Section

### Placement
Below the product grid, before the site footer. Same section structure as the "Related Stories" section on the product page.

### Content
- **Section heading**: "Editor’s Picks" or "From The Collection" — `font-display`, `text-section`, `uppercase`, `tracking-widest`
- **3-column editorial cards**: Each card has a lifestyle/editorial image, date, category label, and headline
- Data sourced from `relatedStories` in `lib/data.ts` (same pattern as product page — static data, not Shopify-driven)
- Animated section with stagger on scroll (same `AnimatedSection` + `data-reveal` pattern)

### Empty State
If fewer than 3 items in the editorial feed, show only what's available (no placeholder cards).

---

## Component Inventory

### `EditorialHero` (new, server component)
- Props: `{ title, image, description, vehicleCount }`
- Renders the split image/text panel
- Uses `Image` from `next/image` for the collection image
- Falls back gracefully when image or description is absent
- GSAP entrance animation on the title (CSS class `collection-title-in` is removed from `page.tsx` and moved here)

### `CollectionFilterBar` (updated, existing client component)
- Wraps filter controls in elevated card on desktop
- Mobile Sheet unchanged
- No logic changes — only wrapper DOM

### `EditorialFeed` (new, client component)
- Props: `{ stories: RelatedStory[] }`
- Renders 3-column card grid with editorial images
- Uses `AnimatedSection` for scroll stagger
- Same image hover scale effect as product page stories

---

## Data Flow Changes

### 1. Extend `ShopifyCollection` type

**File:** `web/lib/types.ts`

```ts
export type ShopifyCollection = {
  id: string
  handle: string
  title: string
  image: ShopifyImage | null
  description: string | null   // ← NEW
}
```

### 2. Extend `GET_COLLECTIONS` query

**File:** `web/lib/queries.ts`

```graphql
node {
  id
  handle
  title
  image {
    url
    altText
  }
  description           # ← NEW
}
```

### 3. Add `description` to `fetchCollectionProducts` response

The `fetchCollectionProducts` function returns `{ id, title, products }`. It needs to also return `description` from Shopify.

### 4. `lib/data.ts` — Editorial stories

Add a `collectionStories` array to `lib/data.ts`:

```ts
export const collectionStories: RelatedStory[] = [
  { id, title, href, image, date, category },
  // ...
]
```

---

## Design Tokens Used

| Token | Usage |
|---|---|
| `--brand-green` | Accent rules, vehicle count, CTAs |
| `--brand-red` | Divider bar, sold/reserved price |
| `--surface-dark` (`#1c1c1c`) | Editorial text panel background |
| `--text-on-dark-muted` | Body copy in dark panel |
| `--surface-elevated` | Filter bar card background |
| `--border-subtle` | Card borders |

---

## Animation Summary

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Hero title + divider | `collection-title-in` CSS animation | 0.5s | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Editorial text panel | opacity 0→1 | 0.4s, 100ms delay | `ease-out` |
| Filter bar card | opacity 0→1 | 0.3s | `ease-out` |
| Editorial feed cards | `data-reveal` + ScrollTrigger stagger | 0.6s, 0.15s stagger | `power2.out` |

All animations respect `prefers-reduced-motion: reduce`.

---

## Files to Modify

| File | Change |
|---|---|
| `web/lib/types.ts` | Add `description` to `ShopifyCollection` |
| `web/lib/queries.ts` | Add `description` to `GET_COLLECTIONS` and `GET_PRODUCTS_IN_COLLECTION` |
| `web/lib/shopify.ts` | Return `description` from `fetchCollectionProducts` |
| `web/lib/data.ts` | Add `collectionStories` array |
| `web/app/collections/[handle]/page.tsx` | Remove old title section, add `EditorialHero`, add `EditorialFeed`, pass description to server components |
| `web/app/collections/[handle]/filter-bar.tsx` | Wrap desktop filter bar in elevated card |
| `web/components/editorial-hero.tsx` | **New** — split hero server component |
| `web/components/editorial-feed.tsx` | **New** — editorial stories client component |
| `web/app/globals.css` | Add editorial hero entrance animation, filter bar card styles |

---

## Scope Boundary

**In scope:**
- Collection page editorial redesign
- Shopify type/query extensions for `description`
- Editorial stories data and component
- Filter bar elevation

**Out of scope:**
- Any changes to the product page
- Any changes to the Shopify cart/checkout flow
- Adding new Shopify API endpoints
- Dark mode variants of the editorial hero (handled by existing dark mode tokens)
