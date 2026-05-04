import 'server-only'

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'up',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'has',
  'have',
  'had',
  'this',
  'that',
  'it',
  'its',
  'as',
  'no',
  'not',
  'so',
  'if',
])

// FNV-1a 32-bit hash — deterministic, collision-resistant for short strings
function fnv1a32(str: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash
}

export type SparseVector = { indices: number[]; values: number[] }

/**
 * Convert text to a BM25-style sparse vector using TF weighting.
 * Uses FNV-1a32 hash to map tokens to stable 32-bit indices.
 * Same text at index time and query time → compatible sparse vectors.
 */
export function toSparseVector(text: string): SparseVector {
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 2 && t.length <= 25 && !STOP_WORDS.has(t))

  if (tokens.length === 0) return { indices: [], values: [] }

  const tf = new Map<number, number>()
  for (const token of tokens) {
    const idx = fnv1a32(token)
    tf.set(idx, (tf.get(idx) ?? 0) + 1)
  }

  const total = tokens.length
  const sorted = [...tf.entries()].sort(([a], [b]) => a - b)

  return {
    indices: sorted.map(([idx]) => idx),
    values: sorted.map(([, count]) => parseFloat((count / total).toFixed(6))),
  }
}
