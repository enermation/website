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

// Vehicle-specific metafields (from shopify.* and custom.* namespaces)
// Metaobject references are stored as JSON arrays of GIDs.
// Resolution (parsing GIDs → label strings) happens at the data layer.
export type VehicleMetafields = {
  make: ShopifyMetafield | null // derived from product title — not a metafield
  model: ShopifyMetafield | null // derived from product title — not a metafield
  year: ShopifyMetafield | null // custom.model_year → number_integer
  mileage: ShopifyMetafield | null // not set on Shopify — derived from elsewhere
  colour: ShopifyMetafield | null // not set on Shopify
  fuelType: ShopifyMetafield | null // shopify.fuel-supply → list.metaobject_reference
  transmission: ShopifyMetafield | null // shopify.transmission-type → list.metaobject_reference
  originCountry: ShopifyMetafield | null // not set on Shopify
  condition: ShopifyMetafield | null // shopify.item-condition → list.metaobject_reference
  engine: ShopifyMetafield | null // not set on Shopify
  driveType: ShopifyMetafield | null // shopify.drive-type → list.metaobject_reference
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
  createdAt?: string
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
  // driveType added — previously was part of vehicle namespace but now uses shopify.drive-type
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
  driveType: ShopifyMetafield | null
}

export type ShopifyProductMinimal = Pick<
  ShopifyProduct,
  'id' | 'handle' | 'title' | 'description' | 'availableForSale' | 'priceRange'
> & {
  images: { edges: { node: Pick<ShopifyImage, 'url' | 'altText'> }[] }
  year: Pick<ShopifyMetafield, 'value'> | null
  colour: Pick<ShopifyMetafield, 'value'> | null
  mileage: Pick<ShopifyMetafield, 'value'> | null
  transmission: Pick<ShopifyMetafield, 'value'> | null
}

export type ShopifyCollection = {
  id: string
  handle: string
  title: string
  image: ShopifyImage | null
  description: string | null
}

export type ShopifyMenuResource =
  | { __typename: 'Collection'; handle: string }
  | { __typename: 'Product'; handle: string }
  | { __typename: 'Page'; handle: string }
  | { __typename: 'Blog'; handle: string }

export type ShopifyMenuItem = {
  id: string
  title: string
  url: string | null
  type: string | null
  resource: ShopifyMenuResource | null
  items: ShopifyMenuItem[]
}

export type ShopifyMenu = {
  id: string
  title: string
  items: ShopifyMenuItem[]
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
