export type ProductChunkMetadata = {
  productId: string
  handle: string
  title: string
  priceAmount: string
  priceCurrency: string
  collectionHandles: string[]
  vendor: string | null
  make: string | null
  model: string | null
  year: string | null
  fuelType: string | null
  transmission: string | null
  condition: string | null
  driveType: string | null
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
}
