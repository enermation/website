export type CarSpec = {
  year: string
  color: string
  mileage: string
  interior: string
}

export type Car = {
  id: string
  name: string
  image: string
  description: string
  price: string
  spec: CarSpec
}

export type NewsArticle = {
  image: string
  date: string
  category: string
  title: string
  excerpt: string
}

export type NavLink = {
  label: string
  href: string
  hasDropdown?: boolean
}

export type HeaderAction = {
  label: string
  href: string
}

export type HeaderNavFallbackItem = {
  label: 'Inventory' | 'About' | 'Contact'
  href: string
}

export type SubNavItem = {
  label: string
  href: string
  active?: boolean
}

export type FooterLink = {
  label: string
  href: string
}

export type FooterLinkGroup = {
  title: string
  links: FooterLink[]
}

export type FooterSocialPlatform = 'website' | 'whatsapp' | 'email' | 'quote'

export type FooterSocialLink = FooterLink & {
  platform: FooterSocialPlatform
}

export const primaryShowroomCollectionHandle = 'shop-all'
export const primaryShowroomCollectionHref =
  `/collections/${primaryShowroomCollectionHandle}` as const

export type HeroShowcaseVehicle = {
  label: string
  href: string
}

export const heroShowcaseVehicles: HeroShowcaseVehicle[] = [
  // { label: 'Porsche 911', href: primaryShowroomCollectionHref },
  // { label: 'Lamborghini Aventador', href: primaryShowroomCollectionHref },
  {
    label: 'Cars',
    href: primaryShowroomCollectionHref,
  },
  {
    label: 'Heavy Duty Trucks',
    href: primaryShowroomCollectionHref,
  },
  {
    label: 'Heavy Machinery',
    href: primaryShowroomCollectionHref,
  },
  {
    label: 'Commercial Vehicles',
    href: primaryShowroomCollectionHref,
  },
]

export const heroBrandWordmark = 'enermation' as const

// â”€â”€ Section images â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const heroImage = '/images/hero.webp'

// â"€â"€ Navigation â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Showroom', href: '#', hasDropdown: true },
  { label: 'Sell Your Car', href: '#', hasDropdown: true },
  { label: 'Services', href: '#', hasDropdown: true },
  { label: 'About', href: '#', hasDropdown: true },
  { label: 'Contact', href: '/contact' },
]

export const inventoryCollectionLinks: { label: string; href: string }[] = [
  { label: 'Used Cars', href: '/collections/residential-automobiles' },
  { label: 'Commercial Vehicles', href: '/collections/commercial-vehicles' },
  { label: 'Motorcycles', href: '/collections/motorcycles' },
  { label: 'Spare Parts', href: '/collections/spare-parts' },
]

export const headerNavFallbackItems: HeaderNavFallbackItem[] = [
  { label: 'Inventory', href: '/collections/shop-all' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

export const headerActions: { primary: HeaderAction; secondary: HeaderAction } = {
  primary: { label: 'Request Quote', href: '/#contact' },
  secondary: { label: 'Contact Sales', href: '/#contact' },
}

// â”€â”€ Header dropdown copy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const headerDropdownCopy = {
  featuredLabel: 'Featured category',
  browseLabel: 'Browse',
} as const

// â”€â”€ Cars page sub-navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€ Footer data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const footerAboutLinks: FooterLink[] = [
  { label: 'Our Story', href: '/about' },
  { label: 'Why Enermation FAQ', href: '/faq' },
  { label: 'Testimonials', href: '/testimonials' },
]

export const footerPrimaryLinks: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Showroom', href: primaryShowroomCollectionHref },
  { label: 'About', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

export const footerContactLinks: FooterLink[] = [{ label: 'How To Find Us', href: '/contact' }]

export const footerContactInfo = {
  location: 'Dubai, UAE',
  region: 'Global Export Network',
  phone: '+1 307 488 4085',
  email: 'info@enermation.us',
  whatsappHref: 'https://wa.me/13074884085',
  phoneHref: 'tel:+13074884085',
  emailHref: 'mailto:info@enermation.us',
}

export const footerLegalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

export const footerNavigationGroups: FooterLinkGroup[] = [
  {
    title: 'Explore',
    links: footerPrimaryLinks,
  },
  {
    title: 'Information',
    links: [...footerAboutLinks, ...footerContactLinks],
  },
]

export const footerSocialLinks: FooterSocialLink[] = [
  { label: 'Website', href: 'https://www.enermation.co/', platform: 'website' },
  { label: 'WhatsApp', href: footerContactInfo.whatsappHref, platform: 'whatsapp' },
  { label: 'Email', href: footerContactInfo.emailHref, platform: 'email' },
  { label: 'Quote', href: '/contact?topic=request-quote', platform: 'quote' },
]

export type FooterProofPoint = {
  label: string
  icon: 'globe' | 'shield' | 'badge' | 'support'
}

export const footerProofPoints: FooterProofPoint[] = [
  { label: 'Global Network', icon: 'globe' },
  { label: 'Trusted Partner', icon: 'shield' },
  { label: 'Quality Assured', icon: 'badge' },
  { label: 'Dedicated Support', icon: 'support' },
]

export const footerBrandSummary =
  'Global export solutions for cars, commercial vehicles, heavy-duty trucks, heavy machinery and auto parts.'

export const footerQuickLinks: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Cars', href: '/collections/residential-automobiles' },
  { label: 'Commercial Vehicles', href: '/collections/commercial-vehicles' },
  { label: 'Heavy Duty Trucks', href: '/collections/heavy-duty-trucks' },
  { label: 'Heavy Machinery', href: '/collections/heavy-machineries' },
  { label: 'Shop All', href: primaryShowroomCollectionHref },
  { label: 'Contact Us', href: '/contact' },
]

export const footerExportSolutions: FooterLink[] = [
  { label: 'Vehicle Export', href: '/collections/shop-all' },
  { label: 'Heavy Machinery Export', href: '/collections/heavy-machineries' },
  { label: 'Auto Parts Sourcing', href: '/search?q=auto%20parts' },
  { label: 'Shipping Assistance', href: '/contact?topic=shipping-assistance' },
  { label: 'Inspection Support', href: '/contact?topic=inspection-support' },
  { label: 'Custom Order Requests', href: '/contact?topic=custom-order' },
]

export const footerGlobalMarkets: string[] = [
  'Japan',
  'China',
  'UAE',
  'Korea',
  'Thailand',
  'United Kingdom',
  'United States',
]

export const footerQuoteCta = {
  title: 'Looking for a specific vehicle or machine?',
  label: 'Request a Quote',
  href: '/contact?topic=request-quote',
} as const

export const footerContent = {
  eyebrow: 'Stay Connected',
  description:
    'Join the Enermation mailing list for newly sourced inventory, notable arrivals, and specialist market updates.',
  inputPlaceholder: 'Enter your email',
  actionLabel: 'Roll Me In',
  companyLine:
    '© 2026 Enermation Lifestyle Ltd. T/A Enermation Supercars. Registered Company Number: 06937335',
  disclaimer:
    'Disclaimer: Great care is taken to ensure the specification displayed for each vehicle is correct, however due to how data is ported from third party sources from time to time errors may occur. Enermation take no responsibility or liability for such errors in the listings and we advise you check the full vehicle details independently before purchase.',
  creditPrefix: 'Site by',
  creditLabel: 'racecar',
} as const

// â”€â”€ Filter / sort options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const sortOptions = [
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Newest First', value: 'newest' },
]

// â”€â”€ Latest arrivals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const cars: Car[] = [
  {
    id: 'ferrari-812-superfast',
    name: 'Ferrari 812 Superfast',
    image: '/images/cars/ferrari-812-superfast.webp',
    description:
      'Registered March 2019/19 Specification Exterior Paintwork in Nero Daytona Interior in Nero Hide Adaptiveâ€¦',
    price: 'Â£239,995',
    spec: {
      year: '2019 / 19',
      color: 'Nero Daytona',
      mileage: '9,250 Miles',
      interior: 'Nero Hide',
    },
  },
  {
    id: 'ferrari-ff-v12-novitec',
    name: 'FERRARI FF V12 Novitec',
    image: '/images/cars/ferrari-ff-v12-novitec.webp',
    description:
      'Registered April 2012 Enermation are proud to present this highly specified Ferrari FF Novitec V12,â€¦',
    price: 'Â£109,995',
    spec: {
      year: '2012 / 12',
      color: 'Grigio Silverstone',
      mileage: '29,350 Miles',
      interior: 'Nero Hide',
    },
  },
  {
    id: 'ferrari-purosangue-esteso',
    name: 'Ferrari Purosangue Esteso by Novitec',
    image: '/images/cars/ferrari-purosangue-esteso.webp',
    description:
      'Enermation are proud to present this extraordinary Ferrari Purosangue Esteso by Novitec, an exceptionallyâ€¦',
    price: 'Reserved â€” More Wanted',
    spec: {
      year: '2025 / 2025',
      color: 'Nero Daytona Metallic',
      mileage: '80 Miles',
      interior: 'Tortora Leather',
    },
  },
  {
    id: 'ferrari-sf90-stradale',
    name: 'Ferrari SF90 Stradale',
    image: '/images/cars/ferrari-sf90-stradale.webp',
    description:
      'Enermation are proud to present this exceptional Ferrari SF90 Stradale, finished in the sophisticatedâ€¦',
    price: 'Â£285,995',
    spec: {
      year: '2020 / 20',
      color: 'Grigio Alloy',
      mileage: '3,070 Miles',
      interior: 'Carta da Zucchero',
    },
  },
  {
    id: 'ferrari-812-gts',
    name: 'Ferrari 812 GTS',
    image: '/images/cars/ferrari-812-gts.webp',
    description:
      'The Ferrari 812 GTS is a convertible supercar powered by a naturally aspirated 6.5-litre V12 engine deliveringâ€¦',
    price: 'Â£314,995',
    spec: {
      year: '2020 / 70',
      color: 'Grigio Silverstone',
      mileage: '11,500 Miles',
      interior: 'Charcoal Alcantara',
    },
  },
  {
    id: 'lamborghini-aventador-ultimae',
    name: 'Lamborghini Aventador LP 780-4 Ultimae',
    image: '/images/cars/lamborghini-aventador-ultimae.webp',
    description:
      'Enermation are proud to present this outstanding Lamborghini Aventador LP 780-4 Ultimae, finished inâ€¦',
    price: 'Reserved â€” More Wanted',
    spec: {
      year: '2022 / 22',
      color: 'Verde Selvans',
      mileage: '4,000 Miles',
      interior: 'Black Alcantara',
    },
  },
]

// â”€â”€ Latest company news â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const newsArticle: NewsArticle = {
  image: '/images/news/news-article-1.webp',
  date: '06 March 2024',
  category: 'Latest News',
  title: "Enermation's Top 5 Supercar Picks to Grace Your Driveway in 2024",
  excerpt: "Enermation's Definitive Guide to the Ultimate Driving Experience in 2024",
}

// â”€â”€ Related stories (product page) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type RelatedStory = {
  id: string
  image: string
  date: string
  category: string
  title: string
  excerpt: string
  href: string
}

export const relatedStories: RelatedStory[] = [
  {
    id: '1',
    image: '/images/news/news-article-1.webp',
    date: '06 March 2024',
    category: 'Latest News',
    title: "Enermation's Top 5 Supercar Picks to Grace Your Driveway in 2024",
    excerpt: "A quick look at the performance machines defining this year's collector market.",
    href: '#',
  },
  {
    id: '2',
    image: '/images/instagram/1.webp',
    date: '15 January 2024',
    category: 'Cars',
    title: 'Why the Ferrari SF90 Stradale Remains the Ultimate Hybrid Supercar',
    excerpt: 'Engineering, hybrid response, and long-term desirability keep the SF90 at the top.',
    href: '#',
  },
  {
    id: '3',
    image: '/images/instagram/2.webp',
    date: '22 November 2023',
    category: 'News',
    title: 'Lamborghini Aventador Ultimae: The Last of a Legendary V12 Era',
    excerpt: 'How the final naturally aspirated V12 flagship secured its place among modern icons.',
    href: '#',
  },
]

// Collection stories (editorial feed) ────────────────────────────────────────────────────────────────

export const collectionStories: RelatedStory[] = [
  {
    id: 'cs-1',
    image: '/images/news/news-article-1.webp',
    date: '15 January 2026',
    category: 'Buyer Guide',
    title: 'The Complete Guide to Financing Your First Supercar',
    excerpt: 'Understanding PCP, HP, and lease options for high-value vehicle acquisitions.',
    href: '#',
  },
  {
    id: 'cs-2',
    image: '/images/news/news-article-2.webp',
    date: '02 February 2026',
    category: 'Market Insight',
    title: 'Why the UK Supercar Market Remains Resilient in 2026',
    excerpt: 'A look at collector demand and what it means for buyers and sellers alike.',
    href: '#',
  },
  {
    id: 'cs-3',
    image: '/images/news/news-article-3.webp',
    date: '20 March 2026',
    category: 'Lifestyle',
    title: 'The Most Coveted Road Trips for Enthusiasts This Summer',
    excerpt:
      'From the Scottish Highlands to the French Riviera — routes that define the driving experience.',
    href: '#',
  },
]

// â”€â”€ Dealer info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type OfficeLocation = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
}

export const officeLocations: OfficeLocation[] = [
  {
    id: 'usa',
    name: 'USA',
    address: '30 N Gould St, Sheridan, WY 82801, USA',
    lat: 44.7977595,
    lng: -106.9549842,
  },
  {
    id: 'dubai',
    name: 'UAE',
    address: 'FDAU0291 Compass Building, Al Hamra Industrial Zone, RAK, United Arab Emirates',
    lat: 25.7103915,
    lng: 55.8267258,
  },
  {
    id: 'uk',
    name: 'UK',
    address: '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ',
    lat: 51.5147928,
    lng: -0.1235399,
  },
]

export const dealerInfo = {
  name: 'Enermation Supercars',
  address: 'Preston, Lancashire, UK',
  memberSinceLabel: `Member since ${new Date().getFullYear()}`,
  listingAgentValue: 'License #LU977TT',
  registeredYear: '2026',
}

// â”€â”€ Product page copy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const productPage = {
  breadcrumb: {
    home: 'Home',
    showroom: 'Showroom',
  },
  sections: {
    aboutThisListing: 'About This Car',
    keyInformation: 'Key Information',
    statsAndPerformance: 'Stats & Performance',
    vehicleFeatures: 'Vehicle Features',
    moreFeatures: 'More Features',
    askAQuestion: 'Ask a Question',
    contactAgent: 'Contact Agent',
    forSaleBy: 'For Sale by',
    youMayAlsoLike: 'You Might Also Like',
    relatedStories: 'Related Stories',
  },
  labels: {
    brand: 'Brand',
    status: 'Status',
    price: 'Price',
    address: 'Address',
    phoneNumber: 'Phone number',
    email: 'Email',
    specialistExportBroker: 'Specialist vehicle export broker',
    specialistDealer: 'Specialist dealer',
    callAgent: 'Call Agent',
    viewAllStock: 'View all stock',
    viewAllStockForSale: 'View all stock for sale',
    available: 'Available',
    sold: 'Sold',
    soldOrReserved: 'Sold / Reserved',
    reserved: 'Reserved',
    reservedMoreWanted: 'Reserved — More Wanted',
    notSpecified: 'Not specified',
    vatType: 'VAT Type',
    noDutyPaid: 'No Duty Paid',
    year: 'Year',
    mileage: 'Mileage',
    location: 'Location',
    website: 'Website',
    engine: 'Engine',
    gearbox: 'Gearbox',
    carType: 'Car type',
    driveTrain: 'Drive train',
    fuelType: 'Fuel type',
    power: 'Power',
    condition: 'Condition',
    vin: 'VIN',
    color: 'Color',
    interiorColor: 'Interior color',
    internalReference: 'Internal Reference',
    licenseNumber: 'License number',
    aboutDealer: 'About',
    viewMore: 'View more',
    listingAgent: 'Listing agent',
    registeredOnPlatform: 'Registered on Enermation',
    showPhoneNumber: 'Show phone number',
    listed: 'Listed',
    reportListing: 'Report Listing',
    reportListingSubjectPrefix: 'Report listing:',
    askSellerPlaceholder: 'Ask the seller for more information about this car...',
    askQuestionCta: 'Ask a question',
    sendMessage: 'Send message',
    yourMessage: 'Your message',
    yourName: 'Your name',
    yourEmail: 'Your email address',
    enquiryMessagePrefix: 'Please contact me regarding',
    phoneOptional: 'Phone number (optional)',
    countryCode: '+44',
    notifySimilar: 'Notify me via email when similar listings appear',
    agreePrefix: 'I agree to',
    agreeMiddle: 'and',
    agreeSuffix: 'including sharing my activity and interests with the seller',
    termsOfUse: 'Terms of Use',
    privacyPolicy: 'Privacy Policy',
    tapToExpand: 'Tap to expand',
    clickToExpand: 'Click to expand',
    save: 'Save',
    share: 'Share',
    copyLinkPrompt: 'Copy this link',
    lightboxHelp: 'Arrow keys navigate | Esc close',
    photos: 'Photos',
    listingForSaleSingular: 'listing for sale',
    listingsForSalePlural: 'listings for sale',
  },
  links: {
    termsOfUse: '#',
    privacyPolicy: '#',
  },
} as const

export const cart = {
  emptyTitle: 'Your cart is empty',
  emptyDescription: "Looks like you haven't added anything yet.",
  title: 'Shopping Cart',
  quantityLabel: 'Qty',
  noImage: 'No image',
  subtotalLabel: 'Subtotal',
  checkoutButton: 'Proceed to Checkout',
} as const

// ── Search ────────────────────────────────────────────────────────────────────

export const searchCopy = {
  label: 'Search products',
  placeholder: 'Search cars, parts, accessories…',
  clearLabel: 'Clear search',
  closeLabel: 'Close search',
  searchingLabel: 'Searching…',
  noResultsLabel: 'No results found. Try a different term.',
  seeAllLabel: 'See all results',
} as const
