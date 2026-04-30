import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { WishlistClientPage } from './wishlist-client'

export const metadata: Metadata = {
  title: 'My Wishlist — Enermation',
  description: 'View and manage your saved vehicles',
}

export default function WishlistPage() {
  return (
    <>
      <SiteHeader />
      <WishlistClientPage />
    </>
  )
}
