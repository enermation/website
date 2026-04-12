# Instagram Feed — Behold JSON Feed Integration

## Context
Replace the static Instagram grid on the homepage (`web/app/page.tsx:331-360`) with a live feed
from Behold's JSON API. Uses Behold Starter plan ($10/mo). Behold handles Instagram OAuth and
token refresh — we own the UI entirely via their JSON feed endpoint.

**Feed endpoint:** `https://feeds.behold.so/{BEHOLD_FEED_ID}`
**Docs:** https://behold.so/docs/react/ | https://behold.so/docs/widget/
**Type package:** `@behold/types`

## Prerequisites (manual — do before coding)
- [ ] Create account at behold.so (upgrade to Starter for hourly updates + no branding)
- [ ] Connect the Enermation Instagram account as a source
- [ ] Create a feed, copy the feed ID
- [ ] Add `BEHOLD_FEED_ID=<your_feed_id>` to `web/.env.local`

## A. Install types package
- [ ] `bun add -D @behold/types` in `web/`

## B. Add env var typing
- [ ] Add `BEHOLD_FEED_ID` to `web/lib/env.ts` (or wherever env vars are typed/validated)
  — if no such file exists, just use `process.env.BEHOLD_FEED_ID` with a non-null assertion and a
  startup check in the fetch function

## C. Create server-side fetch utility
- [ ] Create `web/lib/instagram.ts`:
  - Export `getInstagramPosts()` async function
  - Fetches `https://feeds.behold.so/${process.env.BEHOLD_FEED_ID}`
  - Uses `next` fetch options: `{ next: { revalidate: 3600 } }` (1-hour cache)
  - Returns typed array using `@behold/types` (`BeholdPost[]`)
  - Throws clearly if `BEHOLD_FEED_ID` is not set (fail fast at startup, not silently)
  - Falls back to empty array `[]` on fetch error (so page doesn't crash if Behold is down)

## D. Update homepage
- [ ] In `web/app/page.tsx`:
  - Add `getInstagramPosts()` call to the existing `Promise.all` at the top of `Home()`
  - Replace `instagramPosts.map(...)` grid (lines ~344-358) with live `posts.map(...)` using
    `post.mediaUrl` (image) and `post.permalink` (link to post on Instagram)
  - Wrap each grid cell in `<a href={post.permalink} target="_blank" rel="noopener noreferrer">`
    so cells are clickable (currently static images are not linked)
  - Keep exact same grid layout: `grid grid-cols-3 md:grid-cols-4 gap-px`
  - Keep `next/image` with `fill` + `object-cover` — add `cdn.behold.so` to allowed domains
  - Handle empty array gracefully (hide the section or show nothing — don't crash)

## E. Update Next.js image domains
- [ ] In `web/next.config.ts`, add `cdn.behold.so` (and any other Behold CDN domains) to
  `images.remotePatterns`

## F. Clean up static data
- [ ] Remove `instagramPosts` export and `InstagramPost` type from `web/lib/data.ts`
- [ ] Remove static images from `web/public/images/instagram/` (optional — keep if used elsewhere)
- [ ] Remove `instagramPosts` import from `web/app/page.tsx`

## G. Validation
- [ ] `bun run lint` — no errors
- [ ] `bun run build` — no errors
- [ ] Start dev server, confirm grid renders live posts
- [ ] Confirm clicking a post opens the Instagram permalink
- [ ] Confirm page does not crash when `BEHOLD_FEED_ID` is missing (should fail fast with a clear error)
- [ ] Check `next/image` has no domain warnings in console

## Review Notes (fill after implementation)
- [ ] Files changed
- [ ] Behold CDN domain(s) confirmed
- [ ] Any post field name corrections (verify against actual API response shape)
