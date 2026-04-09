'use client'

import { ChevronLeft, ChevronRight, Heart, Images, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import type { ShopifyImage } from '@/lib/types'

export function ImageGallery({ images }: { images: ShopifyImage[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [desktopPage, setDesktopPage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxControlsVisible, setLightboxControlsVisible] = useState(true)
  const lightboxRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const touchStartTime = useRef(0)
  const lastTapTime = useRef(0)
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

  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false)
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, images.length])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX
    touchEndY.current = e.touches[0].clientY
  }

  function handleTouchEnd() {
    const swipeThreshold = 50
    const closeThreshold = 80
    const tapThreshold = 200
    const doubleTapThreshold = 300

    const diffX = touchStartX.current - touchEndX.current
    const diffY = touchEndY.current - touchStartY.current
    const duration = Date.now() - touchStartTime.current

    // Check for vertical drag (pull down to close)
    if (diffY > closeThreshold && Math.abs(diffX) < closeThreshold / 2) {
      setLightboxOpen(false)
      touchStartX.current = 0
      touchEndX.current = 0
      touchStartY.current = 0
      touchEndY.current = 0
      return
    }

    // Check for horizontal swipe (navigation)
    if (Math.abs(diffX) >= swipeThreshold && Math.abs(diffY) < swipeThreshold / 2) {
      if (diffX > 0) {
        // Swipe left - next image
        setLightboxIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
      } else {
        // Swipe right - previous image
        setLightboxIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
      }
    }

    // Check for tap (toggle controls)
    if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10 && duration < tapThreshold) {
      const now = Date.now()
      const timeSinceLastTap = now - lastTapTime.current

      // Double-tap detected
      if (timeSinceLastTap < doubleTapThreshold && timeSinceLastTap > 0) {
        // Double-tap action: could zoom (future enhancement)
        lastTapTime.current = 0
      } else {
        // Single tap: toggle controls visibility
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
              <div
                className="product-gallery-mobile relative overflow-hidden bg-gray-94 cursor-pointer"
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
          <div
            className="relative flex-1 overflow-hidden bg-gray-94 cursor-pointer"
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
          </div>

          {sideImages.length > 0 && (
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px">
              {sideImages.map((image, i) => {
                const isLast = i === sideImages.length - 1
                const imageIndex = desktopPageStart + 1 + i
                return (
                  <div
                    key={image.url}
                    className="relative overflow-hidden bg-gray-94 cursor-pointer"
                    onClick={() => openLightbox(imageIndex)}
                  >
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
                        onClick={e => {
                          e.stopPropagation()
                          showNextDesktopPage()
                        }}
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

      {lightboxOpen && images[lightboxIndex] && (
        <div
          ref={lightboxRef}
          data-slot="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-contain bg-black-40 touch-pan-y"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            aria-label="Close lightbox"
            className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full bg-black-30 text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={e => {
              e.stopPropagation()
              closeLightbox()
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                closeLightbox()
              }
            }}
          >
            <X className="size-5" strokeWidth={2} />
          </button>

          <button
            type="button"
            aria-label="Previous image"
            className={`absolute left-2 top-1/2 z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black-30 text-white transition-all duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex ${
              lightboxControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={e => {
              e.stopPropagation()
              setLightboxControlsVisible(true)
              setLightboxIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setLightboxControlsVisible(true)
                setLightboxIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
              }
            }}
          >
            <ChevronLeft className="size-6" strokeWidth={2} />
          </button>

          <button
            type="button"
            aria-label="Next image"
            className={`absolute right-2 top-1/2 z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black-30 text-white transition-all duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex ${
              lightboxControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={e => {
              e.stopPropagation()
              setLightboxControlsVisible(true)
              setLightboxIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setLightboxControlsVisible(true)
                setLightboxIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
              }
            }}
          >
            <ChevronRight className="size-6" strokeWidth={2} />
          </button>

          <div
            className="relative flex items-center justify-center"
            style={{ width: 'var(--w-lightbox)', height: 'var(--h-lightbox)' }}
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].altText ?? ''}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black-30 px-4 py-2 font-heading text-13 text-white transition-all duration-300 ${
              lightboxControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Images className="size-4" strokeWidth={1.75} />
            <span>
              {lightboxIndex + 1} / {images.length} Photos
            </span>
          </div>
        </div>
      )}
    </>
  )
}
