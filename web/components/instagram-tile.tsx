'use client'

import { mdiInstagram, mdiPlay } from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import { useRef } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'

type Props = {
  href: string
  mediaUrl: string
  thumbnailUrl: string
  alt: string
  isReel: boolean
}

export function InstagramTile({ href, mediaUrl, thumbnailUrl, alt, isReel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => videoRef.current?.play().catch(() => {})
  const handleMouseLeave = () => {
    const v = videoRef.current
    if (!v) return
    v.pause()
    v.currentTime = 0
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-xl"
      data-instagram-item
      onMouseEnter={isReel ? handleMouseEnter : undefined}
      onMouseLeave={isReel ? handleMouseLeave : undefined}
    >
      <AspectRatio ratio={1} className="bg-surface-elevated">
        {/* Thumbnail — always visible as base layer */}
        <Image
          src={thumbnailUrl}
          alt={alt}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isReel ? 'group-hover:opacity-0' : ''}`}
          sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
        />

        {/* Video layer — only for reels */}
        {isReel && (
          <video
            ref={videoRef}
            src={mediaUrl}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Play icon — visible on reel tiles when not hovering */}
        {isReel && (
          <div className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-background/80 transition-opacity duration-300 group-hover:opacity-0">
            <Icon path={mdiPlay} size={1} className="size-3.5 text-foreground" />
          </div>
        )}

        {/* Instagram badge — appears on hover */}
        <div className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Icon path={mdiInstagram} size={1} className="size-3.5 text-foreground" />
        </div>
      </AspectRatio>
    </a>
  )
}
