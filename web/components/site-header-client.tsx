'use client'

import {
  mdiArrowBottomRight,
  mdiArrowRight,
  mdiBike,
  mdiBus,
  mdiBusArticulatedEnd,
  mdiCar,
  mdiCarConvertible,
  mdiCarElectric,
  mdiCarEstate,
  mdiCarHatchback,
  mdiCarPickup,
  mdiCarSports,
  mdiCart,
  mdiCarWrench,
  mdiChevronDown,
  mdiChevronRight,
  mdiFlash,
  mdiHome,
  mdiJeepney,
  mdiMenu,
  mdiMotorbike,
  mdiTractorVariant,
  mdiTruck,
  mdiTruckCargoContainer,
  mdiVanPassenger,
} from '@mdi/js'
import { Icon } from '@mdi/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HeaderSearch } from '@/components/header-search'
import { ShoppingCart1 } from '@/components/shopping-cart1'
import { Badge } from '@/components/ui/badge'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/lib/cart-context'
import { headerDropdownCopy } from '@/lib/data'
import type { HeaderNavItem, HeaderNavigation } from '@/lib/header-navigation'
import { cn } from '@/lib/utils'

type SiteHeaderClientProps = {
  navigation: HeaderNavigation
  isHomePage?: boolean
}

function hasHref(href: string): boolean {
  return href !== '#'
}

function menuItemIcon(label: string) {
  const normalized = label.toLowerCase()

  if (normalized.includes('part') || normalized.includes('spare')) return mdiCarWrench

  if (
    normalized.includes('motorcycle') ||
    normalized.includes('motor cycle') ||
    normalized.includes('motorbike')
  )
    return mdiMotorbike
  if (normalized.includes('cycle') || normalized.includes('bike')) return mdiBike

  if (normalized.includes('machinery') || normalized.includes('machine')) return mdiTractorVariant
  if (normalized.includes('tractor') || normalized.includes('semi')) return mdiTractorVariant
  if (normalized.includes('bus') && normalized.includes('articulated')) return mdiBusArticulatedEnd
  if (normalized.includes('bus')) return mdiBus

  if (normalized.includes('cargo') || normalized.includes('container'))
    return mdiTruckCargoContainer
  if (normalized.includes('truck')) return mdiTruck
  if (normalized.includes('commercial') || normalized.includes('heavy')) return mdiTruck

  if (normalized.includes('van')) return mdiVanPassenger
  if (normalized.includes('jeep') || normalized.includes('suv')) return mdiJeepney

  if (normalized.includes('estate') || normalized.includes('station')) return mdiCarEstate
  if (normalized.includes('hatchback') || normalized.includes('compact')) return mdiCarHatchback
  if (normalized.includes('pickup') || normalized.includes('ute')) return mdiCarPickup
  if (normalized.includes('sports') || normalized.includes('performance')) return mdiCarSports
  if (normalized.includes('convertible') || normalized.includes('cabrio')) return mdiCarConvertible

  if (normalized.includes('electric')) return mdiCarElectric
  if (normalized.includes('renewable') || normalized.includes('energy')) return mdiFlash

  return mdiCar
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

function MobileNavAccordion({ item, onClose }: { item: HeaderNavItem; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = item.children.length > 0

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex items-center gap-3 rounded-lg px-4 py-3 font-heading text-13 font-semibold uppercase tracking-wide text-background transition-colors hover:bg-white-20',
          focusRing,
          expanded && 'bg-white-10'
        )}
        aria-expanded={expanded}
      >
        <Icon path={mdiCar} size={1} className="size-5 text-white-50" aria-hidden="true" />
        <span className="flex-1 text-left">{item.label}</span>
        {hasChildren && (
          <Icon
            path={mdiChevronRight}
            size={1}
            className={cn(
              'size-4 text-white-50 transition-transform duration-200',
              expanded && 'rotate-90'
            )}
            aria-hidden="true"
          />
        )}
      </button>
      {expanded && hasChildren && (
        <div className="mt-1 flex flex-col gap-1 px-3">
          {item.children.map(child =>
            hasHref(child.href) ? (
              <Link
                key={`${item.label}-${child.label}`}
                href={child.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-2.5 font-body text-sm text-white-70 transition-colors hover:bg-white-20 hover:text-background',
                  focusRing
                )}
                onClick={onClose}
              >
                <Icon
                  path={menuItemIcon(child.label)}
                  size={1}
                  className="size-4"
                  aria-hidden="true"
                />
                <span>{child.label}</span>
              </Link>
            ) : (
              <span
                key={`${item.label}-${child.label}`}
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 font-body text-sm text-white-50"
              >
                <Icon
                  path={menuItemIcon(child.label)}
                  size={1}
                  className="size-4"
                  aria-hidden="true"
                />
                <span>{child.label}</span>
              </span>
            )
          )}
        </div>
      )}
    </div>
  )
}

function DesktopNavItem({ item }: { item: HeaderNavItem }) {
  const hasChildren = item.children.length > 0
  const featured = item.children[0]
  const isInventory = item.label === 'Inventory'
  const childIcon = isInventory ? mdiArrowBottomRight : mdiChevronDown

  return (
    <div className={cn('relative', hasChildren && 'group')}>
      {hasHref(item.href) ? (
        <Link
          href={item.href}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 font-heading text-13 font-semibold uppercase tracking-wide text-background transition-colors hover:bg-white-20',
            focusRing
          )}
        >
          {item.label}
          {hasChildren && <Icon path={childIcon} size={1} className="size-3" aria-hidden="true" />}
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-heading text-13 font-semibold uppercase tracking-wide text-background">
          {item.label}
          {hasChildren && <Icon path={childIcon} size={1} className="size-3" aria-hidden="true" />}
        </span>
      )}

      {hasChildren && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-opacity transition-[visibility] duration-150',
            'group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100',
            'group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100'
          )}
        >
          <div
            className={cn(
              'flex flex-col gap-1 rounded-2xl border border-white-20 bg-surface-dark p-4 shadow-xl',
              item.children.length >= 8 ? 'w-96' : 'w-72'
            )}
          >
            <p className="pb-1 font-heading text-sm font-semibold text-background">{item.label}</p>
            {item.children.length >= 8 ? (
              <div className="grid grid-cols-3 gap-x-4">
                {item.children.map(child => {
                  const iconPath = menuItemIcon(child.label)

                  return hasHref(child.href) ? (
                    <Link
                      key={`${item.label}-${child.label}`}
                      href={child.href}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-lg px-2 py-2 font-body text-base text-background transition-colors hover:bg-white-20',
                        focusRing
                      )}
                    >
                      <span className="inline-flex size-7 items-center justify-center rounded-md border border-white-30 bg-white-20">
                        <Icon path={iconPath} size={1} className="size-3.5" aria-hidden="true" />
                      </span>
                      <span>{child.label}</span>
                    </Link>
                  ) : (
                    <span
                      key={`${item.label}-${child.label}`}
                      className="inline-flex items-center gap-2 rounded-lg px-2 py-2 font-body text-base text-on-dark-muted"
                    >
                      <span className="inline-flex size-7 items-center justify-center rounded-md border border-white-30 bg-white-20">
                        <Icon path={iconPath} size={1} className="size-3.5" aria-hidden="true" />
                      </span>
                      <span>{child.label}</span>
                    </span>
                  )
                })}
              </div>
            ) : (
              item.children.map(child => {
                const iconPath = menuItemIcon(child.label)

                return hasHref(child.href) ? (
                  <Link
                    key={`${item.label}-${child.label}`}
                    href={child.href}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg px-2 py-2 font-body text-base text-background transition-colors hover:bg-white-20',
                      focusRing
                    )}
                  >
                    <span className="inline-flex size-7 items-center justify-center rounded-md border border-white-30 bg-white-20">
                      <Icon path={iconPath} size={1} className="size-3.5" aria-hidden="true" />
                    </span>
                    <span>{child.label}</span>
                  </Link>
                ) : (
                  <span
                    key={`${item.label}-${child.label}`}
                    className="inline-flex items-center gap-2 rounded-lg px-2 py-2 font-body text-base text-on-dark-muted"
                  >
                    <span className="inline-flex size-7 items-center justify-center rounded-md border border-white-30 bg-white-20">
                      <Icon path={iconPath} size={1} className="size-3.5" aria-hidden="true" />
                    </span>
                    <span>{child.label}</span>
                  </span>
                )
              })
            )}

            {featured && hasHref(featured.href) && (
              <Link
                href={featured.href}
                className={cn(
                  'mt-2 rounded-xl border border-white-30 bg-white-20 p-3 transition-colors hover:bg-white-30',
                  focusRing
                )}
              >
                <p className="font-heading text-13 text-on-dark-muted">
                  {headerDropdownCopy.featuredLabel}
                </p>
                <p className="mt-1 font-body text-sm text-background">{featured.label}</p>
                <span className="mt-2 inline-flex items-center gap-1 font-heading text-13 text-background">
                  {headerDropdownCopy.browseLabel}
                  <Icon path={mdiArrowRight} size={1} className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function SiteHeaderClient({ navigation, isHomePage = false }: SiteHeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItemCount, closeCart, isCartOpen } = useCart()

  useEffect(() => {
    setCartOpen(isCartOpen)
  }, [isCartOpen])

  function handleCartOpenChange(open: boolean) {
    setCartOpen(open)

    if (!open) {
      closeCart()
    }
  }

  return (
    <header
      data-slot="site-header"
      className={cn(
        'z-50 transition-[position] duration-300',
        isHomePage ? 'fixed inset-x-0 top-0 [padding-top:env(safe-area-inset-top)]' : 'sticky top-0'
      )}
    >
      <div className="mx-auto max-w-site px-3 py-3 md:px-6 md:py-4">
        <div className="flex h-12 items-center rounded-full border border-black-40 bg-black-50 px-3 md:h-12 md:px-7">
          <Link href="/" aria-label="Enermation home" className="shrink-0">
            <img
              src="/logo.svg"
              alt="Enermation"
              width={124}
              height={32}
              className="h-7 w-auto rounded-sm"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-7 px-8 md:flex">
            {navigation.items.map(item => (
              <DesktopNavItem key={item.label} item={item} />
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <HeaderSearch variant="desktop" />

            <Sheet open={cartOpen} onOpenChange={handleCartOpenChange}>
              <SheetTrigger
                className={cn(
                  'relative inline-flex h-8 w-8 items-center justify-center rounded-full text-background transition-colors hover:bg-white-20',
                  focusRing
                )}
                aria-label="Open cart"
              >
                <Icon path={mdiCart} size={1} className="size-5" aria-hidden="true" />
                {totalItemCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-green px-1 p-0 font-heading text-11 font-semibold text-background">
                    {totalItemCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent
                side="right"
                className="cart-sidebar w-full max-w-md border-l border-white-20 bg-surface-dark p-0 text-background backdrop-blur-md sm:max-w-md"
              >
                <SheetTitle className="sr-only">Shopping cart</SheetTitle>
                <div className="grain-overlay relative flex flex-col">
                  {/* Cart editorial header */}
                  <div className="px-5 pt-6 pb-0">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-0.5 w-9 bg-brand-green" />
                      <div className="h-0.5 w-9 border border-white-solid" />
                      <div className="h-0.5 w-9 bg-brand-red" />
                    </div>
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-section font-semibold uppercase tracking-wider text-on-dark">
                        Your Cart
                      </h2>
                      {totalItemCount > 0 && (
                        <span className="flex size-9 items-center justify-center rounded-full border border-white-30 bg-white-10 font-heading text-13 font-semibold text-on-dark-muted">
                          {totalItemCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mx-5 border-t border-white-20" />
                  <div className="flex-1 overflow-y-auto px-5 pt-4">
                    <ShoppingCart1 />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="ml-auto flex items-center gap-1 md:hidden">
            <HeaderSearch variant="mobile" />

            <Sheet open={cartOpen} onOpenChange={handleCartOpenChange}>
              <SheetTrigger
                className={cn(
                  'relative inline-flex size-11 items-center justify-center rounded-full text-background',
                  focusRing
                )}
                aria-label="Open cart"
              >
                <Icon path={mdiCart} size={1} className="size-5" aria-hidden="true" />
                {totalItemCount > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-green px-1 p-0 font-heading text-11 font-semibold text-background">
                    {totalItemCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent
                side="right"
                className="cart-sidebar w-full max-w-md border-l border-white-20 bg-surface-dark p-0 text-background backdrop-blur-md sm:max-w-md"
              >
                <SheetTitle className="sr-only">Shopping cart</SheetTitle>
                <div className="grain-overlay relative flex flex-col">
                  {/* Cart editorial header */}
                  <div className="px-5 pt-6 pb-0">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-0.5 w-9 bg-brand-green" />
                      <div className="h-0.5 w-9 border border-white-solid" />
                      <div className="h-0.5 w-9 bg-brand-red" />
                    </div>
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-section font-semibold uppercase tracking-wider text-on-dark">
                        Your Cart
                      </h2>
                      {totalItemCount > 0 && (
                        <span className="flex size-9 items-center justify-center rounded-full border border-white-30 bg-white-10 font-heading text-13 font-semibold text-on-dark-muted">
                          {totalItemCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mx-5 border-t border-white-20" />
                  <div className="flex-1 overflow-y-auto px-5 pt-4">
                    <ShoppingCart1 />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
              <DrawerTrigger
                className={cn(
                  'inline-flex size-11 items-center justify-center rounded-full text-background md:hidden',
                  focusRing
                )}
                aria-label="Open menu"
              >
                <Icon path={mdiMenu} size={1} className="size-5" />
              </DrawerTrigger>
              <DrawerContent
                data-slot="drawer-content"
                className="w-full max-w-none border-r border-white-20 bg-surface-dark text-background"
              >
                <div className="flex h-full flex-col pt-12">
                  <span className="sr-only">Site navigation</span>

                  <div className="px-5 pb-4">
                    <Link
                      href="/"
                      aria-label="Enermation home"
                      onClick={() => setMobileOpen(false)}
                    >
                      <img
                        src="/logo.svg"
                        alt="Enermation"
                        width={132}
                        height={34}
                        className="h-8 w-auto rounded-sm"
                      />
                    </Link>
                  </div>

                  <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-5 pb-8">
                    {navigation.items.map(item => {
                      const hasChildren = item.children.length > 0
                      return (
                        <div key={item.label} className="rounded-xl bg-white-5 p-1">
                          {hasChildren ? (
                            <MobileNavAccordion item={item} onClose={() => setMobileOpen(false)} />
                          ) : hasHref(item.href) ? (
                            <Link
                              href={item.href}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-4 py-3 font-heading text-13 font-semibold uppercase tracking-wide text-background transition-colors hover:bg-white-20',
                                focusRing
                              )}
                              onClick={() => setMobileOpen(false)}
                            >
                              <Icon
                                path={item.label === 'Home' ? mdiHome : mdiCar}
                                size={1}
                                className="size-5 text-white-50"
                                aria-hidden="true"
                              />
                              {item.label}
                            </Link>
                          ) : (
                            <p className="flex items-center gap-3 rounded-lg px-4 py-3 font-heading text-13 font-semibold uppercase tracking-wide text-background">
                              <Icon
                                path={mdiCar}
                                size={1}
                                className="size-5 text-white-50"
                                aria-hidden="true"
                              />
                              {item.label}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </nav>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  )
}
