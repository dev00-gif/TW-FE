import { useMemo } from 'react'
import { barY, defineChart, stack } from '@tanstack/charts'
import { polar, radialArc } from '@tanstack/charts/polar'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/react-charts'
import { scaleBand, scaleLinear } from 'd3-scale'
import { CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ReportDay, ReportOverview, ReportPeriod } from '../types'
import { reportCategories } from '../types'
import { aggregateReportDays } from '../utils'

const categoryColors = {
  normal: '#358bff',
  emergency: '#f04452',
  warning: '#ff9d2f',
  other: '#22c55e',
}
const card =
  'min-w-0 rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-bold text-blue-950 dark:text-white">
      <CalendarDays className="size-4 text-blue-600" />
      {children}
    </h2>
  )
}

export function ReportVolumeChart({
  days,
  period,
  onPeriodChange,
}: {
  days: ReportDay[]
  period: ReportPeriod
  onPeriodChange: (period: ReportPeriod) => void
}) {
  const { t, i18n } = useTranslation('adminReports')
  const rows = useMemo(() => aggregateReportDays(days, period), [days, period])
  const data = useMemo(
    () =>
      rows.flatMap((day) =>
        reportCategories.map((type) => ({
          date: day.date,
          type,
          count: day[type],
        })),
      ),
    [rows],
  )
  const max = Math.max(
    10,
    ...rows.map((day) => day.normal + day.emergency + day.warning + day.other),
  )
  const chart = useMemo(
    () =>
      defineChart({
        marks: [
          barY(data, { x: 'date', y: 'count', color: 'type', layout: stack() }),
        ],
        x: { scale: () => scaleBand().padding(0.25) },
        y: {
          scale: scaleLinear,
          domain: [0, max * 1.1],
          grid: true,
          nice: true,
        },
        color: {
          domain: reportCategories,
          range: reportCategories.map((type) => categoryColors[type]),
        },
        tooltip: {
          use: tooltip,
          format: (point) =>
            `${point.datum.date} · ${t(`categories.${point.datum.type}`)}: ${point.datum.count.toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}`,
        },
      }),
    [data, max, t, i18n.language],
  )
  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <CardTitle>{t('volumeChart')}</CardTitle>
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onPeriodChange(value)}
              className={`rounded px-2.5 py-1 text-xs ${period === value ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-blue-50'}`}
            >
              {t(`periods.${value}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-3 pt-3 text-[11px] text-slate-600 dark:text-slate-300">
        {reportCategories.map((type) => (
          <span key={type} className="inline-flex items-center gap-1.5">
            <i
              className="size-2.5 rounded-full"
              style={{ backgroundColor: categoryColors[type] }}
            />
            {t(`categories.${type}`)}
          </span>
        ))}
      </div>
      <div className="px-2 pb-2">
        {rows.length ? (
          <Chart definition={chart} height={190} ariaLabel={t('volumeChart')} />
        ) : (
          <p className="grid h-[190px] place-items-center text-sm text-slate-500">
            {t('empty')}
          </p>
        )}
      </div>
    </section>
  )
}

function ReportDonut({
  values,
  total,
  center,
  subtitle,
  title,
}: {
  values: { key: string; amount: number; color: string; label: string }[]
  total: number
  center: string
  subtitle: string
  title: string
}) {
  const chart = useMemo(() => {
    let angle = 0
    const arcs = values.map((value) => {
      const startAngle = angle
      angle += total ? (value.amount / total) * Math.PI * 2 : 0
      return { ...value, startAngle, endAngle: angle }
    })
    return defineChart({
      marks: [
        polar({
          radiusRatio: 0.96,
          marks: [
            radialArc(arcs, {
              startAngle: 'startAngle',
              endAngle: 'endAngle',
              innerRadius: ({ radius }) => radius * 0.66,
              color: 'key',
              key: 'key',
              stroke: '#fff',
              strokeWidth: 2,
            }),
          ],
        }),
      ],
      color: {
        domain: values.map((value) => value.key),
        range: values.map((value) => value.color),
      },
      tooltip: {
        use: tooltip,
        format: (point) =>
          `${point.datum.label}: ${point.datum.amount.toLocaleString()} (${total ? ((point.datum.amount / total) * 100).toFixed(1) : 0}%)`,
      },
    })
  }, [values, total])
  return (
    <section className={card}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <CardTitle>{title}</CardTitle>
      </div>
      <div className="flex min-h-[225px] flex-col items-center justify-center gap-3 p-3 sm:flex-row">
        <div className="relative w-44 shrink-0">
          <Chart definition={chart} height={170} ariaLabel={title} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <strong className="text-lg text-blue-950 dark:text-white">
              {center}
            </strong>
            <span className="text-[11px] text-slate-500">{subtitle}</span>
          </div>
        </div>
        <div className="w-full space-y-2">
          {values.map((value) => (
            <div key={value.key} className="flex items-start gap-2 text-xs">
              <span
                className="mt-1 size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: value.color }}
              />
              <div>
                <p className="text-slate-600 dark:text-slate-300">
                  {value.label}
                </p>
                <strong className="text-blue-950 dark:text-white">
                  {value.amount.toLocaleString()} (
                  {total ? ((value.amount / total) * 100).toFixed(1) : 0}%)
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ReportSuccessChart({
  metrics,
}: {
  metrics: ReportOverview['metrics']
}) {
  const { t, i18n } = useTranslation('adminReports')
  const number = new Intl.NumberFormat(
    i18n.language === 'en' ? 'en-US' : 'vi-VN',
  )
  return (
    <ReportDonut
      title={t('successChart')}
      total={metrics.total}
      center={number.format(metrics.total)}
      subtitle={t('totalBroadcasts')}
      values={[
        {
          key: 'success',
          amount: metrics.success,
          color: '#20be68',
          label: t('success'),
        },
        {
          key: 'failed',
          amount: metrics.failed,
          color: '#f04452',
          label: t('failed'),
        },
      ]}
    />
  )
}

export function ReportDurationChart({
  durationByType,
  total,
}: {
  durationByType: ReportOverview['durationByType']
  total: number
}) {
  const { t } = useTranslation('adminReports')
  const values = durationByType.map((item) => ({
    key: item.type,
    amount: item.minutes,
    color: categoryColors[item.type],
    label: t(`categories.${item.type}`),
  }))
  return (
    <ReportDonut
      title={t('durationChart')}
      total={total}
      center={`${Math.floor(total / 60)}h`}
      subtitle={t('totalDuration')}
      values={values}
    />
  )
}
