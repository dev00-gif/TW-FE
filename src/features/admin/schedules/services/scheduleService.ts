import {
  canAccessTerritory,
  assertTerritory,
} from '@/features/territory/access'
import type { TerritoryAccess } from '@/features/territory/access'
import { demoAreas, provinceArea } from '@/features/territory/demoAreas'
import type { ScheduleFilters, ScheduleInput, ScheduleItem } from '../types'

const images = {
  city: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=120&q=80',
  weather:
    'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=120&q=80',
  traffic:
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=120&q=80',
  night:
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=120&q=80',
}

const seedDate = new Date()
const seedMonth = `${seedDate.getFullYear()}-${String(seedDate.getMonth() + 1).padStart(2, '0')}`
const daysInSeedMonth = new Date(
  seedDate.getFullYear(),
  seedDate.getMonth() + 1,
  0,
).getDate()

const schedule = (
  id: number,
  day: number,
  hour: string,
  title: string,
  category: ScheduleItem['category'],
  channel: ScheduleItem['channel'],
  status: ScheduleItem['status'],
  area = 'Cụm TP. Thái Nguyên',
  image = images.city,
): ScheduleItem => ({
  id: String(id),
  title,
  content: title,
  category,
  channel,
  status,
  area:
    area === 'Toàn tỉnh'
      ? provinceArea.name
      : area === 'Cụm khu vực phía Bắc'
        ? demoAreas[2].name
        : demoAreas[(id - 1) % demoAreas.length].name,
  provinceCode: '19',
  wardCode:
    area === 'Toàn tỉnh'
      ? undefined
      : area === 'Cụm khu vực phía Bắc'
        ? demoAreas[2].wardCode
        : demoAreas[(id - 1) % demoAreas.length].wardCode,
  image,
  scheduledAt: `${seedMonth}-${String(Math.min(day, daysInSeedMonth)).padStart(2, '0')}T${hour}:00`,
  deviceCount: area === 'Toàn tỉnh' ? 342 : 12,
})

let items: ScheduleItem[] = [
  schedule(
    1,
    10,
    '08:00',
    'Lịch phát bản tin sáng',
    'normal',
    'radio',
    'published',
  ),
  schedule(
    2,
    10,
    '14:00',
    'Cảnh báo mưa lớn',
    'warning',
    'both',
    'pending',
    'Toàn tỉnh',
    images.weather,
  ),
  schedule(
    3,
    10,
    '16:00',
    'Tuyên truyền ATGT',
    'propaganda',
    'digital',
    'pending',
    'Cụm TP. Thái Nguyên',
    images.traffic,
  ),
  schedule(
    4,
    10,
    '19:00',
    'Bản tin tối',
    'normal',
    'radio',
    'published',
    'Cụm TP. Thái Nguyên',
    images.night,
  ),
  schedule(
    5,
    12,
    '14:00',
    'Diễn tập PCCC',
    'emergency',
    'radio',
    'cancelled',
    'Cụm khu vực phía Bắc',
    images.weather,
  ),
  schedule(6, 1, '08:00', 'Bản tin sáng', 'normal', 'radio', 'published'),
  schedule(
    7,
    1,
    '10:00',
    'Tuyên truyền ATGT',
    'propaganda',
    'digital',
    'published',
  ),
  schedule(
    8,
    2,
    '09:00',
    'Cảnh báo thời tiết',
    'warning',
    'radio',
    'published',
    'Toàn tỉnh',
    images.weather,
  ),
  schedule(9, 2, '14:00', 'Bản tin địa phương', 'normal', 'both', 'published'),
  schedule(
    10,
    3,
    '07:30',
    'Tuyên truyền y tế',
    'propaganda',
    'digital',
    'published',
  ),
  schedule(11, 3, '19:00', 'Bản tin tối', 'normal', 'radio', 'published'),
  schedule(12, 4, '08:00', 'Bản tin sáng', 'normal', 'radio', 'published'),
  schedule(13, 5, '10:00', 'Diễn tập PCCC', 'emergency', 'radio', 'published'),
  schedule(
    14,
    5,
    '14:00',
    'Tuyên truyền',
    'propaganda',
    'digital',
    'published',
  ),
  schedule(15, 6, '08:00', 'Bản tin sáng', 'normal', 'radio', 'published'),
  schedule(
    16,
    6,
    '15:00',
    'Bản tin nông nghiệp',
    'propaganda',
    'digital',
    'published',
  ),
  schedule(
    17,
    7,
    '09:00',
    'Bảo trì thiết bị',
    'maintenance',
    'radio',
    'published',
  ),
  schedule(
    18,
    7,
    '14:00',
    'Bản tin địa phương',
    'normal',
    'radio',
    'published',
  ),
  schedule(
    19,
    8,
    '08:00',
    'Tuyên truyền',
    'propaganda',
    'digital',
    'published',
  ),
  schedule(20, 8, '20:00', 'Bản tin tối', 'normal', 'radio', 'published'),
  schedule(21, 11, '08:00', 'Bản tin sáng', 'normal', 'radio', 'published'),
  schedule(
    22,
    12,
    '10:00',
    'Tuyên truyền ATGT',
    'propaganda',
    'digital',
    'published',
  ),
  schedule(23, 12, '19:00', 'Bản tin tối', 'normal', 'radio', 'published'),
  schedule(24, 14, '08:00', 'Bản tin sáng', 'normal', 'radio', 'published'),
  schedule(
    25,
    16,
    '15:00',
    'Bản tin khẩn cấp',
    'emergency',
    'both',
    'pending',
    'Toàn tỉnh',
    images.weather,
  ),
  schedule(26, 16, '20:00', 'Bản tin tối', 'normal', 'radio', 'pending'),
  schedule(27, 17, '08:00', 'Tuyên truyền', 'propaganda', 'digital', 'pending'),
  schedule(28, 18, '08:00', 'Bản tin sáng', 'normal', 'radio', 'pending'),
  schedule(
    29,
    19,
    '10:00',
    'Bản tin địa phương',
    'propaganda',
    'digital',
    'pending',
  ),
  schedule(30, 19, '19:00', 'Bản tin tối', 'normal', 'radio', 'pending'),
  schedule(31, 20, '08:00', 'Bản tin sáng', 'normal', 'radio', 'pending'),
  schedule(
    32,
    20,
    '15:00',
    'Bản tin nông nghiệp',
    'propaganda',
    'digital',
    'pending',
  ),
  schedule(33, 21, '08:00', 'Bản tin sáng', 'normal', 'radio', 'pending'),
  schedule(34, 22, '08:00', 'Bản tin sáng', 'normal', 'radio', 'pending'),
  schedule(35, 22, '20:00', 'Bản tin tối', 'normal', 'radio', 'pending'),
  schedule(36, 24, '08:00', 'Bản tin địa phương', 'normal', 'radio', 'pending'),
  schedule(37, 25, '14:00', 'Diễn tập PCCC', 'emergency', 'radio', 'cancelled'),
  schedule(38, 25, '19:00', 'Bản tin tối', 'normal', 'radio', 'pending'),
  schedule(39, 26, '08:00', 'Bản tin sáng', 'normal', 'radio', 'pending'),
  schedule(
    40,
    29,
    '10:00',
    'Cảnh báo thời tiết',
    'warning',
    'radio',
    'pending',
    'Toàn tỉnh',
    images.weather,
  ),
  schedule(41, 29, '20:00', 'Bản tin tối', 'normal', 'radio', 'pending'),
  schedule(42, 30, '08:00', 'Bản tin sáng', 'normal', 'radio', 'pending'),
  schedule(43, 31, '20:00', 'Bản tin tối', 'normal', 'radio', 'pending'),
]

function matches(item: ScheduleItem, filters: ScheduleFilters) {
  const date = item.scheduledAt.slice(0, 10)
  const search = filters.search.trim().toLocaleLowerCase('vi-VN')
  return (
    date >= filters.from &&
    date <= filters.to &&
    (!search ||
      `${item.title} ${item.content} ${item.area}`
        .toLocaleLowerCase('vi-VN')
        .includes(search)) &&
    (filters.category === 'all' || item.category === filters.category) &&
    (filters.channel === 'all' ||
      item.channel === filters.channel ||
      item.channel === 'both') &&
    (filters.status === 'all' || item.status === filters.status) &&
    (filters.area === 'all' || item.area === filters.area)
  )
}

export const scheduleService = {
  list: async (filters: ScheduleFilters, access?: TerritoryAccess) =>
    items.filter(
      (item) =>
        (!access || canAccessTerritory(access, item)) && matches(item, filters),
    ),
  create: async (input: ScheduleInput, access?: TerritoryAccess) => {
    if (access) assertTerritory(access, input)
    const created = { ...input, id: crypto.randomUUID() }
    items = [created, ...items]
    return created
  },
  update: async (
    { id, input }: { id: string; input: ScheduleInput },
    access?: TerritoryAccess,
  ) => {
    const current = items.find((item) => item.id === id)
    if (!current) throw new Error('Không tìm thấy lịch phát')
    if (access) {
      assertTerritory(access, current)
      assertTerritory(access, input)
    }
    const updated = { ...input, id }
    items = items.map((item) => (item.id === id ? updated : item))
    return updated
  },
  cancel: async (id: string, access?: TerritoryAccess) => {
    const current = items.find((item) => item.id === id)
    if (!current) throw new Error('Không tìm thấy lịch phát')
    if (access) assertTerritory(access, current)
    items = items.map((item) =>
      item.id === id ? { ...item, status: 'cancelled' } : item,
    )
  },
  importMany: async (inputs: ScheduleInput[], access?: TerritoryAccess) => {
    if (access) for (const input of inputs) assertTerritory(access, input)
    const created = inputs.map((input) => ({
      ...input,
      id: crypto.randomUUID(),
    }))
    items = [...created, ...items]
    return created.length
  },
}
