import { Building2, MapPin, Radio, Rows3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LocationSummary } from '../types'

export function LocationStats({ summary }: { summary?: LocationSummary }) {
  const { t } = useTranslation('adminLocations')
  const cards = [
    {
      key: 'total',
      value: summary
        ? (summary.provinceCount + summary.wardCount).toLocaleString()
        : '…',
      note: t('totalNote'),
      icon: MapPin,
      tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950',
    },
    {
      key: 'provinces',
      value: summary ? summary.provinceCount.toLocaleString() : '…',
      note: t('provincesNote'),
      icon: Building2,
      tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950',
    },
    {
      key: 'wards',
      value: summary ? summary.wardCount.toLocaleString() : '…',
      note: t('wardsNote'),
      icon: Rows3,
      tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950',
    },
    {
      key: 'devices',
      value: summary ? summary.deviceCount.toLocaleString() : '…',
      note: t('devicesNote'),
      icon: Radio,
      tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950',
    },
  ] as const
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            <p className="text-xs text-slate-500">{t(`stats.${key}`)}</p>
            <strong
              className="mt-1 block truncate text-lg text-blue-950 dark:text-white"
              title={value}
            >
              {value}
            </strong>
            <p className="text-xs text-slate-500">{note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
