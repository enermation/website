import type { ActiveFilters, FilterDimension, FilterOption, ShopifyProduct } from './types'

const EXCLUDED_SPEC_IDS = new Set(['shopify.vehicle-features'])

// Preferred display order — matched against spec labels (case-insensitive substring).
// Unknown labels fall through to alphabetical.
const PREFERRED_LABEL_ORDER = [
  'make',
  'model',
  'year',
  'condition',
  'fuel',
  'transmission',
  'drive',
  'colour',
  'color',
  'engine',
  'origin',
  'mileage',
]

export function buildFilterDimensions(products: ShopifyProduct[]): FilterDimension[] {
  const specMap = new Map<string, { label: string; counts: Map<string, number> }>()

  for (const product of products) {
    for (const spec of product.resolvedSpecs ?? []) {
      const id = `${spec.namespace}.${spec.key}`
      if (EXCLUDED_SPEC_IDS.has(id)) continue

      if (!specMap.has(id)) specMap.set(id, { label: spec.label, counts: new Map() })
      const entry = specMap.get(id)!
      entry.counts.set(spec.value, (entry.counts.get(spec.value) ?? 0) + 1)
    }
  }

  return Array.from(specMap.entries())
    .sort(([, a], [, b]) => {
      const ai = PREFERRED_LABEL_ORDER.findIndex(l => a.label.toLowerCase().includes(l))
      const bi = PREFERRED_LABEL_ORDER.findIndex(l => b.label.toLowerCase().includes(l))
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      return a.label.localeCompare(b.label)
    })
    .map(([key, { label, counts }]) => {
      const allNumeric = Array.from(counts.keys()).every(v => v !== '' && !Number.isNaN(Number(v)))
      const options: FilterOption[] = Array.from(counts.entries())
        .sort(([a], [b]) => (allNumeric ? Number(b) - Number(a) : a.localeCompare(b)))
        .map(([value, count]) => ({ value, label: value, count }))
      return {
        key,
        label,
        type: (allNumeric ? 'number' : 'text') as 'text' | 'number',
        options,
      }
    })
    .filter(d => d.options.length > 0)
}

export function applyFilters(products: ShopifyProduct[], active: ActiveFilters): ShopifyProduct[] {
  const activeEntries = Object.entries(active).filter(([, v]) => v && v !== 'Show All')
  if (activeEntries.length === 0) return products

  return products.filter(product => {
    for (const [specId, value] of activeEntries) {
      if (!value) continue
      const dot = specId.indexOf('.')
      const ns = specId.slice(0, dot)
      const key = specId.slice(dot + 1)
      const match = (product.resolvedSpecs ?? []).find(s => s.namespace === ns && s.key === key)
      if (!match || match.value !== value) return false
    }
    return true
  })
}
