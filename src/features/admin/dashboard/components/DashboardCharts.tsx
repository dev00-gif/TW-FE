import { useMemo } from 'react'
import { barY, defineChart, group } from '@tanstack/charts'
import { polar, radialArc } from '@tanstack/charts/polar'
import { Chart } from '@tanstack/react-charts'
import { tooltip } from '@tanstack/charts/tooltip'
import { scaleBand, scaleLinear } from 'd3-scale'
import { ChartColumnIncreasing, ChartNoAxesCombined } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DashboardOverview, DeviceStatus } from '../types'

const statusColors: Record<DeviceStatus, string> = {
  active: '#27ae60',
  warning: '#ff9c37',
  offline: '#f04452',
  maintenance: '#aab3c1',
}

export function DeviceStatusChart({
  statuses,
}: {
  statuses: DashboardOverview['statuses']
}) {
  const { t, i18n } = useTranslation('adminDashboard')
  const total = statuses.reduce((sum, row) => sum + row.count, 0)
  const chart = useMemo(() => {
    let angle = 0
    const arcs = statuses.map((row) => {
      const startAngle = angle
      angle += (row.count / total) * Math.PI * 2
      return { ...row, startAngle, endAngle: angle }
    })
    return defineChart({
      marks: [
        polar({
          radiusRatio: 0.94,
          marks: [
            radialArc(arcs, {
              startAngle: 'startAngle',
              endAngle: 'endAngle',
              innerRadius: ({ radius }) => radius * 0.65,
              color: 'status',
              key: 'status',
              stroke: '#fff',
              strokeWidth: 2,
            }),
          ],
        }),
      ],
      color: {
        domain: statuses.map((row) => row.status),
        range: statuses.map((row) => statusColors[row.status]),
      },
      tooltip: {
        use: tooltip,
        format: (point) =>
          `${t(point.datum.status)}: ${point.datum.count.toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN')} (${((point.datum.count / total) * 100).toFixed(1)}%)`,
      },
    })
  }, [statuses, total, t, i18n.language])
  const formatted = new Intl.NumberFormat(
    i18n.language === 'en' ? 'en-US' : 'vi-VN',
  )
  return (
    <section
      id="device-status"
      className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 text-base font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
        <ChartColumnIncreasing className="size-5 text-blue-600" />
        {t('statusTitle')}
      </h2>
      <div className="flex flex-col items-center gap-4 p-4 sm:flex-row">
        <div className="relative w-full max-w-[210px] shrink-0">
          <Chart definition={chart} height={195} ariaLabel={t('statusTitle')} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <strong className="text-2xl text-slate-950 dark:text-white">
              {formatted.format(total)}
            </strong>
            <span className="text-xs text-slate-500">{t('devices')}</span>
          </div>
        </div>
        <div className="w-full space-y-3">
          {statuses.map((row) => (
            <div key={row.status} className="flex items-center gap-2 text-xs">
              <span
                className="size-3 shrink-0 rounded"
                style={{ backgroundColor: statusColors[row.status] }}
              />
              <span className="min-w-0 flex-1 text-slate-500 dark:text-slate-300">
                {t(row.status)}
              </span>
              <strong className="text-slate-900 dark:text-white">
                {formatted.format(row.count)}
              </strong>
              <span className="text-slate-500">
                ({((row.count / total) * 100).toFixed(1).replace('.', ',')}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BroadcastChart({
  broadcasts,
}: {
  broadcasts: DashboardOverview['broadcasts']
}) {
  const { t, i18n } = useTranslation('adminDashboard')
  const chart = useMemo(
    () =>
      defineChart({
        marks: [
          barY(broadcasts, {
            x: 'day',
            y: 'count',
            color: 'channel',
            layout: group({ padding: 0.16 }),
          }),
        ],
        x: { scale: () => scaleBand().padding(0.35) },
        y: { scale: scaleLinear, domain: [0, 40], grid: true, nice: true },
        color: { domain: ['radio', 'digital'], range: ['#318bff', '#2cb765'] },
        tooltip: {
          use: tooltip,
          format: (point) =>
            `${point.datum.day} · ${t(point.datum.channel)}: ${point.datum.count.toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}`,
        },
      }),
    [broadcasts, t, i18n.language],
  )
  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <h2 className="flex items-center gap-3 text-base font-semibold text-slate-900 dark:text-white">
          <ChartNoAxesCombined className="size-5 text-blue-600" />
          {t('broadcastStats')}{' '}
          <span className="font-normal text-slate-500">
            {t('lastSevenDays')}
          </span>
        </h2>
        <div className="flex gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <i className="size-3 rounded-sm bg-blue-500" />
            {t('radio')}
          </span>
          <span className="flex items-center gap-1">
            <i className="size-3 rounded-sm bg-green-500" />
            {t('digital')}
          </span>
        </div>
      </div>
      <div className="px-3 pb-2 pt-3">
        <Chart
          definition={chart}
          height={205}
          ariaLabel={t('broadcastStats')}
        />
      </div>
    </section>
  )
}
