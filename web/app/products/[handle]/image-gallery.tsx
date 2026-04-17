'use client'

import Lightbox, { isImageSlide } from 'yet-another-react-lightbox'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import { mdiChevronLeft, mdiChevronRight, mdiClose, mdiImageMultiple } from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import { useState } from 'react'
import { ProductGallery1 } from '@/components/product-gallery1'
import { Button } from '@/components/ui/button'
import type { ShopifyImage } from '@/lib/types'

export function ImageGallery({ images }: { images: ShopifyImage[] }) {
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
      {/* ── Mobile gallery ── */}
      <ProductGallery1 images={images} className="md:hidden" onImageClick={openLightbox} />

      {/* ── Desktop grid ── */}
      <div className="grain-overlay relative hidden md:flex md:flex-col md:gap-4">
        <div className="flex h-96 gap-px min-w-0">
          <button
            type="button"
            className="relative flex-1 overflow-hidden bg-surface-elevated cursor-zoom-in min-w-0"
            onClick={() => openLightbox(desktopPageStart)}
          >
            <Image
              src={mainImage.url}
              alt={mainImage.altText ?? ''}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1320px) 660px, 50vw"
            />
          </button>

          {sideImages.length > 0 && (
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px">
              {sideImages.map((image, i) => {
                const isLast = i === sideImages.length - 1
                const imageIndex = desktopPageStart + 1 + i
                return (
                  <div key={image.url} className="relative overflow-hidden bg-surface-elevated">
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
                        className="object-cover"
                        sizes="(min-width: 1320px) 330px, 25vw"
                      />
                    </button>
                    {isLast && remainingCount > 0 && (
                      <button
                        type="button"
                        className="absolute inset-0 flex items-end justify-end bg-black-30 p-3 hover:bg-black-40 transition-colors"
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
          <div className="flex items-center gap-2 font-heading text-11 text-gray-60 uppercase tracking-widest">
            <Icon path={mdiImageMultiple} size={1} className="size-3.5" />
            <span>
              {desktopPageStart + 1}–{desktopPageEnd} of {images.length}
            </span>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 rounded-full border border-white-20 bg-black-40 px-4 font-heading text-13 font-semibold uppercase tracking-wide text-white transition-colors hover:border-white-40 hover:bg-black-50"
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
                className="h-11 rounded-full border border-white-20 bg-black-40 px-4 font-heading text-13 font-semibold uppercase tracking-wide text-white transition-colors hover:border-white-40 hover:bg-black-50"
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
          iconPrev: () => (
            <Icon path={mdiChevronLeft} size={1} className="size-5" aria-label="Previous image" />
          ),
          iconNext: () => (
            <Icon path={mdiChevronRight} size={1} className="size-5" aria-label="Next image" />
          ),
          iconClose: () => (
            <Icon path={mdiClose} size={1} className="size-5" aria-label="Close lightbox" />
          ),
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
