import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  MapPin,
  Radio,
  RotateCcw,
  Settings2,
  UploadCloud,
  Wrench,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tabs } from '@/components/common/Tabs'
import { Button } from '@/components/ui/button'
import { DeviceDialog } from '../../components/DeviceDialog'
import { DeviceStatusBadge } from '../../components/DeviceStatusBadge'
import { DeviceActivityTable } from '../../components/detail/DeviceActivityTable'
import { DeviceMetricsPanel } from '../../components/detail/DeviceMetricsPanel'
import { DeviceOverview } from '../../components/detail/DeviceOverview'
import { DeviceFirmwarePanel } from '../../components/detail/DeviceFirmwarePanel'
import { DeviceQuickActions } from '../../components/detail/DeviceQuickActions'
import { DeviceSidePanel } from '../../components/detail/DeviceSidePanel'
import { DeviceStatusPanel } from '../../components/detail/DeviceStatusPanel'
import { DeviceVolumeControl } from '../../components/detail/DeviceVolumeControl'
import { useDeviceDetail, useUpsertDevice } from '../../hooks/useDevices'
import {
  getDeviceActivity,
  getDeviceFirmwareHistory,
} from '../../services/deviceDetailMock'
import type { Device, DeviceDetailTab } from '../../types'

const tabs: DeviceDetailTab[] = [
  'overview',
  'status',
  'config',
  'schedule',
  'firmware',
  'broadcasts',
  'maintenance',
  'files',
  'remote',
]
const panel =
  'rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export default function DeviceDetailPage({ deviceId }: { deviceId: string }) {
  const { t } = useTranslation('adminDevices')
  const [tab, setTab] = useState<DeviceDetailTab>('overview')
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState('')
  const [configResetKey, setConfigResetKey] = useState(0)
  const [showRemoteControls, setShowRemoteControls] = useState(false)
  const { data: device, isPending, isFetching } = useDeviceDetail(deviceId)
  const upsertDevice = useUpsertDevice()
  if (isPending || (isFetching && !device))
    return (
      <div className="p-6 text-sm text-slate-500">{t('detail.loading')}</div>
    )
  if (!device)
    return (
      <div className="space-y-3 p-6">
        <p role="alert" className="text-sm text-slate-600">
          {t('detail.notFound')}
        </p>
        <Link
          to="/dashboard/devices"
          className="text-sm text-blue-600 hover:underline"
        >
          {t('detail.backToList')}
        </Link>
      </div>
    )

  const activity = getDeviceActivity(device)
  const action = (
    kind: 'firmware' | 'restart' | 'test' | 'emergency' | 'reset',
  ) => {
    if (kind === 'firmware' && device.firmware !== 'v1.2.4')
      upsertDevice.mutate({
        ...device,
        firmware: 'v1.2.4',
        firmwareHistory: [
          {
            version: 'v1.2.4',
            updatedAt: new Date().toISOString(),
            kind: 'updated',
          },
          ...getDeviceFirmwareHistory(device),
        ],
      })
    if (kind === 'restart') upsertDevice.mutate({ ...device, uptimeDays: 0 })
    if (kind === 'reset') {
      upsertDevice.mutate({ ...device, volume: 80 })
      setConfigResetKey((current) => current + 1)
    }
    setNotice(t(`detail.actionNotice.${kind}`))
  }
  const changeVolume = (volume: number) =>
    upsertDevice.mutate({ ...device, volume })
  const save = (updated: Device) => {
    upsertDevice.mutate(updated)
    setEditing(false)
    setNotice(t('saveSuccess'))
  }
  const tabContent = () => {
    if (tab === 'overview')
      return (
        <div className="space-y-3">
          <div className="grid items-stretch gap-3 lg:grid-cols-2">
            <DeviceQuickActions onAction={action} onTab={setTab} />
            <DeviceVolumeControl
              value={device.volume}
              onChange={changeVolume}
            />
          </div>
          <DeviceMetricsPanel device={device} />
        </div>
      )
    if (tab === 'status')
      return (
        <div className="grid items-start gap-3 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.6fr)]">
          <DeviceStatusPanel device={device} />
          <DeviceMetricsPanel device={device} />
        </div>
      )
    if (tab === 'firmware') return <DeviceFirmwarePanel device={device} />
    if (tab === 'config')
      return (
        <section className={panel}>
          <h2 className="font-bold">{t('detail.tabs.config')}</h2>
          <p className="mt-3 text-sm text-slate-500">
            {t('detail.demoConfigNotice')}
          </p>
          <Button
            className="mt-4"
            variant="outlinePrimary"
            onClick={() => setEditing(true)}
          >
            <Settings2 />
            {t('editDevice')}
          </Button>
        </section>
      )
    if (tab === 'remote')
      return (
        <div className="space-y-3">
          <section className={panel}>
            <h2 className="font-bold">{t('detail.tabs.remote')}</h2>
            <p className="mt-3 text-sm text-slate-500">
              {t('detail.demoConfigNotice')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outlinePrimary"
                onClick={() => action('restart')}
              >
                <RotateCcw />
                {t('detail.restart')}
              </Button>
              <Button
                variant="outlinePrimary"
                onClick={() => action('firmware')}
                disabled={device.firmware === 'v1.2.4'}
              >
                <UploadCloud />
                {t('detail.updateFirmware')}
              </Button>
              <Button
                onClick={() => setShowRemoteControls((visible) => !visible)}
                aria-expanded={showRemoteControls}
              >
                <Settings2 />
                {t('detail.controlDevice')}
              </Button>
            </div>
          </section>
          {showRemoteControls && (
            <div className="max-w-xl">
              <DeviceSidePanel key={configResetKey} />
            </div>
          )}
        </div>
      )
    if (tab === 'schedule')
      return (
        <div className="space-y-3">
          <DeviceActivityTable
            title={t('detail.upcomingSchedules')}
            items={activity.upcoming}
          />
          <DeviceActivityTable
            title={t('detail.recentBroadcasts')}
            items={activity.recent}
          />
        </div>
      )
    if (tab === 'broadcasts')
      return (
        <DeviceActivityTable
          title={t('detail.recentBroadcasts')}
          items={activity.recent}
        />
      )
    if (tab === 'maintenance')
      return (
        <section className={panel}>
          <h2 className="font-bold">{t('detail.tabs.maintenance')}</h2>
          <p className="mt-3 text-sm text-slate-500">
            {t('detail.maintenanceSummary')}
          </p>
          <Button
            className="mt-4"
            variant="outlinePrimary"
            onClick={() => setNotice(t('detail.actionNotice.maintenance'))}
          >
            <Wrench />
            {t('detail.requestMaintenance')}
          </Button>
        </section>
      )
    return (
      <section className={panel}>
        <h2 className="font-bold">{t('detail.tabs.files')}</h2>
        <p className="mt-3 text-sm text-slate-500">{t('detail.noFiles')}</p>
      </section>
    )
  }
  return (
    <div className="space-y-3 pb-6">
      <header className="space-y-2">
        <nav
          aria-label={t('detail.breadcrumb')}
          className="flex items-center gap-2 text-sm text-slate-500"
        >
          <Link to="/dashboard" className="hover:text-blue-600">
            {t('home')}
          </Link>
          <span>›</span>
          <Link to="/dashboard/devices" className="hover:text-blue-600">
            {t('breadcrumb')}
          </Link>
          <span>›</span>
          <span>{t('detail.breadcrumb')}</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-blue-950 dark:text-white">
                {device.id} - {device.name}
              </h1>
              <DeviceStatusBadge status={device.status} />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Radio className="size-3" />
                {t(`types.${device.type}`)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {device.address}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {device.area}
              </span>
            </div>
          </div>
        </div>
      </header>
      {notice && (
        <div
          role="status"
          className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-200"
        >
          {notice}
        </div>
      )}
      <DeviceOverview device={device} />
      <Tabs<DeviceDetailTab>
        items={tabs.map((value) => ({
          value,
          label: t(`detail.tabs.${value}`),
        }))}
        value={tab}
        onValueChange={setTab}
        ariaLabel={t('detail.sectionTabs')}
        className="bg-transparent"
        tabClassName="px-4 py-3 text-sm"
      />
      {tabContent()}
      {editing && (
        <DeviceDialog
          item={device}
          onClose={() => setEditing(false)}
          onSave={save}
        />
      )}
    </div>
  )
}
