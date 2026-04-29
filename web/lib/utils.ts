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
  'Model',
  'Equipment',
] as const

type DescriptionLine = {
  label: string
  value: string
}

export function parseVehicleDescription(raw: string): DescriptionLine[] {
  if (!raw) return []

  const text = raw.replace(/\n/g, ' ').replace(/\r/g, ' ').trim()

  const labelPattern = DESCRIPTION_LABELS.join('|').replace(/ /g, '\\s+')
  const labelRegex = new RegExp(`(${labelPattern}):`, 'gi')
  const matches = [...text.matchAll(labelRegex)]

  if (matches.length === 0) {
    return [{ label: '', value: text }]
  }

  const result: DescriptionLine[] = []

  for (let i = 0; i < matches.length; i++) {
    const label = matches[i][1]
    const startIndex = matches[i].index ?? 0
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

export function formatVehicleDescription(raw: string): {
  specs: DescriptionLine[]
  equipment: string[]
} {
  if (!raw) return { specs: [], equipment: [] }

  const parsed = parseVehicleDescription(raw)

  const specs = parsed.filter(line => line.label !== 'Equipment')
  const equipmentLines = parsed.filter(line => line.label === 'Equipment')

  const equipment = equipmentLines.flatMap(line =>
    line.value
      .split(/[,/]/)
      .map(part => part.trim())
      .filter(Boolean)
  )

  return { specs, equipment }
}

export function cleanSuggestionMarkers(content: string): string {
  return content.replace(/\s*SUGGESTION:[\s\S]*$/i, '').trim()
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^[*-]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .trim()
}
