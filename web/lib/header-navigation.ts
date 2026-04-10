import { cache } from 'react'
import {
  type HeaderNavFallbackItem,
  headerActions,
  headerNavFallbackItems,
  inventoryCollectionLinks,
} from '@/lib/data'
import { GET_HEADER_MENU } from '@/lib/queries'
import { getClient } from '@/lib/shopify'
import type { ShopifyMenu, ShopifyMenuItem } from '@/lib/types'

export type HeaderNavChild = {
  label: string
  href: string
}

export type HeaderNavItem = {
  label: string
  href: string
  children: HeaderNavChild[]
}

export type HeaderNavigation = {
  items: HeaderNavItem[]
  actions: typeof headerActions
}

type HeaderMenuResponse = {
  menu: ShopifyMenu | null
}

const DEFAULT_MENU_HANDLE = 'main-menu'
type AllowedTopLevelLabel = 'Home' | 'Inventory' | 'About' | 'Contact'

const TOP_LEVEL_ALIASES: Record<string, AllowedTopLevelLabel> = {
  home: 'Home',
  inventory: 'Inventory',
  catalog: 'Inventory',
  showroom: 'Inventory',
  about: 'About',
  contact: 'Contact',
}

function toRelativeUrl(url: string | null): string {
  if (!url) return '#'
  if (url.startsWith('/')) return url

  if (url.startsWith('http://') || url.startsWith('https://')) {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/'
  }

  return '#'
}

function resourceUrl(item: ShopifyMenuItem): string | null {
  const resource = item.resource
  if (!resource) return null

  if (resource.__typename === 'Collection') {
    return `/collections/${resource.handle}`
  }

  if (resource.__typename === 'Product') {
    return `/products/${resource.handle}`
  }

  if (resource.__typename === 'Page') {
    return `/${resource.handle}`
  }

  if (resource.__typename === 'Blog') {
    return `/blogs/${resource.handle}`
  }

  return null
}

function itemHref(item: ShopifyMenuItem): string {
  return resourceUrl(item) ?? toRelativeUrl(item.url)
}

function toChild(item: ShopifyMenuItem): HeaderNavChild | null {
  const label = item.title.trim()
  if (!label) return null

  return {
    label,
    href: itemHref(item),
  }
}

function isChild(item: HeaderNavChild | null): item is HeaderNavChild {
  return item !== null
}

function normalizeTopLevelLabel(raw: string): AllowedTopLevelLabel | null {
  const label = raw.trim()
  if (!label) return null

  const normalized = TOP_LEVEL_ALIASES[label.toLowerCase()]
  return normalized ?? null
}

function childrenForInventory(items: ShopifyMenuItem[]): HeaderNavChild[] {
  const mapped = items.map(toChild).filter(isChild)
  return mapped.length > 0 ? mapped : inventoryCollectionLinks
}

function fallbackHref(label: AllowedTopLevelLabel): string {
  const match = headerNavFallbackItems.find(item => item.label === label)
  return match?.href ?? '/'
}

function toItem(item: ShopifyMenuItem): HeaderNavItem | null {
  const normalizedLabel = normalizeTopLevelLabel(item.title)
  if (!normalizedLabel) return null

  const href = itemHref(item)
  const resolvedHref = href === '#' ? fallbackHref(normalizedLabel) : href
  const children =
    normalizedLabel === 'Inventory'
      ? childrenForInventory(item.items)
      : item.items.map(toChild).filter(isChild)

  return {
    label: normalizedLabel,
    href: resolvedHref,
    children,
  }
}

function toFallbackItem(item: HeaderNavFallbackItem): HeaderNavItem {
  const children = item.label === 'Inventory' ? inventoryCollectionLinks : []

  return {
    label: item.label,
    href: item.href,
    children,
  }
}

function isItem(item: HeaderNavItem | null): item is HeaderNavItem {
  return item !== null
}

function fallbackItems(): HeaderNavItem[] {
  return headerNavFallbackItems.map(toFallbackItem)
}

export const getHeaderNavigation = cache(async (): Promise<HeaderNavigation> => {
  const menuHandle = process.env.SHOPIFY_HEADER_MENU_HANDLE?.trim() || DEFAULT_MENU_HANDLE
  const client = await getClient()
  const { data } = await client.request<HeaderMenuResponse>(GET_HEADER_MENU, {
    variables: { handle: menuHandle },
  })

  const shopifyItems = data?.menu?.items.map(toItem).filter(isItem) ?? []

  return {
    items: shopifyItems.length > 0 ? shopifyItems : fallbackItems(),
    actions: headerActions,
  }
})
