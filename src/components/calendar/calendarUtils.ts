import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export type CalendarView = 'month' | 'week' | 'day'

export function calendarDays(date: Date, view: CalendarView): Date[] {
  if (view === 'day') return [date]
  const start = startOfWeek(view === 'month' ? startOfMonth(date) : date, {
    weekStartsOn: 1,
  })
  const end =
    view === 'month'
      ? endOfWeek(endOfMonth(date), { weekStartsOn: 1 })
      : addDays(start, 6)
  const days: Date[] = []
  for (let day = start; day <= end; day = addDays(day, 1)) days.push(day)
  return days
}

export function groupCalendarItems<T>(
  items: readonly T[],
  getDate: (item: T) => Date,
): Map<string, T[]> {
  const grouped = new Map<string, T[]>()
  for (const item of items) {
    const key = format(getDate(item), 'yyyy-MM-dd')
    const current = grouped.get(key) ?? []
    current.push(item)
    grouped.set(key, current)
  }
  for (const group of grouped.values())
    group.sort((a, b) => getDate(a).getTime() - getDate(b).getTime())
  return grouped
}
