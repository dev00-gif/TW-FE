import { useRef, useState } from 'react'
import { Download, Plus, Upload } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Pagination } from '@/components/table/Pagination'
import { Button } from '@/components/ui/button'
import { BulletinFilters } from '../components/BulletinFilters'
import { BulletinStats } from '../components/BulletinStats'
import { BulletinTable } from '../components/BulletinTable'
import {
  useBulletins,
  useImportBulletins,
  useSetBulletinStatus,
} from '../hooks/useBulletins'
import { parseBulletinImport } from '../services/bulletinService'
import type {
  Bulletin,
  BulletinFilters as Filters,
  BulletinStatus,
} from '../types'

const initialFilters: Filters = {
  search: '',
  type: 'all',
  channel: 'all',
  priority: 'all',
  area: 'all',
  status: 'all',
  author: '',
  from: '',
  to: '',
  page: 1,
  limit: 10,
}

export default function BulletinsPage() {
  const { t } = useTranslation('adminBulletins')
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [notice, setNotice] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const query = useBulletins(filters)
  const setStatus = useSetBulletinStatus()
  const importer = useImportBulletins()
  const { items, filtered, counts, meta } = query.data

  const exportItems = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(filtered, null, 2)], {
        type: 'application/json',
      }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = t('exportName')
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const importItems = async (file?: File) => {
    if (!file) return
    try {
      const parsed = parseBulletinImport(await file.text())
      const count = await importer.mutateAsync(parsed)
      setNotice(t('imported', { count }))
    } catch {
      setNotice(t('importError'))
    }
  }
  const changeStatus = async (item: Bulletin, status: BulletinStatus) => {
    await setStatus.mutateAsync({ id: item.id, status })
    setNotice(t('statusChanged'))
  }
  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <nav
            className="mb-2 flex items-center gap-2 text-xs text-slate-500"
            aria-label={t('breadcrumb')}
          >
            <Link to="/dashboard" className="hover:text-blue-600">
              {t('home')}
            </Link>
            <span>›</span>
            <span>{t('breadcrumb')}</span>
          </nav>
          <h1 className="text-2xl font-bold text-blue-950 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('description')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outlinePrimary" asChild>
            <Link to="/dashboard/bulletins/categories">{t('categories')}</Link>
          </Button>
          <Button
            variant="outlinePrimary"
            onClick={() => fileInput.current?.click()}
          >
            <Upload className="size-4" />
            {t('import')}
          </Button>
          <Button variant="outlinePrimary" onClick={exportItems}>
            <Download className="size-4" />
            {t('export')}
          </Button>
          <Button asChild>
            <Link to="/dashboard/bulletins/new">
              <Plus className="size-4" />
              {t('create')}
            </Link>
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label={t('import')}
            onChange={(event) => {
              void importItems(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </div>
      </div>
      {notice && (
        <p
          role="status"
          className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-200"
        >
          {notice}
        </p>
      )}
      <BulletinStats
        counts={counts}
        value={filters.status}
        onChange={(status) =>
          setFilters((current) => ({ ...current, status, page: 1 }))
        }
      />
      <BulletinFilters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />
      <BulletinTable
        items={items}
        page={meta.page}
        limit={meta.limit}
        onView={(item) =>
          void navigate({
            to: '/dashboard/bulletins/$bulletinId',
            params: { bulletinId: item.id },
          })
        }
        onEdit={(item) =>
          void navigate({
            to: '/dashboard/bulletins/$bulletinId/edit',
            params: { bulletinId: item.id },
          })
        }
        onSetStatus={(item, status) => {
          void changeStatus(item, status)
        }}
      />
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Pagination
          pagination={meta}
          displayedCount={items.length}
          onPageChange={(page) =>
            setFilters((current) => ({ ...current, page }))
          }
          onPageSizeChange={(limit) =>
            setFilters((current) => ({ ...current, limit, page: 1 }))
          }
          pageSizeOptions={[10, 20, 50]}
        />
      </div>
    </div>
  )
}
