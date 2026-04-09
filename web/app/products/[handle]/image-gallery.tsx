import Image from "next/image"
import type { ShopifyImage } from "@/lib/types"

export function ImageGallery({ images }: { images: ShopifyImage[] }) {
  if (images.length === 0) return null

  const mainImage = images[0]
  const sideImages = images.slice(1, 5)
  const extraCount = images.length - 5

  return (
    <div data-slot="image-gallery" className="h-96 flex gap-px">
      {/* Main image — left half */}
      <div className="relative flex-1 overflow-hidden bg-gray-94">
        <Image
          src={mainImage.url}
          alt={mainImage.altText ?? ""}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1320px) 660px, 50vw"
        />
      </div>

      {/* Side images — 2×2 grid, right half */}
      {sideImages.length > 0 && (
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px">
          {sideImages.map((image, i) => {
            const isLast = i === sideImages.length - 1
            return (
              <div key={image.url} className="relative overflow-hidden bg-gray-94">
                <Image
                  src={image.url}
                  alt={image.altText ?? ""}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1320px) 330px, 25vw"
                />
                {isLast && extraCount > 0 && (
                  <div className="absolute inset-0 flex items-end justify-end p-3 bg-black-30">
                    <span className="font-heading text-13 text-white bg-black-40 px-3 py-1">
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
  )
}

