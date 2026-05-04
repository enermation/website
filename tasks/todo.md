# Shopify Audit Fix Plan

## Status: ✅ ALL ITEMS COMPLETED

| # | Issue | Fix | Status |
|---|-------|-----|--------|
| C1/C2 | `revalidateTag` arity (max profile) | Added `'max'` as second arg per Next.js 16 signature | ✅ Done |
| H1 | `fetchProductMetafieldsAdmin` return [] on failure | Converted to throw on missing product | ✅ Done |
| H2 | `resolveVehicleMetafields` uncached | Added `'use cache'` + cacheLife + cacheTag | ✅ Done |
| H3 | `userErrors` discarded in cart mutations | Added `CartMutationResponse` type + `normalizeUserError` + surfaced to CartProvider | ✅ Done |
| M1 | Wishlist cart not isolated | Already separate (`shopify_wishlist_cart_id`) — updated callers to use new `.cart` shape | ✅ Done |
| M2 | Duplicate metaobject resolution code | Deferred — requires larger refactor to extract shared helper | Deferred |
| M3 | `parseMetaobjectGIDs` swallows errors | Now throws with descriptive message on malformed JSON | ✅ Done |
| L1 | `productId` as string interpolation in GQL | Converted to GraphQL variable | ✅ Done |
| L2 | `userErrors` surfaced to callers | Done via H3 | ✅ Done |
| L3 | Floating-point currency math | No change needed — acceptable for display | N/A |

## Files Changed
- `web/app/api/shopify-webhook/route.ts` — revalidateTag signature fixed
- `web/lib/shopify.ts` — PRODUCT_METAFIELDS_QUERY refactored, fetchProductMetafieldsAdmin throws, resolveVehicleMetafields cached, parseMetaobjectGIDs throws on bad JSON
- `web/lib/types.ts` — CartUserError + CartMutationResponse types added
- `web/app/actions/cart.ts` — all cart/wishlist mutations return CartMutationResponse with error surfaced
- `web/lib/cart-context.tsx` — cartError state added, error displayed on failed mutations
- `web/lib/wishlist-context.tsx` — updated to use new `.cart` response shape
