import { Heart, Images } from 'lucide-react'
import Image from 'next/image'
import type { ShopifyImage } from '@/lib/types'

export function ImageGallery({ images }: { images: ShopifyImage[] }) {
  if (images.length === 0) return null

  const mainImage = images[0]
  const sideImages = images.slice(1, 5)
  const extraCount = images.length - 5

  return (
    <>
      <div
        data-slot="image-gallery-mobile"
        className="product-gallery-mobile relative overflow-hidden bg-gray-94 md:hidden"
      >
        <Image
          src={mainImage.url}
          alt={mainImage.altText ?? ''}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-11 items-center justify-center rounded-full border border-white-20 bg-white">
              <Heart className="size-5 text-gray-7" strokeWidth={1.75} />
            </div>
            <div className="flex size-11 items-center justify-center rounded-full bg-white">
              <Images className="size-5 text-gray-7" strokeWidth={1.75} />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-end p-4">
          <div className="flex items-center gap-2 rounded-full border border-white-20 bg-black-40 px-4 py-2 font-heading text-13 text-white">
            <Images className="size-4" strokeWidth={1.75} />
            <span>{images.length} Photos</span>
          </div>
        </div>
      </div>

      <div data-slot="image-gallery" className="hidden h-96 gap-px md:flex">
        <div className="relative flex-1 overflow-hidden bg-gray-94">
          <Image
            src={mainImage.url}
            alt={mainImage.altText ?? ''}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1320px) 660px, 50vw"
          />
        </div>

        {sideImages.length > 0 && (
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px">
            {sideImages.map((image, i) => {
              const isLast = i === sideImages.length - 1
              return (
                <div key={image.url} className="relative overflow-hidden bg-gray-94">
                  <Image
                    src={image.url}
                    alt={image.altText ?? ''}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1320px) 330px, 25vw"
                  />
                  {isLast && extraCount > 0 && (
                    <div className="absolute inset-0 flex items-end justify-end bg-black-30 p-3">
                      <span className="bg-black-40 px-3 py-1 font-heading text-13 text-white">
                        +{extraCount} Photos
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
