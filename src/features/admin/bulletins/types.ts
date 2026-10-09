export type BulletinType =
  | 'news'
  | 'notice'
  | 'warning'
  | 'emergency'
  | 'campaign'
export type BulletinChannel = 'radio' | 'display'
export type BulletinPriority = 'low' | 'medium' | 'high'
export type BulletinStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'published'
  | 'rejected'

export type BulletinAttachment = {
  id: string
  name: string
  url: string
  mimeType: string
  size: number
}

export type BulletinCategory = {
  id: string
  name: string
  slug: string
  description: string
  parentId: string | null
}

export type Bulletin = {
  id: string
  title: string
  content: string
  type: BulletinType
  channels: BulletinChannel[]
  area: string
  priority: BulletinPriority
  status: BulletinStatus
  image: string
  createdAt: string
  author: string
  reviewer?: string
  reviewedAt?: string
  summary?: string
  topics?: string[]
  source?: string
  language?: string
  effectiveFrom?: string
  effectiveTo?: string
  attachments?: BulletinAttachment[]
  categoryIds?: string[]
}

export type BulletinDraft = Pick<
  Bulletin,
  | 'title'
  | 'content'
  | 'type'
  | 'channels'
  | 'area'
  | 'priority'
  | 'status'
  | 'image'
> &
  Partial<
    Pick<
      Bulletin,
      | 'summary'
      | 'topics'
      | 'source'
      | 'language'
      | 'effectiveFrom'
      | 'effectiveTo'
      | 'attachments'
      | 'author'
      | 'categoryIds'
    >
  >

export type BulletinFilters = {
  search: string
  type: BulletinType | 'all'
  channel: BulletinChannel | 'all'
  priority: BulletinPriority | 'all'
  area: string
  status: BulletinStatus | 'all'
  author: string
  from: string
  to: string
  page: number
  limit: number
}
