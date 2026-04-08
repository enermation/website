import Image from "next/image";
import Link from "next/link";
import { Calendar, Mail } from "lucide-react";
import client from "@/lib/shopify";
import { GET_ALL_PRODUCTS } from "@/lib/queries";
import type { ShopifyProduct } from "@/lib/types";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/social-icons";
import { cn } from "@/lib/utils";
import {
  instagramPosts,
  newsArticle,
  navLinks,
  heroImage,
  supplyingImage,
  carsForSaleImage,
  sellYourCarImage,
} from "@/lib/data";

// ── Shared primitives ────────────────────────────────────────────────────────

function StripeBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center">
      <div className="h-1 w-10 bg-brand-green" />
      <div
        className={cn(
          "h-1 w-10",
          dark ? "bg-white" : "bg-white border border-gray-87"
        )}
      />
      <div className="h-1 w-10 bg-brand-red" />
    </div>
  );
}

function SectionHeading({
  title,
  dark = false,
}: {
  title: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <h2
        className={cn(
          "font-inter font-normal text-section uppercase tracking-widest text-center",
          dark ? "text-gray-93" : "text-gray-7"
        )}
      >
        {title}
      </h2>
      <StripeBar dark={dark} />
    </div>
  );
}

// ── Car card ─────────────────────────────────────────────────────────────────

function CarCard({ product }: { product: ShopifyProduct }) {
  const image = product.images.edges[0]?.node;
  const { amount, currencyCode } = product.priceRange.minVariantPrice;
  const price = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));

  return (
    <Link href={`/products/${product.handle}`} className="flex flex-col group">
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-94">
        {image && (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw"
          />
        )}
      </div>

      {/* Title */}
      <h3 className="font-inter font-normal text-xl text-gray-7 mt-3 px-1 leading-snug">
        {product.title}
      </h3>

      {/* Description + price */}
      <div className="flex flex-col flex-1 px-1 mt-3 pb-4 border-b border-gray-87">
        <p className="font-roboto text-15 text-gray-33 leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>
        <p className="font-montserrat font-semibold text-lg text-black mt-2">
          {product.availableForSale ? price : "Reserved — More Wanted"}
        </p>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Home() {
  const { data } = await client.request<{
    products: { edges: { node: ShopifyProduct }[] }
  }>(GET_ALL_PRODUCTS);
  const products = data?.products.edges.map((e) => e.node).slice(0, 6) ?? [];

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-gray-7 overflow-hidden">
        <Image
          src={heroImage}
          alt=""
          fill
          className="object-cover"
          priority
          aria-hidden="true"
        />

        {/* Navigation */}
        <nav className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-16 py-6">
          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              { label: "Facebook",  Icon: FacebookIcon  },
              { label: "Instagram", Icon: InstagramIcon },
              { label: "Twitter",   Icon: TwitterIcon   },
              { label: "YouTube",   Icon: YoutubeIcon   },
            ].map(({ label, Icon }) => (
              <Link
                key={label}
                href="#"
                aria-label={label}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </div>

          {/* Logo */}
          <Link
            href="/"
            className="font-inter font-light text-2xl uppercase tracking-widest text-white"
          >
            AMARI™
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="font-montserrat text-13 text-white/80 uppercase tracking-wider hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
            <Link
              href="#"
              className="font-montserrat text-13 font-semibold text-white border border-white/60 px-4 py-2 uppercase tracking-wider whitespace-nowrap hover:bg-white hover:text-gray-7 transition-colors"
            >
              Get Valuation
            </Link>
          </div>
        </nav>
      </section>

      {/* ── LATEST ARRIVALS ───────────────────────────────────────────────── */}
      <section className="bg-white">
        <SectionHeading title="Latest Arrivals for Sale" />
        <div className="max-w-site mx-auto px-6 pb-16">
          <div className="grid grid-cols-3 gap-8">
            {products.map((product) => (
              <CarCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link
              href="#"
              className="font-montserrat font-semibold text-13 uppercase tracking-wider border-2 border-black text-black px-8 py-3 hover:bg-black hover:text-white transition-colors"
            >
              View all stock for sale
            </Link>
          </div>
        </div>
      </section>

      {/* ── SUPPLYING THE FINEST SUPERCARS ────────────────────────────────── */}
      <section className="relative bg-gray-7 overflow-hidden py-32 px-20">
        <Image
          src={supplyingImage}
          alt=""
          fill
          className="object-cover opacity-50"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-site mx-auto flex justify-end">
          <div className="w-1/2 text-right">
            <h2 className="font-inter font-normal text-banner uppercase tracking-widest text-white leading-tight mb-8">
              Supplying the
              <br />
              finest Supercars
            </h2>
            <p className="font-roboto text-15 text-white leading-relaxed mb-8">
              Based in Preston in Lancashire, close to Junction 31A of the M6
              Motorway, AMARI™ stock a wide range of contemporary and classic
              Super Cars and sports cars for sale from such marques as Aston
              Martin, Bentley, Bugatti, Ferrari, Lamborghini, Pagani, Porsche
              and a great many more. AMARI™ Supercars are internationally
              renowned for offering a unique selection of some of the
              world&apos;s finest automobiles. With literally hundreds of
              beautiful cars supplied to a diverse customer base, AMARI™ is the
              premier and Number 1 Supercar dealer in the UK.
            </p>
            <Link
              href="#"
              className="inline-block font-montserrat font-semibold text-13 uppercase tracking-wider border-2 border-white text-white px-8 py-3 hover:bg-white hover:text-gray-7 transition-colors"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ── CARS FOR SALE / SELL US YOUR CAR ─────────────────────────────── */}
      <section className="grid grid-cols-2">
        {[
          {
            image: carsForSaleImage,
            title: "Cars For Sale",
            alt: "A showroom floor filled with exotic supercars",
          },
          {
            image: sellYourCarImage,
            title: "Sell Us Your Car",
            alt: "A red Ferrari F40 — we buy supercars",
          },
        ].map(({ image, title, alt }) => (
          <Link key={title} href="#" className="relative overflow-hidden block">
            <div className="relative h-cta">
              <Image
                src={image}
                alt={alt}
                fill
                className="object-cover"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-black-40" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <h2 className="font-inter font-normal text-section uppercase tracking-widest text-gray-93">
                {title}
              </h2>
              <p className="font-montserrat text-15 text-white-70 tracking-widest">
                Discover More
              </p>
              <div className="mt-4">
                <StripeBar dark />
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* ── LATEST COMPANY NEWS ───────────────────────────────────────────── */}
      <section className="bg-white">
        <SectionHeading title="Latest Company News" />
      </section>

      {/* ── NEWS + INSTAGRAM + NEWSLETTER ────────────────────────────────── */}
      <section className="bg-gray-98 pt-24 pb-16 px-20">
        <div className="max-w-site mx-auto">

          {/* Two-column layout */}
          <div className="grid grid-cols-12 mb-20">

            {/* Featured article — 7 cols */}
            <article className="col-span-7 pr-16">
              <div className="relative aspect-[3/2] w-full rounded overflow-hidden mb-6">
                <Image
                  src={newsArticle.image}
                  alt={newsArticle.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 730px, 55vw"
                />
              </div>

              <div className="flex items-center gap-3 mb-4 font-montserrat text-13 text-black tracking-wide">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3 shrink-0" />
                  {newsArticle.date}
                </span>
                <span className="opacity-40">|</span>
                <span>{newsArticle.category}</span>
              </div>

              <h3 className="font-inter font-normal text-3xl text-gray-7 leading-tight mb-4">
                {newsArticle.title}
              </h3>
              <p className="font-roboto text-15 text-gray-33 leading-relaxed mb-8">
                {newsArticle.excerpt}
              </p>

              <Link
                href="#"
                className="inline-block font-montserrat font-semibold text-13 uppercase tracking-wider border-2 border-black text-black px-8 py-3 hover:bg-black hover:text-white transition-colors"
              >
                Read More
              </Link>
            </article>

            {/* Instagram feed — 5 cols */}
            <div className="col-span-5 border-l border-gray-90 pl-8">
              <h3 className="font-inter font-medium text-2xl text-gray-7 uppercase tracking-widest mb-3">
                AMARI™ on Instagram
              </h3>
              <div className="flex items-center gap-2 mb-5">
                <InstagramIcon className="size-3 text-black shrink-0" />
                <span className="font-montserrat text-13 text-black">
                  Follow us @amarisupercars
                </span>
              </div>
              <div className="grid grid-cols-4 gap-px">
                {instagramPosts.map((post) => (
                  <div
                    key={post.id}
                    className="relative aspect-square overflow-hidden bg-gray-94"
                  >
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      className="object-cover hover:opacity-80 transition-opacity"
                      sizes="(min-width: 1280px) 120px, 10vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-gray-90 pt-12 flex flex-col items-center gap-3">
            <h3 className="font-inter font-medium text-2xl text-gray-7 uppercase tracking-widest">
              Newsletter
            </h3>
            <p className="font-montserrat text-13 text-gray-33 text-center">
              Stay up to date with our news and latest stock
            </p>
            <Link
              href="#"
              className="mt-3 flex items-center gap-3 font-montserrat font-semibold text-13 uppercase tracking-wider bg-black text-white border-2 border-black px-8 py-3 hover:bg-gray-16 transition-colors"
            >
              Mailing list sign up
              <Mail className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
