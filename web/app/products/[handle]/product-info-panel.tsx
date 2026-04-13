'use client'

import { mdiCar } from '@mdi/js'
import { Icon } from '@mdi/react'
import { useRef } from 'react'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { ProductSpecs1 } from '@/components/product-specs1'
import { Badge } from '@/components/ui/badge'
import { productPage } from '@/lib/data'
import { gsap, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

type ProductInfoPanelProps = {
  vendor?: string | null
  title: string
  price: string
  availableForSale: boolean
  description: string
  specOptions: { name: string; value: string }[]
  merchandiseId: string
}

export function ProductInfoPanel({
  vendor,
  title,
  price,
  availableForSale,
  description,
  specOptions,
  merchandiseId,
}: ProductInfoPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const items = containerRef.current?.querySelectorAll('[data-reveal]')
      if (!items?.length) return
      gsap.set(items, { opacity: 0, y: 20 })
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.15,
        clearProps: 'all',
      })
    },
    { scope: containerRef }
  )

  const specs = [
    ...(vendor ? [{ label: productPage.labels.brand, value: vendor }] : []),
    ...specOptions.map(option => ({ label: option.name, value: option.value })),
    {
      label: productPage.labels.status,
      value: availableForSale ? productPage.labels.available : productPage.labels.soldOrReserved,
    },
    {
      label: productPage.labels.price,
      value: availableForSale ? price : productPage.labels.reserved,
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
            {availableForSale ? price : productPage.labels.reserved}
          </p>
          <Badge
            variant="outline"
            className={cn(
              'h-auto rounded-none px-3 py-1 font-heading text-13 font-semibold uppercase tracking-wide',
              availableForSale
                ? 'border-brand-green text-brand-green'
                : 'border-muted-foreground text-muted-foreground'
            )}
          >
            {availableForSale ? productPage.labels.available : productPage.labels.sold}
          </Badge>
        </div>
      </div>

      <div data-reveal>
        <AddToCartButton merchandiseId={merchandiseId} availableForSale={availableForSale} />
      </div>

      {description ? (
        <div data-reveal className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-balance text-heading">
            {productPage.sections.aboutThisListing}
          </h2>
          <p className="whitespace-pre-line break-words font-body text-15 leading-relaxed text-body">
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
