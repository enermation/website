'use client'

import { useState } from 'react'

export type DeviceTier = 'high' | 'mid' | 'low'

type NavigatorWithExtensions = Navigator & {
  deviceMemory?: number
  connection?: {
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
    saveData?: boolean
  }
}

function computeTier(): DeviceTier {
  if (typeof window === 'undefined') return 'high'

  const nav = navigator as NavigatorWithExtensions
  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory
  const effectiveType = nav.connection?.effectiveType ?? '4g'
  const saveData = nav.connection?.saveData ?? false

  if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') return 'low'
  if (cores <= 2 || (memory !== undefined && memory <= 2)) return 'low'
  if (cores <= 4 || (memory !== undefined && memory <= 4) || effectiveType === '3g') return 'mid'
  return 'high'
}

export function useDeviceTier(): DeviceTier {
  const [tier] = useState<DeviceTier>(computeTier)
  return tier
}
