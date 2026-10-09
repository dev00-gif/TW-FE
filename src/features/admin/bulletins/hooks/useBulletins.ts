import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bulletinService } from '../services/bulletinService'
import { bulletinCategoryService } from '../services/bulletinCategoryService'
import type { BulletinFilters } from '../types'

export const bulletinQueryKeys = {
  all: ['admin', 'bulletins'] as const,
  lists: () => [...bulletinQueryKeys.all, 'list'] as const,
  list: (filters: BulletinFilters) =>
    [...bulletinQueryKeys.lists(), filters] as const,
  details: () => [...bulletinQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...bulletinQueryKeys.details(), id] as const,
  categories: () => [...bulletinQueryKeys.all, 'categories'] as const,
}

export function useBulletinCategories() {
  return useQuery({
    queryKey: bulletinQueryKeys.categories(),
    queryFn: bulletinCategoryService.list,
  })
}

export function useSaveBulletinCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: bulletinCategoryService.save,
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: bulletinQueryKeys.categories(),
      })
    },
  })
}

export function useDeleteBulletinCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: bulletinCategoryService.delete,
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: bulletinQueryKeys.categories(),
      })
    },
  })
}

export function useBulletinDetail(id: string) {
  return useQuery({
    queryKey: bulletinQueryKeys.detail(id),
    queryFn: () => bulletinService.detail(id),
    enabled: Boolean(id),
  })
}

export function useBulletins(filters: BulletinFilters) {
  return useQuery({
    queryKey: bulletinQueryKeys.list(filters),
    queryFn: () => bulletinService.list(filters),
    initialData: () => bulletinService.list(filters),
  })
}

export function useSaveBulletin() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: bulletinService.save,
    onSuccess: (item) => {
      client.setQueryData(bulletinQueryKeys.detail(item.id), item)
      void client.invalidateQueries({ queryKey: bulletinQueryKeys.lists() })
    },
  })
}

export function useSetBulletinStatus() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: bulletinService.setStatus,
    onSuccess: (item) => {
      client.setQueryData(bulletinQueryKeys.detail(item.id), item)
      void client.invalidateQueries({ queryKey: bulletinQueryKeys.lists() })
    },
  })
}

export function useImportBulletins() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: bulletinService.importMany,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: bulletinQueryKeys.lists() })
      void client.invalidateQueries({ queryKey: bulletinQueryKeys.details() })
    },
  })
}
