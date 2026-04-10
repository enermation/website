'use client'

import { ChevronLeft, ChevronRight, Heart, Images, Share2, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { productPage } from '@/lib/data'
import type { ShopifyImage } from '@/lib/types'

const desktopGallerySlots = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const

export function ImageGallery({ images }: { images: ShopifyImage[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxControlsVisible, setLightboxControlsVisible] = useState(true)
  const [saved, setSaved] = useState(false)
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lightboxRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const touchStartTime = useRef(0)
  const lastTapTime = useRef(0)

  const mainImage = images[0] ?? null
  const sideImages = images.slice(1, 5)
  const remainingCount = Math.max(0, images.length - 5)
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

  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxOpen(false)
      } else if (event.key === 'ArrowLeft') {
        setLightboxControlsVisible(true)
        setLightboxIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
      } else if (event.key === 'ArrowRight') {
        setLightboxControlsVisible(true)
        setLightboxIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, images.length])

  useEffect(() => {
    if (!lightboxOpen || !lightboxControlsVisible) return

    if (autoHideTimer.current) clearTimeout(autoHideTimer.current)

    autoHideTimer.current = setTimeout(() => {
      setLightboxControlsVisible(false)
    }, 3000)

    return () => {
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current)
    }
  }, [lightboxOpen, lightboxControlsVisible])

  function handleLightboxActivity() {
    setLightboxControlsVisible(true)

    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current)
      autoHideTimer.current = null
    }
  }

  function handleTouchStart(event: React.TouchEvent) {
    const x = event.touches[0].clientX
    const y = event.touches[0].clientY
    touchStartX.current = x
    touchEndX.current = x
    touchStartY.current = y
    touchEndY.current = y
    touchStartTime.current = Date.now()
  }

  function handleTouchMove(event: React.TouchEvent) {
    touchEndX.current = event.touches[0].clientX
    touchEndY.current = event.touches[0].clientY
  }

  function handleTouchEnd() {
    const swipeThreshold = 50
    const closeThreshold = 80
    const tapThreshold = 200
    const doubleTapThreshold = 300

    const diffX = touchStartX.current - touchEndX.current
    const diffY = touchEndY.current - touchStartY.current
    const duration = Date.now() - touchStartTime.current

    if (diffY > closeThreshold && Math.abs(diffX) < closeThreshold / 2) {
      setLightboxOpen(false)
      touchStartX.current = 0
      touchEndX.current = 0
      touchStartY.current = 0
      touchEndY.current = 0
      return
    }

    if (Math.abs(diffX) >= swipeThreshold && Math.abs(diffY) < swipeThreshold / 2) {
      if (diffX > 0) {
        setLightboxIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
      } else {
        setLightboxIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
      }
    }

    if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10 && duration < tapThreshold) {
      const now = Date.now()
      const timeSinceLastTap = now - lastTapTime.current

      if (timeSinceLastTap < doubleTapThreshold && timeSinceLastTap > 0) {
        lastTapTime.current = 0
      } else {
        setLightboxControlsVisible(prev => !prev)
        lastTapTime.current = now
      }
    }

    touchStartX.current = 0
    touchEndX.current = 0
    touchStartY.current = 0
    touchEndY.current = 0
  }

  function openLightbox(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
    setLightboxControlsVisible(true)
  }

  function closeLightbox() {
    setLightboxOpen(false)
  }

  async function handleShare(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()

    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt(productPage.labels.copyLinkPrompt, url)
    }
  }

  function handleSave(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setSaved(current => !current)
  }

  if (!mainImage || !currentImage) return null

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
              <button
                type="button"
                className="product-gallery-mobile relative cursor-zoom-in overflow-hidden bg-gray-94 transition-opacity duration-150 active:opacity-30"
                onClick={() => openLightbox(index)}
                aria-label={`${productPage.labels.clickToExpand} ${index + 1}`}
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
            <button
              type="button"
              aria-label={productPage.labels.save}
              aria-pressed={saved}
              className="flex size-11 items-center justify-center rounded-full border border-white-20 bg-white-solid"
              onClick={handleSave}
            >
              <Heart
                className={saved ? 'size-5 fill-current text-gray-7' : 'size-5 text-gray-7'}
                strokeWidth={1.75}
              />
            </button>
            <button
              type="button"
              aria-label={productPage.labels.share}
              className="flex size-11 items-center justify-center rounded-full bg-white-solid"
              onClick={handleShare}
            >
              <Share2 className="size-5 text-gray-7" strokeWidth={1.75} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-black-40 px-3 py-1.5 font-heading text-12 text-white-solid">
            <Images className="size-3.5" strokeWidth={1.75} />
            <span>{productPage.labels.tapToExpand}</span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-end p-4">
          <div className="flex items-center gap-2 rounded-full border border-white-20 bg-black-40 px-4 py-2 font-heading text-13 text-white-solid">
            <Images className="size-4" strokeWidth={1.75} />
            <span>
              {activeIndex + 1}/{images.length} {productPage.labels.photos}
            </span>
          </div>
        </div>
      </Carousel>

      <div data-slot="image-gallery" className="relative hidden md:block">
        <div className="product-gallery-desktop grid grid-cols-2 gap-px overflow-hidden bg-gray-90">
          <button
            type="button"
            className="group relative h-full cursor-zoom-in overflow-hidden bg-gray-94"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={mainImage.url}
              alt={mainImage.altText ?? ''}
              fill
              priority
              className="object-cover transition-opacity group-hover:opacity-90"
              sizes="(min-width: 1920px) 862px, 50vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black-30 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex items-center gap-2 rounded-full bg-black-40 px-4 py-2 font-heading text-13 text-white-solid">
                <Images className="size-4" strokeWidth={1.75} />
                <span>{productPage.labels.clickToExpand}</span>
              </div>
            </div>
          </button>

          <div className="grid grid-cols-2 grid-rows-2 gap-px">
            {desktopGallerySlots.map((slotName, slotIndex) => {
              const image = sideImages[slotIndex]
              const imageIndex = slotIndex + 1
              const isLastTile = slotIndex === 3

              if (!image) {
                return <div key={slotName} className="bg-gray-94" />
              }

              return (
                <button
                  key={`${slotName}-${image.url}`}
                  type="button"
                  className="group relative cursor-zoom-in overflow-hidden bg-gray-94 text-left"
                  onClick={() => openLightbox(imageIndex)}
                >
                  <Image
                    src={image.url}
                    alt={image.altText ?? ''}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                    sizes="(min-width: 1920px) 429px, 25vw"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black-30 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-2 rounded-full bg-black-40 px-4 py-2 font-heading text-13 text-white-solid">
                      <Images className="size-4" strokeWidth={1.75} />
                      <span>{productPage.labels.clickToExpand}</span>
                    </div>
                  </div>

                  {isLastTile && remainingCount > 0 && (
                    <span className="absolute bottom-3 right-3 rounded-md bg-black-40 px-3 py-1 font-heading text-13 text-white-solid">
                      +{remainingCount} {productPage.labels.photos}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              aria-pressed={saved}
              className="flex items-center gap-2 rounded-full border border-gray-90 bg-white-solid px-4 py-2 font-heading text-13 text-gray-7"
              onClick={handleSave}
            >
              <Heart
                className={saved ? 'size-4 fill-current text-gray-7' : 'size-4 text-gray-7'}
                strokeWidth={1.75}
              />
              <span>{productPage.labels.save}</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-gray-90 bg-white-solid px-4 py-2 font-heading text-13 text-gray-7"
              onClick={handleShare}
            >
              <Share2 className="size-4" strokeWidth={1.75} />
              <span>{productPage.labels.share}</span>
            </button>
          </div>

          <button
            type="button"
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-white-20 bg-black-40 px-4 py-2 font-heading text-13 text-white-solid"
            onClick={() => openLightbox(0)}
          >
            <Images className="size-4" strokeWidth={1.75} />
            <span>
              {images.length} {productPage.labels.photos}
            </span>
          </button>
        </div>
      </div>

      {lightboxOpen && images[lightboxIndex] && (
        <div
          ref={lightboxRef}
          data-slot="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="fixed inset-0 z-50 flex h-dvh w-screen items-center justify-center overflow-hidden overscroll-contain bg-black-40 touch-pan-y"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleLightboxActivity}
          onKeyDown={event => {
            if (event.key === 'Escape') closeLightbox()
          }}
        >
          <button
            type="button"
            aria-label="Close lightbox"
            className="absolute right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full bg-black-30 text-white-solid transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-solid"
            onClick={event => {
              event.stopPropagation()
              closeLightbox()
            }}
          >
            <X className="size-5" strokeWidth={2} />
          </button>

          <button
            type="button"
            aria-label="Previous image"
            className={cnLightboxControl(lightboxControlsVisible, 'left-2')}
            onClick={event => {
              event.stopPropagation()
              setLightboxControlsVisible(true)
              setLightboxIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
            }}
          >
            <ChevronLeft className="size-6" strokeWidth={2} />
          </button>

          <button
            type="button"
            aria-label="Next image"
            className={cnLightboxControl(lightboxControlsVisible, 'right-2')}
            onClick={event => {
              event.stopPropagation()
              setLightboxControlsVisible(true)
              setLightboxIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
            }}
          >
            <ChevronRight className="size-6" strokeWidth={2} />
          </button>

          <button
            type="button"
            className="relative size-full"
            aria-label={`${productPage.labels.clickToExpand} ${lightboxIndex + 1}`}
            onClick={event => {
              event.stopPropagation()
            }}
          >
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].altText ?? ''}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </button>

          <div
            className={`absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black-30 px-4 py-2 font-heading text-13 text-white-solid transition-all duration-300 ${
              lightboxControlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <Images className="size-4" strokeWidth={1.75} />
            <span>
              {lightboxIndex + 1} / {images.length} {productPage.labels.photos}
            </span>
            <span className="ml-2 hidden border-l border-white-20 pl-2 text-11 text-white-70 md:inline-block">
              {productPage.labels.lightboxHelp}
            </span>
          </div>
        </div>
      )}
    </>
  )
}

function cnLightboxControl(visible: boolean, edgeClass: string): string {
  return `absolute ${edgeClass} top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black-30 text-white-solid transition-all duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-solid ${
    visible ? 'opacity-100' : 'pointer-events-none opacity-0'
  }`
}
