import { useQuery } from '@tanstack/react-query'
import { locationService } from '../services/locationService'

export const locationQueryKeys = {
  all: ['admin', 'locations'] as const,
  summary: () => [...locationQueryKeys.all, 'summary'] as const,
  provinces: () => [...locationQueryKeys.all, 'provinces'] as const,
  wards: (provinceCode: string) =>
    [...locationQueryKeys.all, 'wards', provinceCode] as const,
  ward: (wardCode: string) =>
    [...locationQueryKeys.all, 'ward', wardCode] as const,
}

export function useLocationSummary() {
  return useQuery({
    queryKey: locationQueryKeys.summary(),
    queryFn: locationService.summary,
    staleTime: 10 * 60 * 1000,
  })
}

export function useProvinces() {
  return useQuery({
    queryKey: locationQueryKeys.provinces(),
    queryFn: locationService.provinces,
    staleTime: 10 * 60 * 1000,
  })
}

export function useWards(provinceCode: string) {
  return useQuery({
    queryKey: locationQueryKeys.wards(provinceCode),
    queryFn: () => locationService.wards(provinceCode),
    enabled: Boolean(provinceCode),
    staleTime: 10 * 60 * 1000,
  })
}
