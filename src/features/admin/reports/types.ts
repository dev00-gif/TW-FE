export type ReportCategory = 'normal' | 'emergency' | 'warning' | 'other'
export type ReportPeriod = 'day' | 'week' | 'month' | 'year'

export type ReportFilters = {
  from: string
  to: string
  area: string
}

export type ReportDay = {
  date: string
  normal: number
  emergency: number
  warning: number
  other: number
  success: number
  failed: number
  durationMinutes: number
}

export type ReportArea = {
  id: string
  name: string
  longitude: number
  latitude: number
  broadcasts: number
  successRate: number
}

export type ReportDevice = {
  id: string
  broadcasts: number
  successRate: number
}

export type FailedBroadcast = {
  id: string
  date: string
  title: string
  area: string
  device: string
  reason: 'offline' | 'connection' | 'file'
}

export type ReportOverview = {
  days: ReportDay[]
  areas: ReportArea[]
  devices: ReportDevice[]
  failures: FailedBroadcast[]
  metrics: {
    total: number
    success: number
    failed: number
    durationMinutes: number
    devices: number
  }
  durationByType: { type: ReportCategory; minutes: number }[]
}

export const reportCategories: ReportCategory[] = [
  'normal',
  'emergency',
  'warning',
  'other',
]
