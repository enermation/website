import type { MetadataRoute } from 'next'
import { fetchCollectionProducts, fetchCollections } from '@/lib/shopify'

const BASE_URL = 'https://www.enermation.co'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/search`, changeFrequency: 'weekly', priority: 0.6 },
  ]

  const collections = await fetchCollections()
  const collectionPages: MetadataRoute.Sitemap = collections.map(c => ({
    url: `${BASE_URL}/collections/${c.handle}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const shopAll = await fetchCollectionProducts('shop-all', { first: 250 })
  const productPages: MetadataRoute.Sitemap = (shopAll?.products ?? []).map(p => ({
    url: `${BASE_URL}/products/${p.handle}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...collectionPages, ...productPages]
}
