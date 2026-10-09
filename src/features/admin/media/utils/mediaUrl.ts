import { apiBaseUrl } from '@/lib/apiClient'

/** Local media paths are served by the API host, not the admin web host. */
export function resolveMediaUrl(url: string): string {
  if (!/^\/(?:images|uploads)\//.test(url)) return url

  const fallbackOrigin =
    typeof window === 'undefined'
      ? 'http://localhost:3000'
      : window.location.origin
  return new URL(url, new URL(apiBaseUrl, fallbackOrigin)).href
}
