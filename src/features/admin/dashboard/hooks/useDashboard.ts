import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

export const dashboardQueryKeys = {
  all: ['admin', 'dashboard'] as const,
  overview: () => [...dashboardQueryKeys.all, 'overview'] as const,
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardQueryKeys.overview(),
    queryFn: dashboardService.overview,
    staleTime: Infinity,
  })
}
