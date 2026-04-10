# Product Page — QWEN.md Compliance Fix

## A. Color Token Replacements
- [ ] `page.tsx`: `text-black` → `text-foreground` (~15 instances)
- [ ] `page.tsx`: `bg-white` → `bg-background` (4 instances)
- [ ] `page.tsx`: `border-black` → `border-foreground`, `hover:bg-black` → `hover:bg-foreground`, `hover:text-white` → `hover:text-background`
- [ ] `image-gallery.tsx`: `bg-black/30` → `bg-black-30`, `bg-black/60` → `bg-black-40`

## B. shadcn Button (replace native `<button>`)
- [ ] `enquiry-form.tsx`: native `<button>` → `Button` from `@/components/ui/button`
- [ ] `contact-section.tsx`: native `<button>` → `Button` from `@/components/ui/button`

## C. Extract Shared Components
- [ ] Create `web/components/car-card.tsx` — used in collection page + product page (2+ places)
- [ ] Create `web/components/stripe-bar.tsx` — used in product page + home page
- [ ] Update `web/app/collections/[handle]/page.tsx` — import shared `CarCard`
- [ ] Update `web/app/products/[handle]/page.tsx` — import shared `CarCard` and `StripeBar`
- [ ] Update `web/app/page.tsx` — import shared `StripeBar`

## D. Static Data to `lib/data.ts`
- [ ] Add `productPage` section to `web/lib/data.ts` with typed copy:
  - "Ask a Question", "Contact Agent", "For Sale By", "Listing Details", "About This Listing"
  - "You May Also Like", "Related Stories", "View all stock for sale"
  - "Specialist vehicle export broker", "Specialist dealer"
- [ ] Update `page.tsx` to import and use data from `lib/data.ts`

## E. Bug Fix
- [ ] `page.tsx` CarCard: hardcoded year `"2025"` → remove or derive from product data

## F. Arbitrary Values
- [ ] `image-gallery.tsx`: `h-96` → add token or use standard Tailwind scale
- [ ] `aspect-[3/2]` → keep (standard ratio, no Tailwind default)

## Review
- [ ] Run `bun run lint` — no errors
- [ ] Run `bun run build` — no errors
- [ ] Verify visual parity on dev server

---

# Vev Header Replacement Plan (Pending Approval)

## Problem
Replace the current site header in `web/components/site-header.tsx` with a faithful implementation of the header from `https://www.vev.design/`, using Playwright CLI as the primary source of truth (DOM, attributes, computed styles, interactions), not screenshot-only guessing.

## Tradeoffs + Recommendation (Needs Your Decision)
- [x] **Decision 1: Matching scope** — **Selected:** A (full parity desktop + mobile interactions)
  - **A (Recommended):** Implement full header parity for desktop + mobile nav behavior (layout, links, CTA, menu interactions, sticky behavior if present).
  - B: Implement desktop-first parity now, defer mobile behavior to a second pass.
  - C: Visual-only parity (no interactive parity beyond existing behavior).
  - **Recommendation:** A, because replacing a header without mobile/interaction parity usually creates regressions and rework.
- [x] **Decision 2: Integration strategy** — **Selected:** A (keep `SiteHeader` and refactor internals)
  - **A (Recommended):** Keep `SiteHeader` as the integration point and refactor internals; preserve existing import usage across pages.
  - B: Create a new header component and migrate all page imports in one pass.
  - **Recommendation:** A, because it minimizes blast radius and keeps routing/pages untouched.
- [x] **Decision 3: Data source strategy** — **Selected:** A (move static header data to typed `web/lib/data.ts`)
  - **A (Recommended):** Move all new static header copy/links into typed `web/lib/data.ts` structures.
  - B: Keep a temporary inline structure in component during migration, then extract later.
  - **Recommendation:** A, to stay aligned with project convention and avoid follow-up churn.

## Execution Checklist
- [ ] **Inspect source header with Playwright CLI (desktop + mobile)**
  - Use `playwright-cli snapshot` to enumerate element map and roles.
  - Use `playwright-cli eval` on key nodes to extract ids/classes/data attributes/aria.
  - Use `playwright-cli run-code` to capture computed styles for key elements (height, spacing, typography, colors, borders, z-index, position, transitions).
  - Use `playwright-cli run-code` to verify interaction behavior (menu open/close, hover/focus states, sticky transition, CTA states).
- [ ] **Map current header architecture**
  - Audit `web/components/site-header.tsx`, `web/components/CardNav.tsx`, and related data contracts in `web/lib/data.ts`.
  - Identify reusable primitives from `web/components/ui/*` needed for parity.
- [ ] **Define target contract before edits**
  - Finalize typed data model for links/actions/socials in `web/lib/data.ts`.
  - Confirm server/client boundary for header interactivity.
- [ ] **Implement header replacement**
  - Update `web/components/site-header.tsx` (and only tightly-coupled files as needed).
  - Keep Tailwind/token rules (no arbitrary values, no hardcoded non-token colors).
  - Keep TypeScript strictness (no `any`).
- [ ] **Validation**
  - Run `bun run lint` in `web\`.
  - Run `bun run build` in `web\`.
  - Use Playwright CLI to compare behavior against source for desktop + mobile checkpoints.

## Review Notes (to fill after implementation)
- [ ] Files changed
- [ ] Behavioral diff vs current main
- [ ] Known limitations / intentional deviations
- [ ] Follow-up cleanup tasks
