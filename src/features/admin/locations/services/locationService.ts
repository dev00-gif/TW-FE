import { api } from '@/lib/apiClient'
import type { LocationSummary, Province, Ward } from '../types'

export const locationService = {
  summary: () => api.get<LocationSummary>('/locations/summary'),
  provinces: () => api.get<Province[]>('/locations/provinces'),
  wards: (provinceCode: string) =>
    api.get<Ward[]>(
      `/locations/provinces/${encodeURIComponent(provinceCode)}/wards`,
    ),
  ward: (wardCode: string) =>
    api.get<Ward>(`/locations/wards/${encodeURIComponent(wardCode)}`),
}
