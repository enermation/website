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
