import type { LucideIcon } from 'lucide-react'
import {
  AirVent,
  Apple,
  Armchair,
  Astroid,
  Bluetooth,
  Camera,
  Eye,
  Flame,
  Gauge,
  Key,
  Monitor,
  Navigation,
  Scan,
  Shield,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Speaker,
  TriangleAlert,
  Tv,
  Wifi,
} from 'lucide-react'

type FeatureEntry = { keywords: string[]; icon: LucideIcon; iconGrid?: true }

export const FEATURE_MAP: FeatureEntry[] = [
  { keywords: ['android auto'], icon: Astroid, iconGrid: true },
  { keywords: ['apple carplay', 'carplay'], icon: Apple, iconGrid: true },
  { keywords: ['bluetooth'], icon: Bluetooth },
  { keywords: ['navigation', 'sat nav', 'gps'], icon: Navigation, iconGrid: true },
  { keywords: ['air condition', 'climate control'], icon: AirVent },
  { keywords: ['sound system', 'audio', 'jbl', 'speaker', 'multimedia system'], icon: Speaker },
  { keywords: ['tv', 'television', 'full segment'], icon: Tv },
  { keywords: ['360', 'panoram', 'panoramic'], icon: Scan, iconGrid: true },
  {
    keywords: ['camera', 'monitor system', 'terrain monitor', 'trail camera'],
    icon: Camera,
    iconGrid: true,
  },
  { keywords: ['keyless', 'push start'], icon: Key },
  { keywords: ['cruise control', 'lane departure', 'lane keeping', 'lane assist'], icon: Gauge },
  { keywords: ['blind spot'], icon: Eye },
  {
    keywords: ['collision', 'brake alert', 'braking', 'hill descent', 'hill climb', 'hill assist'],
    icon: TriangleAlert,
  },
  { keywords: ['airbag', 'air bag'], icon: Shield },
  {
    keywords: ['touchscreen', 'infotainment', 'heads-up display', 'hud', 'display screen'],
    icon: Monitor,
    iconGrid: true,
  },
  { keywords: ['heated seat', 'seat heat', 'heated,', 'heated '], icon: Flame },
  {
    keywords: ['ventilated seat', 'seat ventil', 'iso-dynamic', 'performance seat'],
    icon: Snowflake,
  },
  { keywords: ['wireless charg'], icon: Smartphone },
  { keywords: ['wifi', 'wi-fi'], icon: Wifi },
  {
    keywords: ['traction control', 'stability control', 'abs', 'ebd', 'anti-lock'],
    icon: ShieldCheck,
  },
  { keywords: ['rear cross traffic', 'cross traffic'], icon: TriangleAlert },
  { keywords: ['hill descent', 'hill climb', 'hill assist'], icon: TriangleAlert },
  { keywords: ['cctv', 'back camera', 'rear camera'], icon: Camera },
  { keywords: ['seat', 'seating'], icon: Armchair },
]

export function matchFeature(item: string): LucideIcon | null {
  const lower = item.toLowerCase()
  return FEATURE_MAP.find(e => e.keywords.some(k => lower.includes(k)))?.icon ?? null
}

export function scanFeaturesFromText(
  text: string
): { item: string; icon: LucideIcon; iconGrid: boolean }[] {
  const lower = text.toLowerCase()
  const seen = new Set<LucideIcon>()
  const results: { item: string; icon: LucideIcon; iconGrid: boolean }[] = []
  for (const entry of FEATURE_MAP) {
    const matched = entry.keywords.find(k => lower.includes(k))
    if (matched && !seen.has(entry.icon)) {
      seen.add(entry.icon)
      results.push({
        item: matched.replace(/\b\w/g, c => c.toUpperCase()),
        icon: entry.icon,
        iconGrid: entry.iconGrid ?? false,
      })
    }
  }
  return results
}
