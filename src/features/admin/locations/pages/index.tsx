import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LocationDetail } from '../components/LocationDetail'
import { LocationMap } from '../components/LocationMap'
import { LocationStats } from '../components/LocationStats'
import { LocationTable } from '../components/LocationTable'
import { LocationTree } from '../components/LocationTree'
import {
  useLocationSummary,
  useProvinces,
  useWards,
} from '../hooks/useLocations'
import { exportLocationsCsv } from '../utils'

export default function LocationsPage() {
  const { t } = useTranslation('adminLocations')
  const [provinceCode, setProvinceCode] = useState('19')
  const [wardCode, setWardCode] = useState<string | null>(null)
  const [treeSearch, setTreeSearch] = useState('')
  const provincesQuery = useProvinces()
  const summaryQuery = useLocationSummary()
  const wardsQuery = useWards(provinceCode)
  const provinces = provincesQuery.data ?? []
  const wards = wardsQuery.data ?? []
  const province = provinces.find((item) => item.code === provinceCode)
  const ward = wards.find((item) => item.code === wardCode)
  const selectProvince = (code: string) => {
    setProvinceCode(code)
    setWardCode(null)
  }

  return (
    <div className="space-y-3 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/dashboard" className="hover:text-blue-600">
              {t('home')}
            </Link>
            <span>›</span>
            <span>{t('title')}</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-950 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">{t('description')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outlinePrimary"
            disabled
            title={t('writeUnavailable')}
          >
            <Upload className="size-4" />
            {t('import')}
          </Button>
          <Button disabled title={t('writeUnavailable')}>
            <Plus className="size-4" />
            {t('add')}
          </Button>
        </div>
      </div>
      <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        {t('referenceNotice')}
      </p>
      {provincesQuery.isError ? (
        <div
          role="alert"
          className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700"
        >
          {t('loadError')}{' '}
          <button
            type="button"
            onClick={() => void provincesQuery.refetch()}
            className="ml-2 underline"
          >
            {t('retry')}
          </button>
        </div>
      ) : provincesQuery.isPending ? (
        <div className="rounded-lg bg-white p-8 text-center text-sm text-slate-500">
          {t('loading')}
        </div>
      ) : (
        <>
          <LocationStats summary={summaryQuery.data} />
          {summaryQuery.isError && (
            <div
              role="alert"
              className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
            >
              {t('summaryError')}{' '}
              <button
                type="button"
                onClick={() => void summaryQuery.refetch()}
                className="ml-2 underline"
              >
                {t('retry')}
              </button>
            </div>
          )}
          {wardsQuery.isError && (
            <div
              role="alert"
              className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
            >
              {t('wardsError')}{' '}
              <button
                type="button"
                onClick={() => void wardsQuery.refetch()}
                className="ml-2 underline"
              >
                {t('retry')}
              </button>
            </div>
          )}
          <div className="grid items-start gap-3 xl:grid-cols-[minmax(230px,0.7fr)_minmax(0,1.45fr)_minmax(285px,0.95fr)]">
            <LocationTree
              provinces={provinces}
              wards={wards}
              provinceCode={provinceCode}
              wardCode={wardCode}
              search={treeSearch}
              onSearch={setTreeSearch}
              onProvinceSelect={selectProvince}
              onWardSelect={setWardCode}
              wardsLoading={wardsQuery.isPending}
            />
            <LocationMap province={province} ward={ward} />
            <LocationDetail
              province={province}
              ward={ward}
              wardCount={wards.length}
            />
            <div className="min-w-0 xl:col-span-3">
              <LocationTable
                provinces={provinces}
                wards={wards}
                provinceCode={provinceCode}
                wardCode={wardCode}
                onProvinceSelect={selectProvince}
                onWardSelect={setWardCode}
                onExport={exportLocationsCsv}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
