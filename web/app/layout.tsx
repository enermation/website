import type { Metadata } from 'next'
import { Barlow_Semi_Condensed, Bebas_Neue, Inter, Playfair_Display } from 'next/font/google'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import './globals.css'
import { SiteFooter } from '@/components/site-footer'
import { CartProvider } from '@/lib/cart-context'

const display = Bebas_Neue({
  variable: '--font-display',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const heading = Barlow_Semi_Condensed({
  variable: '--font-heading',
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const body = Inter({
  variable: '--font-body',
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
})

const flauta = localFont({
  src: '../public/fonts/flauta.ttf',
  variable: '--font-flauta',
  display: 'swap',
})

const luxury = Playfair_Display({
  variable: '--font-luxury',
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Enermation — Supplying the Finest Supercars',
  description:
    "Enermation are internationally renowned for offering a unique selection of some of the world's finest automobiles. The premier supercar dealer in the UK.",
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${heading.variable} ${body.variable} ${luxury.variable} ${flauta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense>
          <CartProvider>
            {children}
            <SiteFooter />
          </CartProvider>
        </Suspense>
      </body>
    </html>
  )
}
