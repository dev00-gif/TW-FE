import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { RowSelectionState } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Eye, Pencil, SlidersHorizontal, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Table } from '@/components/table/Table'
import { Checkbox } from '@/components/ui/checkbox'
import type { ScheduleItem, ScheduleStatus } from '../types'

const helper = createColumnHelper<ScheduleItem>()
const categoryClass = {
  normal: 'bg-sky-50 text-blue-700',
  propaganda: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  emergency: 'bg-rose-50 text-rose-700',
  maintenance: 'bg-violet-50 text-violet-700',
}
const statusClass = {
  published: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-rose-50 text-rose-700',
}

export function ScheduleTable({
  items,
  search,
  status,
  onSearch,
  onStatus,
  onView,
  onEdit,
  onCancel,
}: {
  items: ScheduleItem[]
  search: string
  status: ScheduleStatus | 'all'
  onSearch: (value: string) => void
  onStatus: (value: ScheduleStatus | 'all') => void
  onView: (item: ScheduleItem) => void
  onEdit: (item: ScheduleItem) => void
  onCancel: (item: ScheduleItem) => void
}) {
  const { t } = useTranslation('adminSchedules')
  const [page, setPage] = useState(1)
  const [selection, setSelection] = useState<RowSelectionState>({})
  const limit = 5
  const totalPages = Math.max(1, Math.ceil(items.length / limit))
  const safePage = Math.min(page, totalPages)
  const pageItems = items.slice((safePage - 1) * limit, safePage * limit)
  const columns = useMemo(
    () => [
      helper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            aria-label={t('all')}
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(checked) =>
              table.toggleAllPageRowsSelected(checked === true)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={row.original.title}
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(checked === true)}
          />
        ),
        size: 36,
      }),
      helper.display({
        id: 'number',
        header: t('number'),
        cell: ({ row }) => (safePage - 1) * limit + row.index + 1,
        size: 44,
      }),
      helper.accessor('title', {
        header: t('scheduleName'),
        cell: ({ row }) => (
          <div className="flex min-w-42 items-center gap-2">
            <img
              src={row.original.image}
              alt=""
              loading="lazy"
              className="size-7 rounded object-cover"
            />
            <span className="font-medium">{row.original.title}</span>
          </div>
        ),
      }),
      helper.accessor('content', {
        header: t('postContent'),
        cell: ({ getValue }) => (
          <span className="block max-w-48 truncate">{getValue()}</span>
        ),
      }),
      helper.accessor('category', {
        header: t('category'),
        cell: ({ getValue }) => (
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${categoryClass[getValue()]}`}
          >
            {t(`categories.${getValue()}`)}
          </span>
        ),
      }),
      helper.accessor('channel', {
        header: t('channel'),
        cell: ({ getValue }) => t(`channels.${getValue()}`),
      }),
      helper.accessor('area', { header: t('areaDevice') }),
      helper.accessor('scheduledAt', {
        header: t('broadcastTime'),
        cell: ({ getValue }) =>
          format(new Date(getValue()), 'dd/MM/yyyy HH:mm'),
      }),
      helper.accessor('status', {
        header: t('status'),
        cell: ({ getValue }) => (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass[getValue()]}`}
          >
            {t(`statuses.${getValue()}`)}
          </span>
        ),
      }),
      helper.display({
        id: 'actions',
        header: t('actions'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-blue-600">
            <button
              type="button"
              aria-label={t('viewAction')}
              title={t('viewAction')}
              onClick={() => onView(row.original)}
              className="rounded p-1 hover:bg-blue-50"
            >
              <Eye className="size-4" />
            </button>
            <button
              type="button"
              aria-label={t('editAction')}
              title={t('editAction')}
              onClick={() => onEdit(row.original)}
              className="rounded p-1 hover:bg-blue-50"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              aria-label={t('cancelAction')}
              title={t('cancelAction')}
              disabled={row.original.status === 'cancelled'}
              onClick={() => onCancel(row.original)}
              className="rounded p-1 hover:bg-rose-50 disabled:opacity-30"
            >
              <XCircle className="size-4" />
            </button>
          </div>
        ),
      }),
    ],
    [onView, onEdit, onCancel, safePage, t],
  )
  return (
    <section
      id="schedule-table"
      className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('scheduleList')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label={t('status')}
            value={status}
            onChange={(event) =>
              onStatus(event.target.value as ScheduleStatus | 'all')
            }
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="all">{t('all')}</option>
            {(['published', 'pending', 'cancelled'] as const).map((value) => (
              <option key={value} value={value}>
                {t(`statuses.${value}`)}
              </option>
            ))}
          </select>
          <input
            aria-label={t('searchPlaceholder')}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-800"
          />
          <a
            href="#schedule-filters"
            className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs text-blue-600 dark:border-slate-700"
          >
            <SlidersHorizontal className="size-3" />
            {t('advancedFilter')}
          </a>
        </div>
      </div>
      <Table
        data={pageItems}
        columns={columns}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        getRowId={(item) => item.id}
        pagination={{ page: safePage, limit, total: items.length, totalPages }}
        onPageChange={setPage}
        emptyMessage={t('noSchedules')}
        className="rounded-none border-0 shadow-none"
      />
    </section>
  )
}
