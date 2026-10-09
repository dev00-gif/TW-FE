import type { ComponentType } from 'react'
import { rolePanel } from './rolesShared'

export function RoleStatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: ComponentType<{ className?: string }>
  value: number
  label: string
}) {
  return (
    <div
      className={`${rolePanel} flex min-h-[72px] min-w-0 items-center gap-2 px-3 py-3 sm:min-h-20 sm:gap-4 sm:px-5 sm:py-4`}
    >
      <span className="hidden size-11 shrink-0 place-items-center rounded-full bg-primary-50 dark:bg-primary/20 sm:grid">
        <Icon className="size-5 text-primary-700 dark:text-primary-300" />
      </span>
      <div className="min-w-0">
        <strong className="block text-lg leading-none text-foreground sm:text-xl">
          {value}
        </strong>
        <span className="mt-1.5 block truncate text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
          {label}
        </span>
      </div>
    </div>
  )
}
