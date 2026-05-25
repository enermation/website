---
name: isr-caching-audit
description: ISR caching audit findings for Next.js site — gaps and fixes needed
metadata:
  date: 2026-05-25
  type: notes
---

# ISR Caching Audit

**Date:** 2026-05-25
**Topic:** Next.js ISR + CDN caching hardening before scaling

## What We Discussed

- **ISR vs SSR cost**: ISR pages served from Vercel Edge Network (fast, cheap). SSR = cold serverless on every request (slow, expensive). ISR wins for product/collection pages that don't change every second.
- **1-day baseline + Shopify webhook busting**: Pages cached for 86400s. Shopify `products/update` webhook calls `revalidateTag()` to bust cache immediately on product changes.
- **Four pillars**: page revalidate values, `generateStaticParams` for static paths, Cache-Control on API routes, `next/image` CDN config.

## Current State (from codebase audit)

### ✅ Already Working
- `cacheComponents: true` in `next.config.ts` — Next.js 16 cache components enabled
- Custom image loader for Shopify CDN (`cdn.shopify.com`) + `behold.pictures`
- Shopify webhook endpoint exists at `/api/shopify-webhook` with HMAC validation
- Webhook currently calls `revalidateTag('products', 'max')` and `revalidateTag('collections', 'max')`

### ⚠️ Gaps Identified

1. **No `generateStaticParams`** on dynamic routes:
   - `web/app/(main)/products/[handle]/page.tsx` — no `generateStaticParams` export
   - `web/app/collections/[handle]/page.tsx` — no `generateStaticParams` export
   - → Every product/collection page is ISR-on-demand instead of pre-warmed static

2. **No `revalidate` export** on pages — no explicit ISR interval set on any page

3. **Webhook `revalidateTag` bug** — `revalidateTag('products', 'max')` passes two args. `revalidateTag()` only accepts one tag string. `'max'` is silently ignored. Should be `revalidateTag('products', `product-${handle}`)` for per-product invalidation.

4. **`/api/search` has no Cache-Control** — returns JSON with no caching headers. Should be edge-cached with `s-maxage=60, stale-while-revalidate=300`.

5. **`next.config.ts` missing `deviceSizes` and `minimumCacheTTL`** — images served via custom loader but Next.js doesn't know optimal breakpoints for responsive images. Missing `minimumCacheTTL: 86400` for CDN-cached optimized images.

6. **RAG chat API is not cacheable** — correct (personalized streaming responses), no fix needed.

## Implementation Plan

See: `.planning/todos/pending/isr-caching-implementation.md`