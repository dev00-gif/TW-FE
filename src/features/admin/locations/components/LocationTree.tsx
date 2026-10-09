import {
  Building2,
  ChevronDown,
  ChevronRight,
  MapPin,
  Search,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Province, Ward } from '../types'
import { filterLocations } from '../utils'

export function LocationTree({
  provinces,
  wards,
  provinceCode,
  wardCode,
  search,
  onSearch,
  onProvinceSelect,
  onWardSelect,
  wardsLoading,
}: {
  provinces: Province[]
  wards: Ward[]
  provinceCode: string
  wardCode: string | null
  search: string
  onSearch: (value: string) => void
  onProvinceSelect: (code: string) => void
  onWardSelect: (code: string) => void
  wardsLoading: boolean
}) {
  const { t } = useTranslation('adminLocations')
  const visibleProvinces = filterLocations(provinces, search)
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-blue-950 dark:text-white">
        <Building2 className="size-4 text-blue-600" />
        {t('treeTitle')}
      </h2>
      <label className="mx-3 mb-2 flex h-9 items-center gap-2 rounded-lg bg-slate-50 px-3 text-slate-500 dark:bg-slate-800">
        <Search className="size-4" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={t('searchProvince')}
          aria-label={t('searchProvince')}
          className="min-w-0 w-full bg-transparent text-xs outline-none"
        />
      </label>
      <div className="max-h-[465px] overflow-y-auto px-2 pb-3">
        {visibleProvinces.map((province) => (
          <div key={province.code}>
            <button
              type="button"
              onClick={() => onProvinceSelect(province.code)}
              className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left text-xs ${provinceCode === province.code ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200'}`}
            >
              {provinceCode === province.code ? (
                <ChevronDown className="size-3.5 shrink-0" />
              ) : (
                <ChevronRight className="size-3.5 shrink-0" />
              )}
              <Building2 className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                {province.name.trim()}
              </span>
              <span
                className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] tabular-nums text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                title={`${t('deviceCount')}: ${province.deviceCount.toLocaleString()}`}
              >
                {province.deviceCount.toLocaleString()}
              </span>
            </button>
            {provinceCode === province.code && (
              <div className="ml-5 border-l border-blue-100 pl-2 dark:border-slate-700">
                {wardsLoading ? (
                  <p className="px-2 py-2 text-xs text-slate-500">
                    {t('loading')}
                  </p>
                ) : wards.length ? (
                  wards.map((ward) => (
                    <button
                      key={ward.code}
                      type="button"
                      onClick={() => onWardSelect(ward.code)}
                      className={`flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs ${wardCode === ward.code ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300'}`}
                    >
                      <MapPin className="size-3 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">
                        {ward.name.trim()}
                      </span>
                      <span
                        className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        title={`${t('deviceCount')}: ${ward.deviceCount.toLocaleString()}`}
                      >
                        {ward.deviceCount.toLocaleString()}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-2 py-2 text-xs text-slate-500">
                    {t('noWards')}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        {!visibleProvinces.length && (
          <p className="px-3 py-6 text-center text-xs text-slate-500">
            {t('empty')}
          </p>
        )}
      </div>
    </section>
  )
}
