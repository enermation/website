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

export type ShopifySelectedOption = {
  name: string
  value: string
}

// Variant shape returned by GET_PRODUCT_BY_HANDLE (full detail).
// compareAtPrice and selectedOptions are not returned by GET_ALL_PRODUCTS
// variants, so those fields are optional here.
export type ShopifyProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  price: ShopifyMoney
  compareAtPrice?: ShopifyMoney | null
  selectedOptions?: ShopifySelectedOption[]
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
    maxVariantPrice?: ShopifyMoney  // present in GET_PRODUCT_BY_HANDLE, absent in GET_ALL_PRODUCTS
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
    selectedOptions: ShopifySelectedOption[]
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
