import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const formatterCache = new Map<string, Intl.NumberFormat>()

export function formatPrice(amount: string | number, currencyCode: string): string {
  const key = `en-GB-${currencyCode}`
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat('en-GB', { style: 'currency', currency: currencyCode })
    )
  }
  return formatterCache.get(key)!.format(typeof amount === 'string' ? parseFloat(amount) : amount)
}

export type MoneyInput = { amount: string; currencyCode: string }

export function computeLineTotal(line: MoneyInput & { quantity: number }): string {
  return formatPrice(parseFloat(line.amount) * line.quantity, line.currencyCode)
}

export function metaValue(field: { value: string | null } | null): string | null {
  return field?.value ?? null
}
