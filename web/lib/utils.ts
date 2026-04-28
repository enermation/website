import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const formatterCache = new Map<string, Intl.NumberFormat>()

export function formatPrice(amount: string | number, currencyCode: string): string {
  const key = `en-GB-${currencyCode}`
  let formatter = formatterCache.get(key)

  if (!formatter) {
    formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: currencyCode })
    formatterCache.set(key, formatter)
  }

  return formatter.format(typeof amount === 'string' ? parseFloat(amount) : amount)
}

export type MoneyInput = { amount: string; currencyCode: string }

export function computeLineTotal(line: MoneyInput & { quantity: number }): string {
  return formatPrice(parseFloat(line.amount) * line.quantity, line.currencyCode)
}

export function metaValue(field: { value: string | null } | null): string | null {
  return field?.value ?? null
}

// Parses make and model from a product title like "Toyota Hilux SR5 48V Hybrid".
// First word = make (manufacturer), second word = model, remaining = variant/trim.
export function parseVehicleFromTitle(title: string): {
  make: string | null
  model: string | null
} {
  const parts = title.trim().split(/\s+/)
  return {
    make: parts[0] ?? null,
    model: parts[1] ?? null,
  }
}

// ── Vehicle description formatter ──────────────────────────────────────────

const DESCRIPTION_LABELS = [
  'Year',
  'Mileage',
  'Transmission',
  'Displacement',
  'Engine',
  'Max output',
  'Fuel',
  'Drivetrain',
  'Drive modes',
  'Steering Modes',
  'Suspension',
  'Chassis',
  'Frame',
  'Model Code',
  'Equipment',
] as const

type DescriptionLine = {
  label: string
  value: string
}

/**
 * Parses raw Shopify product description strings into structured label/value pairs.
 * Handles concatenated formats like "Year: 2025Mileage: 0 kmTransmission: Automatic..."
 * where field labels run together without proper separators.
 */
export function parseVehicleDescription(raw: string): DescriptionLine[] {
  if (!raw) return []

  // Clean the input — normalize whitespace, remove newlines
  const text = raw.replace(/\n/g, ' ').replace(/\r/g, ' ').trim()

  // Build a regex that matches any known label followed by a colon
  // Labels contain uppercase letters, spaces, and hyphens
  const labelPattern = DESCRIPTION_LABELS.join('|').replace(/ /g, '\\s+')

  // Find all label positions in the string
  const labelRegex = new RegExp(`(${labelPattern}):`, 'gi')
  const matches = [...text.matchAll(labelRegex)]

  if (matches.length === 0) {
    return [{ label: '', value: text }]
  }

  const result: DescriptionLine[] = []

  for (let i = 0; i < matches.length; i++) {
    const label = matches[i][1]
    const startIndex = matches[i].index ?? 0

    // Value extends from after the label+colon to the start of the next label (or end)
    const valueStart = startIndex + label.length + 1 // skip "Label:"
    const nextMatch = matches[i + 1]
    const valueEnd = nextMatch ? (nextMatch.index ?? text.length) : text.length
    const value = text.slice(valueStart, valueEnd).trim()

    if (label && value) {
      result.push({ label, value })
    }
  }

  return result
}

/**
 * Formats a vehicle description for display — separates specs from equipment.
 */
export function formatVehicleDescription(raw: string): {
  specs: DescriptionLine[]
  equipment: string[]
} {
  if (!raw) return { specs: [], equipment: [] }

  const parsed = parseVehicleDescription(raw)

  const specs = parsed.filter(line => line.label !== 'Equipment')
  const equipmentLines = parsed.filter(line => line.label === 'Equipment')

  // Equipment items are comma or slash-separated
  const equipment = equipmentLines.flatMap(line =>
    line.value
      .split(/[,/]/)
      .map(part => part.trim())
      .filter(Boolean)
  )

  return { specs, equipment }
}
