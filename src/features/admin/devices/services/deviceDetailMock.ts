import type { Device, DeviceFirmwareEvent } from '../types'

export function getDeviceFirmwareHistory(
  device: Device,
): DeviceFirmwareEvent[] {
  return device.firmwareHistory?.length
    ? device.firmwareHistory
    : [
        {
          version: device.firmware,
          updatedAt: device.installedAt,
          kind: 'installed',
        },
      ]
}

export type DeviceActivity = {
  id: string
  titleKey: 'traffic' | 'evening' | 'morning' | 'weather' | 'fire'
  category: 'normal' | 'propaganda' | 'warning' | 'emergency'
  status: 'upcoming' | 'pending' | 'published'
  at: string
}

const atOffset = (days: number, hour: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

export function getDeviceActivity(device: Device) {
  const suffix = device.id
  const upcoming: DeviceActivity[] = [
    {
      id: `${suffix}-a`,
      titleKey: 'traffic',
      category: 'propaganda',
      status: 'upcoming',
      at: atOffset(0, 15),
    },
    {
      id: `${suffix}-b`,
      titleKey: 'evening',
      category: 'normal',
      status: 'pending',
      at: atOffset(0, 19),
    },
    {
      id: `${suffix}-c`,
      titleKey: 'morning',
      category: 'normal',
      status: 'pending',
      at: atOffset(1, 7),
    },
    {
      id: `${suffix}-d`,
      titleKey: 'weather',
      category: 'warning',
      status: 'pending',
      at: atOffset(1, 14),
    },
  ]
  const recent: DeviceActivity[] = [
    {
      id: `${suffix}-e`,
      titleKey: 'evening',
      category: 'normal',
      status: 'published',
      at: atOffset(-1, 19),
    },
    {
      id: `${suffix}-f`,
      titleKey: 'traffic',
      category: 'propaganda',
      status: 'published',
      at: atOffset(-1, 14),
    },
    {
      id: `${suffix}-g`,
      titleKey: 'weather',
      category: 'warning',
      status: 'published',
      at: atOffset(-1, 10),
    },
    {
      id: `${suffix}-h`,
      titleKey: 'morning',
      category: 'normal',
      status: 'published',
      at: atOffset(-1, 8),
    },
  ]
  return { upcoming, recent }
}

export type ResourceMetric = 'cpu' | 'ram' | 'temperature'
export type ResourcePoint = {
  point: number
  label: string
  metric: ResourceMetric
  value: number
}

export function getResourceHistory(
  device: Device,
  period: 'day' | 'week',
): ResourcePoint[] {
  const count = period === 'day' ? 24 : 7
  const metrics: ResourceMetric[] = ['cpu', 'ram', 'temperature']
  return metrics.flatMap((metric) =>
    Array.from({ length: count }, (_, point) => {
      const baseline =
        metric === 'cpu'
          ? device.cpu
          : metric === 'ram'
            ? device.ram
            : device.temperature
      const fluctuation =
        Math.sin(point * 0.9 + device.id.length) * 5 + Math.cos(point * 1.7) * 3
      return {
        point,
        label:
          period === 'day'
            ? `${String(point).padStart(2, '0')}:00`
            : `D${point + 1}`,
        metric,
        value: Math.max(0, Math.min(100, Math.round(baseline + fluctuation))),
      }
    }),
  )
}
