import { usePublicWebsiteSettings } from '@/features/admin/settings/hooks/useWebsiteSettings'
import { resolveMediaUrl } from '@/features/admin/media/utils/mediaUrl'
import { APP_INFO } from '@/config/appInfo'

const Logo = () => {
  const { data } = usePublicWebsiteSettings()
  return (
    <img
      src={data?.logoUrl ? resolveMediaUrl(data.logoUrl) : APP_INFO.FAVICON}
      alt={data?.siteName || APP_INFO.NAME}
      className="h-10 w-10 rounded-lg object-contain"
    />
  )
}

export default Logo
