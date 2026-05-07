<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## RAG Pipeline (Embedding + Reranking)
- Embedding and reranking route **direct to Cohere** via `@ai-sdk/cohere` — NOT through Vercel AI Gateway.
  Gateway does not support rerank BYOK, causing free-credit rate limits.
- Models: `cohere.embedding('embed-v4.0')` for vectors, `cohere.reranking('rerank-v3.5')` for reranking.
- Both auto-read `COHERE_API_KEY` from env (no explicit key passing needed).
- Ingest script: `bun run scripts/ingest.ts` (embeddings bypass gateway, no OIDC needed).
