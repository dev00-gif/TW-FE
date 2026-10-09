// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initialDevices } from '../services/deviceMockService'
import type { DeviceFilters } from '../types'
import {
  deviceQueryKeys,
  useDeviceDetail,
  useDevices,
  useImportDevices,
  useUpsertDevice,
} from './useDevices'

vi.mock('@/features/territory/useTerritory', () => ({
  useTerritory: () => ({
    userId: 'admin',
    access: { hasFullAccess: true, scopes: [] },
  }),
}))
vi.mock('@/features/auth/hooks/usePermission', () => ({
  usePermission: () => true,
}))

const filters: DeviceFilters = {
  search: 'TN-PT-001',
  type: 'all',
  status: 'all',
  area: 'all',
}

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, wrapper }
}

describe('device hooks', () => {
  beforeEach(() => sessionStorage.clear())

  it('keys filtered lists and details separately', () => {
    expect(deviceQueryKeys.list(filters)).toEqual([
      'admin',
      'devices',
      'list',
      filters,
    ])
    expect(deviceQueryKeys.detail('TN-PT-001')).toEqual([
      'admin',
      'devices',
      'detail',
      'TN-PT-001',
    ])
  })

  it('shares updates between the filtered list and detail cache', async () => {
    const { client, wrapper } = setup()
    const { result } = renderHook(
      () => ({
        list: useDevices(filters),
        detail: useDeviceDetail('TN-PT-001'),
        upsert: useUpsertDevice(),
      }),
      { wrapper },
    )
    await waitFor(() =>
      expect(result.current.detail.data?.id).toBe('TN-PT-001'),
    )

    const updated = { ...initialDevices[0], volume: 42 }
    await act(async () => {
      await result.current.upsert.mutateAsync(updated)
    })

    await waitFor(() =>
      expect(result.current.list.data.filtered[0].volume).toBe(42),
    )
    expect(result.current.detail.data?.volume).toBe(42)
    expect(
      client.getQueryData([
        ...deviceQueryKeys.detail(updated.id),
        'admin',
        { hasFullAccess: true, scopes: [] },
      ]),
    ).toEqual(updated)
    expect(
      JSON.parse(sessionStorage.getItem('somics-demo-devices') ?? '[]'),
    ).toContainEqual(updated)
  })

  it('imports devices and refreshes list and detail queries', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(
      () => ({
        list: useDevices(filters),
        detail: useDeviceDetail('TN-PT-001'),
        importDevices: useImportDevices(),
      }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.detail.data).not.toBeUndefined())

    await act(async () => {
      await result.current.importDevices.mutateAsync([
        { ...initialDevices[0], name: 'Thiết bị thử nghiệm' },
      ])
    })

    await waitFor(() =>
      expect(result.current.detail.data?.name).toBe('Thiết bị thử nghiệm'),
    )
    expect(result.current.list.data.filtered[0].name).toBe(
      'Thiết bị thử nghiệm',
    )
  })
})
