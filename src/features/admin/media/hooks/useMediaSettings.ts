import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { mediaService } from '../services/mediaService'
import type {
  MediaListInput,
  UpdateMediaSettingsInput,
} from '../services/mediaService'

export const mediaQueryKeys = {
  all: ['admin', 'media'] as const,
  lists: () => [...mediaQueryKeys.all, 'list'] as const,
  list: (input: MediaListInput) => [...mediaQueryKeys.lists(), input] as const,
  settings: () => [...mediaQueryKeys.all, 'settings'] as const,
}

export function useMediaList(input: MediaListInput = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: mediaQueryKeys.list(input),
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      mediaService.list({
        ...input,
        page: pageParam,
        limit: input.limit ?? 10,
        search: input.search ?? '',
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
  })
}

export function useCreateMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mediaService.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: mediaQueryKeys.lists() }),
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => mediaService.upload(file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: mediaQueryKeys.lists() }),
  })
}

export function useCreateMediaFolder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mediaService.createFolder,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: mediaQueryKeys.lists() }),
  })
}

export function useUpdateMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mediaService.update,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: mediaQueryKeys.lists() }),
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mediaService.delete,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: mediaQueryKeys.lists() }),
  })
}

export function useMediaSettings(enabled = true) {
  return useQuery({
    queryKey: mediaQueryKeys.settings(),
    queryFn: mediaService.getSettings,
    enabled,
  })
}

export function useUpdateMediaSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateMediaSettingsInput) =>
      mediaService.updateSettings(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: mediaQueryKeys.settings() }),
  })
}
