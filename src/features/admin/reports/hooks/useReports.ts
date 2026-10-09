import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'
import type { ReportFilters } from '../types'

export const reportQueryKeys = {
  all: ['admin', 'reports'] as const,
  overview: (filters: ReportFilters) =>
    [...reportQueryKeys.all, 'overview', filters] as const,
}

export function useReportOverview(filters: ReportFilters) {
  return useQuery({
    queryKey: reportQueryKeys.overview(filters),
    queryFn: () => reportService.overview(filters),
    placeholderData: (previous) => previous,
  })
}
