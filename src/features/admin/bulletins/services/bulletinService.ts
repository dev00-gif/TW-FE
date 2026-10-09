import type {
  Bulletin,
  BulletinDraft,
  BulletinFilters,
  BulletinStatus,
  BulletinType,
} from '../types'

const STORAGE_KEY = 'somics-demo-bulletins'
const images = [
  'https://images.unsplash.com/photo-1584515933487-779824d29309?w=360&q=75',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=360&q=75',
  'https://images.unsplash.com/photo-1599708153386-62d35f6a8d9a?w=360&q=75',
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=360&q=75',
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=360&q=75',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=360&q=75',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=360&q=75',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=360&q=75',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9?w=360&q=75',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=360&q=75',
] as const
const titles = [
  'Thông tin tuyên truyền phòng chống dịch bệnh mùa đông xuân',
  'Cảnh báo mưa lớn trên diện rộng tại khu vực miền núi',
  'Diễn tập phương án phòng cháy chữa cháy năm 2025',
  'Tuyên truyền an toàn giao thông dịp Tết Nguyên đán',
  'Thông báo lịch cúp điện phục vụ bảo trì lưới điện',
  'Giới thiệu mô hình nông nghiệp công nghệ cao',
  'Cảnh báo thời tiết nguy hiểm (áp thấp nhiệt đới)',
  'Bản tin thời sự địa phương ngày 17/01/2025',
  'Hướng dẫn cài đặt ứng dụng dịch vụ công trực tuyến',
  'Thông báo về việc tổ chức hội nghị cán bộ xã',
] as const
const types: BulletinType[] = [
  'news',
  'warning',
  'emergency',
  'news',
  'notice',
  'news',
  'warning',
  'news',
  'campaign',
  'notice',
]
const statuses: BulletinStatus[] = [
  'approved',
  'pending',
  'approved',
  'approved',
  'published',
  'published',
  'approved',
  'approved',
  'approved',
  'draft',
]
const areas = [
  'Toàn tỉnh',
  'Huyện Định Hóa',
  'TP. Thái Nguyên',
  'Huyện Phú Lương',
  'Huyện Đại Từ',
]
export const bulletinAreas = areas

export const initialBulletins: Bulletin[] = Array.from(
  { length: 128 },
  (_, index) => {
    const sample = index % titles.length
    const day = String(20 - (index % 18)).padStart(2, '0')
    const createdAt = `2025-01-${day}T${String(10 + (index % 8)).padStart(2, '0')}:25:00`
    const status =
      index < statuses.length
        ? statuses[index]
        : (
            [
              'draft',
              'pending',
              'approved',
              'approved',
              'approved',
              'published',
              'rejected',
            ] as const
          )[index % 7]
    return {
      id: `BN-2025-${String(index + 1).padStart(3, '0')}`,
      title:
        index < titles.length
          ? titles[index]
          : `${titles[sample]} (${index + 1})`,
      content:
        index < titles.length
          ? titles[index]
          : `${titles[sample]}. Nội dung bản tin mẫu phục vụ giao diện quản lý.`,
      type: types[sample],
      channels:
        index % 3 === 1
          ? ['radio']
          : index % 3 === 2
            ? ['display']
            : ['radio', 'display'],
      area: areas[index % areas.length],
      priority:
        index % 7 === 2 || index % 7 === 6
          ? 'high'
          : index % 7 === 1
            ? 'medium'
            : 'low',
      status,
      image: images[sample],
      createdAt,
      author: index % 2 === 0 ? 'Nguyễn Văn Minh' : 'Trần Thị Hoa',
      reviewer: ['approved', 'published'].includes(status)
        ? 'Trần Thị Hoa'
        : undefined,
      reviewedAt: ['approved', 'published'].includes(status)
        ? createdAt
        : undefined,
      summary: `${titles[sample]}. Thông tin được biên soạn để phát trên hệ thống thông tin nguồn của địa phương.`,
      topics:
        sample === 0
          ? ['Y tế', 'Phòng chống dịch bệnh']
          : [types[sample] === 'warning' ? 'Cảnh báo' : 'Thông tin địa phương'],
      source: 'UBND tỉnh Thái Nguyên',
      language: 'Tiếng Việt',
      effectiveFrom: createdAt,
      effectiveTo: `2025-01-31T23:59:00`,
      attachments: [],
      categoryIds: [`bulletin-category-${(sample % 5) + 1}`],
    }
  },
)

let fallbackItems = initialBulletins

function readItems(): Bulletin[] {
  if (typeof window === 'undefined') return initialBulletins
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return initialBulletins
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isBulletin))
      return initialBulletins
    return parsed
  } catch {
    return fallbackItems
  }
}

function writeItems(items: Bulletin[]) {
  fallbackItems = items
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Keep mock edits in memory when browser storage is unavailable.
  }
}

function isBulletin(value: unknown): value is Bulletin {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Bulletin>
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.content === 'string' &&
    typeof item.createdAt === 'string' &&
    !Number.isNaN(Date.parse(item.createdAt)) &&
    typeof item.area === 'string' &&
    typeof item.author === 'string' &&
    typeof item.image === 'string' &&
    (item.summary === undefined || typeof item.summary === 'string') &&
    (item.source === undefined || typeof item.source === 'string') &&
    (item.language === undefined || typeof item.language === 'string') &&
    (item.effectiveFrom === undefined ||
      typeof item.effectiveFrom === 'string') &&
    (item.effectiveTo === undefined || typeof item.effectiveTo === 'string') &&
    (item.topics === undefined ||
      (Array.isArray(item.topics) &&
        item.topics.every((topic) => typeof topic === 'string'))) &&
    (item.attachments === undefined ||
      (Array.isArray(item.attachments) &&
        item.attachments.every((attachment: unknown) => {
          if (!attachment || typeof attachment !== 'object') return false
          const record = attachment as Record<string, unknown>
          return (
            typeof record.id === 'string' &&
            typeof record.name === 'string' &&
            typeof record.url === 'string' &&
            typeof record.mimeType === 'string' &&
            typeof record.size === 'number' &&
            Number.isFinite(record.size)
          )
        }))) &&
    (item.categoryIds === undefined ||
      (Array.isArray(item.categoryIds) &&
        item.categoryIds.every((id) => typeof id === 'string'))) &&
    ['news', 'notice', 'warning', 'emergency', 'campaign'].includes(
      item.type ?? '',
    ) &&
    ['low', 'medium', 'high'].includes(item.priority ?? '') &&
    ['draft', 'pending', 'approved', 'published', 'rejected'].includes(
      item.status ?? '',
    ) &&
    Array.isArray(item.channels) &&
    item.channels.length > 0 &&
    item.channels.every((channel) => ['radio', 'display'].includes(channel))
  )
}

export function parseBulletinImport(raw: string): Bulletin[] {
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed) || !parsed.every(isBulletin))
    throw new Error('Invalid bulletin import')
  return parsed
}

export const bulletinService = {
  all() {
    return readItems()
  },
  detail(id: string) {
    return readItems().find((item) => item.id === id) ?? null
  },
  list(filters: BulletinFilters) {
    const all = readItems()
    const counts = {
      all: all.length,
      draft: all.filter((item) => item.status === 'draft').length,
      pending: all.filter((item) => item.status === 'pending').length,
      approved: all.filter((item) => item.status === 'approved').length,
      published: all.filter((item) => item.status === 'published').length,
      rejected: all.filter((item) => item.status === 'rejected').length,
    }
    const search = filters.search.trim().toLocaleLowerCase()
    const filtered = all.filter(
      (item) =>
        (!search ||
          [item.id, item.title, item.content, item.author].some((value) =>
            value.toLocaleLowerCase().includes(search),
          )) &&
        (filters.type === 'all' || item.type === filters.type) &&
        (filters.channel === 'all' ||
          item.channels.includes(filters.channel)) &&
        (filters.priority === 'all' || item.priority === filters.priority) &&
        (filters.area === 'all' || item.area === filters.area) &&
        (filters.status === 'all' || item.status === filters.status) &&
        (!filters.author ||
          item.author
            .toLocaleLowerCase()
            .includes(filters.author.trim().toLocaleLowerCase())) &&
        (!filters.from || item.createdAt.slice(0, 10) >= filters.from) &&
        (!filters.to || item.createdAt.slice(0, 10) <= filters.to),
    )
    const totalPages = Math.max(1, Math.ceil(filtered.length / filters.limit))
    const page = Math.min(filters.page, totalPages)
    return {
      items: filtered.slice((page - 1) * filters.limit, page * filters.limit),
      filtered,
      counts,
      meta: { page, limit: filters.limit, total: filtered.length, totalPages },
    }
  },
  async save(input: { id?: string; draft: BulletinDraft }) {
    const all = readItems()
    const existing = input.id
      ? all.find((item) => item.id === input.id)
      : undefined
    const item: Bulletin = {
      ...existing,
      ...input.draft,
      id:
        existing?.id ??
        `BN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      author: existing?.author ?? input.draft.author ?? 'Nguyễn Thị Lan',
      reviewer: ['approved', 'published'].includes(input.draft.status)
        ? existing?.reviewer
        : undefined,
      reviewedAt: ['approved', 'published'].includes(input.draft.status)
        ? existing?.reviewedAt
        : undefined,
    }
    writeItems(
      existing
        ? all.map((current) => (current.id === item.id ? item : current))
        : [item, ...all],
    )
    return item
  },
  async setStatus(input: { id: string; status: BulletinStatus }) {
    const all = readItems()
    const item = all.find((current) => current.id === input.id)
    if (!item) throw new Error('Bulletin not found')
    const updated: Bulletin = {
      ...item,
      status: input.status,
      reviewer: input.status === 'approved' ? 'Nguyễn Thị Lan' : item.reviewer,
      reviewedAt:
        input.status === 'approved'
          ? new Date().toISOString()
          : item.reviewedAt,
    }
    writeItems(
      all.map((current) => (current.id === input.id ? updated : current)),
    )
    return updated
  },
  async importMany(items: Bulletin[]) {
    const byId = new Map(readItems().map((item) => [item.id, item]))
    items.forEach((item) => byId.set(item.id, item))
    writeItems([...byId.values()])
    return items.length
  },
}
