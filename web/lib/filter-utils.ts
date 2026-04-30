import type { ActiveFilters, FilterDimension, FilterOption, ShopifyProduct } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEffectiveValue(product: ShopifyProduct, key: keyof ActiveFilters): string | null {
  switch (key) {
    case 'make':
      return product.make?.value ?? null
    case 'model':
      return product.model?.value ?? null
    case 'year':
      return product.year?.value ?? null
    case 'mileage':
      return product.mileage?.value ?? null
    case 'colour':
      return product.colour?.value ?? null
    case 'fuelType':
      return product.fuelType?.value ?? null
    case 'transmission':
      return product.transmission?.value ?? null
    case 'condition':
      return product.condition?.value ?? null
    case 'driveType':
      return product.driveType?.value ?? null
    case 'originCountry':
      return product.originCountry?.value ?? null
    case 'engine':
      return product.engine?.value ?? null
    default:
      return null
  }
}

function dimensionKeyToField(key: string): keyof ActiveFilters | null {
  const map: Record<string, keyof ActiveFilters> = {
    make: 'make',
    model: 'model',
    year: 'year',
    condition: 'condition',
    fuelType: 'fuelType',
    transmission: 'transmission',
    driveType: 'driveType',
    originCountry: 'originCountry',
    colour: 'colour',
    engine: 'engine',
    mileage: 'mileage',
  }
  return map[key] ?? null
}

// ── Build filter dimensions ─────────────────────────────────────────────────────

type DimensionDef = {
  key: keyof ActiveFilters
  label: string
  type: 'text' | 'number'
}

const DIMENSION_DEFS: DimensionDef[] = [
  { key: 'make', label: 'Make', type: 'text' },
  { key: 'model', label: 'Model', type: 'text' },
  { key: 'year', label: 'Year', type: 'number' },
  { key: 'colour', label: 'Colour', type: 'text' },
  { key: 'fuelType', label: 'Fuel Type', type: 'text' },
  { key: 'transmission', label: 'Transmission', type: 'text' },
  { key: 'condition', label: 'Condition', type: 'text' },
  { key: 'driveType', label: 'Drive Type', type: 'text' },
  { key: 'originCountry', label: 'Origin', type: 'text' },
  { key: 'engine', label: 'Engine', type: 'text' },
]

export function buildFilterDimensions(products: ShopifyProduct[]): FilterDimension[] {
  return DIMENSION_DEFS.map(def => {
    const counts = new Map<string, number>()

    for (const product of products) {
      const value = getEffectiveValue(product, def.key)
      if (!value) continue
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }

    const options: FilterOption[] = Array.from(counts.entries())
      .sort(
        ([a], [b]) =>
          def.type === 'number'
            ? Number(b) - Number(a) // years descending
            : a.localeCompare(b) // alphabetical for text
      )
      .map(([value, count]) => ({ value, label: value, count }))

    return {
      key: def.key,
      label: def.label,
      type: def.type,
      options,
    }
  }).filter(d => d.options.length > 0)
}

// ── Apply filters ─────────────────────────────────────────────────────────────

export function applyFilters(products: ShopifyProduct[], active: ActiveFilters): ShopifyProduct[] {
  return products.filter(product => {
    for (const [key, value] of Object.entries(active)) {
      if (!value) continue
      const effectiveValue = getEffectiveValue(product, key as keyof ActiveFilters)
      if (effectiveValue !== value) return false
    }
    return true
  })
}

// ── Compute filtered counts ────────────────────────────────────────────────────

export function computeFilteredCounts(
  products: ShopifyProduct[],
  active: ActiveFilters,
  dimensionKey: string
): Map<string, number> {
  const field = dimensionKeyToField(dimensionKey)
  if (!field) return new Map()

  // Build the "other filters" by excluding the target dimension
  const otherActive: ActiveFilters = { ...active }
  delete otherActive[field]

  const counts = new Map<string, number>()

  for (const product of products) {
    // First check if product passes all OTHER active filters
    let passesOtherFilters = true
    for (const [k, v] of Object.entries(otherActive)) {
      if (!v) continue
      const effectiveValue = getEffectiveValue(product, k as keyof ActiveFilters)
      if (effectiveValue !== v) {
        passesOtherFilters = false
        break
      }
    }
    if (!passesOtherFilters) continue

    // Now count this product under each option of the target dimension
    const value = getEffectiveValue(product, field)
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return counts
}
