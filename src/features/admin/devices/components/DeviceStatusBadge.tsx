import { CircleCheck, CircleMinus, CircleX, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DeviceStatus } from '../types'

const styles = {
  active:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  offline: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  error: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  maintenance:
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
} as const
const icons = {
  active: CircleCheck,
  offline: CircleMinus,
  error: TriangleAlert,
  maintenance: CircleX,
}

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const { t } = useTranslation('adminDevices')
  const Icon = icons[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <Icon className="size-3" />
      {t(`statuses.${status}`)}
    </span>
  )
}
