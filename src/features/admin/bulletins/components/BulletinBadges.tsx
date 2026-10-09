import { useTranslation } from 'react-i18next'
import type { BulletinPriority, BulletinStatus, BulletinType } from '../types'

const statusTone: Record<BulletinStatus, string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  approved:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  published: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
}
const priorityTone: Record<BulletinPriority, string> = {
  low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  high: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
}
const typeTone: Record<BulletinType, string> = {
  news: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  notice: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  emergency: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  campaign:
    'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
}
const base =
  'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap'

export function BulletinStatusBadge({ value }: { value: BulletinStatus }) {
  const { t } = useTranslation('adminBulletins')
  return (
    <span className={`${base} ${statusTone[value]}`}>
      ● {t(`statuses.${value}`)}
    </span>
  )
}

export function BulletinPriorityBadge({ value }: { value: BulletinPriority }) {
  const { t } = useTranslation('adminBulletins')
  return (
    <span className={`${base} ${priorityTone[value]}`}>
      ● {t(`priorities.${value}`)}
    </span>
  )
}

export function BulletinTypeBadge({ value }: { value: BulletinType }) {
  const { t } = useTranslation('adminBulletins')
  return (
    <span className={`${base} ${typeTone[value]}`}>{t(`types.${value}`)}</span>
  )
}
