"use client"

import { ArrowUpRight, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLayoutEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

export type CardNavLink = {
  label: string
  href: string
}

export type CardNavItem = {
  label: string
  href: string
  links: CardNavLink[]
}

export interface CardNavProps {
  items: CardNavItem[]
  className?: string
  onMenuClick?: () => void
}

const CardNav = ({ items, className, onMenuClick }: CardNavProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const navRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const calculateHeight = () => {
    const navEl = navRef.current
    if (!navEl) return 260

    const isMobile = window.matchMedia("(max-width: 768px)").matches
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement
      if (contentEl) {
        const wasVisible = contentEl.style.visibility
        const wasPointerEvents = contentEl.style.pointerEvents
        const wasPosition = contentEl.style.position
        const wasHeight = contentEl.style.height

        contentEl.style.visibility = "visible"
        contentEl.style.pointerEvents = "auto"
        contentEl.style.position = "static"
        contentEl.style.height = "auto"

        contentEl.offsetHeight

        const topBar = 60
        const padding = 16
        const contentHeight = contentEl.scrollHeight

        contentEl.style.visibility = wasVisible
        contentEl.style.pointerEvents = wasPointerEvents
        contentEl.style.position = wasPosition
        contentEl.style.height = wasHeight

        return topBar + contentHeight + padding
      }
    }
    return 260
  }

  const createTimeline = () => {
    const navEl = navRef.current
    if (!navEl) return null

    gsap.set(navEl, { height: 60, overflow: "hidden" })
    gsap.set(cardsRef.current, { y: 50, opacity: 0 })

    const tl = gsap.timeline({ paused: true })

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease: "power3.out",
    })

    tl.to(
      cardsRef.current,
      { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.08 },
      "-=0.1"
    )

    return tl
  }

  useLayoutEffect(() => {
    const tl = createTimeline()
    tlRef.current = tl

    return () => {
      tl?.kill()
      tlRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return

      if (isExpanded) {
        const newHeight = calculateHeight()
        gsap.set(navRef.current, { height: newHeight })

        tlRef.current.kill()
        const newTl = createTimeline()
        if (newTl) {
          newTl.progress(1)
          tlRef.current = newTl
        }
      } else {
        tlRef.current.kill()
        const newTl = createTimeline()
        if (newTl) {
          tlRef.current = newTl
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isExpanded])

  const toggleMenu = () => {
    const tl = tlRef.current
    if (!tl) return
    if (!isExpanded) {
      setIsExpanded(true)
      tl.play(0)
    } else {
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false))
      tl.reverse()
    }
  }

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el
  }

  return (
    <div
      data-slot="card-nav"
      className={cn(
        "absolute left-1/2 top-3 z-50 w-[90%] max-w-[800px] -translate-x-1/2 md:top-5",
        className
      )}
    >
      <nav
        ref={navRef}
        className={cn("relative h-[60px] overflow-hidden rounded-xl border border-gray-90 bg-white shadow-md will-change-[height]", isExpanded && "open")}
      >
        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 z-10 flex h-[60px] items-center justify-between px-4 md:pl-[1.1rem]">
          {/* Hamburger */}
          <button
            type="button"
            className={cn(
              "group flex h-full flex-col items-center justify-center gap-1.5 cursor-pointer",
              isExpanded && "open"
            )}
            onClick={toggleMenu}
            aria-label={isExpanded ? "Close menu" : "Open menu"}
          >
            <span className="block h-[2px] w-[30px] bg-foreground transition-[transform,opacity] duration-300 [transform-origin:50%_50%] group-hover:opacity-75"
              style={{ transform: isExpanded ? "translateY(4px) rotate(45deg)" : "none" }}
            />
            <span className="block h-[2px] w-[30px] bg-foreground transition-[transform,opacity] duration-300 [transform-origin:50%_50%] group-hover:opacity-75"
              style={{ transform: isExpanded ? "translateY(-4px) rotate(-45deg)" : "none" }}
            />
          </button>

          {/* Logo */}
          <Link href="/" aria-label="Enermation home" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-0">
            <Image
              src="/logo.jpg"
              alt="Enermation"
              width={180}
              height={44}
              className="h-7 w-auto"
            />
          </Link>

          {/* Phone CTA — desktop only */}
          <Link
            href="tel:+441772663777"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-gray-16 px-4 py-2 font-body font-bold text-white text-xs tracking-wide transition-colors hover:bg-gray-18"
          >
            +44 (0)1772 663777
          </Link>

          {/* Mobile full menu button */}
          <button
            type="button"
            className="md:hidden flex size-10 items-center justify-center text-foreground"
            onClick={onMenuClick}
            aria-label="Open full menu"
          >
            <Menu className="size-6" />
          </button>
        </div>

        {/* Cards content */}
        <div
          className={cn(
            "card-nav-content absolute left-0 right-0 top-[60px] bottom-0 z-0 flex flex-col items-stretch gap-2 justify-start p-2 invisible pointer-events-none md:flex-row md:items-end md:gap-3",
            isExpanded && "visible pointer-events-auto"
          )}
          aria-hidden={!isExpanded}
        >
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={item.label}
              ref={setCardRef(idx)}
              className="flex flex-col gap-2 p-3 rounded-lg bg-gray-98 min-w-0 flex-1 h-auto min-h-[60px] md:h-full select-none"
            >
              <Link
                href={item.href}
                className="font-display text-lg md:text-xl text-foreground tracking-wide hover:opacity-80 transition-opacity"
                onClick={() => isExpanded && toggleMenu()}
              >
                {item.label}
              </Link>
              <div className="mt-auto flex flex-col gap-1">
                {item.links?.map((lnk) => (
                  <Link
                    key={lnk.label}
                    href={lnk.href}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => isExpanded && toggleMenu()}
                  >
                    <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                    {lnk.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}

export { CardNav }
