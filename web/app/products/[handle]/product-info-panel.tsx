'use client'

import { mdiCar } from '@mdi/js'
import { Icon } from '@mdi/react'
import { useRef, useState } from 'react'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { ProductSpecs1 } from '@/components/product-specs1'
import { Badge } from '@/components/ui/badge'
import { productPage } from '@/lib/data'
import { useGSAP } from '@/lib/gsap'
import type { ShopifyProductVariant } from '@/lib/types'
import { cn, formatPrice } from '@/lib/utils'

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
  const containerRef = useRef<HTMLDivElement>(null)

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

  useGSAP(
    () => {
      // CSS animations handle staggered reveal via [data-reveal="N"] animation-delay
      // GSAP is not needed for stagger; reduced-motion is handled by CSS
    },
    { scope: containerRef }
  )

  const specs = [
    ...(vendor ? [{ label: productPage.labels.brand, value: vendor }] : []),
    ...specOptions.map(option => ({ label: option.name, value: option.value })),
    {
      label: productPage.labels.status,
      value: currentAvailableForSale
        ? productPage.labels.available
        : productPage.labels.soldOrReserved,
    },
    {
      label: productPage.labels.price,
      value: currentAvailableForSale && currentPrice ? currentPrice : productPage.labels.reserved,
    },
  ]

  const categories = [
    {
      id: 'details',
      name: productPage.sections.listingDetails,
      icon: <Icon path={mdiCar} size={1} className="size-4" />,
      specs,
    },
  ]

  return (
    <div ref={containerRef} className="flex flex-col gap-6 md:gap-8">
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
          <select
            id="variant-select"
            value={selectedVariantId}
            onChange={e => setSelectedVariantId(e.target.value)}
            className="h-12 rounded-none border border-gray-90 bg-background px-4 font-body text-15 text-foreground"
          >
            {variants.map(variant => {
              const label = variant.selectedOptions
                ?.filter(o => o.name !== 'Title' && o.value !== 'Default Title')
                .map(o => o.value)
                .join(' / ')
              return (
                <option key={variant.id} value={variant.id}>
                  {label ?? variant.title}
                  {!variant.availableForSale ? ` — ${productPage.labels.sold}` : ''}
                </option>
              )
            })}
          </select>
        </div>
      )}

      {/* Row 4: Description */}
      {description ? (
        <div data-reveal="4" className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-balance text-heading">
            {productPage.sections.aboutThisListing}
          </h2>
          <p className="whitespace-pre-line overflow-wrap-break-word font-body text-15 leading-relaxed text-body">
            {description}
          </p>
        </div>
      ) : null}

      {/* Row 5: Specs */}
      <div data-reveal="5">
        <ProductSpecs1 categories={categories} title="" className="py-0" />
      </div>
    </div>
  )
}
