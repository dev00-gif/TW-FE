export type DeviceStatus = 'active' | 'offline' | 'error' | 'maintenance'
export type DeviceType = 'speaker' | 'display' | 'camera'

export type DeviceDetailTab =
  | 'overview'
  | 'status'
  | 'config'
  | 'schedule'
  | 'firmware'
  | 'broadcasts'
  | 'maintenance'
  | 'files'
  | 'remote'

export type Device = {
  provinceCode?: string
  wardCode?: string
  id: string
  name: string
  type: DeviceType
  area: string
  address: string
  longitude: number
  latitude: number
  status: DeviceStatus
  firmware: string
  firmwareHistory?: DeviceFirmwareEvent[]
  installedAt: string
  uptimeDays: number
  signal: number
  nextBroadcast: string
  program: string
  cpu: number
  ram: number
  storage: number
  temperature: number
  volume: number
}

export type DeviceFirmwareEvent = {
  version: string
  updatedAt: string
  kind: 'installed' | 'updated'
}

export type DeviceFilters = {
  search: string
  type: DeviceType | 'all'
  status: DeviceStatus | 'all'
  area: string
}
