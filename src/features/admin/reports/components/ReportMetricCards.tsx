import { CheckCircle2, Clock3, Radio, Smartphone, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ReportOverview } from '../types'
import { formatDuration } from '../utils'

export function ReportMetricCards({
  metrics,
}: {
  metrics: ReportOverview['metrics']
}) {
  const { t, i18n } = useTranslation('adminReports')
  const number = new Intl.NumberFormat(
    i18n.language === 'en' ? 'en-US' : 'vi-VN',
  )
  const cards = [
    {
      key: 'total',
      value: number.format(metrics.total),
      note: t('totalNote'),
      icon: Radio,
      tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950',
    },
    {
      key: 'success',
      value: number.format(metrics.success),
      note: `${metrics.total ? ((metrics.success / metrics.total) * 100).toFixed(1) : '0'}%`,
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950',
    },
    {
      key: 'failed',
      value: number.format(metrics.failed),
      note: `${metrics.total ? ((metrics.failed / metrics.total) * 100).toFixed(1) : '0'}%`,
      icon: XCircle,
      tone: 'bg-rose-50 text-rose-600 dark:bg-rose-950',
    },
    {
      key: 'duration',
      value: formatDuration(metrics.durationMinutes, i18n.language),
      note: t('durationNote'),
      icon: Clock3,
      tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950',
    },
    {
      key: 'devices',
      value: number.format(metrics.devices),
      note: t('devicesNote'),
      icon: Smartphone,
      tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950',
    },
  ] as const
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ key, value, note, icon: Icon, tone }) => (
        <div
          key={key}
          className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <span
            className={`grid size-12 shrink-0 place-items-center rounded-xl ${tone}`}
          >
            <Icon className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(`metrics.${key}`)}
            </p>
            <strong
              className="mt-1 block truncate text-xl text-blue-950 dark:text-white"
              title={value}
            >
              {value}
            </strong>
            <p className="mt-0.5 text-xs text-slate-500">{note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
