import { Cpu, HardDrive, Monitor, Radio, Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function DeviceStats({
  counts,
}: {
  counts: Record<'all' | 'active' | 'offline' | 'error' | 'maintenance', number>
}) {
  const { t } = useTranslation('adminDevices')
  const cards = [
    {
      key: 'all',
      icon: Monitor,
      tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950',
    },
    {
      key: 'active',
      icon: Radio,
      tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950',
    },
    {
      key: 'offline',
      icon: HardDrive,
      tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950',
    },
    {
      key: 'error',
      icon: Cpu,
      tone: 'bg-rose-50 text-rose-600 dark:bg-rose-950',
    },
    {
      key: 'maintenance',
      icon: Wrench,
      tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800',
    },
  ] as const
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ key, icon: Icon, tone }) => (
        <div
          key={key}
          className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            className={`grid size-12 shrink-0 place-items-center rounded-xl ${tone}`}
          >
            <Icon className="size-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(`stats.${key}`)}
            </p>
            <p className="text-2xl font-bold text-slate-950 dark:text-white">
              {counts[key].toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400">
              {key === 'all'
                ? t('stats.totalNote')
                : `${((counts[key] / Math.max(1, counts.all)) * 100).toFixed(1)}%`}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
