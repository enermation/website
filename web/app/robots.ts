import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.enermation.co'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/api/rag/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
