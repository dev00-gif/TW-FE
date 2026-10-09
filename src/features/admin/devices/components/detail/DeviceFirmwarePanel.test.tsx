// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import i18n from '@/config/i18n'
import { initialDevices } from '../../services/deviceMockService'
import { DeviceFirmwarePanel } from './DeviceFirmwarePanel'

describe('DeviceFirmwarePanel', () => {
  it('shows the current version and persisted demo update history', async () => {
    await i18n.changeLanguage('vi')
    const device = initialDevices[0]
    render(
      <DeviceFirmwarePanel
        device={{
          ...device,
          firmware: 'v1.2.4',
          firmwareHistory: [
            {
              version: 'v1.2.4',
              updatedAt: '2026-10-01T10:00:00.000Z',
              kind: 'updated',
            },
            {
              version: device.firmware,
              updatedAt: device.installedAt,
              kind: 'installed',
            },
          ],
        }}
      />,
    )
    expect(screen.getByText('Lịch sử cập nhật firmware')).toBeTruthy()
    expect(screen.getByText('Cài đặt ban đầu')).toBeTruthy()
    expect(screen.getByText('Cập nhật firmware')).toBeTruthy()
    expect(screen.getAllByText('v1.2.4').length).toBeGreaterThan(0)
    expect(screen.getByText(device.firmware)).toBeTruthy()
  })
})
