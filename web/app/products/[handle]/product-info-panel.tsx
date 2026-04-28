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
import { productPage } from '@/lib/data'
import { matchFeature } from '@/lib/features'
import type { ShopifyProductVariant } from '@/lib/types'
import { cn, formatPrice, parseVehicleDescription } from '@/lib/utils'

const TECH_SPEC_LABELS = new Set([
  'Displacement',
  'Max output',
  'Drivetrain',
  'Drive modes',
  'Steering Modes',
  'Suspension',
  'Chassis',
  'Frame',
])

function SpecTable({ rows }: { rows: { label: string; value: string }[] }) {
  const left = rows.filter((_, i) => i % 2 === 0)
  const right = rows.filter((_, i) => i % 2 !== 0)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="md:pr-6">
        {left.map(({ label, value }) => (
          <div
            key={label}
            className="flex min-w-0 items-center justify-between gap-4 border-b border-border py-3"
          >
            <span className="shrink-0 font-body text-14 text-muted-foreground">{label}</span>
            <span className="truncate font-body text-14 font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>
      <div className="md:border-l md:border-border md:pl-6">
        {right.map(({ label, value }) => (
          <div
            key={label}
            className="flex min-w-0 items-center justify-between gap-4 border-b border-border py-3"
          >
            <span className="shrink-0 font-body text-14 text-muted-foreground">{label}</span>
            <span className="truncate font-body text-14 font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type ProductInfoPanelProps = {
  vendor?: string | null
  title: string
  availableForSale: boolean
  description: string
  variants: ShopifyProductVariant[]
  defaultVariantId?: string
}

export function ProductInfoPanel({
  vendor,
  title,
  availableForSale,
  description,
  variants,
  defaultVariantId,
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

  const parsed = parseVehicleDescription(description)

  const vehicleSpecLines = parsed
    .filter(line => line.label !== 'Equipment')
    .map(line => ({ label: line.label, value: line.value }))

  const equipmentRaw = parsed
    .filter(line => line.label === 'Equipment')
    .map(line => line.value)
    .join(' ')

  const equipmentItems = equipmentRaw
    ? equipmentRaw
        .split(/[,/]/)
        .map(s => s.trim())
        .filter(Boolean)
    : []

  const hasStructuredSpecs = vehicleSpecLines.some(l => l.label !== '')

  const allSpecRows = [
    ...specOptions.map(o => ({ label: o.name, value: o.value })),
    ...vehicleSpecLines.filter(l => l.label !== ''),
  ].filter(r => r.value)

  const keySpecRows = allSpecRows.filter(r => !TECH_SPEC_LABELS.has(r.label))
  const techSpecRows = allSpecRows.filter(r => TECH_SPEC_LABELS.has(r.label))

  const iconFeatures = equipmentItems
    .map(item => ({ item, icon: matchFeature(item) }))
    .filter((f): f is { item: string; icon: string } => f.icon !== null)

  const unmatchedFeatures = equipmentItems.filter(item => matchFeature(item) === null)

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
        <div data-reveal="5" className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-heading">
            {productPage.sections.statsAndPerformance}
          </h2>
          <SpecTable rows={techSpecRows} />
        </div>
      )}

      {iconFeatures.length > 0 && (
        <div data-reveal="6" className="flex flex-col gap-4">
          <h2 className="font-display text-xl text-heading">
            {productPage.sections.vehicleFeatures}
          </h2>
          <div className="grid grid-cols-3 gap-6 rounded-lg border border-border p-6 sm:grid-cols-4 md:grid-cols-5">
            {iconFeatures.map(({ item, icon }) => (
              <div key={item} className="flex flex-col items-center gap-2 text-center">
                <Icon path={icon} size={1} className="size-6 text-foreground" />
                <span className="font-body text-12 leading-tight text-muted-foreground">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {unmatchedFeatures.length > 0 && (
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
              {unmatchedFeatures.map(item => (
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
