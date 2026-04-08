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
}

// ── Section images ──────────────────────────────────────────────────────────

export const heroImage =
  "https://www.figma.com/api/mcp/asset/69543879-8d40-44dd-a43a-e23acc9ee728"

export const supplyingImage =
  "https://www.figma.com/api/mcp/asset/d30c99b7-d832-41f9-8bfa-48f77ef5f398"

export const carsForSaleImage =
  "https://www.figma.com/api/mcp/asset/c1ddef72-b46f-4167-83b7-dfc000d0fff5"

export const sellYourCarImage =
  "https://www.figma.com/api/mcp/asset/e9c949d8-d2fb-40e1-842b-0c8220145bce"

// ── Navigation ───────────────────────────────────────────────────────────────

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Supercars", href: "#" },
  { label: "Sell Your Car", href: "#" },
  { label: "Services", href: "#" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
]

// ── Latest arrivals ──────────────────────────────────────────────────────────

export const cars: Car[] = [
  {
    id: "ferrari-812-superfast",
    name: "Ferrari 812 Superfast",
    image: "https://www.figma.com/api/mcp/asset/792587eb-d611-4ca7-a08b-0cd6196eda28",
    description:
      "Registered March 2019/19 Specification Exterior Paintwork in Nero Daytona Interior in Nero Hide Adaptive…",
    price: "£239,995",
    spec: {
      year: "2019 / 19",
      color: "Nero Daytona",
      mileage: "9,250 Miles",
      interior: "Nero Hide",
    },
  },
  {
    id: "ferrari-ff-v12-novitec",
    name: "FERRARI FF V12 Novitec",
    image: "https://www.figma.com/api/mcp/asset/e37e51ac-e0ef-495b-ace7-8d4e00bfc008",
    description:
      "Registered April 2012 Amari Supercars are proud to present this highly specified Ferrari FF Novitec V12,…",
    price: "£109,995",
    spec: {
      year: "2012 / 12",
      color: "Grigio Silverstone",
      mileage: "29,350 Miles",
      interior: "Nero Hide",
    },
  },
  {
    id: "ferrari-purosangue-esteso",
    name: "Ferrari Purosangue Esteso by Novitec",
    image: "https://www.figma.com/api/mcp/asset/d001d36f-edd8-4733-b35d-da3a7f6037f8",
    description:
      "Amari Supercars are proud to present this extraordinary Ferrari Purosangue Esteso by Novitec, an exceptionally…",
    price: "Reserved — More Wanted",
    spec: {
      year: "2025 / 2025",
      color: "Nero Daytona Metallic",
      mileage: "80 Miles",
      interior: "Tortora Leather",
    },
  },
  {
    id: "ferrari-sf90-stradale",
    name: "Ferrari SF90 Stradale",
    image: "https://www.figma.com/api/mcp/asset/9734ddde-7f13-46a5-8239-42b54520aca2",
    description:
      "Amari Supercars are proud to present this exceptional Ferrari SF90 Stradale, finished in the sophisticated…",
    price: "£285,995",
    spec: {
      year: "2020 / 20",
      color: "Grigio Alloy",
      mileage: "3,070 Miles",
      interior: "Carta da Zucchero",
    },
  },
  {
    id: "ferrari-812-gts",
    name: "Ferrari 812 GTS",
    image: "https://www.figma.com/api/mcp/asset/84ce206c-eb40-49b3-9fa4-8a8f77c9364b",
    description:
      "The Ferrari 812 GTS is a convertible supercar powered by a naturally aspirated 6.5-litre V12 engine delivering…",
    price: "£314,995",
    spec: {
      year: "2020 / 70",
      color: "Grigio Silverstone",
      mileage: "11,500 Miles",
      interior: "Charcoal Alcantara",
    },
  },
  {
    id: "lamborghini-aventador-ultimae",
    name: "Lamborghini Aventador LP 780-4 Ultimae",
    image: "https://www.figma.com/api/mcp/asset/358b0f11-a047-4cf6-9426-837e8de8f999",
    description:
      "Amari Supercars are proud to present this outstanding Lamborghini Aventador LP 780-4 Ultimae, finished in…",
    price: "Reserved — More Wanted",
    spec: {
      year: "2022 / 22",
      color: "Verde Selvans",
      mileage: "4,000 Miles",
      interior: "Black Alcantara",
    },
  },
]

// ── Instagram feed ───────────────────────────────────────────────────────────

export const instagramPosts: InstagramPost[] = [
  { id: "1",  image: "https://www.figma.com/api/mcp/asset/e68c70fa-4341-476f-a6f2-59f911ed718b" },
  { id: "2",  image: "https://www.figma.com/api/mcp/asset/5a5d4229-cf0c-4ed0-b6f7-ee2d10307a5f" },
  { id: "3",  image: "https://www.figma.com/api/mcp/asset/87fcf29b-9d3d-4c41-a3fd-cdcf6311593c" },
  { id: "4",  image: "https://www.figma.com/api/mcp/asset/1e88840b-dc6c-46cc-a381-9cf0949b86a4" },
  { id: "5",  image: "https://www.figma.com/api/mcp/asset/47739410-f016-477a-8114-e3f5b6676295" },
  { id: "6",  image: "https://www.figma.com/api/mcp/asset/564ef424-a34a-4bd3-a4d8-bf70f62d0bfc" },
  { id: "7",  image: "https://www.figma.com/api/mcp/asset/f8756399-1bea-4736-859d-431476c932c7" },
  { id: "8",  image: "https://www.figma.com/api/mcp/asset/e9fb2aa7-0458-4563-9fb0-db9ca70bea6f" },
  { id: "9",  image: "https://www.figma.com/api/mcp/asset/b99ea531-6f8d-4136-931e-4d00cacf9df4" },
  { id: "10", image: "https://www.figma.com/api/mcp/asset/90430e5e-10ff-4b03-9ba6-b988366d4433" },
  { id: "11", image: "https://www.figma.com/api/mcp/asset/211c9dd8-ab59-4918-835c-27d5e4ec606d" },
  { id: "12", image: "https://www.figma.com/api/mcp/asset/a90bf4a9-3f41-4dda-b18c-e58a62821b41" },
  { id: "13", image: "https://www.figma.com/api/mcp/asset/0bbfb680-e534-4e6a-b169-e30ac43cf2be" },
  { id: "14", image: "https://www.figma.com/api/mcp/asset/657a5a11-8798-49d7-b99f-90554a3f4245" },
  { id: "15", image: "https://www.figma.com/api/mcp/asset/89dc3008-b641-4578-8b63-31176ac40c05" },
  { id: "16", image: "https://www.figma.com/api/mcp/asset/69cdbf04-c0c0-49ee-90aa-ad8f90608169" },
  { id: "17", image: "https://www.figma.com/api/mcp/asset/d012068d-c7a6-4160-93e7-8a5327e3e8bd" },
  { id: "18", image: "https://www.figma.com/api/mcp/asset/5d16b79c-67f3-4159-b6b8-a5d314dd2a48" },
  { id: "19", image: "https://www.figma.com/api/mcp/asset/ab728640-0cc7-4205-bb9d-6f2e7c88e1e1" },
  { id: "20", image: "https://www.figma.com/api/mcp/asset/9e2b278e-18a5-42da-af0a-26906ef9ff52" },
]

// ── Latest company news ──────────────────────────────────────────────────────

export const newsArticle: NewsArticle = {
  image: "https://www.figma.com/api/mcp/asset/7952f809-824f-4cae-8a06-c76f0aed92da",
  date: "06 March 2024",
  category: "Latest News",
  title: "Amari's Top 5 Supercar Picks to Grace Your Driveway in 2024",
  excerpt:
    "Amari Supercars' Definitive Guide to the Ultimate Driving Experience in 2024",
}
