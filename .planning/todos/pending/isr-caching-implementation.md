---
name: isr-caching-implementation
title: ISR Caching Implementation
description: Configure ISR caching: generateStaticParams, revalidate exports, Cache-Control headers, next/image tuning
metadata:
  date: 2026-05-25
  type: todos
  priority: high
---

# ISR Caching Implementation

## Context

Pre-emptive hardening before scaling. 1-day ISR baseline with Shopify webhook busting on product/collection changes. Vercel-hosted Next.js 16.

**Reference:** `.planning/notes/isr-caching-audit.md`

---

## Tasks

- [x] **[product pages] Add `generateStaticParams` export** — Done
- [x] **[collection pages] Add `generateStaticParams` export** — Done
- [x] **[product pages] Add `revalidate = 86400` export** — Done
- [x] **[collection pages] Add `revalidate = 86400` export** — Done
- [x] **[webhook] Fix `revalidateTag` — per-product invalidation** — Done: separate `revalidateTag('products')` + `revalidateTag(`product-${handle}`)` calls
- [x] **[webhook] Add cache tag for collection updates using handle** — Done: `revalidateTag('collections')` + `revalidateTag(`collection-${handle}`)`
- [x] **[search API] Add Cache-Control header** — Done: `s-maxage=60, stale-while-revalidate=300`
- [x] **[next.config.ts] Add `deviceSizes` and `minimumCacheTTL`** — Done: 8 breakpoints + 86400s TTL

---

## Verification

After implementing:
1. Deploy to Vercel preview
2. Check in Vercel dashboard: product pages show `ISR` not `SSG` or `SSR`
3. Trigger a Shopify product update webhook → verify cache busts for that product only
4. Check response headers on `/api/search?q=X` — should show `X-SCache: HIT` or similar
5. Test image loading in DevTools → network should show appropriately-sized images per breakpoint