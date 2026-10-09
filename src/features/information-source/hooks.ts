import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { informationSourceService } from './service'

export const sourceKeys = { all: ['information-source'] as const }

export function useWorkspace(poll = true) {
  const user = useCurrentUser()
  return useQuery({
    queryKey: [...sourceKeys.all, 'workspace', user?.id],
    queryFn: informationSourceService.workspace,
    enabled: Boolean(
      user &&
      (user.isSuperAdmin ||
        user.permissionCodes.includes('integration.gateway.view')),
    ),
    refetchInterval: poll ? 3000 : false,
    retry: 1,
  })
}

export function useServiceCatalog() {
  return useQuery({
    queryKey: [...sourceKeys.all, 'catalog'],
    queryFn: informationSourceService.catalog,
    staleTime: 60_000,
  })
}

export function useReadNotification() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: informationSourceService.markRead,
    onSuccess: () => client.invalidateQueries({ queryKey: sourceKeys.all }),
  })
}

export function useRefreshSource() {
  const client = useQueryClient()
  return () => client.invalidateQueries({ queryKey: sourceKeys.all })
}
