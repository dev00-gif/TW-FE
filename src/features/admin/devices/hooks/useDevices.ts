import { useTerritory } from '@/features/territory/useTerritory'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deviceService } from '../services/deviceService'
import type { Device, DeviceFilters } from '../types'

export const deviceQueryKeys = {
  all: ['admin', 'devices'] as const,
  lists: () => [...deviceQueryKeys.all, 'list'] as const,
  list: (filters: DeviceFilters) =>
    [...deviceQueryKeys.lists(), filters] as const,
  details: () => [...deviceQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...deviceQueryKeys.details(), id] as const,
}

export function useDevices(filters: DeviceFilters) {
  const { access, userId } = useTerritory()
  return useQuery({
    queryKey: [...deviceQueryKeys.list(filters), userId, access],
    queryFn: () => deviceService.list(filters, access),
    initialData: () => deviceService.list(filters, access),
  })
}

export function useDeviceDetail(id: string) {
  const { access, userId } = useTerritory()
  return useQuery({
    queryKey: [...deviceQueryKeys.detail(id), userId, access],
    queryFn: () => deviceService.detail(id, access),
  })
}

export function useUpsertDevice() {
  const queryClient = useQueryClient()
  const { access } = useTerritory()
  const mayCreate = usePermission('device.device.create')
  const mayUpdate = usePermission('device.device.update')
  return useMutation({
    mutationFn: (device: Device) => {
      const exists = deviceService.detail(device.id)
      if (!(exists ? mayUpdate : mayCreate))
        throw new Error('Không có quyền thao tác thiết bị')
      return deviceService.upsert(device, access)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: deviceQueryKeys.details() }),
        queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists() }),
      ])
    },
  })
}

export function useImportDevices() {
  const queryClient = useQueryClient()
  const { access } = useTerritory()
  const mayCreate = usePermission('device.device.create')
  const mayUpdate = usePermission('device.device.update')
  return useMutation({
    mutationFn: (devices: Device[]) => {
      if (!mayCreate || !mayUpdate)
        throw new Error('Không có quyền nhập thiết bị')
      return deviceService.importMany(devices, access)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: deviceQueryKeys.details() }),
      ])
    },
  })
}
