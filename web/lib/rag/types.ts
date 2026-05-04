export type ProductChunkMetadata = {
  productId: string
  handle: string
  title: string
  priceAmount: string
  priceCurrency: string
  collectionHandles: string[]
  vendor: string | null
  // Core vehicle identity — derived from title and Shopify standard metafields
  make: string | null
  model: string | null
  year: string | null
  // Shopify standard vehicle metafields (shopify.* namespace — stable namespace+key)
  fuelType: string | null
  transmission: string | null
  driveType: string | null
  condition: string | null
  /** shopify.vehicle-features resolved to human-readable labels (e.g. ["Sunroof", "Air Conditioning"]) */
  features: string[]
  /**
   * All remaining resolved metafields beyond the Shopify standard set.
   * Keyed by stable `namespace.key` (immutable per Shopify API contract).
   * Each entry carries the mutable display label and the resolved value.
   */
  specs: Record<string, { label: string; value: string }>
  imageUrl: string | null
  url: string
  textSnippet: string
  available: boolean
}

export type RagRetrievalResult = {
  metadata: ProductChunkMetadata
  score: number
}

export type RagChatMessageMetadata = {
  citations?: string[]
}

export type ProductCitationData = Pick<
  ProductChunkMetadata,
  | 'handle'
  | 'title'
  | 'priceAmount'
  | 'priceCurrency'
  | 'imageUrl'
  | 'available'
  | 'url'
  | 'make'
  | 'model'
  | 'year'
  | 'fuelType'
  | 'transmission'
  | 'condition'
>

export type FullRagChatMessageMetadata = {
  citations?: ProductCitationData[]
  suggestions?: string[]
}
