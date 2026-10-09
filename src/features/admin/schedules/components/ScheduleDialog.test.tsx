import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/config/i18n'
import { mediaService } from '@/features/admin/media/services/mediaService'
import type { MediaRecord } from '@/features/admin/media/types'
import { usePermission } from '@/features/auth/hooks/usePermission'
import type { ScheduleItem } from '../types'
import { ScheduleDialog } from './ScheduleDialog'

vi.mock('@/features/territory/useTerritory', () => ({
  useTerritory: () => ({ access: { hasFullAccess: true, scopes: [] } }),
}))
vi.mock('@/features/auth/hooks/usePermission', () => ({
  usePermission: vi.fn(),
}))
vi.mock('@/features/admin/media/services/mediaService', () => ({
  mediaService: { upload: vi.fn() },
}))

const media: MediaRecord = {
  id: 'media-1',
  userId: 'admin',
  name: 'ban-tin.mp3',
  originalName: 'ban-tin.mp3',
  path: '/ban-tin.mp3',
  url: '/uploads/ban-tin.mp3',
  storageMode: 'SOURCE',
  mimeType: 'audio/mpeg',
  extension: 'mp3',
  size: 5,
  folder: '/',
  width: null,
  height: null,
  altText: null,
  createdAt: '2026-10-07T08:00:00',
  updatedAt: '2026-10-07T08:00:00',
}
const fileAttachment = {
  type: 'upload' as const,
  mediaId: media.id,
  name: media.name,
  url: media.url,
  mimeType: media.mimeType,
  size: media.size,
}
const item: ScheduleItem = {
  id: 'schedule-1',
  title: 'Bản tin sáng',
  content: 'Nội dung bản tin sáng',
  category: 'normal',
  channel: 'radio',
  area: 'Phường Phan Đình Phùng',
  provinceCode: '19',
  wardCode: '5443',
  scheduledAt: '2026-10-07T08:00:00',
  status: 'pending',
  deviceCount: 12,
}

function setup(existing?: ScheduleItem, mode?: 'view') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const onSave = vi.fn().mockResolvedValue(undefined)
  const onClose = vi.fn()
  const view = render(
    <QueryClientProvider client={client}>
      <ScheduleDialog
        mode={mode ?? (existing ? 'edit' : 'create')}
        item={existing}
        selectedDate={new Date(2026, 9, 7)}
        saving={false}
        onSave={onSave}
        onClose={onClose}
      />
    </QueryClientProvider>,
  )
  return { view, onSave, onClose }
}

describe('schedule content sources', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
    await i18n.changeLanguage('vi')
    vi.mocked(usePermission).mockReturnValue(true)
    vi.mocked(mediaService.upload).mockResolvedValue(media)
  })
  afterEach(cleanup)

  it('shows the selected source field and saves a trimmed URL without uploading the inactive file', async () => {
    const { view, onSave } = setup()
    fireEvent.change(view.getByLabelText('Tên lịch phát'), {
      target: { value: item.title },
    })
    fireEvent.change(view.getByLabelText('Nội dung bản tin'), {
      target: { value: item.content },
    })
    fireEvent.change(view.getByLabelText('Tệp đính kèm'), {
      target: { files: [new File(['audio'], media.name)] },
    })
    expect(mediaService.upload).not.toHaveBeenCalled()
    expect(view.queryByLabelText('URL nội dung')).toBeNull()
    fireEvent.change(view.getByLabelText('Nguồn nội dung'), {
      target: { value: 'url' },
    })
    expect(view.queryByLabelText('Tệp đính kèm')).toBeNull()
    fireEvent.change(view.getByLabelText('URL nội dung'), {
      target: { value: '  https://example.com/ban-tin.mp3  ' },
    })
    fireEvent.click(view.getByRole('button', { name: 'Lưu lịch phát' }))
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          attachment: { type: 'url', url: 'https://example.com/ban-tin.mp3' },
        }),
      ),
    )
    expect(mediaService.upload).not.toHaveBeenCalled()
  })

  it('rejects invalid URLs and lets existing text schedules save without an attachment', async () => {
    const { view, onSave } = setup(item)
    fireEvent.change(view.getByLabelText('Nguồn nội dung'), {
      target: { value: 'url' },
    })
    fireEvent.change(view.getByLabelText('URL nội dung'), {
      target: { value: 'javascript:alert(1)' },
    })
    fireEvent.click(view.getByRole('button', { name: 'Lưu lịch phát' }))
    expect(view.getByRole('alert').textContent).toContain('URL hợp lệ')
    expect(onSave).not.toHaveBeenCalled()
    fireEvent.change(view.getByLabelText('URL nội dung'), {
      target: { value: '' },
    })
    fireEvent.click(view.getByRole('button', { name: 'Lưu lịch phát' }))
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ attachment: undefined }),
      ),
    )
  })

  it('uploads on save, locks the form while pending, and saves the returned media reference once', async () => {
    let completeUpload!: (value: MediaRecord) => void
    vi.mocked(mediaService.upload).mockImplementation(
      () => new Promise((resolve) => (completeUpload = resolve)),
    )
    const { view, onSave } = setup(item)
    const file = new File(['audio'], media.name, { type: 'audio/mpeg' })
    fireEvent.change(view.getByLabelText('Tệp đính kèm'), {
      target: { files: [file] },
    })
    fireEvent.click(view.getByRole('button', { name: 'Lưu lịch phát' }))
    await waitFor(() => expect(mediaService.upload).toHaveBeenCalledWith(file))
    const pendingButton = view.getByRole('button', { name: 'Đang tải tệp...' })
    expect(pendingButton.matches(':disabled')).toBe(true)
    fireEvent.click(pendingButton)
    expect(onSave).not.toHaveBeenCalled()
    completeUpload(media)
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ attachment: fileAttachment }),
      ),
    )
    expect(mediaService.upload).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('keeps the form open on an upload failure and reuses a successful upload when saving is retried', async () => {
    vi.mocked(mediaService.upload).mockRejectedValueOnce(
      new Error('Không thể tải tệp'),
    )
    const { view, onSave, onClose } = setup(item)
    fireEvent.change(view.getByLabelText('Tệp đính kèm'), {
      target: { files: [new File(['audio'], media.name)] },
    })
    fireEvent.click(view.getByRole('button', { name: 'Lưu lịch phát' }))
    expect((await view.findByRole('alert')).textContent).toContain(
      'Không thể tải tệp',
    )
    expect(onSave).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    onSave.mockRejectedValueOnce(new Error('Không thể lưu lịch'))
    fireEvent.click(view.getByRole('button', { name: 'Lưu lịch phát' }))
    await waitFor(() =>
      expect(view.getByRole('alert').textContent).toContain(
        'Không thể lưu lịch',
      ),
    )
    fireEvent.click(view.getByRole('button', { name: 'Lưu lịch phát' }))
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2))
    expect(mediaService.upload).toHaveBeenCalledTimes(2)
    expect(onSave).toHaveBeenLastCalledWith(
      expect.objectContaining({ attachment: fileAttachment }),
    )
  })

  it('preserves saved files during editing and can remove the attachment', async () => {
    const { view, onSave } = setup({ ...item, attachment: fileAttachment })
    expect(view.getByText(media.name)).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: 'Lưu lịch phát' }))
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ attachment: fileAttachment }),
      ),
    )
    await waitFor(() =>
      expect(
        view
          .getByRole('button', { name: 'Lưu lịch phát' })
          .matches(':disabled'),
      ).toBe(false),
    )
    fireEvent.click(view.getByRole('button', { name: 'Bỏ tệp đính kèm' }))
    fireEvent.click(view.getByRole('button', { name: 'Lưu lịch phát' }))
    await waitFor(() =>
      expect(onSave).toHaveBeenLastCalledWith(
        expect.objectContaining({ attachment: undefined }),
      ),
    )
    expect(mediaService.upload).not.toHaveBeenCalled()
  })

  it('loads a saved URL when editing and shows it in schedule details', () => {
    const existing: ScheduleItem = {
      ...item,
      attachment: { type: 'url', url: 'https://example.com/video.mp4' },
    }
    const { view } = setup(existing)
    expect(
      (view.getByLabelText('URL nội dung') as HTMLInputElement).value,
    ).toBe(existing.attachment?.url)
    cleanup()
    const details = setup(existing, 'view')
    expect(
      details.view
        .getByRole('link', { name: existing.attachment?.url })
        .getAttribute('href'),
    ).toBe(existing.attachment?.url)
  })

  it('disables new uploads without Media permission while keeping the URL source available', () => {
    vi.mocked(usePermission).mockReturnValue(false)
    const { view } = setup(item)
    expect(
      view.getByRole('button', { name: 'Chọn tệp' }).matches(':disabled'),
    ).toBe(true)
    expect(
      view.getByText('Bạn không có quyền tải tệp lên thư viện Media.'),
    ).toBeTruthy()
    fireEvent.change(view.getByLabelText('Nguồn nội dung'), {
      target: { value: 'url' },
    })
    expect(view.getByLabelText('URL nội dung').matches(':disabled')).toBe(false)
    expect(mediaService.upload).not.toHaveBeenCalled()
  })
})
