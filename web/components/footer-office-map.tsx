'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  Map as MapLibreMap,
  MapMarker,
  type MapRef,
  MarkerContent,
  MarkerTooltip,
  useMap,
} from '@/components/ui/map'
import { officeLocations } from '@/lib/data'
import { cn } from '@/lib/utils'

type FooterOfficeMapProps = {
  className?: string
}

const MAP_CENTER: [number, number] = [30.0, 26.0]
const MAP_ZOOM = 1.5

function GlobeStyler() {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!isLoaded || !map) return

    // Set globe background color to grey
    map.setPaintProperty('background', 'background-color', '#2a2a2a')
  }, [map, isLoaded])

  return null
}

export function FooterOfficeMap({ className }: FooterOfficeMapProps) {
  const mapRef = useRef<MapRef>(null)
  const fitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    // Smaller padding for tighter zoom
    const padding = 50
    map.fitBounds(bounds, { padding, duration: 0 })
  }, [])

  useEffect(() => {
    // Debounce fitAllMarkers to avoid rapid recalculations
    fitTimerRef.current = setTimeout(fitAllMarkers, 600)
    return () => {
      if (fitTimerRef.current) clearTimeout(fitTimerRef.current)
    }
  }, [fitAllMarkers])

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p className="font-heading text-xs font-semibold uppercase tracking-wide text-white-70 sm:text-sm">
        Our Locations
      </p>
      {/* Map: taller on mobile for better touch visibility, consistent on desktop */}
      <div className="h-56 w-full overflow-hidden rounded-sm border border-white-10 sm:h-60 md:h-64">
        <MapLibreMap
          ref={mapRef}
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          projection={{ type: 'globe' }}
          styles={{
            light: 'https://tiles.openfreemap.org/styles/liberty',
            dark: 'https://tiles.openfreemap.org/styles/liberty',
          }}
          interactive={false}
          className="h-full w-full"
        >
          <GlobeStyler />
          {officeLocations.map((office, index) => (
            <MapMarker key={office.id} longitude={office.lng} latitude={office.lat}>
              <MarkerContent>
                {/* Larger marker on mobile for better touch target */}
                <div className="size-6 flex items-center justify-center rounded-full border-2 border-white bg-blue-500 text-xs font-bold text-white shadow-lg sm:size-5">
                  {index + 1}
                </div>
              </MarkerContent>
              <MarkerTooltip>{office.name}</MarkerTooltip>
            </MapMarker>
          ))}
        </MapLibreMap>
      </div>
      {/* Location list: wrap on mobile, larger touch targets */}
      <ul className="flex flex-col gap-x-3 gap-y-1.5 text-xs text-on-dark sm:text-sm md:flex-row md:gap-x-4">
        {officeLocations.map((office, index) => (
          <li key={office.id} className="flex items-start gap-1.5">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-white-30 bg-white/10 text-[9px] font-bold text-white">
              {index + 1}
            </span>
            <span className="text-xs leading-snug sm:text-sm">{office.address}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
