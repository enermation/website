import { HeroBackgroundVideo } from '@/components/hero-background-video'
import { HeroSequence } from '@/components/hero-sequence'

type Props = {
  initialIndex?: number
}

export function HeroCarousel({ initialIndex = 0 }: Props) {
  return (
    <section data-slot="hero-stage" className="hero-stage">
      <HeroBackgroundVideo />
      <HeroSequence initialIndex={initialIndex} />
    </section>
  )
}
