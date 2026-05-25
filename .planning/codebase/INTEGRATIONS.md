---
name: integrations
description: External service integrations and API clients for the Enermation Workspace
metadata:
  type: codebase
---

# External Integrations

**Analysis Date:** 2026-05-25

## APIs & External Services

**AI Providers:**

- **Groq** - Primary chat model (`groq/gpt-oss-120b`)
  - SDK: `@ai-sdk/groq` 3.0.35
  - Auth: `GROQ_API_KEY` env var
  - BYOK via Vercel AI Gateway

- **Cohere** - Embeddings, reranking, and fallback chat
  - SDK: `@ai-sdk/cohere` 3.0.34
  - Embedding model: `cohere/embed-v4.0` (1536 dimensions)
  - Rerank model: `cohere/rerank-v4-fast`
  - Auth: `COHERE_API_KEY` env var
  - Reranking bypasses Vercel AI Gateway (no BYOK support for rerank)

- **Anthropic** - Alternative chat provider
  - SDK: `@ai-sdk/anthropic` 3.0.71
  - Auth: `ANTHROPIC_API_KEY` env var
  - Via Vercel AI Gateway BYOK

- **Vercel AI Gateway** - Unified gateway for AI providers
  - SDK: `@ai-sdk/gateway` 3.0.107
  - Auth priority: AI_GATEWAY_API_KEY -> VERCEL_OIDC_TOKEN -> Vercel free credits
  - Supports BYOK with `providerOptions.gateway.byok`

**Vector Search:**

- **Qdrant** - Vector database for RAG
  - SDK: `@qdrant/qdrant-js` 1.17.0
  - Collection: `enermation-products`
  - Vector size: 1536 (Cohere embed-v4.0)
  - Distance: Cosine
  - Auth: `QDRANT_URL`, `QDRANT_API_KEY` env vars

- **Upstash Vector** - Alternative vector database (configured but not primary)
  - SDK: `@upstash/vector` 1.2.3

**Caching & Rate Limiting:**

- **Upstash Redis** - Rate limiting backing store
  - SDK: `@upstash/redis` 1.37.0
  - Configured via `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - Rate limit: 10 requests per 60 seconds

- **Upstash Ratelimit** - Rate limiting logic
  - SDK: `@upstash/ratelimit` 2.0.8
  - Uses Upstash Redis

**Analytics & Monitoring:**

- **Vercel Analytics** - Traffic analytics
  - SDK: `@vercel/analytics` 2.0.1

- **Vercel Speed Insights** - Performance monitoring
  - SDK: `@vercel/speed-insights` 2.0.0

## Data Storage

**Shopify Storefront API** - Primary product database
- Client: `@shopify/storefront-api-client` 1.0.10
- API version: 2026-04
- Auth: `PRIVATE_STOREFRONT_API_TOKEN` env var (also accepts `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `PUBLIC_STOREFRONT_API_TOKEN`)
- Store domain: `PUBLIC_STORE_DOMAIN` (also accepts `SHOPIFY_STORE_DOMAIN`)

**Shopify Admin API** - Metafield and metaobject resolution
- Endpoint: `https://{domain}/admin/api/2026-04/graphql.json`
- Auth: `SHOPIFY_ADMIN_ACCESS_TOKEN` env var
- Used for metafield resolution (vehicle specs, features)

**RAG Data:**
- Qdrant vector store (products)
- Raw content stored alongside vectors

## Authentication & Identity

**Vercel OIDC** - Deployment authentication
- SDK: `@vercel/oidc` 3.4.0
- Used for AI Gateway authentication flow

**RAG Admin Secret** - Reindex endpoint protection
- Auth: `RAG_ADMIN_SECRET` env var (Bearer token for admin reindex endpoint)

## Environment Configuration

**Required env vars (RAG/Assistant):**

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API |
| `GROQ_API_KEY` | Groq API key |
| `COHERE_API_KEY` | Cohere API key |
| `VOYAGE_API_KEY` | Voyage AI (alternative embeddings) |
| `UPSTASH_VECTOR_REST_URL` | Upstash Vector URL |
| `UPSTASH_VECTOR_REST_TOKEN` | Upstash Vector token |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `RAG_ADMIN_SECRET` | Admin reindex Bearer token |
| `CHAT_PROVIDER` | Chat provider selection (`anthropic` or `groq`) |
| `CHAT_MODEL_ID` | Model ID override |

**Required env vars (Shopify):**

| Variable | Purpose |
|----------|---------|
| `PUBLIC_STORE_DOMAIN` | Shopify store domain |
| `PRIVATE_STOREFRONT_API_TOKEN` | Storefront API access token |

**Model Constants** (`web/lib/rag/constants.ts`):

- Embed model: `cohere/embed-v4.0`
- Rerank model: `cohere/rerank-v4-fast`
- Chat model: `groq/gpt-oss-120b` (default)
- Vision model: `meta/llama-4-scout`
- Vision fallback: `cohere/command-a`

## Image Loading

**Custom loader:** `web/lib/image-loader.ts`

**Allowed remote patterns:**
- `cdn.shopify.com` - Shopify CDN
- `behold.pictures` - Image hosting

## CI/CD & Deployment

**Hosting:** Vercel (implied by @vercel/* packages, Vercel AI Gateway)

**CI Pipeline:**
- Husky for git hooks
- lint-staged for pre-commit linting
- @changesets/cli for versioning

**E2E Tests:** Playwright (`web/tests/e2e/playwright.config.ts`)

---

*Integration audit: 2026-05-25*