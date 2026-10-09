// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import i18n from '@/config/i18n'
import { DeviceQuickActions } from './DeviceQuickActions'

describe('DeviceQuickActions', () => {
  it('keeps demo actions and maintenance navigation working', async () => {
    await i18n.changeLanguage('vi')
    const onAction = vi.fn()
    const onTab = vi.fn()
    const view = render(
      <DeviceQuickActions onAction={onAction} onTab={onTab} />,
    )
    fireEvent.click(view.getByRole('button', { name: 'Phát thử âm thanh' }))
    fireEvent.click(view.getByRole('button', { name: 'Phát khẩn cấp' }))
    fireEvent.click(view.getByRole('button', { name: 'Bảo trì thiết bị' }))
    expect(onAction).toHaveBeenCalledWith('test')
    expect(onAction).toHaveBeenCalledWith('emergency')
    expect(onTab).toHaveBeenCalledWith('maintenance')
    expect(view.queryByRole('button', { name: 'Khởi động lại' })).toBeNull()
  })
})
