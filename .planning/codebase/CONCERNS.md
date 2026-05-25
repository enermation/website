---
name: concerns
description: Technical concerns and potential issues in the Enermation codebase
metadata:
  type: codebase
---

# Codebase Concerns

**Analysis Date:** 2026-05-25

## Critical Issues

### RAG Chat Route - Swallowed Exceptions in `onError` Callbacks

**File:** `web/app/api/rag/chat/route.ts`

The `streamText` `onError` callback and `toUIMessageStreamResponse` `onError` callback only log errors without re-throwing or returning an error response. This means errors during streaming are invisible to the caller.

```typescript
// Lines 163-165
onError({ error }) {
  console.error('[rag/chat] streamText error:', error)
  // Error is logged but not surfaced to client
},

// Lines 169-171
onError(error) {
  console.error('[rag/chat] stream response error:', error)
  return 'Something went wrong while generating the response.'
  // Returns string, not a Response object
},
```

**Impact:** Streaming failures result in generic error messages or silent failure. The client receives no actionable error details.

### Cart/Wishlist Context - Silent Exception Swallowing

**Files:** `web/lib/cart-context.tsx`, `web/lib/wishlist-context.tsx`

Both contexts have catch blocks that swallow exceptions without any user feedback or error state.

```typescript
// cart-context.tsx lines 194-197
} catch {
  // Silent swallow - no error state set, no user notification
} finally {
  setIsUpdating(false)
}
```

```typescript
// cart-context.tsx lines 232-235
} catch {
} finally {
  setIsUpdating(false)
}
```

**Impact:** Operations like `addToCart`, `removeLine`, `updateLine`, and wishlist operations can fail silently. The UI continues as if the operation succeeded, leaving the user unaware.

### Wishlist `moveToCart` - Non-Atomic Operation Risk

**File:** `web/lib/wishlist-context.tsx` (lines 155-169)

```typescript
const moveToCart = useCallback(async (lineId: string) => {
  // ...
  const result = await removeWishlistLinesAction(cartId, [lineId])
  // If add to cart fails here, item is removed from wishlist but not in cart
  if (result.cart) {
    setLines(mapWishlistLines(result.cart.lines.edges))
  }
  // No add to cart action - moveToCart only removes from wishlist
```

The function removes from wishlist but does not add to cart. If the removal succeeds but caller expectation was atomic, items are lost. Also, the `moveAllToCart` function at line 172 has the same issue - it only removes, never adds.

**Impact:** Items can be removed from wishlist without appearing in cart.

## High Priority

### `'use cache'` Functions Returning `null` / Empty Arrays

**File:** `web/lib/shopify.ts`

Several cached functions return `null` or `[]` on error conditions, which violates the project rule that persistent caches should only contain real data. Empty values cached on failure get served to subsequent requests until TTL expires.

- Line 152: `if (gids.length === 0) return null` (inside `resolveMetaobjectLabel`)
- Line 161: `if (gids.length === 0) return []` (inside `resolveAllMetaobjectLabels`)
- Line 199: `if (!value) return null` (inside `resolveVehicleMetafields`)
- Line 704: `if (!query.trim()) return []` (searchProducts - no cache, fine)

The `resolveVehicleMetafields` at line 178 is cached and could cache a null state if metaobject resolution partially fails.

**Impact:** Persistent cache poisoning - cached `null` or empty arrays served until TTL expires.

### Duplicate Collection Product Fetch

**File:** `web/lib/shopify.ts` (lines 501-518)

```typescript
// Correct price scale: Admin API returns amounts in cents (dollars x 100),
// Storefront API returns them in dollars.
const storefrontCollection = await fetchCollectionProducts(handle, {
  sortKey: options?.sortKey ?? 'CREATED',
  reverse: options?.reverse ?? true,
  first: options?.first ?? 250,
}).catch(() => null)
```

Every call to `fetchCollectionProductsAdmin` makes a second uncached Storefront API call to correct pricing. If this function is called frequently (e.g., by ISR with short cacheLife), the uncached fallback runs every time.

**Impact:** Uncached secondary API call on every request adds latency and API rate pressure.

### Shopify Webhook HMAC Validation - No Empty Body Guard

**File:** `web/app/api/shopify-webhook/route.ts` (lines 34, 86-92)

```typescript
const expectedHmac = await computeHmac(body, process.env.SHOPIFY_WEBHOOK_SECRET)
// ...
if (!adminUrl || typeof adminUrl !== 'string') return null
if (!secret) return null
```

The HMAC computation at line 34 receives `body` (a ReadableStream), but if the body is empty or the HMAC validation fails silently, the route continues. The secret check at line 92 would return `null` but no HTTP error response.

**Impact:** Invalid or missing HMAC could be silently ignored if body is empty. No 401/403 response returned for auth failures.

## Medium Priority

### Unimplemented Email Subscription

**File:** `web/app/actions/subscribe.ts` (line 18)

```typescript
// TODO: connect to email provider (Klaviyo, Mailchimp, etc.)
return { success: false, message: 'Email subscription is not yet available' }
```

Email subscription is a stub. The form accepts emails but never persists them.

**Impact:** User-submitted emails are discarded with a generic message.

### RAG Vision Errors Return 500 Without Retry

**File:** `web/app/api/rag/chat/route.ts` (lines 76-82)

```typescript
try {
  retrievalQuery = await describeImagesForRetrieval(imageParts, userText)
} catch (err) {
  const message = err instanceof Error ? err.message : 'Image description failed'
  console.error('[rag/chat] vision error:', err)
  return NextResponse.json({ error: message }, { status: 500 })
}
```

A single vision failure (e.g., transient network issue) immediately returns 500. No retry logic.

**Impact:** Transient failures on image processing cause complete request failure. User sees error instead of text-only fallback.

### Console.error for Expected Operational Errors

**File:** `web/app/api/rag/chat/route.ts`

Errors like vision failures, retrieval failures, and suggestion generation failures are logged at `console.error` level, but these are expected operational conditions, not programming errors.

```typescript
// Lines 80, 90, 127, 164, 170
console.error('[rag/chat] vision error:', err)
console.error('[rag/chat] retrieval error:', err)
console.error('[rag/chat] suggestion generation failed:', err)
```

**Impact:** Log noise, makes it harder to spot real errors in logs. These should be `console.warn` or handled as normal flow.

### RAG Indexer - No Incremental Fetch Optimisation

**File:** `web/lib/rag/indexer.ts` (lines 267-287)

`fetchAllShopifyProducts` fetches all products with pagination (100 per page) every time, even for `reindexHandles`. The `reindexHandles` function at line 318 fetches all products, filters to matching handles, then discards the rest.

```typescript
const allProducts = await fetchAllShopifyProducts()
const matchingProducts = allProducts.filter(p => handleSet.has(p.handle))
```

**Impact:** Wasted API calls and memory when reindexing a small number of handles. For large catalogs, this is O(n) unnecessary work.

### Wishlist/Cart CartId in localStorage - No Integrity Check

**Files:** `web/lib/cart-context.tsx`, `web/lib/wishlist-context.tsx`

Cart IDs stored in localStorage have no signature or version check. If localStorage is corrupted or manually edited, the app silently fails to load cart.

```typescript
// cart-context.tsx lines 23-26
function getStoredCartId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_ID_STORAGE_KEY)
}
```

**Impact:** Corrupted localStorage causes silent cart/wishlist load failures with no recovery mechanism.

### Metaobject Resolution - Inline GraphQL String Fragments

**File:** `web/lib/shopify.ts` (lines 154, 164)

```typescript
`{ metaobject(id: "${gids[0]}") { id type handle fields { key value } } }`
```

Inline GraphQL fragments instead of using the imported queries. This pattern duplicates query definitions and lacks the validation of imported queries.

**Impact:** Query typos only caught at runtime. Code duplication if similar queries are needed elsewhere.

### Admin API Token Exposure in Server Code

**File:** `web/lib/shopify.ts` (line 33)

```typescript
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? ''
```

Admin API token is used in `adminGraphQL`. If this function is called from a component that should be server-only but accidentally imported client-side, the token could be leaked via network tab.

**Impact:** Security risk if token appears in client bundles. The `createStorefrontApiClient` call at line 104 also exposes env vars to any caller.

### Large Metafield Batches - No Chunking

**File:** `web/lib/shopify.ts` (lines 473-476)

```typescript
const allRawMetafields = await Promise.all(
  productEdges.map(({ node }) => fetchProductMetafieldsAdmin(node.id))
)
```

For collections with many products (e.g., 250 products), this fires 250 parallel Admin API calls. Shopify typically handles this but may rate-limit.

**Impact:** High metafield fetch latency for large collections. Potential rate limiting from Shopify Admin API.

### Search Function Has No Caching

**File:** `web/lib/shopify.ts` (lines 703-721)

```typescript
export async function searchProducts(query: string, first = 10): Promise<SearchResult[]> {
  if (!query.trim()) return []
  // No 'use cache' - always runs live
```

Search always hits the API. High-traffic search usage could hit rate limits.

**Impact:** No caching for repeated or popular queries.

## Low Priority

### RAG Suggestion Generation Failure Silently Falls Back to Empty Array

**File:** `web/app/api/rag/chat/route.ts` (lines 126-129)

```typescript
.catch(err => {
  console.error('[rag/chat] suggestion generation failed:', err)
  return []
})
```

Suggestions failing results in empty array with no user indication. The final metadata at line 175 includes these suggestions regardless.

### Upstash Redis Rate Limit Key - SessionID from Request Body

**File:** `web/app/api/rag/chat/route.ts` (lines 32-36)

```typescript
const { sessionId } = body
const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon'
const key = getRateLimitKey({ sessionId, ip })
```

`sessionId` comes from the request body JSON. If not provided, undefined is passed to rate limiter. The `getRateLimitKey` function is in `lib/rag/ratelimit.ts` - its handling of undefined sessionId is unknown without reading it.

### `fetchBlogByHandle` - Cast to Unknown for Null Description

**File:** `web/lib/shopify.ts` (line 669)

```typescript
description: null as unknown as string | null,
```

This cast is a code smell. If blog description is genuinely null, the type system should handle it more cleanly.

### Error Messages Leaking Internal State

**File:** `web/lib/shopify.ts` (lines 76, 428-429, 469)

```typescript
throw new Error(`Product not found or metafields unavailable: ${productId}`)
throw new Error(`Collection not found: ${handle}`)
throw new Error(`Collection products unavailable: ${handle}`)
```

Error messages include internal IDs and handles. If these errors propagate to client responses, internal system details are exposed.

### Inconsistent Null Handling in Cart Actions

**File:** `web/app/actions/cart.ts`

Some functions like `removeCartLinesAction` and `updateCartLinesAction` return null on error but the catch blocks in the context (cart-context.tsx) silently swallow these failures.

## Performance Considerations

### Qdrant Client Singleton in Serverless

**File:** `web/lib/rag/clients.ts`

If Qdrant client is created as a module-level singleton and the serverless function scales across instances, each instance maintains its own connection pool. In long-running serverless contexts this is fine, but cold start overhead exists.

### RAG Embedding - Sequential Batch Processing

**File:** `web/lib/rag/indexer.ts` (lines 240-261)

Embeddings are generated in one call via `embedDocuments(chunks.map(c => c.text))`, then upserted in batches. If chunks array is very large, the initial embed call could timeout or use significant memory.

### No Connection Pooling Configuration for Shopify Client

**File:** `web/lib/shopify.ts` (lines 104-113)

The Storefront API client is created without explicit connection pooling configuration. High-concurrency scenarios use default settings.

## Test Coverage Gaps

### Untested: Cart/Wishlist Context Error Paths

**Files:** `web/lib/cart-context.tsx`, `web/lib/wishlist-context.tsx`

The catch blocks that silently swallow errors have no test coverage. Failures in `addToCart`, `removeLine`, `updateLine`, and all wishlist operations during error conditions are untested.

### Untested: RAG Chat Route Error Callbacks

**File:** `web/app/api/rag/chat/route.ts`

The `onError` callbacks in `streamText` and `toUIMessageStreamResponse` are not tested. Error behavior during streaming is unknown.

### Untested: Shopify Webhook HMAC Validation

**File:** `web/app/api/shopify-webhook/route.ts`

HMAC validation with empty body, malformed body, or missing secret is not tested.

### Untested: Price Scale Correction Fallback

**File:** `web/lib/shopify.ts` (lines 501-518)

The catch fallback when Storefront price fetch fails is not tested. The code silently continues with incorrect prices if the secondary API call fails.

---

*Concerns audit: 2026-05-25*