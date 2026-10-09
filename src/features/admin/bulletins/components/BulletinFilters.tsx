import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DateRangeModalPicker } from '@/components/common/DateRangeModalPicker'
import { bulletinAreas } from '../services/bulletinService'
import type {
  BulletinFilters as Filters,
  BulletinType,
  BulletinChannel,
  BulletinPriority,
  BulletinStatus,
} from '../types'

const field =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

export function BulletinFilters({
  value,
  onChange,
  onReset,
}: {
  value: Filters
  onChange: (value: Filters) => void
  onReset: () => void
}) {
  const { t } = useTranslation('adminBulletins')
  const [advanced, setAdvanced] = useState(false)
  const update = (patch: Partial<Filters>) =>
    onChange({ ...value, ...patch, page: 1 })
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(180px,1.5fr)_repeat(4,minmax(115px,0.8fr))_minmax(165px,1fr)_auto] xl:items-end">
        <label className="relative block">
          <span className="sr-only">{t('search')}</span>
          <Search className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400" />
          <input
            value={value.search}
            onChange={(event) => update({ search: event.target.value })}
            placeholder={t('search')}
            className={`${field} pl-9`}
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>{t('type')}</span>
          <select
            value={value.type}
            onChange={(event) =>
              update({ type: event.target.value as BulletinType | 'all' })
            }
            className={field}
          >
            <option value="all">{t('all')}</option>
            {(
              ['news', 'notice', 'warning', 'emergency', 'campaign'] as const
            ).map((type) => (
              <option key={type} value={type}>
                {t(`types.${type}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>{t('channel')}</span>
          <select
            value={value.channel}
            onChange={(event) =>
              update({ channel: event.target.value as BulletinChannel | 'all' })
            }
            className={field}
          >
            <option value="all">{t('all')}</option>
            {(['radio', 'display'] as const).map((channel) => (
              <option key={channel} value={channel}>
                {t(`channels.${channel}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>{t('priority')}</span>
          <select
            value={value.priority}
            onChange={(event) =>
              update({
                priority: event.target.value as BulletinPriority | 'all',
              })
            }
            className={field}
          >
            <option value="all">{t('all')}</option>
            {(['low', 'medium', 'high'] as const).map((priority) => (
              <option key={priority} value={priority}>
                {t(`priorities.${priority}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>{t('area')}</span>
          <select
            value={value.area}
            onChange={(event) => update({ area: event.target.value })}
            className={field}
          >
            <option value="all">{t('all')}</option>
            {bulletinAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>{t('createdRange')}</span>
          <DateRangeModalPicker
            value={{
              from: value.from ? parseISO(value.from) : undefined,
              to: value.to ? parseISO(value.to) : undefined,
            }}
            onApply={(range) => {
              if (range.from && range.to)
                update({
                  from: format(range.from, 'yyyy-MM-dd'),
                  to: format(range.to, 'yyyy-MM-dd'),
                })
            }}
            label={t('chooseRange')}
            showLabel={false}
            title={t('dateRangeTitle')}
            description={t('dateRangeDescription')}
            applyLabel={t('apply')}
            cancelLabel={t('cancel')}
            fromLabel={t('from')}
            toLabel={t('to')}
            maxDays={3650}
            className="w-full"
            buttonClassName="h-10 min-w-0 w-full dark:text-slate-100"
          />
        </div>
        <button
          type="button"
          aria-expanded={advanced}
          onClick={() => setAdvanced((current) => !current)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 text-sm text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950"
        >
          <SlidersHorizontal className="size-4" />
          {t('advanced')}
        </button>
      </div>
      {advanced && (
        <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <label className="w-44 space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>{t('status')}</span>
            <select
              value={value.status}
              onChange={(event) =>
                update({ status: event.target.value as BulletinStatus | 'all' })
              }
              className={field}
            >
              <option value="all">{t('all')}</option>
              {(
                [
                  'draft',
                  'pending',
                  'approved',
                  'published',
                  'rejected',
                ] as const
              ).map((status) => (
                <option key={status} value={status}>
                  {t(`statuses.${status}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="w-56 space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>{t('author')}</span>
            <input
              value={value.author}
              onChange={(event) => update({ author: event.target.value })}
              placeholder={t('authorSearch')}
              className={field}
            />
          </label>
          <button
            type="button"
            onClick={onReset}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t('resetFilters')}
          </button>
        </div>
      )}
    </section>
  )
}
