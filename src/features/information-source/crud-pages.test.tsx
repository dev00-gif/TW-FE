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
import { BusinessDataPage, ServiceConfigurationsPage } from './crud-pages'
import { sourceCrud } from './crud-service'
import { mediaService } from '@/features/admin/media/services/mediaService'
import { resolveMediaUrl } from '@/features/admin/media/utils/mediaUrl'
import type { MediaRecord } from '@/features/admin/media/types'
import type { ServiceConfiguration } from './crud-service'
import type { ServiceCode, ServiceDefinition } from './types'
import requests from './test-data/appendix-examples.json'
import responses from './test-data/appendix-responses.json'

const catalog: ServiceDefinition[] = Object.entries(requests).map(
  ([code, example]) => ({
    code: code as ServiceCode,
    name: code,
    path: '/',
    channel: 'shared',
    direction: 'device-to-source',
    operation: 'status',
    providerDefined: false,
    required: Object.keys(example),
    example,
    responseExample: responses[code as ServiceCode],
  }),
)
const search = vi.hoisted(() => ({ kind: 'notifications' }))
const can = vi.fn<(permission: string) => boolean>(() => true)
vi.mock('@/features/auth/hooks/usePermission', () => ({
  usePermission: (permission: string) => can(permission),
}))
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useCurrentUser: () => ({ id: 'owner' }),
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useSearch: () => search,
}))
vi.mock('./hooks', () => ({
  sourceKeys: { all: ['information-source'] },
  useServiceCatalog: () => ({ data: catalog }),
  useWorkspace: () => ({ data: { counts: {}, devices: [], bulletins: [] } }),
}))
vi.mock('./components', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  return {
    ...original,
    SourcePage: ({
      children,
      title,
      actions,
    }: {
      children: ReactNode
      title: string
      actions?: ReactNode
    }) => (
      <>
        <h1>{title}</h1>
        {actions}
        {children}
      </>
    ),
  }
})
vi.mock('./crud-service', () => ({
  sourceCrud: {
    configurations: vi.fn(),
    configuration: vi.fn(),
    saveConfiguration: vi.fn(),
    deleteConfiguration: vi.fn(),
    list: vi.fn(),
    detail: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/features/admin/media/services/mediaService', () => ({
  mediaService: { upload: vi.fn() },
}))
vi.mock('@/utils/toast', () => ({ toast: { success: vi.fn() } }))
const row: ServiceConfiguration = {
  id: 'configuration-id',
  serviceCode: 'DV002',
  name: 'Mẫu đã lưu',
  description: 'Demo',
  enabled: true,
  requestPacket: requests.DV002,
  responsePacket: responses.DV002,
  revision: 4,
  createdAt: '2026-10-09T00:00:00Z',
  updatedAt: '2026-10-09T00:00:00Z',
}
const mount = (component: ReactNode) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {component}
    </QueryClientProvider>,
  )

afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  search.kind = 'notifications'
  can.mockReturnValue(true)
  vi.mocked(sourceCrud.configurations).mockResolvedValue({
    items: [row],
    total: 1,
    limit: 200,
  })
  vi.mocked(sourceCrud.configuration).mockResolvedValue(row)
  vi.mocked(sourceCrud.saveConfiguration).mockResolvedValue(row)
  vi.mocked(sourceCrud.deleteConfiguration).mockResolvedValue({ deleted: true })
  vi.mocked(sourceCrud.list).mockResolvedValue({
    items: [],
    total: 0,
    limit: 200,
  })
  vi.mocked(sourceCrud.save).mockResolvedValue({
    id: 'notice-id',
    title: 'Thông báo mới',
    createdAt: '',
    updatedAt: '',
  })
})

describe('service configuration and business CRUD screens', () => {
  it('shows all 20 service selectors and saves the documented English request/response', async () => {
    mount(<ServiceConfigurationsPage />)
    await screen.findByText('Mẫu đã lưu')
    fireEvent.click(screen.getByRole('button', { name: 'Thêm cấu hình' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Dịch vụ' }), {
      target: { value: 'DV001' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Tên cấu hình' }), {
      target: { value: 'Auth template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu cấu hình' }))
    await waitFor(() => expect(sourceCrud.saveConfiguration).toHaveBeenCalled())
    const input = vi.mocked(sourceCrud.saveConfiguration).mock.calls[0][0]
    expect(input.serviceCode).toBe('DV001')
    expect(input.requestPacket).toEqual(requests.DV001)
    expect(input.responsePacket).toEqual(responses.DV001)
    expect(input.requestPacket.Password).toBe(requests.DV001.Password)
  })

  it('reads the current revision before editing and includes it when saving', async () => {
    mount(<ServiceConfigurationsPage />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Sửa Mẫu đã lưu' }),
    )
    fireEvent.change(
      await screen.findByRole('textbox', { name: 'Tên cấu hình' }),
      { target: { value: 'Updated template' } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Lưu cấu hình' }))
    await waitFor(() =>
      expect(sourceCrud.saveConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Updated template', revision: 4 }),
        row.id,
      ),
    )
    expect(sourceCrud.configuration).toHaveBeenCalledWith(row.id)
  })

  it('waits for confirmation before deleting a saved template', async () => {
    mount(<ServiceConfigurationsPage />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Xóa Mẫu đã lưu' }),
    )
    expect(sourceCrud.deleteConfiguration).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa' }))
    await waitFor(() =>
      expect(sourceCrud.deleteConfiguration).toHaveBeenCalledWith(row.id),
    )
  })

  it('hides mutation actions for a viewer', async () => {
    can.mockReturnValue(false)
    mount(<ServiceConfigurationsPage />)
    await screen.findByText('Mẫu đã lưu')
    expect(screen.queryByRole('button', { name: 'Thêm cấu hình' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Sửa Mẫu đã lưu' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Xóa Mẫu đã lưu' })).toBeNull()
  })

  it('saves a new bulletin as a draft by default', async () => {
    search.kind = 'bulletins'
    mount(<BusinessDataPage />)
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm bản tin' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lưu dữ liệu' }))
    await waitFor(() =>
      expect(sourceCrud.save).toHaveBeenCalledWith(
        'bulletins',
        expect.objectContaining({ publicationStatus: 'draft' }),
        undefined,
      ),
    )
  })

  it('creates a draft and sends the publication status when publishing a bulletin', async () => {
    search.kind = 'bulletins'
    mount(<BusinessDataPage />)
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm bản tin' }))
    expect(
      (
        screen.getByRole('combobox', {
          name: 'Trạng thái bản tin',
        })
      ).value,
    ).toBe('draft')
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Trạng thái bản tin' }),
      { target: { value: 'published' } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Lưu dữ liệu' }))
    await waitFor(() =>
      expect(sourceCrud.save).toHaveBeenCalledWith(
        'bulletins',
        expect.objectContaining({
          publicationStatus: 'published',
          channel: 'radio',
        }),
        undefined,
      ),
    )
  })

  it('creates a notification through the business-data form', async () => {
    mount(<BusinessDataPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Thêm thông báo' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Tiêu đề' }), {
      target: { value: 'Thông báo vận hành' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Nội dung' }), {
      target: { value: 'Thiết bị đã kết nối' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu dữ liệu' }))
    await waitFor(() =>
      expect(sourceCrud.save).toHaveBeenCalledWith(
        'notifications',
        {
          serviceCode: 'DV002',
          title: 'Thông báo vận hành',
          body: 'Thiết bị đã kết nối',
          severity: 'info',
          read: false,
        },
        undefined,
      ),
    )
  })
})

describe('bulletin MP3 upload', () => {
  const openBulletin = async () => {
    search.kind = 'bulletins'
    mount(<BusinessDataPage />)
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm bản tin' }))
    return screen.getByLabelText<HTMLInputElement>('Tệp âm thanh MP3')
  }

  it('blocks save during upload, resolves the API URL and saves Content as an English string field', async () => {
    const input = await openBulletin()
    let finish!: (media: MediaRecord) => void
    vi.mocked(mediaService.upload).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const file = new File(['audio'], 'ban tin.mp3', { type: 'audio/mpeg' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(mediaService.upload).toHaveBeenCalledWith(file)
    expect(
      screen
        .getByRole('button', { name: 'Đang tải tệp…' })
        .hasAttribute('disabled'),
    ).toBe(true)
    finish({ url: '/images/ban tin.mp3' } as MediaRecord)
    const url = resolveMediaUrl('/images/ban tin.mp3')
    await waitFor(() =>
      expect(
        screen.getByLabelText<HTMLInputElement>('Đường dẫn âm thanh').value,
      ).toBe(url),
    )
    expect(screen.getByLabelText('Nghe thử bản tin').getAttribute('src')).toBe(
      url,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Lưu dữ liệu' }))
    await waitFor(() =>
      expect(sourceCrud.save).toHaveBeenCalledWith(
        'bulletins',
        expect.objectContaining({
          channel: 'radio',
          packet: expect.objectContaining({
            Content: url,
            Title: 'Bản tin mới',
            Priority: '3',
          }),
        }),
        undefined,
      ),
    )
  })

  it('rejects non-MP3 and empty files without uploading them', async () => {
    const input = await openBulletin()
    fireEvent.change(input, {
      target: { files: [new File(['text'], 'news.txt')] },
    })
    expect(
      await screen.findByText('Vui lòng chọn tệp âm thanh có đuôi .mp3'),
    ).toBeDefined()
    fireEvent.change(input, { target: { files: [new File([], 'empty.mp3')] } })
    expect(await screen.findByText('Tệp MP3 không được rỗng')).toBeDefined()
    expect(mediaService.upload).not.toHaveBeenCalled()
  })

  it('preserves the existing Content and reports an upload error', async () => {
    vi.mocked(mediaService.upload).mockRejectedValue(
      new Error('Upload không thành công'),
    )
    const input = await openBulletin()
    const before =
      screen.getByLabelText<HTMLInputElement>('Đường dẫn âm thanh').value
    fireEvent.change(input, {
      target: { files: [new File(['audio'], 'news.mp3')] },
    })
    expect(await screen.findByText('Upload không thành công')).toBeDefined()
    expect(
      screen.getByLabelText<HTMLInputElement>('Đường dẫn âm thanh').value,
    ).toBe(before)
    expect(sourceCrud.save).not.toHaveBeenCalled()
  })

  it('requires Media permissions for upload while keeping manual Content available', async () => {
    can.mockImplementation((permission) => !permission.startsWith('media.'))
    const input = await openBulletin()
    expect(input.disabled).toBe(true)
    expect(
      screen.getByLabelText<HTMLInputElement>('Đường dẫn âm thanh').disabled,
    ).toBe(false)
  })
})
