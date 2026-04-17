'use client'

import { mdiCar } from '@mdi/js'
import { Icon } from '@mdi/react'
import { useRef, useState } from 'react'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { ProductSpecs1 } from '@/components/product-specs1'
import { Badge } from '@/components/ui/badge'
import { productPage } from '@/lib/data'
import { gsap, useGSAP } from '@/lib/gsap'
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
      const items = containerRef.current?.querySelectorAll('[data-reveal]')
      if (!items?.length) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.15,
      })
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
      <div
        data-reveal
        className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6"
      >
        <div className="flex flex-col gap-1">
          {vendor && (
            <p className="font-body text-13 uppercase tracking-widest text-body">{vendor}</p>
          )}
          <h1 className="font-display text-2xl leading-tight text-heading md:text-3xl md:leading-snug">
            {title}
          </h1>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          <p className="whitespace-nowrap font-heading text-2xl font-semibold text-foreground">
            {currentAvailableForSale && currentPrice ? currentPrice : productPage.labels.reserved}
          </p>
          <Badge
            variant="outline"
            className={cn(
              'h-auto rounded-none px-3 py-1 font-heading text-13 font-semibold uppercase tracking-wide',
              currentAvailableForSale
                ? 'border-brand-green text-brand-green'
                : 'border-muted-foreground text-muted-foreground'
            )}
          >
            {currentAvailableForSale ? productPage.labels.available : productPage.labels.sold}
          </Badge>
        </div>
      </div>

      <div data-reveal>
        <AddToCartButton
          merchandiseId={selectedVariant?.id ?? ''}
          availableForSale={currentAvailableForSale}
        />
      </div>

      {variants.length > 1 && (
        <div data-reveal className="flex flex-col gap-2">
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

      {description ? (
        <div data-reveal className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-balance text-heading">
            {productPage.sections.aboutThisListing}
          </h2>
          <p className="whitespace-pre-line overflow-wrap-break-word font-body text-15 leading-relaxed text-body">
            {description}
          </p>
        </div>
      ) : null}

      <div data-reveal>
        <ProductSpecs1 categories={categories} title="" className="py-0" />
      </div>
    </div>
  )
}
