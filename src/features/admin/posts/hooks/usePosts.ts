import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { postService } from '../services/postService'
import type {
  ListPostCategoriesInput,
  ListPostsInput,
} from '../services/postService'

export const postQueryKeys = {
  all: ['admin', 'posts'] as const,
  lists: () => [...postQueryKeys.all, 'list'] as const,
  list: (input: ListPostsInput) => [...postQueryKeys.lists(), input] as const,
  details: () => [...postQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...postQueryKeys.details(), id] as const,
  categories: () => [...postQueryKeys.all, 'categories'] as const,
  categoryList: (input: ListPostCategoriesInput) =>
    [...postQueryKeys.categories(), input] as const,
}
export function usePosts(
  input: Parameters<typeof postService.list>[0] = {
    page: 1,
    limit: 10,
    search: '',
  },
) {
  return useQuery({
    queryKey: postQueryKeys.list(input),
    queryFn: () => postService.list(input),
    placeholderData: (previous) => previous,
  })
}
export function usePostDetail(id?: string) {
  return useQuery({
    queryKey: postQueryKeys.detail(id ?? ''),
    queryFn: () => postService.detail(id ?? ''),
    enabled: Boolean(id),
  })
}
export function usePostCategories(
  input: Parameters<typeof postService.categories>[0] = { search: '' },
) {
  return useQuery({
    queryKey: postQueryKeys.categoryList(input),
    queryFn: () => postService.categories(input),
    placeholderData: (previous) => previous,
  })
}
export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postService.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: postQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: postQueryKeys.categories() }),
      ])
    },
  })
}
export function useUpdatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postService.update,
    onSuccess: async (_result, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: postQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: postQueryKeys.detail(input.id),
        }),
        queryClient.invalidateQueries({ queryKey: postQueryKeys.categories() }),
      ])
    },
  })
}
export function useCreatePostCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: postService.createCategory,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: postQueryKeys.categories() }),
  })
}
export function useUpdatePostCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: postService.updateCategory,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: postQueryKeys.categories() }),
        client.invalidateQueries({ queryKey: postQueryKeys.lists() }),
        client.invalidateQueries({ queryKey: postQueryKeys.details() }),
      ])
    },
  })
}
export function useDeletePostCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: postService.deleteCategory,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: postQueryKeys.categories() }),
        client.invalidateQueries({ queryKey: postQueryKeys.lists() }),
        client.invalidateQueries({ queryKey: postQueryKeys.details() }),
      ])
    },
  })
}
