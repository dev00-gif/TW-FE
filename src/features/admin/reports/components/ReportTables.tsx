import { format, parseISO } from 'date-fns'
import { CalendarDays, ListChecks, Radio, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type {
  FailedBroadcast,
  ReportArea,
  ReportDay,
  ReportDevice,
  ReportPeriod,
} from '../types'
import { aggregateReportDays, reportDayTotal } from '../utils'

const card =
  'min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
const th =
  'whitespace-nowrap bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300'
const td =
  'whitespace-nowrap border-t border-slate-100 px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300'

function TableTitle({
  title,
  icon: Icon,
  action,
}: {
  title: string
  icon: typeof Radio
  action?: React.ReactNode
}) {
  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 px-4 py-2">
      <h2 className="flex items-center gap-2 text-sm font-bold text-blue-950 dark:text-white">
        <Icon className="size-4 text-blue-600" />
        {title}
      </h2>
      {action}
    </div>
  )
}

function Rate({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-emerald-600">
        {value.toFixed(1)}%
      </span>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
        <span
          className="block h-full rounded-full bg-emerald-500"
          style={{ width: `${value}%` }}
        />
      </span>
    </div>
  )
}

export function ReportAreaTable({ areas }: { areas: ReportArea[] }) {
  const { t, i18n } = useTranslation('adminReports')
  const number = new Intl.NumberFormat(
    i18n.language === 'en' ? 'en-US' : 'vi-VN',
  )
  return (
    <section className={card}>
      <TableTitle title={t('areaTable')} icon={ListChecks} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>#</th>
              <th className={th}>{t('area')}</th>
              <th className={th}>{t('broadcasts')}</th>
              <th className={th}>{t('successRate')}</th>
            </tr>
          </thead>
          <tbody>
            {areas.map((area, index) => (
              <tr key={area.id}>
                <td className={td}>{index + 1}</td>
                <td className={`${td} font-medium text-blue-700`}>
                  {area.name}
                </td>
                <td className={td}>{number.format(area.broadcasts)}</td>
                <td className={td}>
                  <Rate value={area.successRate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function ReportDeviceTable({ devices }: { devices: ReportDevice[] }) {
  const { t, i18n } = useTranslation('adminReports')
  const number = new Intl.NumberFormat(
    i18n.language === 'en' ? 'en-US' : 'vi-VN',
  )
  return (
    <section className={card}>
      <TableTitle title={t('deviceTable')} icon={Radio} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>#</th>
              <th className={th}>{t('device')}</th>
              <th className={th}>{t('totalBroadcasts')}</th>
              <th className={th}>{t('successRate')}</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={device.id}>
                <td className={td}>{index + 1}</td>
                <td className={`${td} font-medium text-blue-700`}>
                  {device.id}
                </td>
                <td className={td}>{number.format(device.broadcasts)}</td>
                <td className={td}>
                  <Rate value={device.successRate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function ReportFailureTable({
  failures,
}: {
  failures: FailedBroadcast[]
}) {
  const { t } = useTranslation('adminReports')
  return (
    <section className={card}>
      <TableTitle title={t('failureTable')} icon={TriangleAlert} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {(
                [
                  'time',
                  'bulletin',
                  'area',
                  'device',
                  'reason',
                  'status',
                ] as const
              ).map((key) => (
                <th key={key} className={th}>
                  {t(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {failures.map((failure) => (
              <tr key={failure.id}>
                <td className={td}>
                  {format(parseISO(failure.date), 'dd/MM/yyyy HH:mm')}
                </td>
                <td className={td}>{failure.title}</td>
                <td className={td}>{failure.area}</td>
                <td className={td}>{failure.device}</td>
                <td className={td}>
                  <span className="rounded bg-orange-50 px-2 py-1 text-orange-600">
                    {t(`reasons.${failure.reason}`)}
                  </span>
                </td>
                <td className={td}>
                  <span className="rounded bg-rose-50 px-2 py-1 text-rose-600">
                    {t('failed')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!failures.length && (
          <p className="p-4 text-sm text-slate-500">{t('empty')}</p>
        )}
      </div>
    </section>
  )
}

export function ReportSummaryTable({
  days,
  period,
  onPeriodChange,
}: {
  days: ReportDay[]
  period: ReportPeriod
  onPeriodChange: (period: ReportPeriod) => void
}) {
  const { t, i18n } = useTranslation('adminReports')
  const rows = aggregateReportDays(days, period).reverse().slice(0, 5)
  const number = new Intl.NumberFormat(
    i18n.language === 'en' ? 'en-US' : 'vi-VN',
  )
  return (
    <section className={card}>
      <TableTitle
        title={t('summaryTable')}
        icon={CalendarDays}
        action={
          <div className="flex gap-0.5 rounded border border-slate-200 p-0.5">
            {(['day', 'week', 'month', 'year'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onPeriodChange(value)}
                className={`rounded px-2 py-1 text-xs ${period === value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'}`}
              >
                {t(`periods.${value}`)}
              </button>
            ))}
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {(
                [
                  'time',
                  'totalBroadcasts',
                  'success',
                  'failed',
                  'successRate',
                ] as const
              ).map((key) => (
                <th key={key} className={th}>
                  {t(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date}>
                <td className={td}>
                  {period === 'month'
                    ? format(parseISO(row.date), 'MM/yyyy')
                    : period === 'year'
                      ? format(parseISO(row.date), 'yyyy')
                      : format(parseISO(row.date), 'dd/MM/yyyy')}
                </td>
                <td className={td}>{number.format(reportDayTotal(row))}</td>
                <td className={`${td} text-emerald-600`}>
                  {number.format(row.success)}
                </td>
                <td className={`${td} text-rose-600`}>
                  {number.format(row.failed)}
                </td>
                <td className={td}>
                  <Rate
                    value={
                      reportDayTotal(row)
                        ? (row.success / reportDayTotal(row)) * 100
                        : 0
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <p className="p-4 text-sm text-slate-500">{t('empty')}</p>
        )}
      </div>
    </section>
  )
}
