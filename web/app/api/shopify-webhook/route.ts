import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

import { enqueueJob } from '@/lib/rag/queue'

/**
 * Shopify webhook handler for cache invalidation + RAG index updates.
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
 *
 * For product events, also enqueues a RAG index job (non-blocking, processed
 * by the /api/rag/process-queue cron endpoint).
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

  // Route by topic to the right cache tag + RAG job
  switch (topic) {
    case 'products/create':
    case 'products/update': {
      const payload = JSON.parse(body)
      const handle = payload.handle ?? extractHandleFromUrl(payload.admin_url)
      if (handle) {
        // revalidateTag accepts ONE tag per call — bust both the list and the specific product page
        revalidateTag('products', 'max')
        revalidateTag(`product-${handle}`, 'max')
        enqueueJob(handle, 'upsert').catch(err => {
          console.error('[shopify-webhook] RAG upsert job failed:', err)
        })
      }
      break
    }

    case 'products/delete': {
      const payload = JSON.parse(body)
      const handle = payload.handle ?? extractHandleFromUrl(payload.admin_url)
      if (handle) {
        revalidateTag('products', 'max')
        revalidateTag(`product-${handle}`, 'max')
        enqueueJob(handle, 'delete').catch(err => {
          console.error('[shopify-webhook] RAG delete job failed:', err)
        })
      }
      break
    }

    case 'collections/create':
    case 'collections/update':
    case 'collections/delete': {
      const payload = JSON.parse(body)
      const handle = payload.handle ?? extractHandleFromUrl(payload.admin_url)
      if (handle) {
        revalidateTag('collections', 'max')
        revalidateTag(`collection-${handle}`, 'max')
      }
      break
    }

    default:
      // Ignore other topics (orders, customers, etc.)
      return NextResponse.json({ handled: false, topic })
  }

  return NextResponse.json({ handled: true, topic, shop })
}

function extractHandleFromUrl(adminUrl: string | undefined): string | null {
  if (!adminUrl || typeof adminUrl !== 'string') return null
  const match = adminUrl.match(/\/products\/([^/?#]+)/)
  return match ? match[1] : null
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
