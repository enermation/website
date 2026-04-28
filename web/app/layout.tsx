import type { Metadata } from 'next'
import { Barlow_Semi_Condensed, Bebas_Neue, Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { ChatWidgetMount } from '@/components/chat-widget-mount'
import { SiteFooter } from '@/components/site-footer'
import { CartProvider } from '@/lib/cart-context'

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
  title: 'Enermation — Supplying the Finest Supercars',
  description:
    "Enermation are internationally renowned for offering a unique selection of some of the world's finest automobiles. The premier supercar dealer in the UK.",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
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
      className={`${display.variable} ${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense>
          <CartProvider>
            {children}
            <SiteFooter />
            <ChatWidgetMount />
          </CartProvider>
        </Suspense>
      </body>
    </html>
  )
}
