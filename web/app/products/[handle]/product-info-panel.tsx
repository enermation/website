'use client'

import { mdiChevronDown } from '@mdi/js'
import { Icon } from '@mdi/react'
import { useState } from 'react'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { productPage } from '@/lib/data'
import { FEATURE_MAP, scanFeaturesFromText } from '@/lib/features'
import type { ResolvedSpec, ShopifyProductVariant } from '@/lib/types'
import { cn, formatPrice } from '@/lib/utils'

// Metafields listed here appear in the collapsible "Stats & Performance" section
// rather than the main key specs table. Add shopify.* keys as needed.
const TECH_SPEC_KEYS = new Set<string>([])

function SpecTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <Table>
      <TableBody>
        {rows.map(({ label, value }) => (
          <TableRow key={label}>
            <TableCell className="border border-border font-body text-12 text-muted-foreground">
              {label}
            </TableCell>
            <TableCell className="border border-border font-body text-14 font-medium text-foreground">
              {value}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

type ProductInfoPanelProps = {
  vendor?: string | null
  title: string
  availableForSale: boolean
  description: string
  variants: ShopifyProductVariant[]
  defaultVariantId?: string
  resolvedSpecs: ResolvedSpec[]
  resolvedFeatures: string[]
}

export function ProductInfoPanel({
  vendor,
  title,
  availableForSale,
  description,
  variants,
  defaultVariantId,
  resolvedSpecs,
  resolvedFeatures,
}: ProductInfoPanelProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    defaultVariantId ?? variants[0]?.id ?? ''
  )

  const selectedVariant = variants.find(v => v.id === selectedVariantId) ?? variants[0]

  const currentPrice = selectedVariant
    ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
    : null

  const currentAvailableForSale = selectedVariant?.availableForSale ?? availableForSale

  const specOptions =
    selectedVariant?.selectedOptions?.filter(
      option => option.name !== 'Title' && option.value !== 'Default Title'
    ) ?? []

  const equipmentItems = resolvedFeatures

  const allSpecRows = [
    ...specOptions.map(o => ({ label: o.name, value: o.value })),
    ...resolvedSpecs,
  ]

  const hasStructuredSpecs = allSpecRows.length > 0

  const hasNamespace = (r: {
    label: string
    value: string
  }): r is { label: string; value: string } & { namespace: string; key: string } => 'namespace' in r

  const keySpecRows = allSpecRows.filter(r => {
    const id = hasNamespace(r) ? `${r.namespace}.${r.key}` : null
    return id === null || !TECH_SPEC_KEYS.has(id)
  })
  const techSpecRows = allSpecRows.filter(r => {
    const id = hasNamespace(r) ? `${r.namespace}.${r.key}` : null
    return id !== null && TECH_SPEC_KEYS.has(id)
  })

  // Metafield features are authoritative — use their proper taxonomy labels
  const metafieldIconFeatures = equipmentItems
    .map(item => {
      const entry = FEATURE_MAP.find(e => e.keywords.some(k => item.toLowerCase().includes(k)))
      return entry ? { item, icon: entry.icon, iconGrid: entry.iconGrid ?? false } : null
    })
    .filter((f): f is { item: string; icon: string; iconGrid: boolean } => f !== null)

  // Scan description for additional features not already covered by metafields
  const coveredIcons = new Set(metafieldIconFeatures.map(f => f.icon))
  const descriptionIconFeatures = scanFeaturesFromText(description)
    .map(f => {
      const entry = FEATURE_MAP.find(e => e.icon === f.icon)
      return entry ? { ...f, iconGrid: entry.iconGrid ?? false } : f
    })
    .filter(f => !coveredIcons.has(f.icon))

  const allIconFeatures: { item: string; icon: string; iconGrid: boolean }[] = [
    ...metafieldIconFeatures,
    ...descriptionIconFeatures,
  ]
  const iconGridFeatures = allIconFeatures.filter(f => f.iconGrid)
  const moreFeatures = allIconFeatures.filter(f => !f.iconGrid).map(f => f.item)

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Row 1: vendor + title */}
      <div
        data-reveal="1"
        className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6"
      >
        <div className="flex flex-col gap-1">
          {vendor && (
            <p className="font-body text-11 uppercase tracking-widest text-muted-foreground">
              {vendor}
            </p>
          )}
          <h1 className="font-display text-3xl leading-tight text-heading md:text-4xl md:leading-snug">
            {title}
          </h1>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          <p className="whitespace-nowrap font-display text-4xl font-semibold text-heading">
            {currentAvailableForSale && currentPrice ? currentPrice : productPage.labels.reserved}
          </p>
          <Badge
            variant="outline"
            className={cn(
              'h-auto rounded-none px-3 py-1 font-heading text-11 font-semibold uppercase tracking-widest',
              currentAvailableForSale
                ? 'border-brand-green text-brand-green'
                : 'border-muted-foreground text-muted-foreground'
            )}
          >
            {currentAvailableForSale ? productPage.labels.available : productPage.labels.sold}
          </Badge>
        </div>
      </div>

      {/* Row 2: Add to Cart */}
      <div data-reveal="2">
        <AddToCartButton
          merchandiseId={selectedVariant?.id ?? ''}
          availableForSale={currentAvailableForSale}
        />
      </div>

      {/* Row 3: Variant selector */}
      {variants.length > 1 && (
        <div data-reveal="3" className="flex flex-col gap-2">
          <label
            htmlFor="variant-select"
            className="font-heading text-13 font-semibold uppercase tracking-wide text-foreground"
          >
            Select Variant
          </label>
          <Select value={selectedVariantId} onValueChange={v => v && setSelectedVariantId(v)}>
            <SelectTrigger
              id="variant-select"
              className="h-12 rounded-none border-border bg-background px-4 font-body text-15 text-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {variants.map(variant => {
                const label = variant.selectedOptions
                  ?.filter(o => o.name !== 'Title' && o.value !== 'Default Title')
                  .map(o => o.value)
                  .join(' / ')
                return (
                  <SelectItem key={variant.id} value={variant.id}>
                    {label ?? variant.title}
                    {!variant.availableForSale ? ` — ${productPage.labels.sold}` : ''}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {keySpecRows.length > 0 && (
        <div data-reveal="4" className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-heading">
            {productPage.sections.keyInformation}
          </h2>
          <SpecTable rows={keySpecRows} />
        </div>
      )}

      {techSpecRows.length > 0 && (
        <Collapsible data-reveal="5" defaultOpen={false}>
          <CollapsibleTrigger className="flex w-full items-center justify-between border border-border px-4 py-3 hover:bg-muted/50">
            <span className="font-display text-xl text-heading">
              {productPage.sections.statsAndPerformance}
            </span>
            <Icon
              path={mdiChevronDown}
              size={1}
              className="size-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border border-t-0 border-border">
              <SpecTable rows={techSpecRows} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {iconGridFeatures.length > 0 && (
        <div data-reveal="6" className="flex flex-col gap-4">
          <h2 className="font-display text-xl text-heading">
            {productPage.sections.vehicleFeatures}
          </h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {iconGridFeatures.map(({ item, icon }) => (
              <li key={item} className="flex items-center gap-2">
                <Icon path={icon} size={1} className="size-4 shrink-0 text-foreground" />
                <span className="font-body text-14 text-body">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {moreFeatures.length > 0 && (
        <Collapsible data-reveal="7">
          <CollapsibleTrigger className="flex w-full items-center justify-between border border-border px-4 py-3 hover:bg-muted/50">
            <span className="font-body text-14 font-medium text-foreground">
              {productPage.sections.moreFeatures}
            </span>
            <Icon
              path={mdiChevronDown}
              size={1}
              className="size-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="flex flex-col gap-1 border border-t-0 border-border px-4 py-3">
              {moreFeatures.map(item => (
                <li
                  key={item}
                  className="font-body text-14 text-body before:mr-2 before:content-['·']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {!hasStructuredSpecs && description && (
        <div data-reveal="8" className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-heading">
            {productPage.sections.aboutThisListing}
          </h2>
          <p className="whitespace-pre-line break-words font-body text-15 leading-relaxed text-body">
            {description}
          </p>
        </div>
      )}
    </div>
  )
}
