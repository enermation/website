'use client'

import { mdiChevronLeft, mdiChevronRight, mdiClose, mdiHeart, mdiImageMultiple } from '@mdi/js'
import { Icon } from '@mdi/react'
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
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null)
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
        setLightboxControlsVisible(true)
        setLightboxIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
      } else if (e.key === 'ArrowRight') {
        setLightboxControlsVisible(true)
        setLightboxIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, images.length])

  useEffect(() => {
    if (!lightboxOpen || !lightboxControlsVisible) return

    // Auto-hide controls after 3 seconds of inactivity
    if (autoHideTimer) clearTimeout(autoHideTimer)

    const timer = setTimeout(() => {
      setLightboxControlsVisible(false)
    }, 3000)

    setAutoHideTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [lightboxOpen, lightboxControlsVisible, autoHideTimer])

  function handleLightboxActivity() {
    setLightboxControlsVisible(true)
    if (autoHideTimer) {
      clearTimeout(autoHideTimer)
      setAutoHideTimer(null)
    }
  }

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
              <button
                type="button"
                className="product-gallery-mobile relative overflow-hidden bg-gray-94 cursor-zoom-in transition-opacity duration-150 active:opacity-30"
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
          <div className="flex items-center gap-1.5 rounded-full bg-black-40 px-3 py-1.5 font-heading text-12 text-white">
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

      <div data-slot="image-gallery" className="hidden md:flex md:flex-col md:gap-4">
        <div className="flex h-96 gap-px">
          <button
            type="button"
            className="group relative flex-1 overflow-hidden bg-gray-94 cursor-zoom-in"
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
                  <button
                    key={image.url}
                    type="button"
                    className="group relative overflow-hidden bg-gray-94 cursor-zoom-in"
                    onClick={() => openLightbox(imageIndex)}
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
                    {isLast && remainingCount > 0 && (
                      <div
                        role="presentation"
                        className="absolute inset-0 flex cursor-pointer items-end justify-end bg-black-30 p-3 transition-opacity hover:bg-black-40"
                        onClick={e => {
                          e.stopPropagation()
                          openLightbox(desktopPageStart + 1)
                        }}
                      >
                        <span className="bg-black-40 px-3 py-1 font-heading text-13 text-white">
                          +{remainingCount} Photos
                        </span>
                      </div>
                    )}
                  </button>
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
                {desktopPageStart + 1}-{desktopPageEnd} of {images.length} Photos
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

      {lightboxOpen && images[lightboxIndex] && (
        <div
          ref={lightboxRef}
          data-slot="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="fixed left-0 top-0 z-50 flex items-center justify-center overflow-hidden overscroll-contain bg-black-40 touch-pan-y"
          style={{ width: '100vw', height: '100dvh' }}
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseMove={() => handleLightboxActivity()}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleLightboxActivity()
            }
          }}
        >
          <button
            type="button"
            aria-label="Close lightbox"
            className="absolute top-4 right-4 z-20 flex size-11 items-center justify-center rounded-full bg-black-30 text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{
              top: 'max(1rem, env(safe-area-inset-top, 1rem))',
              right: 'max(1rem, env(safe-area-inset-right, 1rem))',
            }}
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
            <Icon path={mdiClose} size={1} className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Previous image"
            className={`absolute left-2 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black-30 text-white transition-all duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              lightboxControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ left: 'max(0.5rem, env(safe-area-inset-left, 0.5rem))' }}
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
            <Icon path={mdiChevronLeft} size={1} className="size-6" />
          </button>

          <button
            type="button"
            aria-label="Next image"
            className={`absolute right-2 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black-30 text-white transition-all duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              lightboxControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ right: 'max(0.5rem, env(safe-area-inset-right, 0.5rem))' }}
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
            <Icon path={mdiChevronRight} size={1} className="size-6" />
          </button>

          <button
            type="button"
            className="relative flex items-center justify-center"
            style={{ width: '100%', height: '100%' }}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
              }
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
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-black-30 px-4 py-2 font-heading text-13 text-white transition-all duration-300 ${
              lightboxControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
          >
            <Icon path={mdiImageMultiple} size={1} className="size-4" />
            <span>
              {lightboxIndex + 1} / {images.length} Photos
            </span>
            <span className="hidden md:inline-block ml-2 pl-2 border-l border-white-20 text-11 text-white-70">
              ← → Navigate · Esc Close
            </span>
          </div>
        </div>
      )}
    </>
  )
}
