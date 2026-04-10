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

export type InstagramPost = {
  id: string
  image: string
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

export type FooterSocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'twitter' | 'youtube'

export type FooterSocialLink = FooterLink & {
  platform: FooterSocialPlatform
}

export const primaryShowroomCollectionHandle = 'shop-all'
export const primaryShowroomCollectionHref =
  `/collections/${primaryShowroomCollectionHandle}` as const

// ── Hero carousel categories ─────────────────────────────────────────────────

export type HeroCategory = {
  label: string
  href: string
}

export const heroCategories: HeroCategory[] = [
  { label: 'Sedan', href: '/collections/sedans' },
  { label: 'SUV', href: '/collections/suvs' },
  { label: 'Commercial', href: '/collections/commercial-vehicles' },
]

// ── Section images ──────────────────────────────────────────────────────────

export const heroImage = '/images/hero.jpg'

export const supplyingImage = '/images/supplying-energy.jpg'

export const carsForSaleImage = '/images/cars-for-sale.jpg'

export const sellYourCarImage = '/images/sell-your-car.jpg'

export type CardNavLink = {
  label: string
  href: string
}

export type CardNavItem = {
  label: string
  href: string
  links: CardNavLink[]
}

export const cardNavItems: CardNavItem[] = [
  {
    label: 'Showroom',
    href: '#',
    links: [
      { label: 'All Stock', href: primaryShowroomCollectionHref },
      { label: 'Latest Arrivals', href: '#' },
      { label: 'Reserved', href: '#' },
    ],
  },
  {
    label: 'Sell Your Car',
    href: '#',
    links: [
      { label: 'Get a Valuation', href: '#' },
      { label: 'How It Works', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
  {
    label: 'Services',
    href: '#',
    links: [
      { label: 'Vehicle Sourcing', href: '#' },
      { label: 'Finance', href: '#' },
      { label: 'Delivery', href: '#' },
    ],
  },
]

// ── Navigation ───────────────────────────────────────────────────────────────

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Showroom', href: '#', hasDropdown: true },
  { label: 'Sell Your Car', href: '#', hasDropdown: true },
  { label: 'Services', href: '#', hasDropdown: true },
  { label: 'About', href: '#', hasDropdown: true },
  { label: 'Contact', href: '#' },
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

// ── Header dropdown copy ─────────────────────────────────────────────────────

export const headerDropdownCopy = {
  featuredLabel: 'Featured category',
  browseLabel: 'Browse',
} as const

// ── Cars page sub-navigation ─────────────────────────────────────────────────

// ── Footer data ──────────────────────────────────────────────────────────────

export const footerAboutLinks: FooterLink[] = [
  { label: 'Our Story', href: '#' },
  { label: 'Why Enermation FAQ', href: '#' },
  { label: 'Testimonials', href: '#' },
]

export const footerPrimaryLinks: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Showroom', href: primaryShowroomCollectionHref },
  { label: 'Sell Your Car', href: '#' },
  { label: 'Services', href: '#' },
  { label: 'About', href: '#' },
  { label: 'Contact Us', href: '#' },
]

export const footerContactLinks: FooterLink[] = [{ label: 'How To Find Us', href: '#' }]

export const footerContactInfo = {
  location: 'Preston, Lancashire, UK',
  phone: '+44 (0)1772 663777',
  email: 'sales@enermation.com',
}

export const footerLegalLinks: FooterLink[] = [
  { label: 'Terms & Conditions', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Contact Us', href: '#' },
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
  { label: 'Instagram', href: '#', platform: 'instagram' },
  { label: 'Facebook', href: '#', platform: 'facebook' },
  { label: 'TikTok', href: '#', platform: 'tiktok' },
  { label: 'Twitter', href: '#', platform: 'twitter' },
  { label: 'YouTube', href: '#', platform: 'youtube' },
]

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

// ── Filter / sort options ────────────────────────────────────────────────────

export const sortOptions = [
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Newest First', value: 'newest' },
]

// ── Latest arrivals ──────────────────────────────────────────────────────────

export const cars: Car[] = [
  {
    id: 'ferrari-812-superfast',
    name: 'Ferrari 812 Superfast',
    image: '/images/cars/ferrari-812-superfast.jpg',
    description:
      'Registered March 2019/19 Specification Exterior Paintwork in Nero Daytona Interior in Nero Hide Adaptive…',
    price: '£239,995',
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
    image: '/images/cars/ferrari-ff-v12-novitec.jpg',
    description:
      'Registered April 2012 Enermation are proud to present this highly specified Ferrari FF Novitec V12,…',
    price: '£109,995',
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
    image: '/images/cars/ferrari-purosangue-esteso.jpg',
    description:
      'Enermation are proud to present this extraordinary Ferrari Purosangue Esteso by Novitec, an exceptionally…',
    price: 'Reserved — More Wanted',
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
    image: '/images/cars/ferrari-sf90-stradale.jpg',
    description:
      'Enermation are proud to present this exceptional Ferrari SF90 Stradale, finished in the sophisticated…',
    price: '£285,995',
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
    image: '/images/cars/ferrari-812-gts.jpg',
    description:
      'The Ferrari 812 GTS is a convertible supercar powered by a naturally aspirated 6.5-litre V12 engine delivering…',
    price: '£314,995',
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
    image: '/images/cars/lamborghini-aventador-ultimae.jpg',
    description:
      'Enermation are proud to present this outstanding Lamborghini Aventador LP 780-4 Ultimae, finished in…',
    price: 'Reserved — More Wanted',
    spec: {
      year: '2022 / 22',
      color: 'Verde Selvans',
      mileage: '4,000 Miles',
      interior: 'Black Alcantara',
    },
  },
]

// ── Instagram feed ───────────────────────────────────────────────────────────

export const instagramPosts: InstagramPost[] = [
  { id: '1', image: '/images/instagram/1.jpg' },
  { id: '2', image: '/images/instagram/2.jpg' },
  { id: '3', image: '/images/instagram/3.jpg' },
  { id: '4', image: '/images/instagram/4.jpg' },
  { id: '5', image: '/images/instagram/5.jpg' },
  { id: '6', image: '/images/instagram/6.jpg' },
  { id: '7', image: '/images/instagram/7.jpg' },
  { id: '8', image: '/images/instagram/8.jpg' },
  { id: '9', image: '/images/instagram/9.jpg' },
  { id: '10', image: '/images/instagram/10.jpg' },
  { id: '11', image: '/images/instagram/11.jpg' },
  { id: '12', image: '/images/instagram/12.jpg' },
  { id: '13', image: '/images/instagram/13.jpg' },
  { id: '14', image: '/images/instagram/14.jpg' },
  { id: '15', image: '/images/instagram/15.jpg' },
  { id: '16', image: '/images/instagram/16.jpg' },
  { id: '17', image: '/images/instagram/17.jpg' },
  { id: '18', image: '/images/instagram/18.jpg' },
  { id: '19', image: '/images/instagram/19.jpg' },
  { id: '20', image: '/images/instagram/20.jpg' },
]

// ── Latest company news ──────────────────────────────────────────────────────

export const newsArticle: NewsArticle = {
  image: '/images/news/news-article-1.jpg',
  date: '06 March 2024',
  category: 'Latest News',
  title: "Enermation's Top 5 Supercar Picks to Grace Your Driveway in 2024",
  excerpt: "Enermation' Definitive Guide to the Ultimate Driving Experience in 2024",
}

// ── Related stories (product page) ──────────────────────────────────────────

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
    image: '/images/news/news-article-1.jpg',
    date: '06 March 2024',
    category: 'Latest News',
    title: "Enermation's Top 5 Supercar Picks to Grace Your Driveway in 2024",
    excerpt: "A quick look at the performance machines defining this year's collector market.",
    href: '#',
  },
  {
    id: '2',
    image: '/images/instagram/1.jpg',
    date: '15 January 2024',
    category: 'Cars',
    title: 'Why the Ferrari SF90 Stradale Remains the Ultimate Hybrid Supercar',
    excerpt: 'Engineering, hybrid response, and long-term desirability keep the SF90 at the top.',
    href: '#',
  },
  {
    id: '3',
    image: '/images/instagram/2.jpg',
    date: '22 November 2023',
    category: 'News',
    title: 'Lamborghini Aventador Ultimae: The Last of a Legendary V12 Era',
    excerpt: 'How the final naturally aspirated V12 flagship secured its place among modern icons.',
    href: '#',
  },
]

// ── Dealer info ───────────────────────────────────────────────────────────────

export const dealerInfo = {
  name: 'Enermation Supercars',
  address: 'Preston, Lancashire, UK',
  memberSinceLabel: 'Joined 3 months ago',
  listingAgentValue: 'License #LU977TT',
  registeredYear: '2026',
  about:
    "Based in Preston in Lancashire, close to Junction 31A of the M6 Motorway, Enermation are internationally renowned for offering a unique selection of some of the world's finest automobiles. With literally hundreds of beautiful cars supplied to a diverse customer base, Enermation is the premier supercar dealer in the UK.",
}

// ── Product page copy ─────────────────────────────────────────────────────────

export const productPage = {
  breadcrumb: {
    home: 'Home',
    showroom: 'Showroom',
  },
  sections: {
    aboutThisListing: 'About This Car',
    listingDetails: 'Car Details',
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
    callUs: 'Call Us',
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
