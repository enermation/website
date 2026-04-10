'use client'

import {
  mdiArrowRight,
  mdiBike,
  mdiCar,
  mdiCarShiftPattern,
  mdiChevronDown,
  mdiMenu,
  mdiTruck,
} from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { HeaderNavItem, HeaderNavigation } from '@/lib/header-navigation'
import { cn } from '@/lib/utils'

type SiteHeaderClientProps = {
  navigation: HeaderNavigation
}

function hasHref(href: string): boolean {
  return href !== '#'
}

function menuItemIcon(label: string) {
  const normalized = label.toLowerCase()

  if (normalized.includes('spare') || normalized.includes('part')) return mdiCarShiftPattern
  if (normalized.includes('commercial') || normalized.includes('truck')) return mdiTruck
  if (normalized.includes('motorcycle') || normalized.includes('bike')) return mdiBike
  return mdiCar
}

function DesktopNavItem({ item }: { item: HeaderNavItem }) {
  const hasChildren = item.children.length > 0
  const featured = item.children[0]

  return (
    <div className={cn('relative', hasChildren && 'group')}>
      {hasHref(item.href) ? (
        <Link
          href={item.href}
          className="inline-flex items-center gap-1 font-heading text-13 font-semibold uppercase tracking-wide text-gray-93 transition-colors hover:text-background"
        >
          {item.label}
          {hasChildren && (
            <Icon path={mdiChevronDown} size={1} className="size-3" aria-hidden="true" />
          )}
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 font-heading text-13 font-semibold uppercase tracking-wide text-gray-93">
          {item.label}
          {hasChildren && (
            <Icon path={mdiChevronDown} size={1} className="size-3" aria-hidden="true" />
          )}
        </span>
      )}

      {hasChildren && (
        <div
          className={cn(
            'pointer-events-none invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-2 opacity-0 transition-all duration-150',
            'group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100',
            'group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100'
          )}
        >
          <div className="flex flex-col gap-1 rounded-2xl border border-white-20 bg-gray-7 p-4 shadow-xl">
            <p className="pb-1 font-heading text-sm font-semibold text-gray-93">{item.label}</p>
            {item.children.map(child => {
              const iconPath = menuItemIcon(child.label)

              return hasHref(child.href) ? (
                <Link
                  key={`${item.label}-${child.label}`}
                  href={child.href}
                  className="inline-flex items-center gap-2 rounded-lg px-2 py-2 font-body text-base text-gray-93 transition-colors hover:bg-white-20 hover:text-background"
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-md border border-white-20 bg-gray-16">
                    <Icon path={iconPath} size={1} className="size-3.5" aria-hidden="true" />
                  </span>
                  <span>{child.label}</span>
                </Link>
              ) : (
                <span
                  key={`${item.label}-${child.label}`}
                  className="inline-flex items-center gap-2 rounded-lg px-2 py-2 font-body text-base text-gray-60"
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-md border border-white-20 bg-gray-16">
                    <Icon path={iconPath} size={1} className="size-3.5" aria-hidden="true" />
                  </span>
                  <span>{child.label}</span>
                </span>
              )
            })}

            {featured && hasHref(featured.href) && (
              <Link
                href={featured.href}
                className="mt-2 rounded-xl border border-white-20 bg-gray-16 p-3 transition-colors hover:bg-gray-20"
              >
                <p className="font-heading text-13 text-gray-60">Featured category</p>
                <p className="mt-1 font-body text-sm text-gray-93">{featured.label}</p>
                <span className="mt-2 inline-flex items-center gap-1 font-heading text-13 text-background">
                  Browse
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

export function SiteHeaderClient({ navigation }: SiteHeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-site px-3 py-3 md:px-6 md:py-4">
        <div className="flex h-12 items-center rounded-full border border-white-20 bg-gray-7 px-3 md:h-12 md:px-7">
          <Link href="/" aria-label="Enermation home" className="shrink-0">
            <Image
              src="/logo.jpg"
              alt="Enermation"
              width={124}
              height={32}
              className="h-7 w-auto rounded-sm"
              priority
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-7 px-8 md:flex">
            {navigation.items.map(item => (
              <DesktopNavItem key={item.label} item={item} />
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={navigation.actions.secondary.href}
              className="inline-flex h-8 items-center justify-center rounded-full border border-white-30 px-4 font-heading text-13 font-semibold uppercase tracking-wide text-gray-93 transition-colors hover:border-background hover:bg-white-20 hover:text-background"
            >
              {navigation.actions.secondary.label}
            </Link>
            <Link
              href={navigation.actions.primary.href}
              className="inline-flex h-8 items-center justify-center rounded-full border border-brand-green bg-brand-green px-4 font-heading text-13 font-semibold uppercase tracking-wide text-background transition-colors hover:bg-brand-red hover:border-brand-red"
            >
              {navigation.actions.primary.label}
            </Link>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="ml-auto inline-flex size-9 items-center justify-center rounded-full text-gray-93 md:hidden"
              aria-label="Open menu"
            >
              <Icon path={mdiMenu} size={1} className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full max-w-none border-r border-white-20 bg-gray-7 p-0 text-background sm:max-w-none"
            >
              <div className="flex h-full flex-col pt-12">
                <SheetTitle className="sr-only">Site navigation</SheetTitle>

                <div className="px-5 pb-4">
                  <Link href="/" aria-label="Enermation home" onClick={() => setMobileOpen(false)}>
                    <Image
                      src="/logo.jpg"
                      alt="Enermation"
                      width={132}
                      height={34}
                      className="h-8 w-auto rounded-sm"
                    />
                  </Link>
                </div>

                <nav className="flex flex-1 flex-col overflow-y-auto px-5 pb-8">
                  {navigation.items.map(item => (
                    <div key={item.label} className="border-b border-white-20 py-4">
                      {hasHref(item.href) ? (
                        <Link
                          href={item.href}
                          className="font-heading text-13 font-semibold uppercase tracking-wide text-gray-93 transition-colors hover:text-background"
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <p className="font-heading text-13 font-semibold uppercase tracking-wide text-gray-93">
                          {item.label}
                        </p>
                      )}

                      {item.children.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2 pl-3">
                          {item.children.map(child =>
                            hasHref(child.href) ? (
                              <Link
                                key={`${item.label}-${child.label}`}
                                href={child.href}
                                className="font-body text-sm text-gray-93 transition-colors hover:text-background"
                                onClick={() => setMobileOpen(false)}
                              >
                                {child.label}
                              </Link>
                            ) : (
                              <span
                                key={`${item.label}-${child.label}`}
                                className="font-body text-sm text-gray-60"
                              >
                                {child.label}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="grid grid-cols-1 gap-2 border-t border-white-20 p-5">
                  <Link
                    href={navigation.actions.secondary.href}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-white-30 px-4 font-heading text-13 font-semibold uppercase tracking-wide text-gray-93 transition-colors hover:bg-white-20 hover:text-background"
                    onClick={() => setMobileOpen(false)}
                  >
                    {navigation.actions.secondary.label}
                  </Link>
                  <Link
                    href={navigation.actions.primary.href}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-brand-green bg-brand-green px-4 font-heading text-13 font-semibold uppercase tracking-wide text-background transition-colors hover:bg-brand-red hover:border-brand-red"
                    onClick={() => setMobileOpen(false)}
                  >
                    {navigation.actions.primary.label}
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
