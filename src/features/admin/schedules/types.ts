export type ScheduleCategory =
  | 'normal'
  | 'propaganda'
  | 'warning'
  | 'emergency'
  | 'maintenance'
export type ScheduleStatus = 'published' | 'pending' | 'cancelled'
export type ScheduleChannel = 'radio' | 'digital' | 'both'

export type ScheduleAttachment =
  | { type: 'url'; url: string }
  | {
      type: 'upload'
      mediaId: string
      name: string
      url: string
      mimeType: string
      size: number
    }

export interface ScheduleItem {
  provinceCode?: string
  wardCode?: string
  id: string
  title: string
  content: string
  category: ScheduleCategory
  channel: ScheduleChannel
  area: string
  scheduledAt: string
  status: ScheduleStatus
  image?: string
  attachment?: ScheduleAttachment
  deviceCount: number
}

export type ScheduleInput = Omit<ScheduleItem, 'id'>

export interface ScheduleFilters {
  from: string
  to: string
  search: string
  category: ScheduleCategory | 'all'
  channel: ScheduleChannel | 'all'
  status: ScheduleStatus | 'all'
  area: string
}
