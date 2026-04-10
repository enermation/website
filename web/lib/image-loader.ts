/**
 * Global Next.js image loader.
 * - Shopify CDN images: served directly via Shopify's on-the-fly resize API
 *   (?width=N), bypassing the Next.js image proxy entirely.
 * - All other images: routed through the standard Next.js image optimizer.
 *
 * Configured via `images.loaderFile` in next.config.ts.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  if (src.startsWith('https://cdn.shopify.com')) {
    const url = new URL(src)
    url.searchParams.set('width', String(width))
    return url.toString()
  }

  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`
}
