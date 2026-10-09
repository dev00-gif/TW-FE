import {
  canAccessTerritory,
  assertTerritory,
} from '@/features/territory/access'
import { demoAreas } from '@/features/territory/demoAreas'
import type { TerritoryAccess } from '@/features/territory/access'
import {
  filterDevices,
  initialDevices,
  parseDeviceImport,
} from './deviceMockService'
import type { Device, DeviceFilters } from '../types'

const STORAGE_KEY = 'somics-demo-devices'
let fallbackItems: Device[] = initialDevices

function readDevices(): Device[] {
  if (typeof window === 'undefined') return initialDevices
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return saved
      ? parseDeviceImport(saved).map((item) => {
          if (item.provinceCode) return item
          const legacyNames = [
            'TP. Thái Nguyên',
            'Đại Từ',
            'Định Hóa',
            'Phú Lương',
            'Võ Nhai',
            'Đồng Hỷ',
            'Sông Công',
            'Phú Bình',
          ]
          const area = demoAreas.find(
            (candidate, index) =>
              legacyNames[index] === item.area || candidate.name === item.area,
          )
          return area
            ? {
                ...item,
                area: area.name,
                provinceCode: area.provinceCode,
                wardCode: area.wardCode,
              }
            : item
        })
      : initialDevices
  } catch {
    return fallbackItems
  }
}

function writeDevices(items: Device[]) {
  fallbackItems = items
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Keep mock edits in memory when browser storage is unavailable.
  }
}

export const deviceService = {
  list(filters: DeviceFilters, access?: TerritoryAccess) {
    const items = readDevices().filter(
      (item) => !access || canAccessTerritory(access, item),
    )
    const counts = {
      all: items.length,
      active: items.filter((item) => item.status === 'active').length,
      offline: items.filter((item) => item.status === 'offline').length,
      error: items.filter((item) => item.status === 'error').length,
      maintenance: items.filter((item) => item.status === 'maintenance').length,
    }
    return { items, filtered: filterDevices(items, filters), counts }
  },
  detail(id: string, access?: TerritoryAccess) {
    return (
      readDevices().find(
        (item) =>
          item.id === id && (!access || canAccessTerritory(access, item)),
      ) ?? null
    )
  },
  async upsert(device: Device, access?: TerritoryAccess) {
    if (access) assertTerritory(access, device)
    const items = readDevices()
    const old = items.find((item) => item.id === device.id)
    if (old && access) assertTerritory(access, old)
    const exists = items.some((item) => item.id === device.id)
    writeDevices(
      exists
        ? items.map((item) => (item.id === device.id ? device : item))
        : [device, ...items],
    )
    return device
  },
  async importMany(devices: Device[], access?: TerritoryAccess) {
    if (access) {
      const current = readDevices()
      for (const device of devices) {
        assertTerritory(access, device)
        const old = current.find((item) => item.id === device.id)
        if (old) assertTerritory(access, old)
      }
    }
    const byId = new Map(readDevices().map((item) => [item.id, item]))
    devices.forEach((item) => byId.set(item.id, item))
    writeDevices([...byId.values()])
    return devices
  },
}
