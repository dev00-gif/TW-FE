import {
  CalendarDays,
  CalendarRange,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CalendarMode } from './ScheduleCalendar'

export function ScheduleToolbar({
  date,
  mode,
  onMode,
  onToday,
  onPrevious,
  onNext,
}: {
  date: Date
  mode: CalendarMode
  onMode: (mode: CalendarMode) => void
  onToday: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  const { t, i18n } = useTranslation('adminSchedules')
  const title =
    mode === 'month' || mode === 'list'
      ? i18n.language === 'vi'
        ? `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`
        : new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric',
          }).format(date)
      : new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(date)
  const tabs = [
    { value: 'month', icon: CalendarDays },
    { value: 'week', icon: CalendarRange },
    { value: 'day', icon: CalendarCheck2 },
    { value: 'list', icon: List },
  ] as const
  const legend = [
    { value: 'normal', color: 'bg-blue-500' },
    { value: 'propaganda', color: 'bg-emerald-500' },
    { value: 'warning', color: 'bg-amber-400' },
    { value: 'emergency', color: 'bg-rose-500' },
    { value: 'maintenance', color: 'bg-violet-500' },
  ] as const
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-2 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap gap-1">
        {tabs.map(({ value, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onMode(value)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${mode === value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <Icon className="size-4" />
            {t(value)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToday}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-blue-600 dark:border-slate-700"
        >
          {t('today')}
        </button>
        <button
          type="button"
          onClick={onPrevious}
          aria-label={t('previous')}
          className="rounded-lg border border-slate-200 p-1.5 text-blue-600 dark:border-slate-700"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-32 text-center text-xs font-bold text-blue-950 dark:text-white">
          {title}
        </span>
        <button
          type="button"
          onClick={onNext}
          aria-label={t('next')}
          className="rounded-lg border border-slate-200 p-1.5 text-blue-600 dark:border-slate-700"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {legend.map(({ value, color }) => (
          <span
            key={value}
            className="flex items-center gap-1 text-[10px] text-slate-500"
          >
            <i className={`size-2.5 rounded-sm ${color}`} />
            {t(`categories.${value}`)}
          </span>
        ))}
      </div>
    </div>
  )
}
