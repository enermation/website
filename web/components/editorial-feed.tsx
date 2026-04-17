'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '@/components/animated-section'
import type { RelatedStory } from '@/lib/data'

type EditorialFeedProps = {
  stories: RelatedStory[]
}

export function EditorialFeed({ stories }: EditorialFeedProps) {
  if (stories.length === 0) return null

  return (
    <section className="border-t border-border bg-background py-12 md:py-16">
      <div className="mx-auto max-w-site px-4 md:px-6">
        <h2 className="font-display text-section uppercase tracking-widest text-heading mb-8 md:mb-10">
          From The Collection
        </h2>

        <AnimatedSection className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stories.map(story => (
            <Link
              key={story.id}
              href={story.href}
              data-reveal
              className="group flex flex-col gap-3"
            >
              {/* Image */}
              <div className="story-row-media relative overflow-hidden bg-surface-elevated">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw"
                />
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 font-heading text-13 text-muted-foreground">
                <span>{story.date}</span>
                <span>|</span>
                <span>{story.category}</span>
              </div>

              {/* Title */}
              <h3 className="font-display text-base leading-snug text-heading transition-colors group-hover:text-brand-green">
                {story.title}
              </h3>
            </Link>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}
