import { KeyRound, MoreVertical, ShieldCheck, UserRound } from 'lucide-react'
import type { AdminManagedRole } from '../../../types'

export function RoleListItem({
  role,
  selected,
  totalPermissions,
  onSelect,
  t,
}: {
  role: AdminManagedRole
  selected: boolean
  totalPermissions: number
  onSelect: () => void
  t: (key: string) => string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border px-3 py-3 text-left transition ${selected ? 'border-primary-500 bg-primary-50/70 shadow-sm dark:bg-primary/15' : 'border-border bg-card hover:border-primary-300 hover:bg-primary-50/30 dark:hover:bg-primary/10'}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full ${role.isSystem ? 'bg-primary-100 text-primary-700 dark:bg-primary/20 dark:text-primary-300' : 'bg-secondary-50 text-secondary-700 dark:bg-secondary/20 dark:text-secondary-300'}`}
        >
          <ShieldCheck className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <strong className="truncate text-sm text-foreground">
              {role.name}
            </strong>
            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] ${role.isSystem ? 'border-primary-200 bg-primary-50 text-primary-700 dark:border-primary/30 dark:bg-primary/15 dark:text-primary-300' : 'border-secondary-200 bg-secondary-50 text-secondary-700 dark:border-secondary/30 dark:bg-secondary/15 dark:text-secondary-300'}`}
            >
              {role.isSystem
                ? t('roleManagement.system')
                : t('roleManagement.custom')}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <UserRound className="size-3" /> {role.userCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <KeyRound className="size-3" /> {role.permissionCount}/
              {totalPermissions}
            </span>
          </div>
        </div>
        <MoreVertical className="size-4 text-slate-500 dark:text-slate-400" />
      </div>
    </button>
  )
}
