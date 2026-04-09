import { type NextRequest, NextResponse } from 'next/server'
import {
  GET_ALL_PRODUCTS,
  GET_CART,
  GET_COLLECTIONS,
  GET_PRODUCT_BY_HANDLE,
  GET_PRODUCTS_IN_COLLECTION,
} from '@/lib/queries'
import { getClient } from '@/lib/shopify'

const SHOP_QUERY = `
  query {
    shop {
      name
      primaryDomain { url }
    }
  }
`

export async function GET(req: NextRequest) {
  const shopify = await getClient()
  const q = req.nextUrl.searchParams.get('q') ?? 'shop'
  const handle = req.nextUrl.searchParams.get('handle') ?? ''
  const cartId = req.nextUrl.searchParams.get('cartId') ?? ''

  if (!shopify) {
    return NextResponse.json(
      { error: 'Shopify environment variables not configured' },
      { status: 503 }
    )
  }

  let result: { data?: unknown; errors?: unknown }

  switch (q) {
    case 'shop':
      result = await shopify.request(SHOP_QUERY)
      break

    case 'products':
      result = await shopify.request(GET_ALL_PRODUCTS)
      break

    case 'product':
      if (!handle)
        return NextResponse.json({ error: 'Pass ?handle=your-product-handle' }, { status: 400 })
      result = await shopify.request(GET_PRODUCT_BY_HANDLE, { variables: { handle } })
      break

    case 'collections':
      result = await shopify.request(GET_COLLECTIONS)
      break

    case 'collection':
      if (!handle)
        return NextResponse.json({ error: 'Pass ?handle=your-collection-handle' }, { status: 400 })
      result = await shopify.request(GET_PRODUCTS_IN_COLLECTION, { variables: { handle } })
      break

    case 'cart':
      if (!cartId)
        return NextResponse.json({ error: 'Pass ?cartId=gid://shopify/Cart/...' }, { status: 400 })
      result = await shopify.request(GET_CART, { variables: { cartId } })
      break

    default:
      return NextResponse.json(
        {
          error: `Unknown query "${q}". Valid options: shop, products, product, collections, collection, cart`,
        },
        { status: 400 }
      )
  }

  if (result.errors) {
    return NextResponse.json({ errors: result.errors }, { status: 500 })
  }

  return NextResponse.json(result.data)
}
