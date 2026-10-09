import { demoAreas } from '@/features/territory/demoAreas'
import type { Device, DeviceFilters, DeviceStatus, DeviceType } from '../types'

const areas = demoAreas

const statusFor = (index: number): DeviceStatus =>
  index < 1156
    ? 'active'
    : index < 1208
      ? 'offline'
      : index < 1236
        ? 'error'
        : 'maintenance'

const typeFor = (index: number): DeviceType =>
  index > 0 && index % 7 === 0
    ? 'display'
    : index > 0 && index % 11 === 0
      ? 'camera'
      : 'speaker'

const isFirmwareHistory = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.every(
    (event: unknown) =>
      typeof event === 'object' &&
      event !== null &&
      typeof (event as { version?: unknown }).version === 'string' &&
      typeof (event as { updatedAt?: unknown }).updatedAt === 'string' &&
      !Number.isNaN(Date.parse((event as { updatedAt: string }).updatedAt)) &&
      ['installed', 'updated'].includes(
        (event as { kind?: string }).kind ?? '',
      ),
  )

const makeDevice = (index: number): Device => {
  const area = areas[index % areas.length]
  const type = typeFor(index)
  const serial = String(index + 1).padStart(3, '0')
  const longitude = area.longitude + Math.sin(index * 19.7) * 0.058
  const latitude = area.latitude + Math.cos(index * 13.3) * 0.043
  return {
    id: `TN-${type === 'speaker' ? 'PT' : type === 'display' ? 'DH' : 'IP'}-${serial}`,
    name:
      index === 0
        ? 'Cụm thu phát thanh UBND phường Phan Đình Phùng'
        : `${type === 'display' ? 'Bảng tin điện tử' : type === 'camera' ? 'Camera giám sát' : 'Cụm thu phát thanh'} ${serial}`,
    type,
    area: area.name,
    provinceCode: area.provinceCode,
    wardCode: area.wardCode,
    address:
      index === 0 ? 'UBND phường Phan Đình Phùng' : `${area.name}, Thái Nguyên`,
    longitude,
    latitude,
    status: statusFor(index),
    firmware: `v1.${index % 4}.${index % 5}`,
    installedAt: '2024-06-15',
    uptimeDays: 2 + ((index * 7) % 28),
    signal: -55 - (index % 24),
    nextBroadcast: index % 3 === 0 ? '2026-10-01T16:00' : '',
    program: index % 3 === 0 ? 'Tuyên truyền ATGT' : '',
    cpu: 32 + (index % 19),
    ram: 45 + (index % 21),
    storage: 68 + (index % 18),
    temperature: 38 + (index % 8),
    volume: 80,
  }
}

export const initialDevices: Device[] = Array.from(
  { length: 1248 },
  (_, index) => makeDevice(index),
)

export function filterDevices(items: Device[], filters: DeviceFilters) {
  const search = filters.search.trim().toLocaleLowerCase()
  return items.filter(
    (item) =>
      (filters.type === 'all' || item.type === filters.type) &&
      (filters.status === 'all' || item.status === filters.status) &&
      (filters.area === 'all' || item.area === filters.area) &&
      (!search ||
        [item.id, item.name, item.area, item.address].some((field) =>
          field.toLocaleLowerCase().includes(search),
        )),
  )
}

export const deviceAreas = areas.map((area) => area.name)

export function parseDeviceImport(raw: string): Device[] {
  const data: unknown = JSON.parse(raw)
  if (
    !Array.isArray(data) ||
    !data.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Device).id === 'string' &&
        !!(item as Device).id.trim() &&
        typeof (item as Device).name === 'string' &&
        typeof (item as Device).area === 'string' &&
        typeof (item as Device).address === 'string' &&
        ['speaker', 'display', 'camera'].includes((item as Device).type) &&
        ['active', 'offline', 'error', 'maintenance'].includes(
          (item as Device).status,
        ) &&
        typeof (item as Device).longitude === 'number' &&
        Math.abs((item as Device).longitude) <= 180 &&
        typeof (item as Device).latitude === 'number' &&
        Math.abs((item as Device).latitude) <= 90 &&
        typeof (item as Device).firmware === 'string' &&
        ((item as Device).firmwareHistory === undefined ||
          isFirmwareHistory((item as Device).firmwareHistory)) &&
        typeof (item as Device).installedAt === 'string' &&
        typeof (item as Device).uptimeDays === 'number' &&
        typeof (item as Device).signal === 'number' &&
        typeof (item as Device).nextBroadcast === 'string' &&
        typeof (item as Device).program === 'string' &&
        typeof (item as Device).cpu === 'number' &&
        typeof (item as Device).ram === 'number' &&
        typeof (item as Device).storage === 'number' &&
        typeof (item as Device).temperature === 'number' &&
        ((item as Partial<Device>).volume === undefined ||
          (typeof (item as Device).volume === 'number' &&
            Number.isFinite((item as Device).volume) &&
            (item as Device).volume >= 0 &&
            (item as Device).volume <= 100)),
    )
  )
    throw new Error('Invalid device import')
  return (data as Array<Partial<Device>>).map((item) => ({
    ...item,
    volume: item.volume ?? 80,
  })) as Device[]
}
