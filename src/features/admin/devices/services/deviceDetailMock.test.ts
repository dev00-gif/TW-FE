import { describe, expect, it } from 'vitest'
import {
  getDeviceActivity,
  getDeviceFirmwareHistory,
  getResourceHistory,
} from './deviceDetailMock'
import { initialDevices } from './deviceMockService'

const device = initialDevices[0]

describe('device detail mock data', () => {
  it('creates distinct upcoming and recent broadcasts for a device', () => {
    const { upcoming, recent } = getDeviceActivity(device)
    expect(upcoming).toHaveLength(4)
    expect(recent).toHaveLength(4)
    expect(new Set([...upcoming, ...recent].map((item) => item.id)).size).toBe(
      8,
    )
  })

  it('creates 24-hour and 7-day chart series with valid values', () => {
    const daily = getResourceHistory(device, 'day')
    const weekly = getResourceHistory(device, 'week')
    expect(daily).toHaveLength(72)
    expect(weekly).toHaveLength(21)
    expect(daily.every((point) => point.value >= 0 && point.value <= 100)).toBe(
      true,
    )
    expect(new Set(daily.map((point) => point.metric))).toEqual(
      new Set(['cpu', 'ram', 'temperature']),
    )
  })

  it('starts firmware history at installation and uses saved updates', () => {
    expect(getDeviceFirmwareHistory(device)).toEqual([
      {
        version: device.firmware,
        updatedAt: device.installedAt,
        kind: 'installed',
      },
    ])
    const update = {
      version: 'v1.2.4',
      updatedAt: '2026-10-01T10:00:00.000Z',
      kind: 'updated' as const,
    }
    expect(
      getDeviceFirmwareHistory({
        ...device,
        firmware: update.version,
        firmwareHistory: [update, ...getDeviceFirmwareHistory(device)],
      }),
    ).toEqual([update, ...getDeviceFirmwareHistory(device)])
  })
})
