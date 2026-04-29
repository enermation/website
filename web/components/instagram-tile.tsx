'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'

type Props = {
  href: string
  mediaUrl: string
  thumbnailUrl: string
  alt: string
  isReel: boolean
}

export function InstagramTile({ href, mediaUrl, thumbnailUrl, alt, isReel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
          video.currentTime = 0
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-xl"
      data-reveal
      data-variant="scale"
    >
      <AspectRatio ratio={1} className="bg-surface-elevated">
        {/* Thumbnail — fades out when video starts playing */}
        <Image
          src={thumbnailUrl}
          alt={alt}
          fill
          className={cn(
            'object-cover transition-all duration-500 group-hover:scale-105',
            isReel && isPlaying && 'opacity-0'
          )}
          sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
        />

        {/* Video layer — autoplays when in viewport, visible once playing */}
        {isReel && (
          <video
            ref={videoRef}
            src={mediaUrl}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className={cn(
              'absolute inset-0 size-full object-cover transition-opacity duration-300',
              isPlaying ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Instagram badge — appears on hover */}
        <div className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <img
            src="/instagram-logo.svg"
            alt="Instagram"
            width={14}
            height={14}
            className="size-3.5"
            aria-hidden="true"
          />
        </div>
      </AspectRatio>
    </a>
  )
}
