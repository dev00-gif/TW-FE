import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { ServicesPage, BulletinsPage } from './pages'
import { informationSourceService } from './service'
import { toEnglishPacket } from './packet-fields'
import type { Packet, ServiceCode, ServiceDefinition, Workspace } from './types'
import requests from './test-data/appendix-examples.json'

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useCurrentUser: () => ({
    id: 'owner',
    isSuperAdmin: true,
    permissionCodes: [],
  }),
}))
vi.mock('@/features/auth/hooks/usePermission', () => ({
  usePermission: () => true,
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useSearch: () => ({}),
}))
vi.mock('@/utils/toast', () => ({ toast: { success: vi.fn() } }))
vi.mock('./service', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  return {
    ...original,
    informationSourceService: {
      catalog: vi.fn(),
      workspace: vi.fn(),
      execute: vi.fn(),
    },
  }
})
const catalog: ServiceDefinition[] = Object.entries(requests).map(
  ([code, example]) => ({
    code: code as ServiceCode,
    name: code,
    path: '/',
    channel: code === 'DV010' || code === 'DV011' ? 'signage' : 'radio',
    direction: 'source-to-device',
    operation: 'schedule',
    providerDefined: false,
    required: Object.keys(example),
    example,
  }),
)
let state: Workspace
let client: QueryClient
const mount = (component: ReactNode) =>
  render(<QueryClientProvider client={client}>{component}</QueryClientProvider>)

afterEach(() => {
  cleanup()
  client.clear()
})
beforeEach(() => {
  vi.clearAllMocks()
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  state = {
    devices: [],
    playlists: [],
    bulletins: [],
    messages: [],
    notifications: [],
    commands: [],
    deliveries: [],
    counts: {
      devices: 0,
      playlists: 0,
      bulletins: 0,
      messages: 0,
      notifications: 0,
      commands: 0,
      unread: 0,
    },
    limit: 200,
    mode: 'http-simulation',
  }
  vi.mocked(informationSourceService.catalog).mockResolvedValue(catalog)
  vi.mocked(informationSourceService.workspace).mockImplementation(async () =>
    structuredClone(state),
  )
  vi.mocked(informationSourceService.execute).mockImplementation(
    async (_code, packet) => {
      for (const item of [
        ...(packet.Bulletins as Packet[]),
        ...(packet.DailyBulletins as Packet[]),
      ]) {
        const old = state.bulletins.find(
          (row) => row.externalId === item.BulletinID,
        )
        const row = {
          id: old?.id ?? crypto.randomUUID(),
          channel: 'radio' as const,
          publicationStatus: 'draft' as const,
          externalId: String(item.BulletinID),
          title: String(item.Title),
          priority: String(item.Priority),
          revision: (old?.revision ?? 0) + 1,
          payload: item,
          createdAt: '2026-10-09T00:00:00Z',
          updatedAt: '2026-10-09T01:00:00Z',
        }
        state.bulletins = [
          row,
          ...state.bulletins.filter((value) => value.id !== row.id),
        ]
      }
      state.counts.bulletins = state.bulletins.length
      return {
        SendStatus: 0,
        Description: 'DV002 packet accepted successfully',
        Content: {},
        Errors: [],
      }
    },
  )
})

describe('API send and bulletin list', () => {
  it('generates new IDs for each click and refreshes the shared bulletin cache before navigation', async () => {
    const page = mount(<ServicesPage />)
    const request =
      await screen.findByLabelText<HTMLTextAreaElement>('Request JSON')
    const packet = JSON.parse(request.value) as Packet
    expect(packet.NguonID).toBe(requests.DV002.SourceID)
    expect(packet.SourceID).toBeUndefined()
    const areas = packet.DanhSachDiaBanNhan as Packet[]
    expect(areas[0].CumLoaID).toEqual(
      requests.DV002.RecipientAreas[0].SpeakerClusterID,
    )
    const bulletins = packet.DanhSachBanTin as Packet[]
    expect(bulletins[0].TacGia).toEqual({
      TenDayDu: requests.DV002.Bulletins[0].Author.FullName,
      ButDanh: requests.DV002.Bulletins[0].Author.PenName,
      Email: requests.DV002.Bulletins[0].Author.Email,
    })
    bulletins[0].TieuDe = 'Bản tin kiểm tra cập nhật'
    fireEvent.change(request, { target: { value: JSON.stringify(packet) } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi request' }))
    await screen.findByRole('link', { name: 'Xem bản tin vừa gửi' })
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Gửi request' })
          .hasAttribute('disabled'),
      ).toBe(false),
    )
    const first = vi.mocked(informationSourceService.execute).mock.calls[0][1]
    expect(first.PlaylistID).not.toBe(packet.LichPhatID)
    expect((first.Bulletins as Packet[])[0].BulletinID).not.toBe(
      bulletins[0].BanTinID,
    )
    expect((first.Bulletins as Packet[])[0].Title).toBe(
      'Bản tin kiểm tra cập nhật',
    )
    expect(JSON.parse(request.value).LichPhatID).toBe(first.PlaylistID)
    expect(JSON.parse(request.value).PlaylistID).toBeUndefined()
    expect(toEnglishPacket(JSON.parse(request.value))).toEqual(first)
    fireEvent.click(screen.getByRole('button', { name: 'Gửi request' }))
    await waitFor(() =>
      expect(informationSourceService.execute).toHaveBeenCalledTimes(2),
    )
    const second = vi.mocked(informationSourceService.execute).mock.calls[1][1]
    expect(second.PlaylistID).not.toBe(first.PlaylistID)
    await screen.findByRole('link', { name: 'Xem bản tin vừa gửi' })
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Gửi request' })
          .hasAttribute('disabled'),
      ).toBe(false),
    )
    page.unmount()
    mount(<BulletinsPage />)
    expect(
      await screen.findAllByText('Bản tin kiểm tra cập nhật'),
    ).toHaveLength(2)
    expect(state.counts.bulletins).toBe(6)
  })

  it('preserves IDs when randomization is turned off', async () => {
    mount(<ServicesPage />)
    await screen.findByLabelText('Request JSON')
    fireEvent.click(
      screen.getByRole('checkbox', { name: /Tạo mã mới mỗi lần gửi/ }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Gửi request' }))
    await screen.findByRole('link', { name: 'Xem bản tin vừa gửi' })
    expect(informationSourceService.execute).toHaveBeenCalledWith(
      'DV002',
      requests.DV002,
      expect.any(String),
    )
  })

  it.each(catalog)(
    '$code sends the English contract from the request editor',
    async ({ code, example }) => {
      vi.mocked(informationSourceService.execute).mockResolvedValue({
        SendStatus: 0,
        Description: 'Đã tiếp nhận',
        Content: {},
      })
      mount(<ServicesPage />)
      await screen.findByLabelText('Request JSON')
      fireEvent.click(
        screen.getByRole('button', { name: new RegExp(`^${code}`) }),
      )
      const checkbox = screen.queryByRole('checkbox', {
        name: /Tạo mã mới mỗi lần gửi/,
      })
      if (checkbox) fireEvent.click(checkbox)
      fireEvent.click(screen.getByRole('button', { name: 'Gửi request' }))
      await waitFor(() =>
        expect(informationSourceService.execute).toHaveBeenCalledWith(
          code,
          example,
          code === 'DV001' ? undefined : expect.any(String),
        ),
      )
    },
  )

  it('restores the Vietnamese sample when reloading or switching services', async () => {
    mount(<ServicesPage />)
    const editor =
      await screen.findByLabelText<HTMLTextAreaElement>('Request JSON')
    fireEvent.change(editor, { target: { value: '{}' } })
    fireEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }))
    expect(JSON.parse(editor.value).NguonID).toBe(requests.DV002.SourceID)
    fireEvent.click(screen.getByRole('button', { name: /^DV020/ }))
    expect(JSON.parse(editor.value)).toEqual({
      BangDienTuID: requests.DV020.DigitalSignageID,
      NguonID: requests.DV020.SourceID,
    })
  })

  it('reports conflicting aliases without sending a packet', async () => {
    mount(<ServicesPage />)
    const editor =
      await screen.findByLabelText<HTMLTextAreaElement>('Request JSON')
    const packet = JSON.parse(editor.value) as Packet
    packet.SourceID = 'another-source'
    fireEvent.change(editor, { target: { value: JSON.stringify(packet) } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi request' }))
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Tên trường bị trùng sau khi chuyển đổi: SourceID',
    )
    expect(informationSourceService.execute).not.toHaveBeenCalled()
  })

  it('shows request errors above the editor and does not report received bulletins', async () => {
    vi.mocked(informationSourceService.execute).mockRejectedValue(
      new Error('Thiết bị chưa được khai báo'),
    )
    mount(<ServicesPage />)
    const editor = await screen.findByLabelText('Request JSON')
    fireEvent.click(screen.getByRole('button', { name: 'Gửi request' }))
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('Thiết bị chưa được khai báo')
    expect(
      alert.compareDocumentPosition(editor) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      screen.queryByRole('link', { name: 'Xem bản tin vừa gửi' }),
    ).toBeNull()
  })
})
