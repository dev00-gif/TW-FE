import { useEffect } from 'react'
import { usePublicWebsiteSettings } from '@/features/admin/settings/hooks/useWebsiteSettings'
import { resolveMediaUrl } from '@/features/admin/media/utils/mediaUrl'
import { APP_INFO } from '@/config/appInfo'

const FullLogo = () => {
  const { data } = usePublicWebsiteSettings()

  useEffect(() => {
    if (!data) return
    document.title = data.siteName
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }
    favicon.href = data.faviconUrl
      ? resolveMediaUrl(data.faviconUrl)
      : APP_INFO.FAVICON
    favicon.type = data.faviconUrl ? '' : 'image/jpeg'
  }, [data])

  return (
    <div className="flex h-20 items-center justify-center px-4">
      <img
        src={data?.logoUrl ? resolveMediaUrl(data.logoUrl) : APP_INFO.LOGO}
        alt={data?.siteName || APP_INFO.NAME}
        className={
          data?.logoUrl
            ? 'h-12 max-w-32 object-contain'
            : 'h-20 w-32 object-cover'
        }
      />
    </div>
  )
}

export default FullLogo
