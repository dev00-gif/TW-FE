import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { noTerritoryAccess } from './access'
import type { TerritoryAccess } from './access'

export const territoryKey = (id: string) => ['territory', id] as const

export function useTerritory() {
  const user = useCurrentUser()
  const query = useQuery({
    queryKey: territoryKey(user?.id ?? ''),
    queryFn: () => api.get<TerritoryAccess>(`/users/${user!.id}/scopes`),
    enabled: Boolean(user),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
  return {
    access: query.isError
      ? noTerritoryAccess
      : (query.data ?? noTerritoryAccess),
    userId: user?.id ?? '',
    pending: query.isPending,
    error: query.isError,
  }
}
