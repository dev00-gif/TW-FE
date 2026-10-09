import { api } from '@/lib/apiClient'

export type WebsiteSettings = {
  siteName: string
  logoUrl: string
  faviconUrl: string
}

export const settingsService = {
  getPublicWebsite: () =>
    api.get<WebsiteSettings>('/system/settings/website/public'),
  getWebsite: () => api.get<WebsiteSettings>('/system/settings/website'),
  updateWebsite: (input: WebsiteSettings) =>
    api.put<WebsiteSettings>('/system/settings/website', input),
}
