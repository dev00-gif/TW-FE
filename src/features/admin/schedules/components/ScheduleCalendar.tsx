import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Calendar } from '@/components/calendar/Calendar'
import type { CalendarView } from '@/components/calendar/calendarUtils'
import type { ScheduleCategory, ScheduleItem } from '../types'

export type CalendarMode = CalendarView | 'list'

const categoryClass: Record<ScheduleCategory, string> = {
  normal: 'bg-sky-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
  propaganda:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  emergency: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
  maintenance:
    'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200',
}

export function ScheduleCalendar({
  date,
  mode,
  items,
  onSelect,
}: {
  date: Date
  mode: CalendarView
  items: ScheduleItem[]
  onSelect: (item: ScheduleItem) => void
}) {
  const { t, i18n } = useTranslation('adminSchedules')
  return (
    <Calendar
      date={date}
      view={mode}
      items={items}
      locale={i18n.language === 'en' ? 'en-US' : 'vi-VN'}
      getItemDate={(item) => new Date(item.scheduledAt)}
      getItemKey={(item) => item.id}
      moreLabel={(count) => t('more', { count })}
      renderItem={(item) => (
        <button
          type="button"
          onClick={() => onSelect(item)}
          title={`${format(new Date(item.scheduledAt), 'HH:mm')} ${item.title}`}
          className={`block w-full truncate rounded px-1.5 py-1 text-left text-[10px] font-medium transition hover:brightness-95 ${categoryClass[item.category]}`}
        >
          <span className="mr-1 font-bold">
            {format(new Date(item.scheduledAt), 'HH:mm')}
          </span>
          {item.title}
        </button>
      )}
    />
  )
}
