import { Link } from '@tanstack/react-router'
import { ChartNoAxesCombined } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DashboardOverview } from '../types'

const statusClasses = {
  live: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950',
  published: 'bg-blue-50 text-blue-700 dark:bg-blue-950',
  scheduled: 'bg-slate-100 text-slate-500 dark:bg-slate-800',
}

export function RecentBroadcasts({
  recent,
}: {
  recent: DashboardOverview['recent']
}) {
  const { t } = useTranslation('adminDashboard')
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <h2 className="flex items-center gap-3 text-base font-semibold text-slate-900 dark:text-white">
          <ChartNoAxesCombined className="size-5 text-blue-600" />
          {t('recent')}
        </h2>
        <Link
          to="/dashboard/posts"
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          {t('viewAll')}
        </Link>
      </div>
      <div>
        {recent.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-0 dark:border-slate-800"
          >
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="size-12 shrink-0 rounded-lg bg-slate-100 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {item.urgent && (
                  <span className="rounded border border-red-400 px-1 text-[10px] font-semibold text-red-600">
                    {t('urgent')}
                  </span>
                )}
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </p>
              </div>
              <p className="mt-1 truncate text-[11px] text-slate-500">
                {t(item.channel)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${statusClasses[item.status]}`}
            >
              {t(item.status)}
            </span>
            <div className="hidden w-16 shrink-0 text-right text-[11px] text-slate-500 sm:block">
              <div>{item.time}</div>
              <div>{item.date}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
