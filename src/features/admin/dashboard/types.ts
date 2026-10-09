export type DeviceStatus = 'active' | 'warning' | 'offline' | 'maintenance'
export type BroadcastChannel = 'radio' | 'digital'

export interface DashboardOverview {
  metrics: {
    devices: number
    broadcasts: number
    schedules: number
    emergency: number
  }
  statuses: { status: DeviceStatus; count: number }[]
  locations: {
    id: string
    name: string
    longitude: number
    latitude: number
    count: number
    status: DeviceStatus
    channel: BroadcastChannel
  }[]
  broadcasts: { day: string; channel: BroadcastChannel; count: number }[]
  recent: {
    id: string
    title: string
    channel: BroadcastChannel | 'both'
    status: 'live' | 'published' | 'scheduled'
    urgent?: boolean
    time: string
    date: string
    image: string
  }[]
}
