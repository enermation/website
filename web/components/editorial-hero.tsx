import Image from 'next/image'

type EditorialHeroProps = {
  title: string
  image: { url: string; altText: string | null } | null
  description: string | null
  vehicleCount: number
}

export function EditorialHero({ title, image, description, vehicleCount }: EditorialHeroProps) {
  const tagline =
    description && description.trim().length > 0
      ? description
      : `Curated vehicles from the ${title} collection.`

  return (
    <section
      className="relative bg-surface-dark overflow-hidden"
      style={{ minHeight: '420px' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: '420px' }}>
        {/* Left: atmospheric image */}
        <div className="relative min-h-64 md:min-h-0">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? title}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-surface-dark" />
          )}
          {/* Gradient scrim bottom-up */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
            }}
          />
          {/* Floating title overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-12">
            <div className="mb-5 h-0.5 w-9 bg-brand-green" />
            <h1 className="font-display text-banner font-normal uppercase tracking-widest text-text-on-dark leading-none mb-4">
              {title}
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-9 bg-brand-green" />
              <div className="h-0.5 w-9 border border-white/30" />
              <div className="h-0.5 w-9 bg-brand-red" />
            </div>
          </div>
        </div>

        {/* Right: editorial text panel */}
        <div className="relative bg-surface-dark p-8 md:p-12 flex flex-col justify-center editorial-panel-in">
          {/* Top-left green accent rule */}
          <div className="absolute top-8 left-8 md:left-12 h-0.5 w-6 bg-brand-green" />

          <p className="font-heading text-11 uppercase tracking-widest text-text-on-dark-muted mb-4">
            About This Collection
          </p>

          <h2 className="font-display text-2xl font-normal text-text-on-dark leading-snug mb-5">
            {tagline}
          </h2>

          {description && (
            <p className="font-body text-15 text-text-on-dark-muted leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-6">
            <div className="h-px w-6 bg-brand-green" />
            <span className="font-heading text-11 uppercase tracking-widest text-brand-green">
              {vehicleCount} {vehicleCount === 1 ? 'Vehicle' : 'Vehicles'} Available
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
