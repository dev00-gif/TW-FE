import { allowedDemoAreas } from '@/features/territory/demoAreas'
import { useTerritory } from '@/features/territory/useTerritory'
import { Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRangeModalPicker } from '@/components/common/DateRangeModalPicker'
import type {
  ScheduleCategory,
  ScheduleChannel,
  ScheduleFilters as Filters,
  ScheduleStatus,
} from '../types'

const inputClass =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

export function ScheduleFilters({
  value,
  onChange,
}: {
  value: Filters
  onChange: (next: Filters) => void
}) {
  const { t } = useTranslation('adminSchedules')
  const { access } = useTerritory()
  const areas = allowedDemoAreas(access, true)
  const update = (patch: Partial<Filters>) => onChange({ ...value, ...patch })
  const dateRange = useMemo(
    () => ({ from: parseISO(value.from), to: parseISO(value.to) }),
    [value.from, value.to],
  )
  return (
    <div className="grid gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_2fr] dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
        <span>{t('time')}</span>
        <DateRangeModalPicker
          value={dateRange}
          onApply={(range) => {
            if (!range.from || !range.to) return
            update({
              from: format(range.from, 'yyyy-MM-dd'),
              to: format(range.to, 'yyyy-MM-dd'),
            })
          }}
          label=""
          title={t('dateRangeTitle')}
          description={t('dateRangeDescription')}
          applyLabel={t('apply')}
          cancelLabel={t('cancel')}
          fromLabel={t('timeFrom')}
          toLabel={t('timeTo')}
          maxDays={366}
          className="w-full"
          buttonClassName="h-9 min-w-0 w-full border-slate-200 bg-white px-3 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <label className="space-y-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
        <span>{t('channel')}</span>
        <select
          value={value.channel}
          onChange={(event) =>
            update({ channel: event.target.value as ScheduleChannel | 'all' })
          }
          className={inputClass}
        >
          <option value="all">{t('all')}</option>
          {(['radio', 'digital', 'both'] as const).map((item) => (
            <option key={item} value={item}>
              {t(`channels.${item}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
        <span>{t('category')}</span>
        <select
          value={value.category}
          onChange={(event) =>
            update({ category: event.target.value as ScheduleCategory | 'all' })
          }
          className={inputClass}
        >
          <option value="all">{t('all')}</option>
          {(
            [
              'normal',
              'propaganda',
              'warning',
              'emergency',
              'maintenance',
            ] as const
          ).map((item) => (
            <option key={item} value={item}>
              {t(`categories.${item}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
        <span>{t('status')}</span>
        <select
          value={value.status}
          onChange={(event) =>
            update({ status: event.target.value as ScheduleStatus | 'all' })
          }
          className={inputClass}
        >
          <option value="all">{t('all')}</option>
          {(['published', 'pending', 'cancelled'] as const).map((item) => (
            <option key={item} value={item}>
              {t(`statuses.${item}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
        <span>{t('area')}</span>
        <select
          value={value.area}
          onChange={(event) => update({ area: event.target.value })}
          className={inputClass}
        >
          <option value="all">{t('all')}</option>
          {areas.map((area) => (
            <option key={area.name} value={area.name}>
              {area.name}
            </option>
          ))}
        </select>
      </label>
      <label className="relative flex items-end">
        <span className="sr-only">{t('searchPlaceholder')}</span>
        <Search className="pointer-events-none absolute bottom-2.5 left-3 size-4 text-slate-400" />
        <input
          value={value.search}
          onChange={(event) => update({ search: event.target.value })}
          placeholder={t('searchPlaceholder')}
          className={`${inputClass} pl-9`}
        />
      </label>
    </div>
  )
}
