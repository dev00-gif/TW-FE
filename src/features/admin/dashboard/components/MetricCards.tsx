import { AlertTriangle, CalendarDays, Monitor, Newspaper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DashboardOverview } from '../types'

export function MetricCards({
  metrics,
}: {
  metrics: DashboardOverview['metrics']
}) {
  const { t, i18n } = useTranslation('adminDashboard')
  const number = new Intl.NumberFormat(
    i18n.language === 'en' ? 'en-US' : 'vi-VN',
  )
  const items = [
    {
      key: 'devices',
      icon: Monitor,
      value: metrics.devices,
      detail: t('activeDevices', { count: number.format(1156) }),
      color: 'bg-blue-500',
    },
    {
      key: 'todayBroadcasts',
      icon: Newspaper,
      value: metrics.broadcasts,
      detail: t('broadcastDetail'),
      color: 'bg-green-500',
    },
    {
      key: 'upcoming',
      icon: CalendarDays,
      value: metrics.schedules,
      detail: t('next24Hours'),
      color: 'bg-orange-400',
    },
    {
      key: 'emergency',
      icon: AlertTriangle,
      value: metrics.emergency,
      detail: t('emergencyDetail'),
      color: 'bg-red-500',
    },
  ] as const
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ key, icon: Icon, value, detail, color }) => (
        <article
          key={key}
          className="flex min-h-28 items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            className={`flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${color}`}
          >
            <Icon className="size-7" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t(key)}
            </h2>
            <div className="mt-0.5 text-3xl font-bold leading-none text-slate-950 dark:text-white">
              {number.format(value)}
            </div>
            <p className="mt-2 truncate text-xs text-slate-500 dark:text-slate-400">
              {detail}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
