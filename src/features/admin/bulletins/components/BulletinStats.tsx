import { Check, CirclePlay, Clock3, FilePenLine, Files, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BulletinStatus } from '../types'

const cards = [
  {
    key: 'all',
    icon: Files,
    tone: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  },
  {
    key: 'draft',
    icon: FilePenLine,
    tone: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
  },
  {
    key: 'pending',
    icon: Clock3,
    tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
  },
  {
    key: 'approved',
    icon: Check,
    tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
  },
  {
    key: 'published',
    icon: CirclePlay,
    tone: 'text-violet-600 bg-violet-50 dark:bg-violet-950',
  },
  {
    key: 'rejected',
    icon: X,
    tone: 'text-rose-600 bg-rose-50 dark:bg-rose-950',
  },
] as const

export function BulletinStats({
  counts,
  value,
  onChange,
}: {
  counts: Record<'all' | BulletinStatus, number>
  value: BulletinStatus | 'all'
  onChange: (value: BulletinStatus | 'all') => void
}) {
  const { t } = useTranslation('adminBulletins')
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {cards.map(({ key, icon: Icon, tone }) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-3 rounded-xl border bg-white p-3 text-left shadow-sm transition-colors hover:border-blue-300 dark:bg-slate-900 ${value === key ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40' : 'border-slate-100 dark:border-slate-800'}`}
        >
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-lg ${tone}`}
          >
            <Icon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              {key === 'all' ? t('all') : t(`statuses.${key}`)}
            </span>
            <strong className="block text-xl leading-tight text-blue-950 dark:text-white">
              {counts[key].toLocaleString()}
            </strong>
          </span>
        </button>
      ))}
    </div>
  )
}
