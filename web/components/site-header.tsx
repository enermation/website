import { SiteHeaderClient } from '@/components/site-header-client'
import { getHeaderNavigation } from '@/lib/header-navigation'

type SiteHeaderProps = {
  isHomePage?: boolean
}

export async function SiteHeader({ isHomePage = false }: SiteHeaderProps) {
  const navigation = await getHeaderNavigation()

  return <SiteHeaderClient navigation={navigation} isHomePage={isHomePage} />
}
