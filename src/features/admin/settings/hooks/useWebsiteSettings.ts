import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '../services/settingsService'
import type { WebsiteSettings } from '../services/settingsService'

export const websiteSettingsQueryKeys = {
  admin: () => ['admin', 'system', 'website-settings'] as const,
  public: () => ['public', 'website-settings'] as const,
}

export function usePublicWebsiteSettings() {
  return useQuery({
    queryKey: websiteSettingsQueryKeys.public(),
    queryFn: settingsService.getPublicWebsite,
    enabled: typeof window !== 'undefined',
  })
}

export function useWebsiteSettings() {
  return useQuery({
    queryKey: websiteSettingsQueryKeys.admin(),
    queryFn: settingsService.getWebsite,
  })
}

export function useUpdateWebsiteSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: WebsiteSettings) =>
      settingsService.updateWebsite(input),
    onSuccess: (settings) => {
      queryClient.setQueryData(websiteSettingsQueryKeys.admin(), settings)
      queryClient.setQueryData(websiteSettingsQueryKeys.public(), settings)
    },
  })
}
