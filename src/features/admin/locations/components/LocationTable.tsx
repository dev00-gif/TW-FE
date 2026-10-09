import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ListFilter, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Province, Ward } from '../types'
import { filterLocations } from '../utils'

type Props = {
  provinces: Province[]
  wards: Ward[]
  provinceCode: string
  wardCode: string | null
  onProvinceSelect: (code: string) => void
  onWardSelect: (code: string) => void
  onExport: (items: Array<Province | Ward>) => void
}

export function LocationTable({
  provinces,
  wards,
  provinceCode,
  wardCode,
  onProvinceSelect,
  onWardSelect,
  onExport,
}: Props) {
  const { t } = useTranslation('adminLocations')
  const [mode, setMode] = useState<'provinces' | 'wards'>('wards')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const rows = useMemo(
    () => filterLocations(mode === 'provinces' ? provinces : wards, search),
    [mode, provinces, wards, search],
  )
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pages)
  const visible = rows.slice((current - 1) * pageSize, current * pageSize)
  const selectMode = (next: 'provinces' | 'wards') => {
    setMode(next)
    setPage(1)
    setSearch('')
  }
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-3 dark:border-slate-800">
        <h2 className="flex items-center gap-2 text-sm font-bold text-blue-950 dark:text-white">
          <ListFilter className="size-4 text-blue-600" />
          {t('listTitle')}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-50 p-1 dark:bg-slate-800">
            {(['provinces', 'wards'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectMode(value)}
                className={`rounded-md px-3 py-1.5 text-xs ${mode === value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {t(`tabs.${value}`)}
              </button>
            ))}
          </div>
          <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-2 dark:border-slate-700">
            <Search className="size-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              aria-label={t('search')}
              placeholder={t('search')}
              className="w-36 bg-transparent text-xs outline-none sm:w-48"
            />
          </label>
          <button
            type="button"
            onClick={() => onExport(rows)}
            disabled={!rows.length}
            className="h-9 rounded-lg border border-blue-200 px-3 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            {t('export')}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">{t('name')}</th>
              <th className="px-3 py-2">{t('code')}</th>
              <th className="px-3 py-2">{t('divisionType')}</th>
              {mode === 'wards' && (
                <th className="px-3 py-2">{t('belongsTo')}</th>
              )}
              <th className="px-3 py-2">{t('deviceCount')}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item, index) => {
              const selected =
                mode === 'provinces'
                  ? provinceCode === item.code
                  : wardCode === item.code
              return (
                <tr
                  key={item.code}
                  onClick={() =>
                    mode === 'provinces'
                      ? onProvinceSelect(item.code)
                      : onWardSelect(item.code)
                  }
                  className={`cursor-pointer border-t border-slate-100 hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-slate-800 ${selected ? 'bg-blue-50/80 dark:bg-blue-950' : ''}`}
                >
                  <td className="px-3 py-2.5 text-slate-500">
                    {(current - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-blue-800 dark:text-blue-200">
                    {item.name.trim()}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">
                    {item.code}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                    {item.divisionType}
                  </td>
                  {mode === 'wards' && (
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                      {provinces
                        .find(
                          (province) =>
                            province.code === (item as Ward).provinceCode,
                        )
                        ?.name.trim() ?? '—'}
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                    {item.deviceCount.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!rows.length && (
          <div className="p-8 text-center text-sm text-slate-500">
            {t('empty')}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-slate-800">
        <span>
          {t('showing', {
            from: rows.length ? (current - 1) * pageSize + 1 : 0,
            to: Math.min(current * pageSize, rows.length),
            total: rows.length,
          })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t('previous')}
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            className="grid size-8 place-items-center rounded border border-slate-200 disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="px-2">
            {current} / {pages}
          </span>
          <button
            type="button"
            aria-label={t('next')}
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
            className="grid size-8 place-items-center rounded border border-slate-200 disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
          <select
            aria-label={t('pageSize')}
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}
            className="ml-1 h-8 rounded border border-slate-200 bg-white px-1 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </section>
  )
}
