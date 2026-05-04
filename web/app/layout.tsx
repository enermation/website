import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import type { Metadata } from 'next'
import { Barlow_Semi_Condensed, Bebas_Neue, Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { ChatWidgetMount } from '@/components/chat-widget-mount'
import { FooterContent } from '@/components/footer-content'
import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/lib/cart-context'
import { getFooterNavigation } from '@/lib/header-navigation'
import { WishlistProvider } from '@/lib/wishlist-context'

const display = Bebas_Neue({
  variable: '--font-display',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
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
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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
      className={`${display.variable} ${heading.variable} ${body.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preload"
          href="/fonts/tachyon-light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense>
          <CartProvider>
            <WishlistProvider>
              {children}
              <Suspense>
                <FooterContent exploreGroups={exploreGroups} />
              </Suspense>
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
