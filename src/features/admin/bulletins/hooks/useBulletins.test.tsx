// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { initialBulletins } from '../services/bulletinService'
import type { BulletinFilters } from '../types'
import {
  bulletinQueryKeys,
  useBulletinDetail,
  useBulletins,
  useSaveBulletin,
} from './useBulletins'

const filters: BulletinFilters = {
  search: 'BN-2025-001',
  type: 'all',
  channel: 'all',
  priority: 'all',
  area: 'all',
  status: 'all',
  author: '',
  from: '',
  to: '',
  page: 1,
  limit: 10,
}

describe('bulletin hooks', () => {
  beforeEach(() => sessionStorage.clear())

  it('keeps filter inputs in the query key and refreshes after saving', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () => ({ list: useBulletins(filters), save: useSaveBulletin() }),
      { wrapper },
    )
    expect(bulletinQueryKeys.list(filters)).toEqual([
      'admin',
      'bulletins',
      'list',
      filters,
    ])
    expect(result.current.list.data.items[0].id).toBe(initialBulletins[0].id)

    const source = initialBulletins[0]
    await act(async () => {
      await result.current.save.mutateAsync({
        id: source.id,
        draft: {
          title: 'Bản tin cập nhật',
          content: source.content,
          type: source.type,
          channels: source.channels,
          area: source.area,
          priority: source.priority,
          status: source.status,
          image: source.image,
        },
      })
    })
    await waitFor(() =>
      expect(result.current.list.data.items[0].title).toBe('Bản tin cập nhật'),
    )
  })

  it('updates the detail cache after saving', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const source = initialBulletins[0]
    const { result } = renderHook(
      () => ({ detail: useBulletinDetail(source.id), save: useSaveBulletin() }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.detail.data?.id).toBe(source.id))
    await act(async () => {
      await result.current.save.mutateAsync({
        id: source.id,
        draft: {
          title: 'Chi tiết đã cập nhật',
          content: source.content,
          type: source.type,
          channels: source.channels,
          area: source.area,
          priority: source.priority,
          status: source.status,
          image: source.image,
        },
      })
    })
    expect(
      client.getQueryData(bulletinQueryKeys.detail(source.id)),
    ).toMatchObject({
      title: 'Chi tiết đã cập nhật',
    })
  })
})
