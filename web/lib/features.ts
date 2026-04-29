import {
  mdiAirbag,
  mdiAirConditioner,
  mdiAndroid,
  mdiApple,
  mdiBluetooth,
  mdiCamera,
  mdiCameraControl,
  mdiCar,
  mdiCarBrakeAlert,
  mdiCarCruiseControl,
  mdiCarSeatCooler,
  mdiCarTireAlert,
  mdiCarWireless,
  mdiEye,
  mdiHeatWave,
  mdiKey,
  mdiMonitor,
  mdiNavigation,
  mdiPanorama,
  mdiSeat,
  mdiShieldCheck,
  mdiSpeaker,
  mdiTelevision,
  mdiWifi,
} from '@mdi/js'

type FeatureEntry = { keywords: string[]; icon: string; iconGrid?: true }

export const FEATURE_MAP: FeatureEntry[] = [
  { keywords: ['android auto'], icon: mdiAndroid, iconGrid: true },
  { keywords: ['apple carplay', 'carplay'], icon: mdiApple, iconGrid: true },
  { keywords: ['bluetooth'], icon: mdiBluetooth },
  { keywords: ['navigation', 'sat nav', 'gps'], icon: mdiNavigation, iconGrid: true },
  { keywords: ['air condition', 'climate control'], icon: mdiAirConditioner },
  { keywords: ['sound system', 'audio', 'jbl', 'speaker', 'multimedia system'], icon: mdiSpeaker },
  { keywords: ['tv', 'television', 'full segment'], icon: mdiTelevision },
  { keywords: ['360', 'panoram', 'panoramic'], icon: mdiPanorama },
  {
    keywords: ['camera', 'monitor system', 'terrain monitor', 'trail camera'],
    icon: mdiCamera,
    iconGrid: true,
  },
  { keywords: ['keyless', 'push start'], icon: mdiKey },
  { keywords: ['cruise control'], icon: mdiCarCruiseControl },
  { keywords: ['blind spot'], icon: mdiEye },
  { keywords: ['collision', 'brake alert', 'braking'], icon: mdiCarBrakeAlert },
  { keywords: ['airbag', 'air bag'], icon: mdiAirbag },
  {
    keywords: ['touchscreen', 'infotainment', 'heads-up display', 'hud', 'display screen'],
    icon: mdiMonitor,
    iconGrid: true,
  },
  { keywords: ['heated seat', 'seat heat', 'heated,', 'heated '], icon: mdiHeatWave },
  {
    keywords: ['ventilated seat', 'seat ventil', 'iso-dynamic', 'performance seat'],
    icon: mdiCarSeatCooler,
  },
  { keywords: ['wireless charg'], icon: mdiCarWireless },
  { keywords: ['wifi', 'wi-fi'], icon: mdiWifi },
  { keywords: ['lane departure', 'lane keeping', 'lane assist'], icon: mdiCarCruiseControl },
  { keywords: ['rear cross traffic', 'cross traffic'], icon: mdiCar },
  { keywords: ['hill descent', 'hill climb', 'hill assist'], icon: mdiCarTireAlert },
  { keywords: ['traction control', 'stability control'], icon: mdiShieldCheck },
  { keywords: ['abs', 'ebd', 'anti-lock'], icon: mdiShieldCheck },
  { keywords: ['cctv', 'back camera', 'rear camera'], icon: mdiCameraControl },
  { keywords: ['seat', 'seating'], icon: mdiSeat },
]

export function matchFeature(item: string): string | null {
  const lower = item.toLowerCase()
  return FEATURE_MAP.find(e => e.keywords.some(k => lower.includes(k)))?.icon ?? null
}

// Scans free-form text for known feature keywords. Returns one entry per
// matched feature type (deduplicated by icon). No specific format required —
// works on raw descriptions, not just pre-split equipment lists.
export function scanFeaturesFromText(
  text: string
): { item: string; icon: string; iconGrid: boolean }[] {
  const lower = text.toLowerCase()
  const seen = new Set<string>()
  const results: { item: string; icon: string; iconGrid: boolean }[] = []
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
