import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Post {
  id: string
  title: string
  summary: string
  label: string
  author: string
  published: string
  url: string
  image: string
}

interface BlogCardGridProps {
  tagline?: string
  heading?: string
  description?: string
  posts: Post[]
  className?: string
}

const BlogCardGrid = ({
  tagline,
  heading,
  description,
  posts = [],
  className,
}: BlogCardGridProps) => {
  return (
    <section className={cn('', className)}>
      <div className="flex flex-col items-center">
        {heading && (
          <h2 className="mt-6 text-center text-5xl tracking-tighter text-pretty md:text-7xl">
            {heading}
          </h2>
        )}
        {description && (
          <p className="mt-4 text-center text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
            {description}
          </p>
        )}
      </div>
      <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-8">
        {posts.map(post => (
          <Card key={post.id} className="grid grid-rows-[auto_auto_1fr_auto] overflow-hidden pt-0">
            <div className="aspect-video w-full">
              <a
                href={post.url}
                target="_blank"
                className="transition-opacity duration-200 fade-in hover:opacity-70"
                rel="noopener"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover object-center"
                />
              </a>
            </div>
            <CardHeader>
              <h3 className="text-xl hover:underline md:text-xl">
                <a href={post.url} target="_blank" rel="noopener">
                  {post.title}
                </a>
              </h3>
              <p className="mt-2 text-sm font-semibold text-foreground/80">
                {post.author} · {post.published}
              </p>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">{post.summary}</p>
            </CardContent>
            <CardFooter>
              <a
                href={post.url}
                target="_blank"
                className="flex items-center text-muted-foreground hover:underline"
                rel="noopener"
              >
                Read more
                <ArrowRight className="ml-1 size-4" />
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

export { BlogCardGrid }
