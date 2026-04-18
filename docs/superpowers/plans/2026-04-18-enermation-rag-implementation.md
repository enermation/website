# Enermation RAG System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered RAG system for Enermation's car and spare parts inventory with three interfaces: floating chat widget, augmented /search page, and new /assistant page.

**Architecture:** Retrieve → Rerank → Generate pipeline using Voyage AI for embeddings/reranking, Qdrant for vector storage, and Groq for LLM generation. Shopify webhooks trigger real-time indexing. Vercel AI SDK provides provider-agnostic framework with AI Elements for UI components.

**Tech Stack:** Voyage AI (embed + rerank), Qdrant Cloud, Groq (Llama 3.3 70B), Vercel AI SDK + AI Elements, Next.js 16

---

## File Structure

```
web/
├── app/
│   ├── api/
│   │   ├── rag/
│   │   │   ├── query/route.ts       # RAG query endpoint
│   │   │   ├── chat/route.ts        # Streaming chat (non-streaming for AI Elements)
│   │   │   └── index/route.ts       # Manual re-index trigger
│   │   └── webhooks/
│   │       └── shopify/
│   │           └── route.ts         # Shopify webhook handler
│   ├── assistant/
│   │   └── page.tsx                 # New /assistant page
│   └── search/
│       └── page.tsx                 # Augmented /search (add AI tab)
├── components/
│   ├── ai-elements/                 # AI Elements (installed via CLI)
│   │   ├── conversation.tsx
│   │   ├── message.tsx
│   │   └── ...
│   └── rag/
│       ├── car-reference.tsx         # Car/spare part citation card
│       ├── suggested-questions.tsx  # Quick question buttons
│       └── widget-wrapper.tsx       # Wraps AI Elements for widget
├── lib/
│   └── rag/
│       ├── client.ts                # Voyage AI + Qdrant clients
│       ├── embed.ts                 # Embedding generation
│       ├── rerank.ts                # Reranking logic
│       ├── query.ts                 # Full query pipeline
│       ├── chunk.ts                 # Product chunking
│       ├── indexer.ts               # Indexing pipeline
│       ├── types.ts                 # TypeScript types
│       └── constants.ts             # Config constants
└── hooks/
    └── use-rag-chat.ts              # Chat hook (integrates with AI Elements)
```

---

## Task 1: RAG Types and Constants

**Files:**
- Create: `web/lib/rag/types.ts`
- Create: `web/lib/rag/constants.ts`
- Create: `web/lib/rag/client.ts`

- [ ] **Step 1: Create types.ts**

```typescript
// web/lib/rag/types.ts

export type Availability = 'available' | 'reserved' | 'sold'

export type Category = 'cars' | 'spare_parts'

// ── Car Metadata ────────────────────────────────────────────────

export type CarMetadata = {
  id: string
  handle: string
  make: string
  model: string
  year: string
  price: number
  price_display: string
  mileage: number
  color: string
  interior: string
  engine: string
  availability: Availability
  category: Category.CARS
  images: string[]
  url: string
}

// ── Spare Part Metadata ──────────────────────────────────────────

export type SparePartMetadata = {
  id: string
  handle: string
  part_number: string
  name: string
  category: Category.SPARE_PARTS
  compatible_makes: string[]
  compatible_models: string[]
  condition: 'new' | 'used' | 'refurbished'
  price: number
  price_display: string
  availability: Availability
  images: string[]
  url: string
}

// ── Union Type ───────────────────────────────────────────────────

export type ProductMetadata = CarMetadata | SparePartMetadata

// ── Chunk ────────────────────────────────────────────────────────

export type Chunk = {
  id: string
  text: string
  metadata: ProductMetadata
}

// ── Citation ────────────────────────────────────────────────────

export type Citation = {
  score: number
  metadata: ProductMetadata
  text: string
}

// ── RAG Response ─────────────────────────────────────────────────

export type RAGResponse = {
  answer: string
  sources: ProductMetadata[]
  citations: Citation[]
}

// ── Chat Message ─────────────────────────────────────────────────

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: ProductMetadata[]
  timestamp: Date
}

// ── Query Request ────────────────────────────────────────────────

export type QueryRequest = {
  query: string
  context?: {
    current_product_handle?: string
    category?: Category
    filters?: {
      make?: string
      price_min?: number
      price_max?: number
      year_min?: number
      year_max?: number
      availability?: Availability
    }
  }
}

// ── Chat Request ─────────────────────────────────────────────────

export type ChatRequest = {
  message: string
  history: ChatMessage[]
  context?: QueryRequest['context']
}
```

- [ ] **Step 2: Create constants.ts**

```typescript
// web/lib/rag/constants.ts

export const VOYAGE_EMBEDDING_MODEL = 'voyage-4-large'
export const VOYAGE_RERANK_MODEL = 'rerank-2.5'

export const EMBEDDING_DIMENSIONS = 1024
export const CHUNK_TOKEN_LIMIT = 512

export const QDRANT_COLLECTION_CARS = 'enermation-cars'
export const QDRANT_COLLECTION_PARTS = 'enermation-spare-parts'

export const RETRIEVAL_INITIAL_K = 50
export const RETRIEVAL_RERANK_TOP = 10
export const RETRIEVAL_LLM_CONTEXT = 5

export const GROQ_MODEL = 'llama-3.3-70b-versatile'

export const QDRANT_VECTOR_CONFIG = {
  size: EMBEDDING_DIMENSIONS,
  distance: 'Cosine' as const,
}
```

- [ ] **Step 3: Create client.ts**

```typescript
// web/lib/rag/client.ts

import { QdrantClient } from '@qdrant/qdrant-js'
import VoyageAI from 'voyageai'

// ── Environment Validation ───────────────────────────────────────

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

// ── Voyage AI Client ─────────────────────────────────────────────

let _voyageClient: VoyageAI | null = null

export function getVoyageClient(): VoyageAI {
  if (!_voyageClient) {
    _voyageClient = new VoyageAI({ apiKey: getRequiredEnv('VOYAGE_API_KEY') })
  }
  return _voyageClient
}

// ── Qdrant Client ────────────────────────────────────────────────

let _qdrantClient: QdrantClient | null = null

export function getQdrantClient(): QdrantClient {
  if (!_qdrantClient) {
    const url = getRequiredEnv('QDRANT_CLOUD_URL')
    const apiKey = getRequiredEnv('QDRANT_API_KEY')
    _qdrantClient = new QdrantClient({ url, apiKey })
  }
  return _qdrantClient
}
```

- [ ] **Step 4: Commit**

```bash
git add web/lib/rag/types.ts web/lib/rag/constants.ts web/lib/rag/client.ts
git commit -m "feat(rag): add RAG types, constants, and client initialization"
```

---

## Task 2: Embedding and Chunking

**Files:**
- Create: `web/lib/rag/embed.ts`
- Create: `web/lib/rag/chunk.ts`

- [ ] **Step 1: Create embed.ts**

```typescript
// web/lib/rag/embed.ts

import { getVoyageClient } from './client'
import { VOYAGE_EMBEDDING_MODEL } from './constants'
import type { Chunk } from './types'

export type EmbeddingResult = {
  id: string
  embedding: number[]
  text: string
}

export async function embedChunks(chunks: Chunk[]): Promise<number[][]> {
  const client = getVoyageClient()
  const texts = chunks.map(c => c.text)

  const response = await client.embed({
    texts,
    model: VOYAGE_EMBEDDING_MODEL,
    input_type: 'document',
    truncation: true,
  })

  return response.data.map(d => d.embedding)
}

export async function embedQuery(query: string): Promise<number[]> {
  const client = getVoyageClient()

  const response = await client.embed({
    texts: [query],
    model: VOYAGE_EMBEDDING_MODEL,
    input_type: 'query',
    truncation: true,
  })

  return response.data[0].embedding
}
```

- [ ] **Step 2: Create chunk.ts**

```typescript
// web/lib/rag/chunk.ts

import type {
  Chunk,
  CarMetadata,
  SparePartMetadata,
  Category,
} from './types'
import { CHUNK_TOKEN_LIMIT } from './constants'

// ── Car Chunking ─────────────────────────────────────────────────

export function chunkCar(car: CarMetadata): Chunk {
  const text = [
    `${car.make} ${car.model}`,
    `Year: ${car.year}`,
    `Price: ${car.price_display}`,
    `Mileage: ${car.mileage.toLocaleString()} miles`,
    car.color ? `Exterior: ${car.color}` : null,
    car.interior ? `Interior: ${car.interior}` : null,
    car.engine ? `Engine: ${car.engine}` : null,
    `Status: ${car.availability}`,
    car.description || '',
  ]
    .filter(Boolean)
    .join('. ')

  return {
    id: car.id,
    text: truncateToTokenLimit(text, CHUNK_TOKEN_LIMIT),
    metadata: car,
  }
}

// ── Spare Part Chunking ──────────────────────────────────────────

export function chunkSparePart(part: SparePartMetadata): Chunk {
  const text = [
    part.name,
    part.part_number ? `Part #: ${part.part_number}` : null,
    `Price: ${part.price_display}`,
    part.condition ? `Condition: ${part.condition}` : null,
    part.compatible_makes.length
      ? `Fits: ${part.compatible_makes.join(', ')}`
      : null,
    part.compatible_models.length
      ? `Models: ${part.compatible_models.join(', ')}`
      : null,
    `Status: ${part.availability}`,
  ]
    .filter(Boolean)
    .join('. ')

  return {
    id: part.id,
    text: truncateToTokenLimit(text, CHUNK_TOKEN_LIMIT),
    metadata: part,
  }
}

// ── Helper: Truncate to token limit ─────────────────────────────

function truncateToTokenLimit(text: string, limit: number): string {
  const charLimit = limit * 4

  if (text.length <= charLimit) return text

  const truncated = text.slice(0, charLimit)
  const lastPeriod = truncated.lastIndexOf('.')

  if (lastPeriod > charLimit * 0.7) {
    return truncated.slice(0, lastPeriod + 1)
  }

  return truncated.trim() + '...'
}

// ── Shopify Product → Chunk ───────────────────────────────────────

export function chunkFromShopifyProduct(
  product: Record<string, unknown>,
  category: Category
): Chunk | null {
  try {
    if (category === Category.CARS) {
      return chunkCar(transformToCarMetadata(product))
    } else {
      return chunkSparePart(transformToSparePartMetadata(product))
    }
  } catch {
    return null
  }
}

// ── Transform Shopify product to CarMetadata ────────────────────

function transformToCarMetadata(product: Record<string, unknown>): CarMetadata {
  const variants = product.variants as Array<Record<string, unknown>> | undefined
  const firstVariant = variants?.[0]

  const priceAmount = firstVariant?.price as string | undefined
  const priceNumber = priceAmount ? parseFloat(priceAmount) : 0

  return {
    id: product.id as string,
    handle: product.handle as string,
    make: (product.vendor as string) || '',
    model: product.title as string,
    year: (firstVariant?.title as string) || '',
    price: priceNumber,
    price_display: firstVariant?.price as string || '£0',
    mileage: 0,
    color: (firstVariant?.selectedOptions as Array<{name: string; value: string}>)?.find(o => o.name === 'Color')?.value || '',
    interior: '',
    engine: '',
    availability: 'available',
    category: Category.CARS,
    images: ((product.images as Array<{url: string}>) || []).map(i => i.url),
    url: `/products/${product.handle}`,
  }
}

// ── Transform Shopify product to SparePartMetadata ───────────────

function transformToSparePartMetadata(product: Record<string, unknown>): SparePartMetadata {
  return {
    id: product.id as string,
    handle: product.handle as string,
    part_number: (product.metafields as Record<string, unknown>)?.part_number as string || '',
    name: product.title as string,
    category: Category.SPARE_PARTS,
    compatible_makes: [],
    compatible_models: [],
    condition: 'new',
    price: parseFloat((product.variants as Array<Record<string, unknown>>)?.[0]?.price as string || '0'),
    price_display: (product.variants as Array<Record<string, unknown>>)?.[0]?.price as string || '£0',
    availability: 'available',
    images: ((product.images as Array<{url: string}>) || []).map(i => i.url),
    url: `/products/${product.handle}`,
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add web/lib/rag/embed.ts web/lib/rag/chunk.ts
git commit -m "feat(rag): add embedding and chunking modules"
```

---

## Task 3: Reranking Module

**Files:**
- Create: `web/lib/rag/rerank.ts`

- [ ] **Step 1: Create rerank.ts**

```typescript
// web/lib/rag/rerank.ts

import { getVoyageClient } from './client'
import { VOYAGE_RERANK_MODEL, RETRIEVAL_RERANK_TOP } from './constants'
import type { Chunk, Citation } from './types'

export type RerankResult = {
  doc_id: string
  relevance_score: number
}

export async function rerankChunks(
  query: string,
  chunks: Chunk[],
  top: number = RETRIEVAL_RERANK_TOP
): Promise<RerankResult[]> {
  if (chunks.length === 0) return []

  const client = getVoyageClient()

  const response = await client.rerank({
    model: VOYAGE_RERANK_MODEL,
    query,
    documents: chunks.map(c => c.text),
    top_k: Math.min(top, chunks.length),
  })

  return response.results.map(r => ({
    doc_id: chunks[r.index].id,
    relevance_score: r.relevance_score,
  }))
}

export async function rerankAndMerge(
  query: string,
  chunks: Chunk[],
  top: number = RETRIEVAL_RERANK_TOP
): Promise<Citation[]> {
  const reranked = await rerankChunks(query, chunks, top)

  return reranked.map(r => {
    const chunk = chunks.find(c => c.id === r.doc_id)!
    return {
      score: r.relevance_score,
      metadata: chunk.metadata,
      text: chunk.text,
    }
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add web/lib/rag/rerank.ts
git commit -m "feat(rag): add reranking module using Voyage AI"
```

---

## Task 4: Query Pipeline

**Files:**
- Create: `web/lib/rag/query.ts`
- Create: `web/lib/rag/indexer.ts`

- [ ] **Step 1: Create query.ts**

```typescript
// web/lib/rag/query.ts

import { embedQuery } from './embed'
import { rerankAndMerge } from './rerank'
import { getQdrantClient } from './client'
import {
  QDRANT_COLLECTION_CARS,
  QDRANT_COLLECTION_PARTS,
  RETRIEVAL_INITIAL_K,
  RETRIEVAL_LLM_CONTEXT,
} from './constants'
import type { QueryRequest, RAGResponse, ProductMetadata, Chunk } from './types'

// ── Build Qdrant Filter ───────────────────────────────────────────

function buildQdrantFilter(context?: QueryRequest['context']) {
  const must: Array<Record<string, unknown>> = []

  if (context?.category) {
    must.push({
      key: 'category',
      match: { value: context.category },
    })
  }

  if (context?.filters) {
    const { make, price_min, price_max, availability } = context.filters

    if (make) {
      must.push({ key: 'make', match: { value: make } })
    }

    if (price_min !== undefined) {
      must.push({ key: 'price', range: { gte: price_min } })
    }

    if (price_max !== undefined) {
      must.push({ key: 'price', range: { lte: price_max } })
    }

    if (availability) {
      must.push({ key: 'availability', match: { value: availability } })
    }
  }

  return must.length > 0 ? { must } : undefined
}

// ── Retrieve from Qdrant ─────────────────────────────────────────

async function retrieveChunks(
  query: string,
  collection: string,
  limit: number,
  context?: QueryRequest['context']
): Promise<Chunk[]> {
  const client = getQdrantClient()
  const embedding = await embedQuery(query)

  const results = await client.search(collection, {
    vector: embedding,
    limit,
    filter: buildQdrantFilter(context),
    with_payload: true,
  })

  return results.map(r => ({
    id: r.id as string,
    text: (r.payload as Record<string, unknown>)?.text as string || '',
    metadata: r.payload as unknown as ProductMetadata,
  }))
}

// ── Query Pipeline ───────────────────────────────────────────────

export async function queryRAG(request: QueryRequest): Promise<RAGResponse> {
  const { query, context } = request

  const [carChunks, partChunks] = await Promise.all([
    retrieveChunks(query, QDRANT_COLLECTION_CARS, RETRIEVAL_INITIAL_K, context),
    context?.category === 'spare_parts'
      ? retrieveChunks(query, QDRANT_COLLECTION_PARTS, RETRIEVAL_INITIAL_K, context)
      : Promise.resolve([]),
  ])

  const allChunks = [...carChunks, ...partChunks]
  const citations = await rerankAndMerge(query, allChunks, RETRIEVAL_LLM_CONTEXT)

  return {
    answer: '',
    sources: citations.map(c => c.metadata),
    citations,
  }
}

// ── Build Prompt for LLM ─────────────────────────────────────────

export function buildRAGPrompt(
  query: string,
  citations: Array<{ metadata: ProductMetadata; text: string }>
): string {
  const contextItems = citations.map(c => {
    const m = c.metadata
    if (m.category === 'cars') {
      return `- ${m.make} ${m.model} (${m.year}) — ${m.price_display}, ${m.mileage.toLocaleString()} miles — ${m.color} — ${m.availability} — ${m.url}`
    } else {
      return `- ${m.name} — ${m.price_display} — ${(m as { condition?: string }).condition} — fits: ${(m as { compatible_makes?: string[] }).compatible_makes?.join(', ')} — ${m.url}`
    }
  })

  return `You are an AI assistant for Enermation, a luxury supercar dealership.

Answer the user's question based ONLY on the following product information. If you cannot answer from the provided context, say so.

PRODUCTS:
${contextItems.join('\n')}

USER QUESTION: ${query}

Provide a helpful response with links to the relevant products. Format car references as: [Make Model](URL)`
}
```

- [ ] **Step 2: Create indexer.ts**

```typescript
// web/lib/rag/indexer.ts

import { embedChunks } from './embed'
import { getQdrantClient } from './client'
import { chunkFromShopifyProduct } from './chunk'
import { QDRANT_COLLECTION_CARS, QDRANT_COLLECTION_PARTS, QDRANT_VECTOR_CONFIG } from './constants'
import type { Category } from './types'

// ── Initialize Collections ───────────────────────────────────────

export async function ensureCollections(): Promise<void> {
  const client = getQdrantClient()

  const carsExists = await collectionExists(QDRANT_COLLECTION_CARS)
  if (!carsExists) {
    await client.createCollection(QDRANT_COLLECTION_CARS, {
      vectors: { size: QDRANT_VECTOR_CONFIG.size, distance: QDRANT_VECTOR_CONFIG.distance },
    })
  }

  const partsExists = await collectionExists(QDRANT_COLLECTION_PARTS)
  if (!partsExists) {
    await client.createCollection(QDRANT_COLLECTION_PARTS, {
      vectors: { size: QDRANT_VECTOR_CONFIG.size, distance: QDRANT_VECTOR_CONFIG.distance },
    })
  }
}

async function collectionExists(name: string): Promise<boolean> {
  const client = getQdrantClient()
  try {
    await client.getCollection(name)
    return true
  } catch {
    return false
  }
}

// ── Index Single Product ──────────────────────────────────────────

export async function indexProduct(
  product: Record<string, unknown>,
  category: Category
): Promise<void> {
  const chunk = chunkFromShopifyProduct(product, category)
  if (!chunk) return

  const client = getQdrantClient()
  const collection = category === Category.CARS ? QDRANT_COLLECTION_CARS : QDRANT_COLLECTION_PARTS

  const embeddings = await embedChunks([chunk])

  await client.upsert(collection, {
    points: [
      {
        id: chunk.id,
        vector: embeddings[0],
        payload: chunk.metadata as Record<string, unknown>,
      },
    ],
  })
}

// ── Delete Product ───────────────────────────────────────────────

export async function deleteProduct(productId: string): Promise<void> {
  const client = getQdrantClient()

  await Promise.all([
    client.delete(QDRANT_COLLECTION_CARS, { points: [productId] }).catch(() => {}),
    client.delete(QDRANT_COLLECTION_PARTS, { points: [productId] }).catch(() => {}),
  ])
}

// ── Full Reindex ──────────────────────────────────────────────────

export async function reindexAll(
  products: Array<{ product: Record<string, unknown>; category: Category }>
): Promise<{ indexed: number; failed: number }> {
  await ensureCollections()

  let indexed = 0
  let failed = 0

  for (const { product, category } of products) {
    try {
      await indexProduct(product, category)
      indexed++
    } catch {
      failed++
    }
  }

  return { indexed, failed }
}
```

- [ ] **Step 3: Commit**

```bash
git add web/lib/rag/query.ts web/lib/rag/indexer.ts
git commit -m "feat(rag): add query pipeline and indexer"
```

---

## Task 5: API Routes

**Files:**
- Create: `web/app/api/rag/query/route.ts`
- Create: `web/app/api/rag/chat/route.ts`
- Create: `web/app/api/rag/index/route.ts`
- Create: `web/app/api/webhooks/shopify/route.ts`

- [ ] **Step 1: Create query route**

```typescript
// web/app/api/rag/query/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { queryRAG, buildRAGPrompt } from '@/lib/rag/query'
import type { QueryRequest } from '@/lib/rag/types'

export async function POST(request: NextRequest) {
  try {
    const body: QueryRequest = await request.json()

    if (!body.query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const ragResult = await queryRAG(body)
    const prompt = buildRAGPrompt(body.query, ragResult.citations.slice(0, 5))

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are Enermation AI assistant. Keep responses concise and helpful.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!groqResponse.ok) {
      throw new Error('Groq API error')
    }

    const groqData = await groqResponse.json()
    const answer = groqData.choices?.[0]?.message?.content || 'I could not find an answer.'

    return NextResponse.json({
      answer,
      sources: ragResult.sources,
      citations: ragResult.citations,
    })
  } catch (error) {
    console.error('RAG query error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create chat route**

```typescript
// web/app/api/rag/chat/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { queryRAG, buildRAGPrompt } from '@/lib/rag/query'
import type { ChatRequest, ChatMessage } from '@/lib/rag/types'

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()

    if (!body.message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const historyText = body.history
      .slice(-5)
      .map((m: ChatMessage) => `${m.role}: ${m.content}`)
      .join('\n')

    const ragResult = await queryRAG({
      query: body.message,
      context: body.context,
    })

    const systemPrompt = `You are Enermation AI assistant. Keep responses concise and helpful. Only reference products from the provided context. If asked about products not in context, say you don't have that information.`
    const historyContext = historyText ? `Previous conversation:\n${historyText}\n\n` : ''
    const prompt = historyContext + buildRAGPrompt(body.message, ragResult.citations.slice(0, 5))

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    })

    if (!groqResponse.ok) {
      throw new Error('Groq API error')
    }

    const groqData = await groqResponse.json()
    const answer = groqData.choices?.[0]?.message?.content || 'I could not find an answer.'

    return NextResponse.json({
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: answer,
      sources: ragResult.sources,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('RAG chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create index route**

```typescript
// web/app/api/rag/index/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { reindexAll } from '@/lib/rag/indexer'
import { getClient } from '@/lib/shopify'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.RAG_ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = getClient()

    const [carsResponse, partsResponse] = await Promise.all([
      client.request<{ products: { edges: { node: Record<string, unknown> }[] } }>(`
        query {
          products(first: 250, query: "product_type:car") {
            edges { node { id handle title vendor variants { edges { node { id title price selectedOptions { name value } } } } images { edges { node { url } } } } }
          }
        }
      `),
      client.request<{ products: { edges: { node: Record<string, unknown> }[] } }>(`
        query {
          products(first: 250, query: "product_type:spare_part") {
            edges { node { id handle title vendor variants { edges { node { id title price selectedOptions { name value } } } } images { edges { node { url } } } } }
          }
        }
      `),
    ])

    const cars = carsResponse.data.products.edges.map(e => ({
      product: e.node,
      category: 'cars' as const,
    }))

    const parts = partsResponse.data.products.edges.map(e => ({
      product: e.node,
      category: 'spare_parts' as const,
    }))

    const result = await reindexAll([...cars, ...parts])

    return NextResponse.json({
      success: true,
      indexed: result.indexed,
      failed: result.failed,
    })
  } catch (error) {
    console.error('Reindex error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create Shopify webhook route**

```typescript
// web/app/api/webhooks/shopify/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { indexProduct, deleteProduct } from '@/lib/rag/indexer'
import crypto from 'crypto'

function verifyShopifyWebhook(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(body).digest('base64')
  return digest === signature
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-shopify-hmac-sha256') || ''
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || ''

    if (!verifyShopifyWebhook(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const topic = request.headers.get('x-shopify-topic') || ''

    const product = event
    const isCar = product.product_type === 'car' || product.tags?.includes('car')
    const category = isCar ? 'cars' : 'spare_parts'

    if (topic === 'products/create' || topic === 'products/update') {
      await indexProduct(product, category)
    } else if (topic === 'products/delete') {
      await deleteProduct(product.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add web/app/api/rag/query/route.ts web/app/api/rag/chat/route.ts web/app/api/rag/index/route.ts web/app/api/webhooks/shopify/route.ts
git commit -m "feat(rag): add API routes for query, chat, index, and Shopify webhook"
```

---

## Task 6: Chat Hook with AI Elements Integration

**Files:**
- Create: `web/hooks/use-rag-chat.ts`

- [ ] **Step 1: Create use-rag-chat.ts**

```typescript
// web/hooks/use-rag-chat.ts

'use client'

import { useState, useCallback, useRef } from 'react'
import type { ChatMessage, ChatRequest } from '@/lib/rag/types'

export type UseRAGChatReturn = {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  clearHistory: () => void
}

export function useRAGChat(): UseRAGChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setError(null)
    setIsLoading(true)

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const request: ChatRequest = {
        message: content,
        history: messages.slice(-10),
      }

      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: data.id || crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        sources: data.sources,
        timestamp: new Date(data.timestamp || Date.now()),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearHistory = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add web/hooks/use-rag-chat.ts
git commit -m "feat(rag): add useRAGChat hook for chat state management"
```

---

## Task 7: Install AI Elements + Custom Components

**Files:**
- Run: `npx ai-elements@latest add conversation`
- Run: `npx ai-elements@latest add message`
- Create: `web/components/rag/car-reference.tsx`
- Create: `web/components/rag/suggested-questions.tsx`
- Create: `web/components/rag/widget-wrapper.tsx`

- [ ] **Step 1: Install AI Elements**

```bash
cd web
npx ai-elements@latest add conversation
npx ai-elements@latest add message
```

This installs AI Elements components to `@/components/ai-elements/`:
- `conversation.tsx`
- `message.tsx`
- (and related components)

- [ ] **Step 2: Create car-reference.tsx**

```tsx
// web/components/rag/car-reference.tsx

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ProductMetadata, CarMetadata, SparePartMetadata } from '@/lib/rag/types'

type CarReferenceProps = {
  product: ProductMetadata
  compact?: boolean
}

export function CarReference({ product, compact = false }: CarReferenceProps) {
  const isCar = product.category === 'cars'
  const carMeta = product as CarMetadata
  const partMeta = product as SparePartMetadata

  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex gap-3 p-2 rounded-lg',
        'bg-card border hover:bg-muted transition-colors',
        compact ? 'items-center' : 'flex-col sm:flex-row',
        'data-slot=car-reference
      )}
    >
      {product.images?.[0] && (
        <div className="size-16 rounded overflow-hidden shrink-0">
          <Image
            src={product.images[0]}
            alt={isCar ? `${carMeta.make} ${carMeta.model}` : partMeta.name}
            width={64}
            height={64}
            className="object-cover size-full"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {isCar ? `${carMeta.make} ${carMeta.model}` : partMeta.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {product.price_display}
        </p>
        {isCar && !compact && (
          <p className="text-xs text-muted-foreground">
            {carMeta.year} · {carMeta.mileage.toLocaleString()} miles · {carMeta.color}
          </p>
        )}
        {!isCar && !compact && (
          <p className="text-xs text-muted-foreground">
            {partMeta.condition} · Fits: {partMeta.compatible_makes?.slice(0, 2).join(', ')}
          </p>
        )}
      </div>

      <span
        className={cn(
          'text-xs px-2 py-0.5 rounded',
          product.availability === 'available'
            ? 'bg-green-100 text-green-800'
            : product.availability === 'reserved'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
        )}
      >
        {product.availability}
      </span>
    </a>
  )
}
```

- [ ] **Step 3: Create suggested-questions.tsx**

```tsx
// web/components/rag/suggested-questions.tsx

import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Show me Ferrari models under £200k',
  'What spare parts do you have for Porsche 911?',
  'Find low mileage Lamborghini Aventador',
  'Tell me about your newest arrivals',
]

type SuggestedQuestionsProps = {
  onSubmit: (question: string) => Promise<void>
}

export function SuggestedQuestions({ onSubmit }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map(question => (
          <button
            key={question}
            onClick={() => onSubmit(question)}
            className={cn(
              'text-sm px-3 py-1.5 rounded-full',
              'bg-muted hover:bg-muted/80',
              'border transition-colors'
            )}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create widget-wrapper.tsx**

```tsx
// web/components/rag/widget-wrapper.tsx

'use client'

import { useState } from 'react'
import { mdiChat } from '@mdi/js'
import { Icon } from '@mdi/react'
import { cn } from '@/lib/utils'
import { useRAGChat } from '@/hooks/use-rag-chat'
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { SuggestedQuestions } from './suggested-questions'
import { CarReference } from './car-reference'

export function WidgetWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, isLoading, error, sendMessage, clearHistory } = useRAGChat()

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'size-14 rounded-full bg-primary shadow-lg',
          'flex items-center justify-center',
          'transition-transform hover:scale-105',
          'data-slot=chat-widget
        )}
        aria-label="Open AI Assistant"
      >
        <Icon path={mdiChat} size={1.25} className="text-primary-foreground" />
      </button>

      {/* Chat panel using AI Elements */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-24 right-6 z-50',
            'w-96 h-[32rem] max-h-[80vh]',
            'bg-background border rounded-2xl shadow-2xl',
            'flex flex-col',
            'data-slot=chat-panel
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="font-semibold">Enermation AI Assistant</h2>
              <p className="text-xs text-muted-foreground">Ask about our cars or spare parts</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded"
              >
                ✕
              </button>
            </div>
          </div>

          {/* AI Elements Conversation */}
          <Conversation className="flex-1 overflow-hidden">
            <ConversationContent className="p-4 overflow-y-auto">
              {messages.length === 0 && (
                <SuggestedQuestions onSubmit={sendMessage} />
              )}

              {messages.map((message, index) => (
                <Message key={message.id} from={message.role === 'user' ? 'user' : 'ai'}>
                  <MessageContent>
                    <MessageResponse>{message.content}</MessageResponse>

                    {!message.role === 'user' && message.sources && message.sources.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.sources.slice(0, 3).map((source, i) => (
                          <CarReference key={i} product={source} compact />
                        ))}
                      </div>
                    )}
                  </MessageContent>
                </Message>
              ))}

              {isLoading && (
                <Message from="ai">
                  <MessageContent>
                    <MessageResponse>Searching...</MessageResponse>
                  </MessageContent>
                </Message>
              )}

              {error && (
                <div className="text-destructive text-sm p-2 bg-destructive/10 rounded">
                  {error}
                </div>
              )}
            </ConversationContent>
          </Conversation>

          {/* Input */}
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement
              if (input.value.trim()) {
                await sendMessage(input.value.trim())
                input.value = ''
              }
            }}
            className="p-4 border-t"
          >
            <div className="flex gap-2">
              <input
                name="message"
                placeholder="Ask about cars, prices, specs..."
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg',
                  'border border-input bg-background',
                  'text-sm placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'px-4 py-2 rounded-lg',
                  'bg-primary text-primary-foreground',
                  'text-sm font-medium',
                  'hover:opacity-90 disabled:opacity-50'
                )}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add web/components/rag/car-reference.tsx web/components/rag/suggested-questions.tsx web/components/rag/widget-wrapper.tsx
git commit -m "feat(rag): add custom RAG components (car-reference, suggested-questions) and widget wrapper using AI Elements"
```

---

## Task 8: Pages Integration

**Files:**
- Modify: `web/app/search/page.tsx` (add AI tab)
- Create: `web/app/assistant/page.tsx`
- Modify: `web/app/layout.tsx` (add WidgetWrapper to root layout)

- [ ] **Step 1: Read existing search page**

```bash
# Read the current search page to understand its structure
```

- [ ] **Step 2: Modify search/page.tsx to add AI tab**

```tsx
// web/app/search/page.tsx (augmented with AI tab)

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AISearchTab } from '@/components/rag/ai-search-tab'
// Import existing search components here

type SearchTab = 'browse' | 'ask-ai'

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<SearchTab>('browse')

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Search Inventory</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b mb-6">
        <button
          onClick={() => setActiveTab('browse')}
          className={cn(
            'px-4 py-2 text-sm font-medium',
            'border-b-2 -mb-px transition-colors',
            activeTab === 'browse'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveTab('ask-ai')}
          className={cn(
            'px-4 py-2 text-sm font-medium',
            'border-b-2 -mb-px transition-colors',
            activeTab === 'ask-ai'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Ask AI
        </button>
      </div>

      {/* Tab content */}
      <div className="min-h-[60vh]">
        {activeTab === 'browse' ? (
          <div>{/* Existing Shopify search results */}</div>
        ) : (
          <AISearchTab />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create ai-search-tab.tsx**

```tsx
// web/components/rag/ai-search-tab.tsx

'use client'

import { useState } from 'react'
import { useRAGChat } from '@/hooks/use-rag-chat'
import { cn } from '@/lib/utils'
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { CarReference } from './car-reference'

export function AISearchTab() {
  const { messages, isLoading, error, sendMessage } = useRAGChat()
  const [input, setInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      await sendMessage(input.trim())
      setInput('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* AI Elements Conversation */}
      <Conversation className="flex-1 overflow-hidden">
        <ConversationContent className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Ask questions about our inventory in natural language
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Ferrari under £250k', 'Low mileage cars', 'New arrivals this month'].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className={cn(
                      'text-sm px-3 py-1.5 rounded-full',
                      'bg-muted hover:bg-muted/80 border'
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(message => (
              <Message key={message.id} from={message.role === 'user' ? 'user' : 'ai'}>
                <MessageContent>
                  <MessageResponse>{message.content}</MessageResponse>
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
      </Conversation>

      {/* Results */}
      {messages.length > 0 && messages[messages.length - 1]?.sources?.length > 0 && (
        <div className="border-t p-4">
          <p className="text-sm font-medium mb-3">Matching products:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {messages[messages.length - 1].sources!.slice(0, 4).map((source, i) => (
              <CarReference key={i} product={source} />
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe what you're looking for..."
            disabled={isLoading}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg',
              'border border-input bg-background',
              'text-sm',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              'px-4 py-2 rounded-lg',
              'bg-primary text-primary-foreground',
              'text-sm font-medium',
              'disabled:opacity-50'
            )}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Create assistant page**

```tsx
// web/app/assistant/page.tsx

'use client'

import {
  Conversation,
  ConversationHeader,
  ConversationContent,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { useRAGChat } from '@/hooks/use-rag-chat'
import { SuggestedQuestions } from '@/components/rag/suggested-questions'
import { CarReference } from '@/components/rag/car-reference'
import { cn } from '@/lib/utils'

export default function AssistantPage() {
  const { messages, isLoading, error, sendMessage, clearHistory } = useRAGChat()

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
          <p className="text-muted-foreground mb-8">
            Ask me anything about our car inventory, spare parts, or services.
          </p>

          {/* Full-page chat using AI Elements */}
          <div className="border rounded-2xl shadow-sm bg-card overflow-hidden">
            <Conversation className="h-[60vh]">
              <ConversationHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Enermation AI Assistant</h2>
                    <p className="text-xs text-muted-foreground">Powered by Voyage AI + Groq</p>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear chat
                  </button>
                </div>
              </ConversationHeader>

              <ConversationContent className="p-4 overflow-y-auto">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Start a conversation about our inventory</p>
                    <SuggestedQuestions onSubmit={sendMessage} />
                  </div>
                )}

                {messages.map(message => (
                  <Message key={message.id} from={message.role === 'user' ? 'user' : 'ai'}>
                    <MessageContent>
                      <MessageResponse>{message.content}</MessageResponse>

                      {!message.role === 'user' && message.sources && message.sources.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium">Matching products:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {message.sources.slice(0, 4).map((source, i) => (
                              <CarReference key={i} product={source} />
                            ))}
                          </div>
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                ))}

                {isLoading && (
                  <Message from="ai">
                    <MessageContent>
                      <MessageResponse>Searching...</MessageResponse>
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
            </Conversation>

            {/* Input */}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement
                if (input.value.trim()) {
                  await sendMessage(input.value.trim())
                  input.value = ''
                }
              }}
              className="p-4 border-t"
            >
              <div className="flex gap-2">
                <input
                  name="message"
                  placeholder="Ask about cars, parts, services..."
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg',
                    'border border-input bg-background',
                    'text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-ring'
                  )}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'px-4 py-2 rounded-lg',
                    'bg-primary text-primary-foreground',
                    'text-sm font-medium',
                    'disabled:opacity-50'
                  )}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Modify layout.tsx to add WidgetWrapper**

```tsx
// web/app/layout.tsx (add WidgetWrapper to root layout)

import { WidgetWrapper } from '@/components/rag/widget-wrapper'
// ... existing imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <WidgetWrapper />
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add web/app/search/page.tsx web/app/assistant/page.tsx web/components/rag/ai-search-tab.tsx web/app/layout.tsx
git commit -m "feat(rag): integrate AI Elements widget into layout, add AI tab to search page, and create /assistant page"
```

---

## Task 9: Environment Setup

**Files:**
- Create: `web/.env.local.example`

- [ ] **Step 1: Create .env.local.example**

```bash
# Voyage AI
VOYAGE_API_KEY=voyage-xxxxx

# Qdrant Cloud
QDRANT_CLOUD_URL=https://xxxxx.cloud.qdrant.tech
QDRANT_API_KEY=qdrant-xxxxx

# Groq
GROQ_API_KEY=gsk_xxxxx

# Shopify Webhook
SHOPIFY_WEBHOOK_SECRET=shpat_xxxxx

# RAG Admin (for manual reindex)
RAG_ADMIN_SECRET=your-secret-here
```

- [ ] **Step 2: Commit**

```bash
git add web/.env.local.example
git commit -m "docs(rag): add environment variables template"
```

---

## Task 10: Dependencies Installation

**Files:**
- Modify: `web/package.json` (add required dependencies)

- [ ] **Step 1: Add dependencies to package.json**

```json
{
  "dependencies": {
    "@qdrant/qdrant-js": "^2.x",
    "voyageai": "^0.x",
    "@ai-sdk/react": "^0.x",
    "ai": "^4.x",
    "@mdi/js": "^7.x",
    "@mdi/react": "^1.x"
  }
}
```

Run: `cd web && bun install`

- [ ] **Step 2: Install AI Elements**

```bash
cd web
npx ai-elements@latest add conversation
npx ai-elements@latest add message
```

- [ ] **Step 3: Verify types**

Run: `cd web && bunx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore(rag): add RAG dependencies and install AI Elements"
```

---

## Spec Coverage Check

| Spec Section | Task |
|--------------|------|
| Architecture diagram | All tasks |
| Chunking strategy (per-product, 512 tokens) | Task 2 |
| Car metadata schema | Task 1 |
| Spare parts metadata schema | Task 1 |
| Query pipeline | Task 4 |
| Indexing pipeline | Task 4 |
| Reranking formula (k=50, top=10, context=5) | Task 3, Task 4 |
| Chat widget (AI Elements) | Task 7 |
| Augmented /search page | Task 8 |
| /assistant page | Task 8 |
| Shopify webhook | Task 5 |
| Environment setup | Task 9 |

---

## Next: Subagent-Driven Execution

**Plan complete and saved to `docs/superpowers/plans/2026-04-18-enermation-rag-implementation.md`**

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**