import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import type { Metadata } from 'next'
import { Barlow_Semi_Condensed, Bebas_Neue, Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import './globals.css'
import { ChatWidgetMount } from '@/components/chat-widget-mount'
import { SiteFooter } from '@/components/site-footer'
import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/lib/cart-context'
import { getFooterNavigation } from '@/lib/header-navigation'
import { WishlistProvider } from '@/lib/wishlist-context'

const alphacorsa = localFont({
  src: '../public/fonts/alphacorsa.ttf',
  variable: '--font-alphacorsa',
  display: 'block',
  preload: true,
})

const display = Bebas_Neue({
  variable: '--font-display',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

const heading = Barlow_Semi_Condensed({
  variable: '--font-heading',
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

const body = Inter({
  variable: '--font-body',
  weight: ['400', '500'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.enermation.com'),
  title: 'Enermation — Automotive Exports',
  description:
    'Enermation: Your premier automotive dealership exporting quality used cars and auto spare parts from strategic locations worldwide. Explore our wide selection today!',
  icons: {
    icon: '/miles_logo.png',
    shortcut: '/miles_logo.png',
    apple: '/miles_logo.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const exploreGroups = await getFooterNavigation()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${alphacorsa.variable} ${display.variable} ${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense>
          <CartProvider>
            <WishlistProvider>
              {children}
              <SiteFooter exploreGroups={exploreGroups} />
              <ChatWidgetMount />
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </WishlistProvider>
          </CartProvider>
        </Suspense>
      </body>
    </html>
  )
}
