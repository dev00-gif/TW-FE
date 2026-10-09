import { TerritoryNotice } from '@/features/territory/TerritoryNotice'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useRef, useState } from 'react'
import { addDays, addMonths, addWeeks, format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { Download, Plus, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ScheduleCalendar } from '../components/ScheduleCalendar'
import type { CalendarMode } from '../components/ScheduleCalendar'
import { ScheduleDialog } from '../components/ScheduleDialog'
import { ScheduleFilters } from '../components/ScheduleFilters'
import { ScheduleSidebar } from '../components/ScheduleSidebar'
import { ScheduleTable } from '../components/ScheduleTable'
import { ScheduleToolbar } from '../components/ScheduleToolbar'
import {
  useCancelSchedule,
  useCreateSchedule,
  useImportSchedules,
  useSchedules,
  useUpdateSchedule,
} from '../hooks/useSchedules'
import { parseScheduleImport, scheduleMonthRange } from '../utils'
import type {
  ScheduleFilters as Filters,
  ScheduleInput,
  ScheduleItem,
  ScheduleStatus,
} from '../types'

export default function SchedulesPage() {
  const { t } = useTranslation('adminSchedules')
  const mayCreate = usePermission('broadcast.schedule.create')
  const mayUpdate = usePermission('broadcast.schedule.update')
  const [initialDate] = useState(() => new Date())
  const [date, setDate] = useState(initialDate)
  const [mode, setMode] = useState<CalendarMode>('month')
  const [filters, setFilters] = useState<Filters>({
    ...scheduleMonthRange(initialDate),
    search: '',
    category: 'all',
    channel: 'all',
    status: 'all',
    area: 'all',
  })
  const [dialog, setDialog] = useState<{
    mode: 'create' | 'edit' | 'view'
    item?: ScheduleItem
  } | null>(null)
  const [notice, setNotice] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const query = useSchedules(filters)
  const create = useCreateSchedule()
  const update = useUpdateSchedule()
  const cancel = useCancelSchedule()
  const importer = useImportSchedules()
  const items = query.data ?? []

  const navigateDate = (step: number) => {
    const next =
      mode === 'day'
        ? addDays(date, step)
        : mode === 'week'
          ? addWeeks(date, step)
          : addMonths(date, step)
    setDate(next)
    setFilters((current) => ({ ...current, ...scheduleMonthRange(next) }))
  }
  const today = () => {
    const next = new Date()
    setDate(next)
    setFilters((current) => ({ ...current, ...scheduleMonthRange(next) }))
  }
  const save = async (input: ScheduleInput) => {
    if (dialog?.mode === 'edit' && dialog.item)
      await update.mutateAsync({ id: dialog.item.id, input })
    else await create.mutateAsync(input)
    setDialog(null)
  }
  const cancelItem = (item: ScheduleItem) => {
    if (mayUpdate && window.confirm(t('confirmCancel')))
      void cancel.mutateAsync(item.id)
  }
  const exportItems = () => {
    const data = items.map(({ id: _id, ...input }) => input)
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `lich-phat-${format(date, 'yyyy-MM')}.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const importItems = async (file?: File) => {
    if (!file) return
    const result = parseScheduleImport(await file.text())
    if (!result.success) {
      setNotice(t('importError'))
      return
    }
    const count = await importer.mutateAsync(result.data)
    setNotice(t('importSuccess', { count }))
  }
  const setStatus = (status: ScheduleStatus | 'all') =>
    setFilters((current) => ({ ...current, status }))
  const setSearch = (search: string) =>
    setFilters((current) => ({ ...current, search }))

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/dashboard" className="hover:text-blue-600">
              {t('home')}
            </Link>
            <span>›</span>
            <span>{t('breadcrumb')}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-950 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('description')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outlinePrimary" onClick={exportItems}>
            <Download />
            {t('export')}
          </Button>
          <Button
            variant="outlinePrimary"
            disabled={!mayCreate}
            onClick={() => fileInput.current?.click()}
          >
            <Upload />
            {t('import')}
          </Button>
          <Button
            disabled={!mayCreate}
            onClick={() => setDialog({ mode: 'create' })}
          >
            <Plus />
            {t('create')}
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            aria-label={t('importHint')}
            className="hidden"
            onChange={(event) => {
              void importItems(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </div>
      </div>
      <TerritoryNotice />
      {notice && (
        <div
          role="status"
          className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950"
        >
          {notice}
        </div>
      )}
      <div id="schedule-filters">
        <ScheduleFilters value={filters} onChange={setFilters} />
      </div>
      <ScheduleToolbar
        date={date}
        mode={mode}
        onMode={setMode}
        onToday={today}
        onPrevious={() => navigateDate(-1)}
        onNext={() => navigateDate(1)}
      />
      {query.isError ? (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-5 text-sm text-red-700"
        >
          {t('loadError')}
        </div>
      ) : query.isPending ? (
        <div className="rounded-xl bg-white p-5 text-sm text-slate-500">
          {t('loading')}
        </div>
      ) : mode === 'list' ? (
        <ScheduleTable
          items={items}
          search={filters.search}
          status={filters.status}
          onSearch={setSearch}
          onStatus={setStatus}
          onView={(item) => setDialog({ mode: 'view', item })}
          onEdit={(item) => {
            if (mayUpdate) setDialog({ mode: 'edit', item })
          }}
          onCancel={cancelItem}
        />
      ) : (
        <>
          <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,2.5fr)_minmax(310px,1fr)]">
            <ScheduleCalendar
              date={date}
              mode={mode}
              items={items}
              onSelect={(item) => setDialog({ mode: 'view', item })}
            />
            <ScheduleSidebar
              items={items}
              onSelect={(item) => setDialog({ mode: 'view', item })}
              onViewAll={() => setMode('list')}
            />
          </div>
          <ScheduleTable
            items={items}
            search={filters.search}
            status={filters.status}
            onSearch={setSearch}
            onStatus={setStatus}
            onView={(item) => setDialog({ mode: 'view', item })}
            onEdit={(item) => {
              if (mayUpdate) setDialog({ mode: 'edit', item })
            }}
            onCancel={cancelItem}
          />
        </>
      )}
      {dialog && (
        <ScheduleDialog
          key={`${dialog.mode}-${dialog.item?.id ?? 'new'}`}
          mode={dialog.mode}
          item={dialog.item}
          selectedDate={date}
          onClose={() => setDialog(null)}
          onSave={save}
          saving={create.isPending || update.isPending}
        />
      )}
    </div>
  )
}
