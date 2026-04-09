'use client'

import { ChevronLeft, ChevronRight, Heart, Images } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import type { ShopifyImage } from '@/lib/types'

export function ImageGallery({ images }: { images: ShopifyImage[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [desktopPage, setDesktopPage] = useState(0)
  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(images.length / pageSize))
  const desktopPageStart = desktopPage * pageSize
  const desktopPageEnd = Math.min(images.length, desktopPageStart + pageSize)
  const mainImage = images[desktopPageStart] ?? images[0] ?? null
  const sideImages = images.slice(desktopPageStart + 1, desktopPageStart + pageSize)
  const remainingCount = images.length - (desktopPageStart + pageSize)
  const currentImage = images[activeIndex] ?? mainImage

  useEffect(() => {
    if (!api) return

    const updateActiveIndex = () => {
      setActiveIndex(api.selectedScrollSnap())
    }

    updateActiveIndex()
    api.on('select', updateActiveIndex)
    api.on('reInit', updateActiveIndex)

    return () => {
      api.off('select', updateActiveIndex)
      api.off('reInit', updateActiveIndex)
    }
  }, [api])

  if (!mainImage || !currentImage) return null

  function showPreviousDesktopPage() {
    setDesktopPage(currentPage => (currentPage === 0 ? pageCount - 1 : currentPage - 1))
  }

  function showNextDesktopPage() {
    setDesktopPage(currentPage => (currentPage + 1) % pageCount)
  }

  return (
    <>
      <Carousel
        data-slot="image-gallery-mobile"
        className="product-gallery-mobile bg-gray-94 md:hidden"
        opts={{ align: 'start', loop: images.length > 1 }}
        setApi={setApi}
      >
        <CarouselContent className="-ml-0">
          {images.map((image, index) => (
            <CarouselItem key={image.url} className="pl-0">
              <div className="product-gallery-mobile relative overflow-hidden bg-gray-94">
                <Image
                  src={image.url}
                  alt={image.altText ?? ''}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

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
            <span>
              {activeIndex + 1}/{images.length} Photos
            </span>
          </div>
        </div>
      </Carousel>

      <div data-slot="image-gallery" className="hidden md:flex md:flex-col md:gap-4">
        <div className="h-96 gap-px md:flex">
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
                    {isLast && remainingCount > 0 && (
                      <button
                        type="button"
                        className="absolute inset-0 flex items-end justify-end bg-black-30 p-3"
                        onClick={showNextDesktopPage}
                      >
                        <span className="bg-black-40 px-3 py-1 font-heading text-13 text-white">
                          +{remainingCount} Photos
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-gray-90 px-4 py-2 font-heading text-13 text-gray-7">
            <Images className="size-4" strokeWidth={1.75} />
            <span>
              {desktopPageStart + 1}-{desktopPageEnd} of {images.length} Photos
            </span>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 rounded-full border-2 px-4 font-heading text-13 font-semibold uppercase tracking-wide"
                onClick={showPreviousDesktopPage}
              >
                <ChevronLeft className="size-4" />
                <span>Prev</span>
                <span className="sr-only">Previous images</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 rounded-full border-2 px-4 font-heading text-13 font-semibold uppercase tracking-wide"
                onClick={showNextDesktopPage}
              >
                <span>Next</span>
                <ChevronRight className="size-4" />
                <span className="sr-only">Next images</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
