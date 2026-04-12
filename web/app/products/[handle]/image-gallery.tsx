'use client'

import Lightbox, { isImageSlide } from 'yet-another-react-lightbox'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import { mdiChevronLeft, mdiChevronRight, mdiClose, mdiHeart, mdiImageMultiple } from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import type { ShopifyImage } from '@/lib/types'

export function ImageGallery({ images }: { images: ShopifyImage[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [desktopPage, setDesktopPage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(images.length / pageSize))
  const desktopPageStart = desktopPage * pageSize
  const desktopPageEnd = Math.min(images.length, desktopPageStart + pageSize)
  const mainImage = images[desktopPageStart] ?? images[0] ?? null
  const sideImages = images.slice(desktopPageStart + 1, desktopPageStart + pageSize)
  const remainingCount = images.length - (desktopPageStart + pageSize)

  const slides = images.map(img => ({
    src: img.url,
    alt: img.altText ?? '',
    ...(img.width && img.height ? { width: img.width, height: img.height } : {}),
  }))

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

  function openLightbox(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  function showPreviousDesktopPage() {
    setDesktopPage(current => (current === 0 ? pageCount - 1 : current - 1))
  }

  function showNextDesktopPage() {
    setDesktopPage(current => (current + 1) % pageCount)
  }

  if (!mainImage) return null

  return (
    <>
      {/* ── Mobile carousel ── */}
      <Carousel
        data-slot="image-gallery-mobile"
        className="product-gallery-mobile bg-surface-elevated md:hidden"
        opts={{ align: 'start', loop: images.length > 1 }}
        setApi={setApi}
      >
        <CarouselContent className="-ml-0">
          {images.map((image, index) => (
            <CarouselItem key={image.url} className="pl-0">
              <button
                type="button"
                className="product-gallery-mobile relative overflow-hidden bg-surface-elevated cursor-zoom-in transition-opacity duration-150 active:opacity-30"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image.url}
                  alt={image.altText ?? ''}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-11 items-center justify-center rounded-full border border-white-20 bg-white">
              <Icon path={mdiHeart} size={1} className="size-5 text-gray-7" />
            </div>
            <div className="flex size-11 items-center justify-center rounded-full bg-white">
              <Icon path={mdiImageMultiple} size={1} className="size-5 text-gray-7" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-black-40 px-3 py-1.5 font-heading text-xs text-white">
            <Icon path={mdiImageMultiple} size={1} className="size-3.5" />
            <span>Tap to expand</span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-end p-4">
          <div className="flex items-center gap-2 rounded-full border border-white-20 bg-black-40 px-4 py-2 font-heading text-13 text-white">
            <Icon path={mdiImageMultiple} size={1} className="size-4" />
            <span>
              {activeIndex + 1}/{images.length} Photos
            </span>
          </div>
        </div>
      </Carousel>

      {/* ── Desktop grid ── */}
      <div data-slot="image-gallery" className="hidden md:flex md:flex-col md:gap-4">
        <div className="flex h-96 gap-px">
          <button
            type="button"
            className="group relative flex-1 overflow-hidden bg-surface-elevated cursor-zoom-in"
            onClick={() => openLightbox(desktopPageStart)}
          >
            <Image
              src={mainImage.url}
              alt={mainImage.altText ?? ''}
              fill
              priority
              className="object-cover transition-opacity group-hover:opacity-90"
              sizes="(min-width: 1320px) 660px, 50vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black-30 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex items-center gap-2 rounded-full bg-black-40 px-4 py-2 font-heading text-13 text-white">
                <Icon path={mdiImageMultiple} size={1} className="size-4" />
                <span>Click to expand</span>
              </div>
            </div>
          </button>

          {sideImages.length > 0 && (
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px">
              {sideImages.map((image, i) => {
                const isLast = i === sideImages.length - 1
                const imageIndex = desktopPageStart + 1 + i
                return (
                  <div
                    key={image.url}
                    className="group relative overflow-hidden bg-surface-elevated"
                  >
                    <button
                      type="button"
                      className="absolute inset-0 w-full h-full cursor-zoom-in"
                      onClick={() => openLightbox(imageIndex)}
                      aria-label={image.altText ?? `Open image ${imageIndex + 1}`}
                    >
                      <Image
                        src={image.url}
                        alt={image.altText ?? ''}
                        fill
                        className="object-cover transition-opacity group-hover:opacity-90"
                        sizes="(min-width: 1320px) 330px, 25vw"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black-30 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex items-center gap-2 rounded-full bg-black-40 px-4 py-2 font-heading text-13 text-white">
                          <Icon path={mdiImageMultiple} size={1} className="size-4" />
                          <span>Click to expand</span>
                        </div>
                      </div>
                    </button>
                    {isLast && remainingCount > 0 && (
                      <button
                        type="button"
                        className="absolute inset-0 flex cursor-pointer items-end justify-end bg-black-30 p-3 transition-opacity hover:bg-black-40"
                        onClick={() => openLightbox(desktopPageStart + 1)}
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-gray-90 px-4 py-2 font-heading text-13 text-gray-7">
              <Icon path={mdiImageMultiple} size={1} className="size-4" />
              <span>
                {desktopPageStart + 1}–{desktopPageEnd} of {images.length} Photos
              </span>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-gray-90 px-4 py-2 font-heading text-13 text-gray-7 transition-colors hover:text-foreground"
              onClick={() => openLightbox(0)}
            >
              <Icon path={mdiImageMultiple} size={1} className="size-4" />
              <span>View All {images.length} Photos</span>
            </button>
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
                <Icon path={mdiChevronLeft} size={1} className="size-4" />
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
                <Icon path={mdiChevronRight} size={1} className="size-4" />
                <span className="sr-only">Next images</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Counter]}
        counter={{ container: { className: 'yarl-counter-pill' } }}
        render={{
          iconPrev: () => <Icon path={mdiChevronLeft} size={1} className="size-5" />,
          iconNext: () => <Icon path={mdiChevronRight} size={1} className="size-5" />,
          iconClose: () => <Icon path={mdiClose} size={1} className="size-5" />,
          slide: ({ slide, offset }) => {
            if (!isImageSlide(slide)) return undefined
            return (
              <div className="yarl__fullsize relative">
                <Image
                  src={slide.src as string}
                  alt={slide.alt ?? ''}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority={offset === 0}
                />
              </div>
            )
          },
        }}
      />
    </>
  )
}
