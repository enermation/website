export type NarrativeSection = {
  heading: string
  paragraphs: string[]
  image: {
    url: string
    altText: string
  }
  reverse?: boolean
}

export type AboutPageData = {
  hero: {
    title: string
    description: string
  }
  sections: NarrativeSection[]
  cta: {
    label: string
    href: string
  }
}

export const aboutData: AboutPageData = {
  hero: {
    title: 'About Enermation',
    description:
      "Internationally renowned for offering a unique selection of the world's finest automobiles.",
  },
  sections: [
    {
      heading: 'Our Vision',
      paragraphs: [
        'Enermation was born out of a passion for excellence and a deep-seated appreciation for automotive engineering at its most refined. We specialize in sourcing and supplying only the most exceptional supercars to a global clientele of discerning collectors and enthusiasts.',
        'Our mission is to bridge the gap between world-class automotive artistry and those who seek it, ensuring that every vehicle we represent meets our exacting standards for quality, provenance, and performance.',
      ],
      image: {
        url: '/images/hero.webp',
        altText: 'Enermation Showroom',
      },
    },
    {
      heading: 'Global Expertise',
      paragraphs: [
        'With years of experience in the international supercar market, our team possesses an unparalleled understanding of market trends, vehicle valuation, and the logistical complexities of global automotive distribution.',
        'From our primary showroom in the UK, we serve clients across every continent, providing a bespoke service that manages every aspect of the acquisition process, from inspection and verification to international shipping and delivery.',
      ],
      image: {
        url: '/images/supplying-energy.webp',
        altText: 'Global Automotive Logistics',
      },
      reverse: true,
    },
    {
      heading: 'The Finest Selection',
      paragraphs: [
        "We take pride in our curated inventory, which features limited edition models, rare heritage pieces, and the latest innovations from the world's most prestigious manufacturers.",
        'Whether you are looking for a track-focused powerhouse or a refined continental tourer, our selection is designed to cater to the most specific of tastes, with every car selected for its unique story and exceptional condition.',
      ],
      image: {
        url: '/images/cars-for-sale.webp',
        altText: 'Supercar Collection',
      },
    },
  ],
  cta: {
    label: 'View Current Inventory',
    href: '/collections/all-stock',
  },
}
