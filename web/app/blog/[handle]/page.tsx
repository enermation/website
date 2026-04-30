import { format } from 'date-fns'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BlogCardGrid } from '@/components/blog-card-grid'
import { SiteHeader } from '@/components/site-header'
import { fetchBlogByHandle } from '@/lib/shopify'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const blog = await fetchBlogByHandle(handle)

  if (!blog) return {}
  return {
    title: `${blog.title} | Enermation`,
    description: blog.description ?? undefined,
    openGraph: {
      title: blog.title,
      description: blog.description ?? undefined,
      type: 'website',
    },
  }
}

export default async function BlogPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const blog = await fetchBlogByHandle(handle)

  if (!blog) notFound()

  // Blog listing with no articles
  const posts = blog.articles.map(article => ({
    id: article.id,
    title: article.title,
    summary: article.excerpt ?? '',
    label: article.tags[0] ?? 'Article',
    author: article.author.name,
    published: format(new Date(article.publishedAt), 'd MMM yyyy'),
    url: `/blog/${handle}/${article.handle}`,
    image: article.image?.url ?? '',
  }))

  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>

      <main className="flex-1" data-slot="blog-page">
        <section className="bg-surface py-20 lg:py-32">
          <div className="mx-auto max-w-site px-4 md:px-6 text-center">
            <p className="font-heading text-13 uppercase tracking-widest text-muted-foreground mb-4">
              Journal
            </p>
            <h1 className="font-display text-banner uppercase tracking-widest text-heading mb-6">
              {blog.title}
            </h1>
            {blog.description && (
              <p className="mx-auto max-w-2xl font-body text-body text-foreground leading-relaxed">
                {blog.description}
              </p>
            )}
          </div>
        </section>

        <section className="bg-background py-16 lg:py-24">
          <div className="mx-auto max-w-site px-4 md:px-6">
            <BlogCardGrid
              tagline="Latest"
              heading="From The Journal"
              description=""
              buttonText=""
              buttonUrl=""
              posts={posts}
            />
          </div>
        </section>
      </main>
    </>
  )
}
