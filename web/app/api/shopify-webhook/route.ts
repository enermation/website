import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

/**
 * Shopify webhook handler for cache invalidation.
 *
 * Configure these webhooks in Shopify Admin → Settings → Notifications → Webhooks:
 *   - products/create   → POST /api/shopify-webhook
 *   - products/update   → POST /api/shopify-webhook
 *   - products/delete   → POST /api/shopify-webhook
 *   - collections/create → POST /api/shopify-webhook
 *   - collections/update → POST /api/shopify-webhook
 *   - collections/delete → POST /api/shopify-webhook
 *
 * Aligns with next-cache-components: uses revalidateTag() for background
 * revalidation so the next request sees fresh data.
 */
export async function POST(request: Request) {
  const topic = request.headers.get('x-shopify-topic')
  const hmac = request.headers.get('x-shopify-hmac-sha256')
  const shop = request.headers.get('x-shopify-shop-domain')

  if (!topic || !hmac || !shop) {
    return NextResponse.json({ error: 'Missing Shopify webhook headers' }, { status: 400 })
  }

  // Verify webhook integrity (HMAC validation)
  const body = await request.text()
  const expectedHmac = await computeHmac(body, process.env.SHOPIFY_WEBHOOK_SECRET)

  if (!expectedHmac || hmac !== expectedHmac) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  // Route by topic to the right cache tag
  switch (topic) {
    case 'products/create':
    case 'products/update':
    case 'products/delete':
      revalidateTag('products', 'max')
      break

    case 'collections/create':
    case 'collections/update':
    case 'collections/delete':
      revalidateTag('collections', 'max')
      break

    default:
      // Ignore other topics (orders, customers, etc.)
      return NextResponse.json({ handled: false, topic })
  }

  return NextResponse.json({ handled: true, topic, shop })
}

async function computeHmac(body: string, secret?: string): Promise<string | null> {
  if (!secret) return null

  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(body)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, messageData)

  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}
