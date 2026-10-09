import { TerritoryNotice } from '@/features/territory/TerritoryNotice'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Download, Plus, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { DeviceDetail } from '../components/DeviceDetail'
import { DeviceDialog } from '../components/DeviceDialog'
import { DeviceMap } from '../components/DeviceMap'
import { DeviceStats } from '../components/DeviceStats'
import { DeviceTable } from '../components/DeviceTable'
import {
  useDevices,
  useImportDevices,
  useUpsertDevice,
} from '../hooks/useDevices'
import { parseDeviceImport } from '../services/deviceMockService'
import type { Device, DeviceFilters } from '../types'

const initialFilters: DeviceFilters = {
  search: '',
  type: 'all',
  status: 'all',
  area: 'all',
}

export default function DevicesPage() {
  const { t } = useTranslation('adminDevices')
  const mayCreate = usePermission('device.device.create')
  const mayUpdate = usePermission('device.device.update')
  const [filters, setFilters] = useState(initialFilters)
  const [selectedId, setSelectedId] = useState('TN-PT-001')
  const [editing, setEditing] = useState<Device | 'new' | null>(null)
  const [notice, setNotice] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const { data } = useDevices(filters)
  const upsertDevice = useUpsertDevice()
  const importDevices = useImportDevices()
  const { items, filtered, counts } = data
  const selected = items.find((item) => item.id === selectedId) ?? filtered[0]
  const exportItems = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(filtered, null, 2)], {
        type: 'application/json',
      }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'devices.json'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const importItems = async (file?: File) => {
    if (!file) return
    try {
      const parsed = parseDeviceImport(await file.text())
      await importDevices.mutateAsync(parsed)
      setNotice(t('importSuccess', { count: parsed.length }))
    } catch {
      setNotice(t('importError'))
    }
  }
  const save = (device: Device) => {
    upsertDevice.mutate(device)
    setSelectedId(device.id)
    setEditing(null)
    setNotice(t('saveSuccess'))
  }
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
          <h1 className="text-2xl font-bold text-blue-950 dark:text-white">
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
            disabled={!mayCreate || !mayUpdate}
            onClick={() => fileInput.current?.click()}
          >
            <Upload />
            {t('import')}
          </Button>
          <Button disabled={!mayCreate} onClick={() => setEditing('new')}>
            <Plus />
            {t('addDevice')}
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label={t('import')}
            onChange={(e) => {
              void importItems(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      </div>
      <TerritoryNotice />
      {notice && (
        <div
          role="status"
          className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-200"
        >
          {notice}
        </div>
      )}
      <DeviceStats counts={counts} />
      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)]">
        <DeviceMap
          items={filtered}
          filters={filters}
          onFiltersChange={setFilters}
          onSelect={(device) => setSelectedId(device.id)}
        />
        <DeviceDetail
          device={selected}
          onEdit={(device) => {
            if (mayUpdate) setEditing(device)
          }}
        />
      </div>
      <DeviceTable
        items={filtered}
        filters={filters}
        onFiltersChange={setFilters}
        onSelect={(device) => setSelectedId(device.id)}
        onEdit={(device) => {
          if (mayUpdate) setEditing(device)
        }}
      />
      {editing && (
        <DeviceDialog
          key={editing === 'new' ? 'new' : editing.id}
          item={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  )
}
