'use client'

import type { FooterNavGroup } from '@/lib/header-navigation'
import { SiteFooter } from './site-footer'

export function FooterContent({ exploreGroups }: { exploreGroups: FooterNavGroup[] }) {
  return <SiteFooter exploreGroups={exploreGroups} />
}
