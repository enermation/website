'use client'

import Image from 'next/image'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { ShopifyImage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductGallery1Props {
  images: ShopifyImage[]
  className?: string
  onImageClick?: (index: number) => void
}

const ProductGallery1 = ({ images, className, onImageClick }: ProductGallery1Props) => {
  return (
    <section className={cn('w-full', className)}>
      <Carousel
        opts={{
          breakpoints: {
            '(min-width: 768px)': {
              active: false,
            },
          },
        }}
      >
        <CarouselContent className="gap-4 md:m-0 md:grid md:grid-cols-3 xl:gap-5">
          {images.map((img, index) => (
            <CarouselItem className="first:col-span-3 md:p-0" key={img.url}>
              <AspectRatio ratio={1} className="overflow-hidden rounded-lg">
                <button
                  type="button"
                  className="relative block size-full cursor-zoom-in"
                  onClick={() => onImageClick?.(index)}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? ''}
                    fill
                    priority={index === 0}
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (min-width: 768px) 33vw, 25vw"
                  />
                </button>
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="md:hidden">
          <CarouselPrevious className="left-4" aria-label="Previous images" />
          <CarouselNext className="right-4" aria-label="Next images" />
        </div>
      </Carousel>
    </section>
  )
}

export { ProductGallery1 }
