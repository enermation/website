export type ProductChunkMetadata = {
  productId: string
  handle: string
  title: string
  priceAmount: string
  priceCurrency: string
  collectionHandles: string[]
  vendor: string | null
  // Core vehicle identity
  make: string | null
  model: string | null
  year: string | null
  // Drivetrain
  fuelType: string | null
  transmission: string | null
  driveType: string | null
  // Vehicle details
  mileage: string | null
  colour: string | null
  engine: string | null
  displacement: string | null
  originCountry: string | null
  condition: string | null
  /** All remaining resolved metafields not already in a dedicated field above. Label → value. */
  specs: Record<string, string>
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
