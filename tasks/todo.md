# Task: Replace Hand-Rolled UI with shadcn/ui Components

## Status: In Progress

## Scope
3 files affected: `web/app/page.tsx`, `web/components/site-header.tsx`, `web/components/site-footer.tsx`

## Component Mapping

| Hand-rolled | Replace With | Notes |
|---|---|---|
| `StripeBar` (3 divs) | `Separator` × 3 with custom colors | Keep tricolor brand identity |
| `CollectionCard` | `Card` + `AspectRatio` | Use Card's built-in image handling |
| CTA `<Link>` buttons | `Button` (asChild) | "View all collections", "Our Story", "Read More", Newsletter CTA |
| Instagram grid `<div>` | `AspectRatio` | Replace `aspect-[3/2]` and `aspect-square` wrappers |
| Social icon `<Link>` wrappers | `Button` (asChild, variant=ghost) | site-header + site-footer + page hero |
| Footer accent bars | `Separator` | Replace `h-0.5 w-10 bg-white/30` |
| Phone CTA button | `Button` | site-header phone link |

## Implementation Order

1. **`page.tsx`** — StripeBar → Separator, CollectionCard → Card, CTA links → Button(asChild), Instagram → AspectRatio
2. **`site-header.tsx`** — Social links → Button(asChild), Phone CTA → Button, Logo stripe → Separator
3. **`site-footer.tsx`** — Accent bars → Separator, Social links → Button(asChild)

## Constraints
- Keep visual parity 1:1 with current design
- Use `asChild` on Button for `<Link>` elements (Next.js routing)
- Maintain all existing hover states, transitions, typography
- No arbitrary Tailwind values
- All colors from CSS custom properties

## Risk
- shadcn Button uses `@base-ui/react` which is client-side — need `asChild` + `"use client"` boundary for components that import it
- Card component has specific internal structure (`CardHeader`, `CardContent`, etc.) — may need custom className overrides to match current design

## Checklist

- [ ] Replace StripeBar with Separator component
- [ ] Replace CollectionCard with Card component
- [ ] Replace CTA buttons with Button component
- [ ] Replace Instagram grid with AspectRatio component
- [ ] Update site-header to use Button component
- [ ] Update site-footer to use Separator and Button components
- [ ] Verify build passes

## Review

_(To be filled after implementation)_
