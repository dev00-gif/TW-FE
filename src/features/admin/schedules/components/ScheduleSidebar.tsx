import { CalendarDays, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { ScheduleItem } from '../types'

export function ScheduleSidebar({
  items,
  onSelect,
  onViewAll,
}: {
  items: ScheduleItem[]
  onSelect: (item: ScheduleItem) => void
  onViewAll: () => void
}) {
  const { t } = useTranslation('adminSchedules')
  const upcoming = items
    .filter((item) => item.status === 'pending')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 4)
  const counts = [
    {
      key: 'totalSchedules',
      value: items.length,
      icon: CalendarDays,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950',
    },
    {
      key: 'publishedCount',
      value: items.filter((item) => item.status === 'published').length,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950',
    },
    {
      key: 'pendingCount',
      value: items.filter((item) => item.status === 'pending').length,
      icon: Clock3,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950',
    },
    {
      key: 'cancelledCount',
      value: items.filter((item) => item.status === 'cancelled').length,
      icon: XCircle,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950',
    },
  ] as const
  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <CalendarDays className="size-5 text-blue-600" />
            {t('upcoming')}
          </h2>
          <button
            onClick={onViewAll}
            className="text-xs text-blue-600 hover:underline"
          >
            {t('viewAll')}
          </button>
        </div>
        <div>
          {upcoming.length ? (
            upcoming.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="flex w-full gap-2.5 border-b border-slate-100 p-3 text-left transition hover:bg-slate-50 last:border-0 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="size-12 shrink-0 rounded-md bg-slate-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {format(new Date(item.scheduledAt), 'HH:mm - dd/MM/yyyy')}
                  </div>
                  <div className="mt-1 truncate text-[11px] text-slate-500">
                    {item.area} ({t('deviceCount', { count: item.deviceCount })}
                    )
                  </div>
                </div>
                <span className="h-fit shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-600">
                  {t('pending')}
                </span>
              </button>
            ))
          ) : (
            <p className="p-4 text-xs text-slate-500">{t('noSchedules')}</p>
          )}
        </div>
      </section>
      <section className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <CalendarDays className="size-5 text-blue-600" />
          {t('stats')}
        </h2>
        <div className="grid grid-cols-4 gap-1.5">
          {counts.map(({ key, value, icon: Icon, color }) => (
            <div
              key={key}
              className={`flex min-h-23 flex-col items-center justify-center rounded-lg p-1.5 text-center ${color}`}
            >
              <Icon className="mb-1 size-5" />
              <strong className="text-xl">{value}</strong>
              <span className="text-[10px] leading-tight">{t(key)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
