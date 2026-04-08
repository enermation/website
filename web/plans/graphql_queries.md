## Overview

Set up all GraphQL queries needed for the ecommerce pages, sourced from the `graphql/examples/` learning kit. Output goes to two files:

- `web/lib/queries.ts` — exported GraphQL string constants
- `web/lib/types.ts` — TypeScript interfaces for all API response shapes

---

## Queries to copy as-is (no modification needed)

- [ ] `08_manage_a_cart/01_create_a_cart_with_one_line_item` — returns cart id, cost, line items; cart re-fetched separately for display
- [ ] `08_manage_a_cart/03_update_line_items` — mutation only; cart re-fetched after
- [ ] `08_manage_a_cart/09_remove_cart_lines` — mutation only; cart re-fetched after
- [ ] `08_manage_a_cart/10_add_cart_lines` — mutation only; cart re-fetched after

---

## Queries that need modification

### 1. Get All Products (`06_products/01_get_3_products_and_3_variants`)

**Missing:** `images`, `priceRange`, `availableForSale`; `first: 3` too small for a real catalogue

Add to each product node:
```graphql
availableForSale
images(first: 1) {
  edges {
    node {
      url
      altText
      width
      height
    }
  }
}
priceRange {
  minVariantPrice {
    amount
    currencyCode
  }
}
```

Change `products(first: 3)` → `products(first: 50)` hardcoded — no variable needed since this limit is fixed

---

### 2. Get Product by Handle (`06_products/02_get_product_by_handle`)

**Missing:** handle is hardcoded; `images`, `priceRange`, `availableForSale` on product; only 3 variants; variants missing `selectedOptions` and `compareAtPrice`

Changes:
- Add variable: `query getProductByHandle($handle: String!)` and `product(handle: $handle)`
- Increase variants: `variants(first: 100)`
- Add to product node:
```graphql
availableForSale
images(first: 10) {
  edges {
    node {
      url
      altText
      width
      height
    }
  }
}
priceRange {
  minVariantPrice { amount currencyCode }
  maxVariantPrice { amount currencyCode }
}
```
- Add to each variant node:
```graphql
availableForSale
compareAtPrice {
  amount
  currencyCode
}
selectedOptions {
  name
  value
}
```

---

### 3. Get Collections (`05_collections/01_get_collections`)

**Missing:** `title`, `image`

Add to each collection node:
```graphql
title
image {
  url
  altText
}
```

---

### 4. Get Products in Collection (`05_collections/04_get_products_in_collection`)

**Missing:** `handle` on product nodes — without it, product cards cannot link to `/products/[handle]`

Add to each product node:
```graphql
handle
```

No other changes needed — query already has `images`, `priceRange`, `availableForSale`, and uses `$handle: String!` variable.

---

### 5. Query Cart (`08_manage_a_cart/02_query_a_cart`)

**Missing:** product title, image, price on line items — needed for cart drawer display

Replace the bare `merchandise` fragment:
```graphql
merchandise {
  ... on ProductVariant {
    id
    title
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    selectedOptions {
      name
      value
    }
    product {
      title
      handle
      images(first: 1) {
        edges {
          node {
            url
            altText
          }
        }
      }
    }
  }
}
```

---

## TypeScript types (`web/lib/types.ts`)

Define response interfaces to match each query's shape. All fields must match exactly — no `any`.

```ts
export type ShopifyImage = {
  url: string
  altText: string | null
  width?: number
  height?: number
}

export type ShopifyMoney = {
  amount: string
  currencyCode: string
}

export type ShopifyProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  price: ShopifyMoney
  compareAtPrice: ShopifyMoney | null
  selectedOptions: { name: string; value: string }[]
}

export type ShopifyProduct = {
  id: string
  title: string
  handle: string
  description: string
  availableForSale: boolean
  images: { edges: { node: ShopifyImage }[] }
  priceRange: {
    minVariantPrice: ShopifyMoney
    maxVariantPrice: ShopifyMoney
  }
  variants: { edges: { node: ShopifyProductVariant }[] }
}

export type ShopifyCollection = {
  id: string
  handle: string
  title: string
  image: ShopifyImage | null
}

export type ShopifyCartLine = {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    price: ShopifyMoney
    compareAtPrice: ShopifyMoney | null
    selectedOptions: { name: string; value: string }[]
    product: {
      title: string
      handle: string
      images: { edges: { node: ShopifyImage }[] }
    }
  }
}

export type ShopifyCart = {
  id: string
  checkoutUrl: string
  lines: { edges: { node: ShopifyCartLine }[] }
  cost: {
    totalAmount: ShopifyMoney
    subtotalAmount: ShopifyMoney
    totalTaxAmount: ShopifyMoney | null
    totalDutyAmount: ShopifyMoney | null
  }
}
```

---

## Testing

All queries can be tested via the dev server at `http://localhost:3000/api/test`.
Run `bun run dev` then open these URLs in the browser:

| URL | What it tests |
|-----|---------------|
| `/api/test` | Shopify connection — returns shop name and domain |
| `/api/test?q=products` | GET_ALL_PRODUCTS — returns first 50 products |
| `/api/test?q=product&handle=YOUR-HANDLE` | GET_PRODUCT_BY_HANDLE — replace with a real product handle from your store |
| `/api/test?q=collections` | GET_COLLECTIONS — returns first 10 collections |
| `/api/test?q=collection&handle=YOUR-HANDLE` | GET_PRODUCTS_IN_COLLECTION — replace with a real collection handle |
| `/api/test?q=cart&cartId=YOUR-CART-ID` | GET_CART — test after creating a cart via the UI |

Cart mutations (CREATE_CART, ADD_CART_LINES, UPDATE_CART_LINES, REMOVE_CART_LINES) cannot be tested via browser URL — they will be exercised when the cart UI is built.

**What a passing test looks like:** the URL returns JSON with data. An error from Shopify returns `{ "errors": [...] }` with a 500 status.

---

## Output files

| File | Contents |
|------|----------|
| `web/lib/queries.ts` | Named exports: `GET_ALL_PRODUCTS`, `GET_PRODUCT_BY_HANDLE`, `GET_COLLECTIONS`, `GET_PRODUCTS_IN_COLLECTION`, `GET_CART`, `CREATE_CART`, `ADD_CART_LINES`, `UPDATE_CART_LINES`, `REMOVE_CART_LINES` |
| `web/lib/types.ts` | All TypeScript interfaces above |

---

## Pages these queries will power

| Query | Page |
|-------|------|
| `GET_ALL_PRODUCTS` | `/products` |
| `GET_PRODUCT_BY_HANDLE` | `/products/[handle]` |
| `GET_COLLECTIONS` | `/collections` |
| `GET_PRODUCTS_IN_COLLECTION` | `/collections/[handle]` |
| `GET_CART` + cart mutations | Cart drawer (all pages) |
