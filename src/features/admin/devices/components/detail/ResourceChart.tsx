import { useMemo, useState } from 'react'
import { defineChart, lineY } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/react-charts'
import { scaleLinear } from 'd3-scale'
import { useTranslation } from 'react-i18next'
import type { Device } from '../../types'
import { getResourceHistory } from '../../services/deviceDetailMock'

export function ResourceChart({ device }: { device: Device }) {
  const { t } = useTranslation('adminDevices')
  const [period, setPeriod] = useState<'day' | 'week'>('day')
  const data = useMemo(
    () => getResourceHistory(device, period),
    [device, period],
  )
  const chart = useMemo(
    () =>
      defineChart({
        marks: [
          lineY(data, {
            x: 'point',
            y: 'value',
            z: 'metric',
            color: 'metric',
            strokeWidth: 2.4,
          }),
        ],
        x: {
          scale: scaleLinear,
          domain: [0, period === 'day' ? 23 : 6],
          nice: false,
        },
        y: { scale: scaleLinear, domain: [0, 100], grid: true, nice: false },
        color: {
          domain: ['cpu', 'ram', 'temperature'],
          range: ['#1677ff', '#14b86a', '#f04452'],
        },
        tooltip: {
          use: tooltip,
          format: (point) =>
            `${point.datum.label} · ${t(`resource.${point.datum.metric}`)}: ${point.datum.value}${point.datum.metric === 'temperature' ? '°C' : '%'}`,
        },
      }),
    [data, period, t],
  )
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <h3 className="text-base font-bold text-blue-950 dark:text-white">
          {t('detail.resourceChart')}
        </h3>
        <select
          aria-label={t('detail.chartPeriod')}
          className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'day' | 'week')}
        >
          <option value="day">{t('detail.last24Hours')}</option>
          <option value="week">{t('detail.last7Days')}</option>
        </select>
      </div>
      <div className="mt-2 flex justify-end gap-3 text-xs text-slate-500">
        {(['cpu', 'ram', 'temperature'] as const).map((metric) => (
          <span key={metric} className="flex items-center gap-1">
            <i
              className={`size-2 rounded-full ${metric === 'cpu' ? 'bg-blue-500' : metric === 'ram' ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
            {t(`resource.${metric}`)}
          </span>
        ))}
      </div>
      <Chart
        definition={chart}
        height={190}
        ariaLabel={t('detail.resourceChart')}
      />
    </div>
  )
}
