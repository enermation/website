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
  mileage: string | null
  colour: string | null
  fuelType: string | null
  transmission: string | null
  originCountry: string | null
  condition: string | null
  engine: string | null
  imageUrl: string | null
  url: string
  textSnippet: string
}

export type RagRetrievalResult = {
  metadata: ProductChunkMetadata
  score: number
}

export type RagChatMessageMetadata = {
  citations?: string[]
}
