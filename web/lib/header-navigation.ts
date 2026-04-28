import { cacheLife, cacheTag } from 'next/cache'
import { type HeaderNavFallbackItem, headerActions, headerNavFallbackItems } from '@/lib/data'
import { GET_COLLECTIONS_FOR_HEADER, GET_HEADER_MENU } from '@/lib/queries'
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

type CollectionsResponse = {
  collections: {
    edges: { node: { handle: string; title: string } }[]
  }
}

function childrenForInventory(
  items: ShopifyMenuItem[],
  collections: HeaderNavChild[]
): HeaderNavChild[] {
  const mapped = items.map(toChild).filter(isChild)
  return mapped.length > 0 ? mapped : collections
}

function fallbackHref(label: AllowedTopLevelLabel): string {
  const match = headerNavFallbackItems.find(item => item.label === label)
  return match?.href ?? '/'
}

function toItem(item: ShopifyMenuItem, collections: HeaderNavChild[]): HeaderNavItem | null {
  const normalizedLabel = normalizeTopLevelLabel(item.title)
  if (!normalizedLabel) return null

  const href = itemHref(item)
  const resolvedHref = href === '#' ? fallbackHref(normalizedLabel) : href
  const children =
    normalizedLabel === 'Inventory'
      ? childrenForInventory(item.items, collections)
      : item.items.map(toChild).filter(isChild)

  return {
    label: normalizedLabel,
    href: resolvedHref,
    children,
  }
}

function toFallbackItem(item: HeaderNavFallbackItem, collections: HeaderNavChild[]): HeaderNavItem {
  const children = item.label === 'Inventory' ? collections : []

  return {
    label: item.label,
    href: item.href,
    children,
  }
}

function isItem(item: HeaderNavItem | null): item is HeaderNavItem {
  return item !== null
}

function fallbackItems(collections: HeaderNavChild[]): HeaderNavItem[] {
  return headerNavFallbackItems.map(item => toFallbackItem(item, collections))
}

async function fetchCollections(): Promise<HeaderNavChild[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('collections')

  const { data } = await getClient().request<CollectionsResponse>(GET_COLLECTIONS_FOR_HEADER)
  return data.collections.edges.map(({ node }) => ({
    label: node.title,
    href: `/collections/${node.handle}`,
  }))
}

export async function getHeaderNavigation(): Promise<HeaderNavigation> {
  'use cache'
  cacheLife('hours')
  cacheTag('navigation')

  const [collections, menuHandle] = await Promise.all([
    fetchCollections(),
    Promise.resolve(process.env.SHOPIFY_HEADER_MENU_HANDLE?.trim() || DEFAULT_MENU_HANDLE),
  ])

  const { data } = await getClient().request<HeaderMenuResponse>(GET_HEADER_MENU, {
    variables: { handle: menuHandle },
  })

  const shopifyItems = data?.menu?.items.map(item => toItem(item, collections)).filter(isItem) ?? []

  return {
    items: shopifyItems.length > 0 ? shopifyItems : fallbackItems(collections),
    actions: headerActions,
  }
}
