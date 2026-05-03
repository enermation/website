'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  Map as MapLibreMap,
  MapMarker,
  type MapRef,
  MarkerContent,
  MarkerTooltip,
} from '@/components/ui/map'
import { officeLocations } from '@/lib/data'
import { cn } from '@/lib/utils'

type FooterOfficeMapProps = {
  className?: string
}

const MAP_CENTER: [number, number] = [30.0, 20.0]
const MAP_ZOOM = 0.5

export function FooterOfficeMap({ className }: FooterOfficeMapProps) {
  const mapRef = useRef<MapRef>(null)
  const fitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const rafCleanupRef = useRef<(() => void) | null>(null)
  const isInteractingRef = useRef(false)

  const fitAllMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    const bounds: [[number, number], [number, number]] = [
      [180, 90],
      [-180, -90],
    ]

    officeLocations.forEach(office => {
      if (office.lng < bounds[0][0]) bounds[0][0] = office.lng
      if (office.lat < bounds[0][1]) bounds[0][1] = office.lat
      if (office.lng > bounds[1][0]) bounds[1][0] = office.lng
      if (office.lat > bounds[1][1]) bounds[1][1] = office.lat
    })

    const padding = 50
    map.fitBounds(bounds, { padding, duration: 0 })
  }, [])

  useEffect(() => {
    fitTimerRef.current = setTimeout(fitAllMarkers, 600)
    return () => {
      if (fitTimerRef.current) clearTimeout(fitTimerRef.current)
      rafCleanupRef.current?.()
    }
  }, [fitAllMarkers])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    map.on('styledata', () => {
      if (rafRef.current !== null) return

      const rotate = (timestamp: number) => {
        if (!isInteractingRef.current) {
          map.rotateTo((timestamp / 100) % 360, { duration: 0 })
        }
        rafRef.current = requestAnimationFrame(rotate)
      }

      rotate(0)
      rafRef.current = requestAnimationFrame(rotate)

      const handleInteract = () => {
        isInteractingRef.current = true
      }

      const handleInteractionEnd = () => {
        isInteractingRef.current = false
      }

      map.on('mousedown', handleInteract)
      map.on('touchstart', handleInteract)
      map.on('mouseup', handleInteractionEnd)
      map.on('touchend', handleInteractionEnd)

      const cleanup = () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        map.off('mousedown', handleInteract)
        map.off('touchstart', handleInteract)
        map.off('mouseup', handleInteractionEnd)
        map.off('touchend', handleInteractionEnd)
      }

      rafCleanupRef.current = cleanup
    })
  }, [])

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <p className="font-heading text-sm sm:text-base md:text-lg font-bold uppercase tracking-wide text-on-dark">
        Global Export Network
      </p>
      <div className="h-56 w-full overflow-hidden rounded-lg border border-footer-line sm:h-60 md:h-64">
        <MapLibreMap
          ref={mapRef}
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          projection={{ type: 'globe' }}
          styles={{
            light: 'https://tiles.openfreemap.org/styles/liberty',
            dark: 'https://tiles.openfreemap.org/styles/liberty',
          }}
          interactive={true}
          attributionControl={false}
          className="h-full w-full"
        >
          {officeLocations.map((office, index) => (
            <MapMarker key={office.id} longitude={office.lng} latitude={office.lat}>
              <MarkerContent>
                <div className="size-6 flex items-center justify-center rounded-full border-2 border-footer-dark bg-footer-accent font-heading text-xs font-bold text-footer-dark shadow-lg sm:size-5">
                  {index + 1}
                </div>
              </MarkerContent>
              <MarkerTooltip>{office.name}</MarkerTooltip>
            </MapMarker>
          ))}
        </MapLibreMap>
      </div>
      <ul className="flex flex-col gap-x-3 gap-y-2 text-xs text-on-dark-muted sm:text-sm md:flex-row md:gap-x-4">
        {officeLocations.map((office, index) => (
          <li key={office.id} className="flex items-start gap-1.5">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-footer-accent bg-footer-dark font-heading text-11 font-bold text-footer-accent">
              {index + 1}
            </span>
            <span className="text-xs leading-snug sm:text-sm">{office.address}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
