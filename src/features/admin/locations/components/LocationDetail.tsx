import { Building2, Hash, MapPin, Radio } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Province, Ward } from '../types'

export function LocationDetail({
  province,
  ward,
  wardCount,
}: {
  province?: Province
  ward?: Ward
  wardCount: number
}) {
  const { t } = useTranslation('adminLocations')
  const item = ward ?? province
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-bold text-blue-950 dark:border-slate-800 dark:text-white">
        <MapPin className="size-4 text-blue-600" />
        {t('detailTitle')}
      </h2>
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-blue-50 via-sky-100 to-emerald-50 dark:from-slate-800 dark:via-blue-950 dark:to-slate-800">
        <span className="grid size-16 place-items-center rounded-2xl bg-white/80 text-blue-600 shadow-sm dark:bg-slate-900">
          <MapPin className="size-9" />
        </span>
      </div>
      <div className="p-4">
        {item ? (
          <>
            <div className="flex items-center gap-2">
              <h3 className="min-w-0 flex-1 text-lg font-bold text-blue-950 dark:text-white">
                {item.name.trim()}
              </h3>
              <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950">
                {item.divisionType}
              </span>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="flex w-28 shrink-0 items-center gap-1.5 text-slate-500">
                  <Hash className="size-4" />
                  {t('code')}
                </dt>
                <dd className="font-medium text-blue-950 dark:text-white">
                  {item.code}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="flex w-28 shrink-0 items-center gap-1.5 text-slate-500">
                  <Radio className="size-4" />
                  {t('deviceCount')}
                </dt>
                <dd className="font-semibold text-blue-700 dark:text-blue-300">
                  {item.deviceCount.toLocaleString()}
                </dd>
              </div>
              {ward && (
                <div className="flex gap-3">
                  <dt className="flex w-28 shrink-0 items-center gap-1.5 text-slate-500">
                    <Building2 className="size-4" />
                    {t('belongsTo')}
                  </dt>
                  <dd className="text-blue-950 dark:text-white">
                    {province?.name.trim()}
                  </dd>
                </div>
              )}
              {!ward && (
                <div className="flex gap-3">
                  <dt className="flex w-28 shrink-0 items-center gap-1.5 text-slate-500">
                    <MapPin className="size-4" />
                    {t('childUnits')}
                  </dt>
                  <dd className="font-semibold text-blue-700">
                    {wardCount.toLocaleString()} {t('wardsUnit')}
                  </dd>
                </div>
              )}
            </dl>
            <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-slate-800">
              {t('referenceOnly')}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-500">{t('chooseProvince')}</p>
        )}
      </div>
    </section>
  )
}
