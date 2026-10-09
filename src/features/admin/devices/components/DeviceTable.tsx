import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import type { RowSelectionState } from '@tanstack/react-table'
import { Eye, Search, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Table } from '@/components/table/Table'
import { Checkbox } from '@/components/ui/checkbox'
import type { Device, DeviceFilters } from '../types'
import { allowedDemoAreas } from '@/features/territory/demoAreas'
import { useTerritory } from '@/features/territory/useTerritory'
import { DeviceStatusBadge } from './DeviceStatusBadge'

const helper = createColumnHelper<Device>()
const selectClass =
  'h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'

export function DeviceTable({
  items,
  filters,
  onFiltersChange,
  onSelect,
  onEdit,
}: {
  items: Device[]
  filters: DeviceFilters
  onFiltersChange: (filters: DeviceFilters) => void
  onSelect: (device: Device) => void
  onEdit: (device: Device) => void
}) {
  const { t } = useTranslation('adminDevices')
  const { access } = useTerritory()
  const areas = allowedDemoAreas(access)
  const deviceAreas = areas.map((area) => area.name)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [selection, setSelection] = useState<RowSelectionState>({})
  const totalPages = Math.max(1, Math.ceil(items.length / limit))
  const safePage = Math.min(page, totalPages)
  const pageItems = items.slice((safePage - 1) * limit, safePage * limit)
  const columns = useMemo(
    () => [
      helper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            aria-label={t('selectAll')}
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={row.original.id}
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(v === true)}
          />
        ),
        size: 36,
      }),
      helper.display({
        id: 'number',
        header: '#',
        cell: ({ row }) => (safePage - 1) * limit + row.index + 1,
        size: 44,
      }),
      helper.accessor('id', {
        header: t('deviceCode'),
        cell: ({ row }) => (
          <Link
            to="/dashboard/devices/$deviceId"
            params={{ deviceId: row.original.id }}
            className="font-medium text-blue-600 hover:underline"
          >
            {row.original.id}
          </Link>
        ),
      }),
      helper.accessor('name', {
        header: t('deviceName'),
        cell: ({ row }) => (
          <button
            type="button"
            className="hover:text-blue-600"
            onClick={() => onSelect(row.original)}
          >
            {row.original.name}
          </button>
        ),
      }),
      helper.accessor('type', {
        header: t('deviceType'),
        cell: ({ getValue }) => t(`types.${getValue()}`),
      }),
      helper.accessor('area', { header: t('area') }),
      helper.accessor('status', {
        header: t('status'),
        cell: ({ getValue }) => <DeviceStatusBadge status={getValue()} />,
      }),
      helper.accessor('firmware', { header: t('firmware') }),
      helper.accessor('signal', {
        header: t('signal'),
        cell: ({ getValue }) => (
          <span className="font-medium text-emerald-600">
            ▂▄▆ {getValue()} dBm
          </span>
        ),
      }),
      helper.accessor('uptimeDays', {
        header: t('uptime'),
        cell: ({ getValue }) => t('days', { count: getValue() }),
      }),
      helper.accessor('nextBroadcast', {
        header: t('nextBroadcast'),
        cell: ({ getValue }) =>
          getValue() ? getValue().replace('T', ' ') : '—',
      }),
      helper.accessor('program', {
        header: t('program'),
        cell: ({ getValue }) => getValue() || '—',
      }),
      helper.display({
        id: 'actions',
        header: t('actions'),
        cell: ({ row }) => (
          <div className="flex gap-2 text-blue-600">
            <Link
              to="/dashboard/devices/$deviceId"
              params={{ deviceId: row.original.id }}
              aria-label={t('view')}
              title={t('view')}
            >
              <Eye className="size-4" />
            </Link>
            <button
              type="button"
              aria-label={t('edit')}
              title={t('edit')}
              onClick={() => onEdit(row.original)}
            >
              <Settings2 className="size-4" />
            </button>
          </div>
        ),
      }),
    ],
    [limit, onEdit, onSelect, safePage, t],
  )
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3">
        <h2 className="text-sm font-bold text-blue-950 dark:text-white">
          {t('listTitle')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <label className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-2 dark:border-slate-700">
            <Search className="size-4 text-slate-400" />
            <input
              aria-label={t('search')}
              className="w-44 bg-transparent text-xs outline-none sm:w-56"
              value={filters.search}
              onChange={(e) => {
                onFiltersChange({ ...filters, search: e.target.value })
                setPage(1)
              }}
              placeholder={t('search')}
            />
          </label>
          <select
            className={selectClass}
            aria-label={t('allTypes')}
            value={filters.type}
            onChange={(e) => {
              onFiltersChange({
                ...filters,
                type: e.target.value as DeviceFilters['type'],
              })
              setPage(1)
            }}
          >
            <option value="all">{t('allTypes')}</option>
            {(['speaker', 'display', 'camera'] as const).map((type) => (
              <option key={type} value={type}>
                {t(`types.${type}`)}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            aria-label={t('allStatuses')}
            value={filters.status}
            onChange={(e) => {
              onFiltersChange({
                ...filters,
                status: e.target.value as DeviceFilters['status'],
              })
              setPage(1)
            }}
          >
            <option value="all">{t('allStatuses')}</option>
            {(['active', 'offline', 'error', 'maintenance'] as const).map(
              (status) => (
                <option key={status} value={status}>
                  {t(`statuses.${status}`)}
                </option>
              ),
            )}
          </select>
          <select
            className={selectClass}
            aria-label={t('allAreas')}
            value={filters.area}
            onChange={(e) => {
              onFiltersChange({ ...filters, area: e.target.value })
              setPage(1)
            }}
          >
            <option value="all">{t('allAreas')}</option>
            {deviceAreas.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>
      <Table
        data={pageItems}
        columns={columns}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        getRowId={(row) => row.id}
        emptyMessage={t('empty')}
        pagination={{ page: safePage, limit, total: items.length, totalPages }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size)
          setPage(1)
        }}
        className="rounded-none border-0"
      />
    </section>
  )
}
