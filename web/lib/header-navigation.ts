import { cacheLife, cacheTag } from 'next/cache'
import { headerActions } from '@/lib/data'
import { GET_COLLECTIONS_FOR_HEADER } from '@/lib/queries'
import { getClient } from '@/lib/shopify'

export type HeaderNavChild = {
  label: string
  href: string
}

export type HeaderNavItem = {
  label: string
  href: string
  children: HeaderNavChild[]
  showOnDesktop?: boolean
}

export type HeaderNavigation = {
  items: HeaderNavItem[]
  actions: typeof headerActions
}

type CollectionCategory = 'cars' | 'motorcycles' | 'commercial' | 'parts'

type CollectionsResponse = {
  collections: {
    edges: { node: { handle: string; title: string } }[]
  }
}

const CATEGORY_RULES: { category: CollectionCategory; patterns: string[] }[] = [
  { category: 'cars', patterns: ['car', 'electric car', 'vehicle', 'automobile'] },
  { category: 'motorcycles', patterns: ['motor cycle', 'motorcycle', 'bike'] },
  {
    category: 'commercial',
    patterns: ['commercial vehicle', 'heavy duty', 'heavy machin', 'truck', 'renewable energy'],
  },
  { category: 'parts', patterns: ['part', 'spare'] },
]

const CATEGORY_LABELS: Record<CollectionCategory, string> = {
  cars: 'Cars',
  motorcycles: 'Motorcycles',
  commercial: 'Commercial',
  parts: 'Parts',
}

function categorizeCollection(handle: string, title: string): CollectionCategory {
  const lowerHandle = handle.toLowerCase()
  const lowerTitle = title.toLowerCase()
  const combined = `${lowerHandle} ${lowerTitle}`

  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some(pattern => combined.includes(pattern))) {
      return rule.category
    }
  }

  return 'cars' // fallback to cars
}

async function fetchCollections(): Promise<HeaderNavChild[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('collections')

  const { data } = await getClient().request<CollectionsResponse>(GET_COLLECTIONS_FOR_HEADER)
  if (!data?.collections) return []
  return data.collections.edges.map(({ node }) => ({
    label: node.title,
    href: `/collections/${node.handle}`,
  }))
}

type GroupedCollections = {
  [K in CollectionCategory]: HeaderNavChild[]
}

function groupCollectionsByCategory(collections: HeaderNavChild[]): GroupedCollections {
  const groups: GroupedCollections = {
    cars: [],
    motorcycles: [],
    commercial: [],
    parts: [],
  }

  for (const collection of collections) {
    const category = categorizeCollection(collection.href, collection.label)
    groups[category].push(collection)
  }

  return groups
}

function buildNavItems(collections: HeaderNavChild[]): HeaderNavItem[] {
  const grouped = groupCollectionsByCategory(collections)
  const items: HeaderNavItem[] = []

  // Home
  items.push({ label: 'Home', href: '/', children: [], showOnDesktop: true })

  // Vehicle categories (only if they have collections)
  const categoryOrder: CollectionCategory[] = ['cars', 'motorcycles', 'commercial', 'parts']
  for (const category of categoryOrder) {
    if (grouped[category].length > 0) {
      items.push({
        label: CATEGORY_LABELS[category],
        href: grouped[category][0].href,
        children: grouped[category],
        showOnDesktop: true,
      })
    }
  }

  return items
}

export async function getHeaderNavigation(): Promise<HeaderNavigation> {
  'use cache'
  cacheLife('hours')
  cacheTag('navigation')

  const collections = await fetchCollections()
  const items = buildNavItems(collections)

  return {
    items,
    actions: headerActions,
  }
}

export type FooterNavGroup = {
  title: string
  children: HeaderNavChild[]
}

export async function getFooterNavigation(): Promise<FooterNavGroup[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('collections')

  const collections = await fetchCollections()
  const grouped = groupCollectionsByCategory(collections)

  const categoryOrder: CollectionCategory[] = ['cars', 'motorcycles', 'commercial', 'parts']
  const groups: FooterNavGroup[] = []

  for (const category of categoryOrder) {
    if (grouped[category].length > 0) {
      groups.push({
        title: CATEGORY_LABELS[category],
        children: grouped[category],
      })
    }
  }

  return groups
}
