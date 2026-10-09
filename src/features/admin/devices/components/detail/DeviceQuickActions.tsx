import { ShieldCheck, TriangleAlert, Volume2, Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DeviceDetailTab } from '../../types'

export function DeviceQuickActions({
  onAction,
  onTab,
}: {
  onAction: (action: 'test' | 'emergency' | 'reset') => void
  onTab: (tab: DeviceDetailTab) => void
}) {
  const { t } = useTranslation('adminDevices')
  const actions = [
    { key: 'test', icon: Volume2, label: t('detail.testAudio') },
    {
      key: 'emergency',
      icon: TriangleAlert,
      label: t('detail.emergencyBroadcast'),
    },
    { key: 'reset', icon: ShieldCheck, label: t('detail.restoreDefaults') },
    { key: 'maintenance', icon: Wrench, label: t('detail.maintenance') },
  ] as const
  return (
    <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-bold text-blue-950 dark:text-white">
        {t('detail.quickActions')}
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {actions.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${key === 'emergency' ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900' : 'border-slate-200 bg-slate-50 text-blue-950 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'}`}
            onClick={() =>
              key === 'maintenance' ? onTab('maintenance') : onAction(key)
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
