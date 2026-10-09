import { useTerritory } from '@/features/territory/useTerritory'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { scheduleService } from '../services/scheduleService'
import type { ScheduleFilters, ScheduleInput } from '../types'

export const scheduleQueryKeys = {
  all: ['admin', 'schedules'] as const,
  lists: () => [...scheduleQueryKeys.all, 'list'] as const,
  list: (filters: ScheduleFilters) =>
    [...scheduleQueryKeys.lists(), filters] as const,
}

export function useSchedules(filters: ScheduleFilters) {
  const { access, userId } = useTerritory()
  return useQuery({
    queryKey: [...scheduleQueryKeys.list(filters), userId, access],
    queryFn: () => scheduleService.list(filters, access),
  })
}

export function useCreateSchedule() {
  const client = useQueryClient()
  const { access } = useTerritory()
  const mayCreate = usePermission('broadcast.schedule.create')
  return useMutation({
    mutationFn: (input: ScheduleInput) => {
      if (!mayCreate) throw new Error('Không có quyền thao tác lịch phát')
      return scheduleService.create(input, access)
    },
    onSuccess: () =>
      client.invalidateQueries({ queryKey: scheduleQueryKeys.lists() }),
  })
}

export function useUpdateSchedule() {
  const client = useQueryClient()
  const { access } = useTerritory()
  const mayUpdate = usePermission('broadcast.schedule.update')
  return useMutation({
    mutationFn: (input: { id: string; input: ScheduleInput }) => {
      if (!mayUpdate) throw new Error('Không có quyền thao tác lịch phát')
      return scheduleService.update(input, access)
    },
    onSuccess: () =>
      client.invalidateQueries({ queryKey: scheduleQueryKeys.lists() }),
  })
}

export function useCancelSchedule() {
  const client = useQueryClient()
  const { access } = useTerritory()
  const mayUpdate = usePermission('broadcast.schedule.update')
  return useMutation({
    mutationFn: (id: string) => {
      if (!mayUpdate) throw new Error('Không có quyền thao tác lịch phát')
      return scheduleService.cancel(id, access)
    },
    onSuccess: () =>
      client.invalidateQueries({ queryKey: scheduleQueryKeys.lists() }),
  })
}

export function useImportSchedules() {
  const client = useQueryClient()
  const { access } = useTerritory()
  const mayCreate = usePermission('broadcast.schedule.create')
  return useMutation({
    mutationFn: (inputs: ScheduleInput[]) => {
      if (!mayCreate) throw new Error('Không có quyền thao tác lịch phát')
      return scheduleService.importMany(inputs, access)
    },
    onSuccess: () =>
      client.invalidateQueries({ queryKey: scheduleQueryKeys.lists() }),
  })
}
