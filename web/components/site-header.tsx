import { SiteHeaderClient } from '@/components/site-header-client'
import { getHeaderNavigation } from '@/lib/header-navigation'

export async function SiteHeader() {
  const navigation = await getHeaderNavigation()

  return <SiteHeaderClient navigation={navigation} />
}
