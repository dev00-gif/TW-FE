import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '../types/auth'
import { authQueryKeys, getMe, useLogin, useLogout } from './useAuth'
import { authService } from '../services/authService'

vi.mock('../services/authService', () => ({
  authService: {
    getMe: vi.fn(),
    login: vi.fn(),
    logoutSession: vi.fn(),
  },
}))

const user: User = {
  id: 'user-1',
  email: 'user@example.com',
  status: 'active',
  roleCodes: [],
  permissionCodes: ['dashboard.overview.view'],
  isSuperAdmin: false,
  canAccessDashboard: true,
  createdAt: '2026-01-01T00:00:00Z',
}

describe('auth query cache', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shares one profile request across route loaders and keeps it for navigation', async () => {
    const queryClient = new QueryClient()
    vi.mocked(authService.getMe).mockResolvedValue(user)

    const [first, second] = await Promise.all([
      getMe(queryClient),
      getMe(queryClient),
    ])
    const nextPage = await getMe(queryClient)

    expect(first).toEqual(user)
    expect(second).toEqual(user)
    expect(nextPage).toEqual(user)
    expect(authService.getMe).toHaveBeenCalledTimes(1)
  })

  it('stores the profile returned by login for subsequent pages', async () => {
    const queryClient = new QueryClient()
    const credentials = { login: 'user@example.com', password: 'test-password' }
    vi.mocked(authService.login).mockResolvedValue(user)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useLogin(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(credentials)
    })

    expect(queryClient.getQueryData(authQueryKeys.me())).toEqual(user)
    expect(await getMe(queryClient)).toEqual(user)
    expect(authService.getMe).not.toHaveBeenCalled()
  })

  it('removes account data from the cache on logout', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(authQueryKeys.me(), user)
    queryClient.setQueryData(['admin', 'users'], ['private data'])
    vi.mocked(authService.logoutSession).mockResolvedValue({ message: 'ok' })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(queryClient.getQueryData(authQueryKeys.me())).toBeNull()
    expect(queryClient.getQueryData(['admin', 'users'])).toBeUndefined()
  })
})
