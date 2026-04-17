import Image from "next/image"

interface EditorialHeroProps {
  title: string
  image: { url: string; altText: string | null } | null
  description: string | null
  vehicleCount: number
}

function EditorialHero({
  title,
  image,
  description,
  vehicleCount,
}: EditorialHeroProps) {
  const tagline = description ?? `Curated vehicles from the ${title} collection.`

  return (
    <section
      className="relative bg-surface-dark overflow-hidden"
      style={{ minHeight: "420px" }}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ minHeight: "420px" }}
      >
        {/* Left panel: atmospheric image */}
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

          {/* Bottom-up gradient scrim */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)",
            }}
          />

          {/* Floating title overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-12">
            <h1 className="font-display text-banner font-normal uppercase tracking-widest text-text-on-dark leading-none">
              {title}
            </h1>

            {/* Brand divider bars */}
            <div className="flex items-center gap-2 mt-4">
              <div className="h-0.5 w-8 bg-brand-green" />
              <div className="h-0.5 w-6 border border-white/30" />
              <div className="h-0.5 w-4 bg-brand-red" />
            </div>
          </div>
        </div>

        {/* Right panel: editorial text */}
        <div className="relative bg-surface-dark p-8 md:p-12 flex flex-col justify-center">
          {/* Green top-left accent */}
          <div className="absolute top-8 left-8 md:left-12 h-0.5 w-6 bg-brand-green" />

          <span className="font-heading text-11 uppercase tracking-widest text-text-on-dark-muted">
            About This Collection
          </span>

          <h2 className="font-display text-2xl font-normal text-text-on-dark leading-snug mt-4">
            {tagline}
          </h2>

          {description && (
            <p className="font-body text-15 text-text-on-dark-muted leading-relaxed mt-4">
              {description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-6">
            <div className="h-px w-6 bg-brand-green" />
            <span className="font-heading text-11 uppercase tracking-widest text-brand-green">
              {vehicleCount} vehicle{vehicleCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export { EditorialHero }
