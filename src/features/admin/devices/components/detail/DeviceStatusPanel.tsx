import {
  CircleCheck,
  Clock3,
  RadioTower,
  Volume2,
  Wifi,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Device } from '../../types'
import { DeviceStatusBadge } from '../DeviceStatusBadge'

export function DeviceStatusPanel({ device }: { device: Device }) {
  const { t } = useTranslation('adminDevices')
  const rows = [
    {
      label: t('uptime'),
      value: t('days', { count: device.uptimeDays }),
      icon: Clock3,
    },
    {
      label: t('detail.lastConnected'),
      value: t(
        device.status === 'active' ? 'detail.justNow' : 'detail.someTimeAgo',
      ),
      icon: Wifi,
    },
    {
      label: t('detail.latency'),
      value: `${20 + device.id.length} ms`,
      icon: Zap,
    },
    { label: t('signal'), value: `${device.signal} dBm`, icon: Wifi },
    { label: t('detail.power'), value: '220V', icon: Zap },
    { label: t('detail.volume'), value: `${device.volume}%`, icon: Volume2 },
    {
      label: t('temperature'),
      value: `${device.temperature}°C`,
      icon: RadioTower,
    },
  ]
  return (
    <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-bold text-blue-950 dark:text-white">
        {t('detail.operatingStatus')}
      </h2>
      <div className="mt-3 flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <CircleCheck
          className={`size-8 ${device.status === 'active' ? 'text-emerald-600' : 'text-amber-500'}`}
        />
        <div>
          <DeviceStatusBadge status={device.status} />
          <p className="mt-1 text-sm text-slate-500">
            {t(
              device.status === 'active'
                ? 'detail.operatingNormally'
                : 'detail.needsAttention',
            )}
          </p>
        </div>
      </div>
      <dl className="mt-2 space-y-1 text-sm">
        {rows.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2 py-1">
            <Icon className="size-4 shrink-0 text-blue-600" />
            <dt className="min-w-0 flex-1 text-slate-500">{label}</dt>
            <dd className="font-semibold text-blue-950 dark:text-white">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
