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

// Metafield returned by Storefront API queries
export type ShopifyMetafield = {
  value: string | null
  type: string | null
}

// Vehicle-specific metafields (all optional — may not be set on every product)
export type VehicleMetafields = {
  make: ShopifyMetafield | null
  model: ShopifyMetafield | null
  year: ShopifyMetafield | null
  mileage: ShopifyMetafield | null
  colour: ShopifyMetafield | null
  fuelType: ShopifyMetafield | null
  transmission: ShopifyMetafield | null
  originCountry: ShopifyMetafield | null
  condition: ShopifyMetafield | null
  engine: ShopifyMetafield | null
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
  vendor: string
  description: string
  availableForSale: boolean
  tags?: string[]
  images: { edges: { node: ShopifyImage }[] }
  priceRange: {
    minVariantPrice: ShopifyMoney
    maxVariantPrice?: ShopifyMoney // present in GET_PRODUCT_BY_HANDLE, absent in GET_ALL_PRODUCTS
  }
  variants: { edges: { node: ShopifyProductVariant }[] }
  collections?: { edges: { node: ShopifyCollection }[] }
  // Vehicle metafields (null if not set or not a vehicle product)
  make: ShopifyMetafield | null
  model: ShopifyMetafield | null
  year: ShopifyMetafield | null
  mileage: ShopifyMetafield | null
  colour: ShopifyMetafield | null
  fuelType: ShopifyMetafield | null
  transmission: ShopifyMetafield | null
  originCountry: ShopifyMetafield | null
  condition: ShopifyMetafield | null
  engine: ShopifyMetafield | null
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

export type ShopifyShopInfo = {
  name: string
  primaryDomain: {
    url: string
  } | null
}
