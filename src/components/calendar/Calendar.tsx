import { format, isSameDay, isSameMonth } from 'date-fns'
import type { ReactNode } from 'react'
import { calendarDays, groupCalendarItems } from './calendarUtils'
import type { CalendarView } from './calendarUtils'

export interface CalendarProps<T> {
  date: Date
  view: CalendarView
  items: readonly T[]
  getItemDate: (item: T) => Date
  getItemKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  moreLabel: (count: number) => string
  locale?: string
  maxMonthItems?: number
  today?: Date
}

export function Calendar<T>({
  date,
  view,
  items,
  getItemDate,
  getItemKey,
  renderItem,
  moreLabel,
  locale = 'vi-VN',
  maxMonthItems = 2,
  today = new Date(),
}: CalendarProps<T>) {
  const days = calendarDays(date, view)
  const grouped = groupCalendarItems(items, getItemDate)
  const hasWeekHeader = view !== 'day'
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(
      new Date(2025, 0, 6 + index),
    ),
  )

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {hasWeekHeader && (
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
          {weekdays.map((weekday, index) => (
            <div
              key={index}
              className="border-r border-slate-100 py-2 text-center text-[11px] font-medium text-slate-600 last:border-r-0 dark:border-slate-800 dark:text-slate-300"
            >
              {weekday}
            </div>
          ))}
        </div>
      )}
      <div className={hasWeekHeader ? 'grid grid-cols-7' : 'grid grid-cols-1'}>
        {days.map((day) => {
          const dayItems = grouped.get(format(day, 'yyyy-MM-dd')) ?? []
          const visible =
            view === 'month' ? dayItems.slice(0, maxMonthItems) : dayItems
          const isToday = isSameDay(day, today)
          const isSelected = isSameDay(day, date)
          return (
            <div
              key={format(day, 'yyyy-MM-dd')}
              data-date={format(day, 'yyyy-MM-dd')}
              aria-current={isToday ? 'date' : undefined}
              className={`min-h-26 border-b border-r border-slate-100 p-1.5 last:border-r-0 dark:border-slate-800 ${view === 'month' ? 'sm:min-h-29 xl:min-h-27' : 'min-h-72'} ${view === 'month' && !isSameMonth(day, date) ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
            >
              <div
                className={`mb-1 text-[11px] ${view !== 'month' || isSameMonth(day, date) ? 'text-blue-900 dark:text-blue-200' : 'text-slate-400'} ${isToday ? 'inline-flex size-5 items-center justify-center rounded-full bg-blue-600 text-white' : isSelected ? 'inline-flex size-5 items-center justify-center rounded-full ring-1 ring-blue-500' : ''}`}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {visible.map((item) => (
                  <div key={getItemKey(item)}>{renderItem(item)}</div>
                ))}
                {dayItems.length > visible.length && (
                  <span className="block px-1 text-[10px] font-semibold text-blue-600">
                    {moreLabel(dayItems.length - visible.length)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
