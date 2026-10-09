import {
  Clock3,
  Cpu,
  HardDrive,
  MemoryStick,
  Thermometer,
  Volume2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Device } from '../../types'
import { ResourceChart } from './ResourceChart'

export function DeviceMetricsPanel({ device }: { device: Device }) {
  const { t } = useTranslation('adminDevices')
  const cards = [
    {
      label: 'CPU',
      value: `${device.cpu}%`,
      icon: Cpu,
      tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950',
    },
    {
      label: 'RAM',
      value: `${device.ram}%`,
      note: '1.8 GB / 4 GB',
      icon: MemoryStick,
      tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950',
    },
    {
      label: t('storage'),
      value: `${device.storage}%`,
      note: '12.4 GB / 16 GB',
      icon: HardDrive,
      tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950',
    },
    {
      label: t('temperature'),
      value: `${device.temperature}°C`,
      icon: Thermometer,
      tone: 'bg-rose-50 text-rose-600 dark:bg-rose-950',
    },
    {
      label: t('uptime'),
      value: t('days', { count: device.uptimeDays }),
      icon: Clock3,
      tone: 'bg-sky-50 text-sky-600 dark:bg-sky-950',
    },
    {
      label: t('detail.volume'),
      value: `${device.volume}%`,
      icon: Volume2,
      tone: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950',
    },
  ]
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 text-base font-bold text-blue-950 dark:text-white">
        {t('detail.operatingMetrics')}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {cards.map(({ label, value, note, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-lg border border-slate-100 p-2 dark:border-slate-800"
          >
            <div
              className={`grid size-10 shrink-0 place-items-center rounded-lg ${tone}`}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-500">{label}</p>
              <p className="truncate text-lg font-bold text-blue-950 dark:text-white">
                {value}
              </p>
              {note && (
                <p className="truncate text-xs text-slate-400">{note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <ResourceChart device={device} />
      </div>
    </section>
  )
}
