import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { postService } from '../services/postService'
import { postQueryKeys, useCreatePost, useUpdatePostCategory } from './usePosts'

vi.mock('../services/postService', () => ({
  postService: {
    create: vi.fn(),
    updateCategory: vi.fn(),
  },
}))

const listInput = { page: 1, limit: 10, search: '' }
const categoryInput = { search: 'news' }

function setup() {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  queryClient.setQueryData(postQueryKeys.list(listInput), { items: [] })
  queryClient.setQueryData(postQueryKeys.categoryList(categoryInput), [])
  queryClient.setQueryData(['admin', 'users'], [])
  return { queryClient, wrapper }
}

describe('post hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalidates post lists and category counts after creating a post', async () => {
    const { queryClient, wrapper } = setup()
    vi.mocked(postService.create).mockResolvedValue(undefined)
    const { result } = renderHook(() => useCreatePost(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ title: 'New post' })
    })

    expect(
      queryClient.getQueryState(postQueryKeys.list(listInput))?.isInvalidated,
    ).toBe(true)
    expect(
      queryClient.getQueryState(postQueryKeys.categoryList(categoryInput))
        ?.isInvalidated,
    ).toBe(true)
    expect(queryClient.getQueryState(['admin', 'users'])?.isInvalidated).toBe(
      false,
    )
  })

  it('invalidates filtered categories and affected post data after editing a category', async () => {
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(postQueryKeys.detail('post-1'), { id: 'post-1' })
    vi.mocked(postService.updateCategory).mockResolvedValue(undefined)
    const { result } = renderHook(() => useUpdatePostCategory(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'category-1', name: 'Updated' })
    })

    expect(
      queryClient.getQueryState(postQueryKeys.categoryList(categoryInput))
        ?.isInvalidated,
    ).toBe(true)
    expect(
      queryClient.getQueryState(postQueryKeys.list(listInput))?.isInvalidated,
    ).toBe(true)
    expect(
      queryClient.getQueryState(postQueryKeys.detail('post-1'))?.isInvalidated,
    ).toBe(true)
  })
})
