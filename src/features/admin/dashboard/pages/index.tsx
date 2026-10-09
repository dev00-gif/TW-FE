import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { DeviceMap } from '../components/DeviceMap'
import {
  BroadcastChart,
  DeviceStatusChart,
} from '../components/DashboardCharts'
import { MetricCards } from '../components/MetricCards'
import { RecentBroadcasts } from '../components/RecentBroadcasts'
import { useDashboardOverview } from '../hooks/useDashboard'

export default function DashboardPage() {
  const { t } = useTranslation('adminDashboard')
  const user = useCurrentUser()
  const { data, isPending, isError } = useDashboardOverview()
  if (isPending) return <div className="p-8 text-slate-500">{t('loading')}</div>
  if (isError)
    return (
      <div role="alert" className="p-8 text-red-600">
        {t('loadError')}
      </div>
    )

  return (
    <div className="space-y-4 bg-slate-50/50 pb-6 dark:bg-transparent">
      <div className="flex flex-wrap items-end justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            {t('welcome', {
              name: user?.profile?.fullName || user?.displayName || 'Admin',
            })}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('intro')}
          </p>
        </div>
        <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {t('province')}
        </span>
      </div>
      <MetricCards metrics={data.metrics} />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
        <div className="space-y-4">
          <DeviceMap locations={data.locations} />
          <BroadcastChart broadcasts={data.broadcasts} />
        </div>
        <div className="space-y-4">
          <DeviceStatusChart statuses={data.statuses} />
          <RecentBroadcasts recent={data.recent} />
        </div>
      </div>
    </div>
  )
}
