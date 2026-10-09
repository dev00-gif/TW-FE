import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { MapPin, RadioTower, Settings2, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tabs } from '@/components/common/Tabs'
import { Button } from '@/components/ui/button'
import type { Device } from '../types'
import { DeviceStatusBadge } from './DeviceStatusBadge'
import { DeviceIllustration } from './DeviceIllustration'
import { DeviceFirmwarePanel } from './detail/DeviceFirmwarePanel'

type DetailTab =
  | 'general'
  | 'status'
  | 'config'
  | 'schedule'
  | 'firmware'
  | 'reports'

export function DeviceDetail({
  device,
  onEdit,
}: {
  device: Device | undefined
  onEdit: (device: Device) => void
}) {
  const { t } = useTranslation('adminDevices')
  const [tab, setTab] = useState<DetailTab>('general')
  if (!device)
    return (
      <section className="grid min-h-[480px] place-items-center rounded-xl border bg-white p-6 text-sm text-slate-500 dark:bg-slate-900">
        {t('noSelection')}
      </section>
    )
  const details = [
    ['deviceCode', device.id],
    ['deviceType', t(`types.${device.type}`)],
    ['area', device.area],
    ['installLocation', device.address],
    [
      'coordinates',
      `${device.latitude.toFixed(5)}, ${device.longitude.toFixed(5)}`,
    ],
    ['firmware', device.firmware],
    ['installedAt', device.installedAt],
  ] as const
  const metrics = [
    ['CPU', `${device.cpu}%`, 'text-blue-600'],
    ['RAM', `${device.ram}%`, 'text-blue-600'],
    [t('storage'), `${device.storage}%`, 'text-emerald-600'],
    [t('temperature'), `${device.temperature}°C`, 'text-red-600'],
    [t('uptime'), t('days', { count: device.uptimeDays }), 'text-blue-950'],
    [t('signal'), `${device.signal} dBm`, 'text-blue-950'],
  ] as const
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 p-3">
        <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800">
          <RadioTower className="size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <DeviceStatusBadge status={device.status} />
          <h2 className="mt-1 truncate text-sm font-bold text-blue-950 dark:text-white">
            {device.id} - {device.name}
          </h2>
          <p className="flex items-center gap-1 truncate text-[11px] text-slate-500">
            <MapPin className="size-3" />
            {device.address}, {device.area}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Button size="sm" asChild>
            <Link
              to="/dashboard/devices/$deviceId"
              params={{ deviceId: device.id }}
            >
              {t('viewDetail')}
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outlinePrimary"
            onClick={() => onEdit(device)}
          >
            <Settings2 />
            {t('edit')}
          </Button>
        </div>
      </div>
      <Tabs<DetailTab>
        items={(
          [
            'general',
            'status',
            'config',
            'schedule',
            'firmware',
            'reports',
          ] as const
        ).map((value) => ({ value, label: t(`tabs.${value}`) }))}
        value={tab}
        onValueChange={setTab}
        ariaLabel={t('detailTabs')}
        tabClassName="px-3 py-2 text-xs"
      />
      {tab === 'general' ? (
        <div className="p-3">
          <div className="grid gap-3 sm:grid-cols-[138px_minmax(0,1fr)]">
            <DeviceIllustration
              type={device.type}
              className="min-h-44 rounded-lg"
            />
            <dl className="min-w-0 text-[11px]">
              {details.map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-[100px_minmax(0,1fr)] gap-2 border-b border-slate-100 py-1 dark:border-slate-800"
                >
                  <dt className="text-slate-500">{t(key)}</dt>
                  <dd className="truncate text-blue-950 dark:text-slate-100">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-blue-950 dark:text-white">
              {t('currentStatus')}
            </h3>
            <DeviceStatusBadge status={device.status} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
            {metrics.map(([label, value, color]) => (
              <div
                key={label}
                className="rounded-lg border border-slate-100 p-2 dark:border-slate-800"
              >
                <p className="truncate text-[10px] text-slate-500">{label}</p>
                <p className={`mt-1 truncate text-sm font-bold ${color}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'status' ? (
        <div className="space-y-3 p-5 text-sm">
          <DeviceStatusBadge status={device.status} />
          <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Wifi className="size-4" />
            {t('signal')}: {device.signal} dBm
          </p>
          <p>
            {t('uptime')}: {t('days', { count: device.uptimeDays })}
          </p>
        </div>
      ) : tab === 'config' ? (
        <div className="space-y-3 p-5 text-sm">
          <p>
            {t('firmware')}: {device.firmware}
          </p>
          <p>
            {t('deviceType')}: {t(`types.${device.type}`)}
          </p>
          <Button
            size="sm"
            variant="outlinePrimary"
            onClick={() => onEdit(device)}
          >
            {t('edit')}
          </Button>
        </div>
      ) : tab === 'firmware' ? (
        <div className="p-3">
          <DeviceFirmwarePanel device={device} />
        </div>
      ) : tab === 'schedule' ? (
        <div className="p-5 text-sm">
          {device.nextBroadcast
            ? `${t('nextBroadcast')}: ${device.nextBroadcast.replace('T', ' ')} — ${device.program}`
            : t('noSchedule')}
        </div>
      ) : (
        <div className="p-5 text-sm text-slate-500">{t('mockUnavailable')}</div>
      )}
    </section>
  )
}
