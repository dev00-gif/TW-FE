import { format, parseISO, startOfWeek } from 'date-fns'
import type { ReportDay, ReportPeriod } from './types'

export function reportDayTotal(day: ReportDay) {
  return day.normal + day.emergency + day.warning + day.other
}

export function aggregateReportDays(
  days: ReportDay[],
  period: ReportPeriod,
): ReportDay[] {
  const rows = new Map<string, ReportDay>()
  for (const day of days) {
    const date = parseISO(day.date)
    const key =
      period === 'day'
        ? day.date
        : period === 'week'
          ? format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
          : period === 'month'
            ? format(date, 'yyyy-MM-01')
            : format(date, 'yyyy-01-01')
    const current = rows.get(key) ?? {
      date: key,
      normal: 0,
      emergency: 0,
      warning: 0,
      other: 0,
      success: 0,
      failed: 0,
      durationMinutes: 0,
    }
    rows.set(key, {
      date: key,
      normal: current.normal + day.normal,
      emergency: current.emergency + day.emergency,
      warning: current.warning + day.warning,
      other: current.other + day.other,
      success: current.success + day.success,
      failed: current.failed + day.failed,
      durationMinutes: current.durationMinutes + day.durationMinutes,
    })
  }
  return [...rows.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function formatDuration(minutes: number, locale: string) {
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return locale === 'en'
    ? `${hours}h ${remaining}m`
    : `${hours} giờ ${remaining} phút`
}
