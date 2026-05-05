import { Suspense } from 'react'
import { FooterContent } from '@/components/footer-content'
import { getFooterNavigation } from '@/lib/header-navigation'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const exploreGroups = await getFooterNavigation()

  return (
    <>
      {children}
      <Suspense>
        <FooterContent exploreGroups={exploreGroups} />
      </Suspense>
    </>
  )
}
