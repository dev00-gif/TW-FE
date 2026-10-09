import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { createColumnHelper } from '@tanstack/react-table'
import type { RowSelectionState } from '@tanstack/react-table'
import { Eye, MoreVertical, Pencil, Radio, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Table } from '@/components/table/Table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Bulletin, BulletinStatus } from '../types'
import {
  BulletinPriorityBadge,
  BulletinStatusBadge,
  BulletinTypeBadge,
} from './BulletinBadges'

const helper = createColumnHelper<Bulletin>()

export function BulletinTable({
  items,
  page,
  limit,
  onView,
  onEdit,
  onSetStatus,
}: {
  items: Bulletin[]
  page: number
  limit: number
  onView: (item: Bulletin) => void
  onEdit: (item: Bulletin) => void
  onSetStatus: (item: Bulletin, status: BulletinStatus) => void
}) {
  const { t } = useTranslation('adminBulletins')
  const [selection, setSelection] = useState<RowSelectionState>({})
  const columns = useMemo(
    () => [
      helper.display({
        id: 'select',
        size: 36,
        header: ({ table }) => (
          <Checkbox
            aria-label={t('selectAll')}
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(checked) =>
              table.toggleAllPageRowsSelected(checked === true)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`${t('view')}: ${row.original.title}`}
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(checked === true)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      }),
      helper.display({
        id: 'number',
        header: '#',
        size: 42,
        cell: ({ row }) => (page - 1) * limit + row.index + 1,
      }),
      helper.accessor('title', {
        header: t('columnTitle'),
        size: 250,
        cell: ({ row }) => (
          <div className="flex min-w-58 items-center gap-2">
            <img
              src={row.original.image}
              alt=""
              className="size-11 shrink-0 rounded-md bg-slate-100 object-cover"
              loading="lazy"
            />
            <span className="line-clamp-2 max-w-56 text-sm font-medium whitespace-normal text-blue-950 dark:text-white">
              {row.original.title}
            </span>
          </div>
        ),
      }),
      helper.accessor('type', {
        header: t('type'),
        size: 94,
        cell: ({ getValue }) => <BulletinTypeBadge value={getValue()} />,
      }),
      helper.accessor('channels', {
        header: t('channel'),
        size: 76,
        cell: ({ getValue }) => (
          <span className="inline-flex items-center gap-2 text-blue-600">
            {getValue().includes('radio') && (
              <Radio className="size-4" aria-label={t('channels.radio')} />
            )}
            {getValue().includes('display') && (
              <Monitor className="size-4" aria-label={t('channels.display')} />
            )}
          </span>
        ),
      }),
      helper.accessor('area', {
        header: t('area'),
        size: 112,
        cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
      }),
      helper.accessor('priority', {
        header: t('priority'),
        size: 100,
        cell: ({ getValue }) => <BulletinPriorityBadge value={getValue()} />,
      }),
      helper.accessor('status', {
        header: t('status'),
        size: 100,
        cell: ({ getValue }) => <BulletinStatusBadge value={getValue()} />,
      }),
      helper.accessor('createdAt', {
        header: t('createdAt'),
        size: 90,
        cell: ({ getValue }) => (
          <span className="text-xs">
            {format(parseISO(getValue()), 'dd/MM/yyyy')}
            <br />
            {format(parseISO(getValue()), 'HH:mm')}
          </span>
        ),
      }),
      helper.display({
        id: 'actions',
        header: t('actions'),
        size: 96,
        cell: ({ row }) => (
          <div
            className="flex items-center gap-1 text-blue-600"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label={t('view')}
              title={t('view')}
              className="rounded p-1 hover:bg-blue-50 dark:hover:bg-slate-800"
              onClick={() => onView(row.original)}
            >
              <Eye className="size-4" />
            </button>
            <button
              type="button"
              aria-label={t('edit')}
              title={t('edit')}
              className="rounded p-1 hover:bg-blue-50 dark:hover:bg-slate-800"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('more')}
                  title={t('more')}
                  className="rounded p-1 hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  <MoreVertical className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => onSetStatus(row.original, 'approved')}
                >
                  {t('approve')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onSetStatus(row.original, 'rejected')}
                >
                  {t('reject')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    [limit, onEdit, onView, onSetStatus, page, t],
  )
  return (
    <Table
      data={items}
      columns={columns}
      emptyMessage={t('empty')}
      getRowId={(row) => row.id}
      rowSelection={selection}
      onRowSelectionChange={setSelection}
      onRowClick={onView}
      className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800"
    />
  )
}
