'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { heroBackgroundVideoUrl, heroVideoPoster } from '@/lib/data'
import { cn } from '@/lib/utils'

export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const playVideo = () => {
      video.play().catch(() => {})
    }

    playVideo()

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries
        if (!entry) return

        if (entry.isIntersecting) {
          playVideo()
          return
        }

        video.pause()
      },
      { threshold: 0.1 }
    )

    observer.observe(video)

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause()
        return
      }

      playVideo()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div className="hero-stage__media" aria-hidden="true">
      <Image
        src={heroVideoPoster}
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn('hero-stage__fallback', isReady && 'hero-stage__fallback--hidden')}
      />
      <video
        ref={videoRef}
        className={cn('hero-stage__video', isReady && 'hero-stage__video--ready')}
        src={heroBackgroundVideoUrl}
        poster={heroVideoPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onCanPlay={() => {
          setIsReady(true)
          videoRef.current?.play().catch(() => {})
        }}
      />
      <div className="hero-stage__veil" />
    </div>
  )
}
