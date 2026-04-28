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

type FeatureEntry = { keywords: string[]; icon: string }

const FEATURE_MAP: FeatureEntry[] = [
  { keywords: ['android auto'], icon: mdiAndroid },
  { keywords: ['apple carplay', 'carplay'], icon: mdiApple },
  { keywords: ['bluetooth'], icon: mdiBluetooth },
  { keywords: ['navigation', 'sat nav', 'gps'], icon: mdiNavigation },
  { keywords: ['air condition', 'climate control'], icon: mdiAirConditioner },
  { keywords: ['sound system', 'audio', 'jbl', 'speaker', 'multimedia system'], icon: mdiSpeaker },
  { keywords: ['tv', 'television', 'full segment'], icon: mdiTelevision },
  { keywords: ['360', 'panoram', 'panoramic'], icon: mdiPanorama },
  { keywords: ['camera', 'monitor system', 'terrain monitor', 'trail camera'], icon: mdiCamera },
  { keywords: ['keyless', 'push start'], icon: mdiKey },
  { keywords: ['cruise control'], icon: mdiCarCruiseControl },
  { keywords: ['blind spot'], icon: mdiEye },
  { keywords: ['collision', 'brake alert', 'braking'], icon: mdiCarBrakeAlert },
  { keywords: ['airbag', 'air bag'], icon: mdiAirbag },
  {
    keywords: ['touchscreen', 'infotainment', 'heads-up display', 'hud', 'display screen'],
    icon: mdiMonitor,
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
