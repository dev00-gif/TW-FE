import { useState } from 'react'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DateRange } from 'react-day-picker'
import { DateRangeModalPicker } from '@/components/common/DateRangeModalPicker'
import { Button } from '@/components/ui/button'
import {
  ReportDurationChart,
  ReportSuccessChart,
  ReportVolumeChart,
} from '../components/ReportCharts'
import { ReportMap } from '../components/ReportMap'
import { ReportMetricCards } from '../components/ReportMetricCards'
import {
  ReportAreaTable,
  ReportDeviceTable,
  ReportFailureTable,
  ReportSummaryTable,
} from '../components/ReportTables'
import { useReportOverview } from '../hooks/useReports'
import { reportAreas } from '../services/reportService'
import type { ReportFilters, ReportPeriod } from '../types'

export default function ReportsPage() {
  const { t } = useTranslation('adminReports')
  const [filters, setFilters] = useState<ReportFilters>(() => ({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    area: 'all',
  }))
  const [volumePeriod, setVolumePeriod] = useState<ReportPeriod>('day')
  const [summaryPeriod, setSummaryPeriod] = useState<ReportPeriod>('day')
  const query = useReportOverview(filters)
  const report = query.data
  const range: DateRange = {
    from: new Date(`${filters.from}T00:00:00`),
    to: new Date(`${filters.to}T00:00:00`),
  }

  const onRangeApply = (value: DateRange) => {
    if (!value.from || !value.to) return
    setFilters((current) => ({
      ...current,
      from: format(value.from!, 'yyyy-MM-dd'),
      to: format(value.to!, 'yyyy-MM-dd'),
    }))
  }

  const exportCsv = () => {
    if (!report) return
    const header = [
      'date',
      'normal',
      'emergency',
      'warning',
      'other',
      'success',
      'failed',
      'durationMinutes',
    ]
    const rows = report.days.map((day) =>
      header.map((key) => day[key as keyof typeof day]).join(','),
    )
    const csv = `\uFEFF${[header.join(','), ...rows].join('\r\n')}`
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `bao-cao-${filters.from}-${filters.to}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="space-y-3 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/dashboard" className="hover:text-blue-600">
              {t('home')}
            </Link>
            <span>›</span>
            <span>{t('title')}</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-950 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">{t('description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeModalPicker
            value={range}
            onApply={onRangeApply}
            label={t('dateRange')}
            showLabel={false}
            title={t('dateRangeTitle')}
            description={t('dateRangeDescription')}
            applyLabel={t('apply')}
            cancelLabel={t('cancel')}
            fromLabel={t('from')}
            toLabel={t('to')}
            maxDays={366}
            buttonClassName="bg-white dark:bg-slate-900 dark:text-white"
          />
          <select
            aria-label={t('area')}
            value={filters.area}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                area: event.target.value,
              }))
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">{t('allAreas')}</option>
            {reportAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          <Button onClick={exportCsv} disabled={!report}>
            <Download className="size-4" />
            {t('export')}
          </Button>
        </div>
      </div>
      {query.isError ? (
        <div
          role="alert"
          className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700"
        >
          {t('loadError')}
        </div>
      ) : !report ? (
        <div className="rounded-lg bg-white p-8 text-center text-sm text-slate-500">
          {t('loading')}
        </div>
      ) : (
        <>
          <ReportMetricCards metrics={report.metrics} />
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.9fr)_minmax(260px,0.9fr)]">
            <ReportVolumeChart
              days={report.days}
              period={volumePeriod}
              onPeriodChange={setVolumePeriod}
            />
            <ReportSuccessChart metrics={report.metrics} />
            <ReportDurationChart
              durationByType={report.durationByType}
              total={report.metrics.durationMinutes}
            />
          </div>
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,0.9fr)]">
            <ReportAreaTable areas={report.areas} />
            <ReportMap areas={report.areas} />
            <ReportDeviceTable devices={report.devices} />
          </div>
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <ReportFailureTable failures={report.failures} />
            <ReportSummaryTable
              days={report.days}
              period={summaryPeriod}
              onPeriodChange={setSummaryPeriod}
            />
          </div>
        </>
      )}
    </div>
  )
}
