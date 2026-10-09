import { eachDayOfInterval, format, isAfter, parseISO } from 'date-fns'
import type {
  FailedBroadcast,
  ReportArea,
  ReportDay,
  ReportDevice,
  ReportFilters,
  ReportOverview,
} from '../types'

const areas = [
  {
    id: 'thai-nguyen',
    name: 'TP. Thái Nguyên',
    longitude: 105.84,
    latitude: 21.59,
    weight: 0.19,
  },
  {
    id: 'dai-tu',
    name: 'Huyện Đại Từ',
    longitude: 105.64,
    latitude: 21.64,
    weight: 0.15,
  },
  {
    id: 'phu-luong',
    name: 'Huyện Phú Lương',
    longitude: 105.75,
    latitude: 21.72,
    weight: 0.13,
  },
  {
    id: 'song-cong',
    name: 'TP. Sông Công',
    longitude: 105.82,
    latitude: 21.49,
    weight: 0.12,
  },
  {
    id: 'dinh-hoa',
    name: 'Huyện Định Hóa',
    longitude: 105.61,
    latitude: 21.9,
    weight: 0.1,
  },
  {
    id: 'phu-binh',
    name: 'Huyện Phú Bình',
    longitude: 105.96,
    latitude: 21.49,
    weight: 0.08,
  },
  {
    id: 'vo-nhai',
    name: 'Huyện Võ Nhai',
    longitude: 106.02,
    latitude: 21.76,
    weight: 0.07,
  },
  {
    id: 'dong-hy',
    name: 'Huyện Đồng Hỷ',
    longitude: 105.99,
    latitude: 21.65,
    weight: 0.07,
  },
  {
    id: 'cho-moi',
    name: 'Huyện Chợ Mới',
    longitude: 105.9,
    latitude: 21.88,
    weight: 0.05,
  },
  {
    id: 'bac-kan',
    name: 'Huyện Bắc Kạn',
    longitude: 105.83,
    latitude: 22.12,
    weight: 0.04,
  },
] as const

export const reportAreas = areas.map(({ id, name }) => ({ id, name }))

function totalOf(day: ReportDay) {
  return day.normal + day.emergency + day.warning + day.other
}

function buildDays(filters: ReportFilters): ReportDay[] {
  const start = parseISO(filters.from)
  const end = parseISO(filters.to)
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    isAfter(start, end)
  )
    return []
  const areaWeight =
    filters.area === 'all'
      ? 1
      : (areas.find((area) => area.id === filters.area)?.weight ?? 1)
  return eachDayOfInterval({ start, end })
    .slice(0, 366)
    .map((date) => {
      const seed = Math.floor(date.getTime() / 86_400_000)
      const normal = Math.max(
        1,
        Math.round((18 + ((seed * 7) % 24)) * areaWeight),
      )
      const emergency = Math.round(
        (seed % 8 === 0 ? 8 : 2 + (seed % 4)) * areaWeight,
      )
      const warning = Math.round((4 + ((seed * 3) % 10)) * areaWeight)
      const other = Math.round((3 + ((seed * 5) % 9)) * areaWeight)
      const total = normal + emergency + warning + other
      const failed = Math.min(
        total,
        seed % 9 === 0 ? 2 : seed % 3 === 0 ? 1 : 0,
      )
      return {
        date: format(date, 'yyyy-MM-dd'),
        normal,
        emergency,
        warning,
        other,
        success: total - failed,
        failed,
        durationMinutes:
          normal * 18 + emergency * 12 + warning * 16 + other * 14,
      }
    })
}

function buildAreas(
  total: number,
  successRate: number,
  filter: string,
): ReportArea[] {
  return areas
    .filter((area) => filter === 'all' || area.id === filter)
    .map((area) => ({
      id: area.id,
      name: area.name,
      longitude: area.longitude,
      latitude: area.latitude,
      broadcasts: filter === 'all' ? Math.round(total * area.weight) : total,
      successRate: total
        ? Math.max(91, Math.min(99.9, successRate - area.weight * 7 + 1))
        : 0,
    }))
    .sort((a, b) => b.broadcasts - a.broadcasts)
}

function buildDevices(total: number, successRate: number): ReportDevice[] {
  const codes = [
    'TN-TP-001',
    'TN-PL-007',
    'TN-DH-003',
    'TN-SC-002',
    'TN-PB-010',
    'TN-DH-004',
    'TN-VN-001',
    'TN-CM-002',
    'TN-DH-008',
    'TN-PL-005',
  ]
  return codes
    .map((id, index) => ({
      id,
      broadcasts: Math.round(total * (0.255 - index * 0.015)),
      successRate: Math.max(
        92,
        Math.min(99.9, successRate + ((index % 4) - 1) * 0.6),
      ),
    }))
    .sort((a, b) => b.broadcasts - a.broadcasts)
}

function buildFailures(
  days: ReportDay[],
  areaRows: ReportArea[],
): FailedBroadcast[] {
  const titles = [
    'Cảnh báo mưa lớn',
    'Thông báo lịch họp',
    'Diễn tập PCCC',
    'Bản tin thời sự',
    'Cảnh báo rét đậm',
  ]
  const reasons: FailedBroadcast['reason'][] = ['connection', 'offline', 'file']
  return days
    .filter((day) => day.failed > 0)
    .slice(-5)
    .reverse()
    .map((day, index) => ({
      id: `${day.date}-${index}`,
      date: `${day.date}T${String(9 + index).padStart(2, '0')}:28:00`,
      title: titles[index % titles.length],
      area: areaRows[index % areaRows.length]?.name ?? areas[0].name,
      device: `TN-${['TP-001', 'DH-003', 'PL-007', 'SC-002', 'VN-001'][index % 5]}`,
      reason: reasons[index % reasons.length],
    }))
}

export const reportService = {
  overview: async (filters: ReportFilters): Promise<ReportOverview> => {
    const days = buildDays(filters)
    const total = days.reduce((sum, day) => sum + totalOf(day), 0)
    const success = days.reduce((sum, day) => sum + day.success, 0)
    const failed = total - success
    const durationMinutes = days.reduce(
      (sum, day) => sum + day.durationMinutes,
      0,
    )
    const successRate = total ? (success / total) * 100 : 0
    const areaRows = buildAreas(total, successRate, filters.area)
    return {
      days,
      areas: areaRows,
      devices: buildDevices(total, successRate),
      failures: buildFailures(days, areaRows),
      metrics: {
        total,
        success,
        failed,
        durationMinutes,
        devices:
          filters.area === 'all'
            ? 1156
            : Math.round(
                1156 *
                  (areas.find((area) => area.id === filters.area)?.weight ??
                    0.1),
              ),
      },
      durationByType: [
        {
          type: 'normal',
          minutes: days.reduce((sum, day) => sum + day.normal * 18, 0),
        },
        {
          type: 'emergency',
          minutes: days.reduce((sum, day) => sum + day.emergency * 12, 0),
        },
        {
          type: 'warning',
          minutes: days.reduce((sum, day) => sum + day.warning * 16, 0),
        },
        {
          type: 'other',
          minutes: days.reduce((sum, day) => sum + day.other * 14, 0),
        },
      ],
    }
  },
}
