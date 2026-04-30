import { format } from 'date-fns'
import { Lightbulb } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface BlogPostProps {
  className?: string
  title?: string
  author?: {
    name: string
    website: string
    websiteName: string
    image: string
  }
  image?: string
  pubDate?: Date
  description?: string
  content?: string
}

const BlogPost = ({
  className,
  title = 'Designing websites faster with shadcn/ui',
  author = {
    name: 'John Doe',
    website: 'https://www.shadcnblocks.com',
    websiteName: 'Shadcnblocks',
    image: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp',
  },
  image = 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg',
  pubDate = new Date(),
  description = 'A step-by-step guide to building a modern, responsive blog using React and Tailwind CSS.',
  content = '',
}: BlogPostProps) => {
  return (
    <section className={cn('py-32', className)}>
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
          <h1 className="max-w-3xl text-5xl font-semibold text-pretty md:text-6xl">{title}</h1>
          <h3 className="max-w-3xl text-lg text-muted-foreground md:text-xl">{description}</h3>
          <div className="flex flex-col items-center gap-1 text-sm md:flex-row md:gap-2 md:text-base">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={author.image} />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{author.name}</span>
            </div>
            <span className="text-muted-foreground">
              Owner of{' '}
              <a href={author.website} className="font-semibold text-foreground hover:underline">
                {author.websiteName}
              </a>
            </span>
            <span className="text-muted-foreground">
              Published on {format(pubDate, 'MMMM d, yyyy')}
            </span>
          </div>
          <img
            src={image}
            alt="placeholder"
            className="mt-4 mb-8 aspect-video w-full rounded-lg border object-cover"
          />
        </div>
      </div>
      <div className="container">
        <div
          className="mx-auto prose max-w-3xl dark:prose-invert"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shopify article contentHtml is server-rendered trusted markup
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  )
}

export { BlogPost }
