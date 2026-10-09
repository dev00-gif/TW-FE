// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@/config/i18n'
import { toast } from '@/utils/toast'
import { TerritoryPanel } from './TerritoryPanel'

const state = vi.hoisted(() => ({
  admin: true,
  fullAccess: false,
  get: vi.fn(),
  put: vi.fn(),
}))
vi.mock('@/lib/apiClient', () => ({ api: { get: state.get, put: state.put } }))
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useCurrentUser: () => ({
    id: 'actor',
    isSuperAdmin: state.admin,
    roleCodes: state.admin ? ['ADMIN'] : ['SYSTEM_STAFF'],
  }),
}))
vi.mock('@/features/auth/hooks/usePermission', () => ({
  usePermission: () => state.admin,
}))
vi.mock('@/utils/toast', () => ({
  toast: { success: vi.fn(), warning: vi.fn(), apiError: vi.fn() },
}))
const province = { id: 'province-id', code: '19', name: 'Thái Nguyên' }
const ward = {
  id: 'ward-id',
  code: '5443',
  name: 'Phường Phan Đình Phùng',
  provinceCode: '19',
}
const scope = {
  scopeType: 'WARD',
  scopeId: ward.id,
  code: ward.code,
  name: ward.name,
  provinceCode: '19',
}
function mount() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <TerritoryPanel userId="staff" />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  state.admin = true
  state.fullAccess = false
  vi.clearAllMocks()
  state.get.mockImplementation((url: string) =>
    Promise.resolve(
      url === '/locations/provinces'
        ? [province]
        : url.includes('/wards')
          ? [ward]
          : { hasFullAccess: state.fullAccess, scopes: [] },
    ),
  )
  state.put.mockResolvedValue({ hasFullAccess: false, scopes: [scope] })
})
afterEach(cleanup)

describe('user territory editor', () => {
  it('loads province/wards and saves only selected UUID assignments', async () => {
    mount()
    await screen.findByText('Thái Nguyên')
    fireEvent.change(screen.getByRole('combobox', { name: 'Tỉnh/thành phố' }), {
      target: { value: province.id },
    })
    fireEvent.click(await screen.findByRole('checkbox', { name: ward.name }))
    fireEvent.click(screen.getByRole('button', { name: 'Thêm địa bàn' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lưu địa bàn' }))
    await waitFor(() =>
      expect(state.put).toHaveBeenCalledWith('/users/staff/scopes', {
        scopes: [{ scopeType: 'WARD', scopeId: ward.id }],
      }),
    )
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Lưu địa bàn' })
          .hasAttribute('disabled'),
      ).toBe(true),
    )
  })
  it('warns when adding an already assigned territory without duplicating it', async () => {
    state.get.mockImplementation((url: string) =>
      Promise.resolve(
        url === '/locations/provinces'
          ? [province]
          : url.includes('/wards')
            ? [ward]
            : { hasFullAccess: false, scopes: [scope] },
      ),
    )
    mount()
    await screen.findByText(ward.name)
    fireEvent.change(screen.getByRole('combobox', { name: 'Tỉnh/thành phố' }), {
      target: { value: province.id },
    })
    fireEvent.click(await screen.findByRole('checkbox', { name: ward.name }))
    fireEvent.click(screen.getByRole('button', { name: 'Thêm địa bàn' }))
    expect(toast.warning).toHaveBeenCalledWith(
      `Địa bàn đã được thêm: ${ward.name}. Không thể thêm trùng.`,
    )
    expect(
      screen.getAllByRole('button', { name: `Xóa địa bàn ${ward.name}` }),
    ).toHaveLength(1)
    expect(
      screen
        .getByRole('button', { name: 'Lưu địa bàn' })
        .hasAttribute('disabled'),
    ).toBe(true)
    expect(state.put).not.toHaveBeenCalled()
  })
  it('displays full access without a scope editor for administrator targets', async () => {
    state.fullAccess = true
    mount()
    await screen.findByText('Tài khoản quản trị có quyền toàn bộ địa bàn.')
    expect(screen.queryByRole('button', { name: 'Lưu địa bàn' })).toBeNull()
    expect(screen.queryByRole('combobox')).toBeNull()
  })
  it('does not show scope assignment controls to staff users', async () => {
    state.admin = false
    mount()
    await screen.findByText(/Chưa được gán địa bàn/)
    expect(screen.queryByRole('button', { name: 'Thêm địa bàn' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Lưu địa bàn' })).toBeNull()
  })
})
