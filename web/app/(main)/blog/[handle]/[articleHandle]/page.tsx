import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BlogPost } from '@/components/blog-post'
import { SiteHeader } from '@/components/site-header'
import { fetchArticleByHandle } from '@/lib/shopify'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; articleHandle: string }>
}): Promise<Metadata> {
  const { handle, articleHandle } = await params
  const article = await fetchArticleByHandle(handle, articleHandle).catch(() => null)

  if (!article) return {}
  return {
    title: `${article.title} | Enermation`,
    description: article.seo?.description ?? article.excerpt ?? undefined,
    openGraph: {
      title: article.seo?.title ?? article.title,
      description: article.seo?.description ?? article.excerpt ?? undefined,
      images: article.image ? [{ url: article.image.url, alt: article.title }] : [],
      type: 'article',
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ handle: string; articleHandle: string }>
}) {
  const { handle, articleHandle } = await params
  const article = await fetchArticleByHandle(handle, articleHandle).catch(() => null)

  if (!article) notFound()

  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>

      <main className="flex-1" data-slot="article-page">
        <BlogPost
          title={article.title}
          description={article.excerpt ?? undefined}
          image={article.image?.url ?? undefined}
          pubDate={new Date(article.publishedAt)}
          author={{
            name: article.author.name,
            website: '',
            websiteName: '',
            image: '',
          }}
          content={article.contentHtml ?? ''}
        />
      </main>
    </>
  )
}
