import type { MetadataRoute } from 'next'
import { fetchBlogByHandle, fetchCollectionProducts, fetchCollections } from '@/lib/shopify'

const BASE_URL = 'https://www.enermation.co'

// ── Static routes ─────────────────────────────────────────────────────────────

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
  { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/collections`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
  { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/miles`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/search`, changeFrequency: 'weekly', priority: 0.5 },
  { url: `${BASE_URL}/wishlist`, changeFrequency: 'weekly', priority: 0.4 },
]

// ── Dynamic routes ─────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes: MetadataRoute.Sitemap = []

  // Collections
  try {
    const collections = await fetchCollections()
    for (const collection of collections) {
      dynamicRoutes.push({
        url: `${BASE_URL}/collections/${collection.handle}`,
        changeFrequency: 'daily',
        priority: 0.8,
      })
    }
  } catch {
    // Collections are cached; failure here doesn't block static routes
  }

  // Products (via shop-all collection — all products appear there)
  try {
    const shopAll = await fetchCollectionProducts('shop-all', { first: 250 })
    for (const product of shopAll.products) {
      dynamicRoutes.push({
        url: `${BASE_URL}/products/${product.handle}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {
    // Product listing failure is non-fatal
  }

  // Blog articles — enumerate all articles for each known blog handle.
  // Extend BLOG_HANDLES if more blogs are added in Shopify.
  const BLOG_HANDLES = ['news', 'updates'] as const

  for (const blogHandle of BLOG_HANDLES) {
    try {
      const blog = await fetchBlogByHandle(blogHandle)
      for (const article of blog.articles) {
        dynamicRoutes.push({
          url: `${BASE_URL}/blog/${blogHandle}/${article.handle}`,
          lastModified: new Date(article.publishedAt),
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    } catch {
      // Blog may not exist; skip silently
    }
  }

  return [...STATIC_ROUTES, ...dynamicRoutes]
}
