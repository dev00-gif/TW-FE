import { TerritoryPanel } from './TerritoryPanel'
import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type {
  AdminUserDetail,
  AdminUserProfile,
  AdminUserProfileInput,
} from '../../types'
import {
  useAdminRoleManagement,
  useAdminUserDetail,
  useAdminUserMutations,
  useAdminUserProfile,
} from '../../hooks/useAdminUsers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { toast } from '@/utils/toast'

type Tab = 'overview' | 'roles' | 'territory' | 'security'
const panel =
  'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-gray-800'

function formatDate(value: string | undefined, locale: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[145px_1fr] dark:border-slate-700">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="break-all text-sm font-medium text-slate-800 dark:text-slate-100">
        {value || '—'}
      </dd>
    </div>
  )
}

function ProfileDialog({
  userId,
  profile,
  open,
  onOpenChange,
}: {
  userId: string
  profile?: AdminUserProfile
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('adminUsers')
  const { createProfile, updateProfile } = useAdminUserMutations()
  const [draft, setDraft] = useState<AdminUserProfileInput>({ fullName: '' })
  useEffect(() => {
    if (open)
      setDraft({
        fullName: profile?.fullName ?? '',
        avatarUrl: profile?.avatarUrl ?? '',
        vehicleType: profile?.vehicleType ?? 'bike',
        address: profile?.address ?? '',
        workingCity: profile?.workingCity ?? '',
      })
  }, [open, profile])
  const pending = createProfile.isPending || updateProfile.isPending
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.fullName.trim()) return
    try {
      const input = { ...draft, fullName: draft.fullName.trim(), id: userId }
      if (profile) await updateProfile.mutateAsync(input)
      else await createProfile.mutateAsync(input)
      toast.success(t('editor.profileSuccess'))
      onOpenChange(false)
    } catch (error) {
      toast.apiError(error, t('editor.profileFailed'))
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editor.profileTitle')}</DialogTitle>
          <DialogDescription>
            {t('editor.profileDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {(
            [
              ['fullName', t('editor.fields.displayName')],
              ['avatarUrl', t('editor.fields.avatarUrl')],
              ['address', t('detail.address')],
              ['workingCity', t('detail.workingCity')],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="block space-y-1 text-sm font-medium">
              <span>{label}</span>
              <Input
                value={draft[field] ?? ''}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                required={field === 'fullName'}
              />
            </label>
          ))}
          <label className="block space-y-1 text-sm font-medium">
            <span>{t('detail.vehicleType')}</span>
            <select
              value={draft.vehicleType ?? 'bike'}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  vehicleType: event.target
                    .value as AdminUserProfileInput['vehicleType'],
                }))
              }
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-gray-800"
            >
              <option value="bike">{t('detail.vehicles.bike')}</option>
              <option value="electric_bike">
                {t('detail.vehicles.electric_bike')}
              </option>
              <option value="car">{t('detail.vehicles.car')}</option>
            </select>
          </label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={pending || !draft.fullName.trim()}>
              {t('editor.saveProfile')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RolesPanel({ user }: { user: AdminUserDetail }) {
  const { t } = useTranslation('adminUsers')
  const query = useAdminRoleManagement()
  const { updateRoles } = useAdminUserMutations()
  const canAssign = usePermission('user.user.approve') && !user.isSuperAdmin
  const [selected, setSelected] = useState<string[]>(user.roleCodes)
  useEffect(() => setSelected(user.roleCodes), [user.roleCodes])
  const roles = query.data?.roles ?? []
  const changed =
    [...selected].sort().join('|') !== [...user.roleCodes].sort().join('|')
  async function save() {
    try {
      await updateRoles.mutateAsync({ id: user.id, roleCodes: selected })
      toast.success(t('editor.rolesSuccess'))
    } catch (error) {
      toast.apiError(error, t('editor.rolesFailed'))
    }
  }
  return (
    <section className={`${panel} p-5`}>
      <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-700">
        <h2 className="font-bold">{t('editor.rolesTitle')}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {t('editor.rolesDescription')}
        </p>
      </div>
      {user.isSuperAdmin && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          {t('editor.superAdminProtected')}
        </p>
      )}
      {query.isLoading ? (
        <p className="text-sm text-slate-500">{t('loading')}</p>
      ) : query.isError ? (
        <p className="text-sm text-red-600">{t('roleManagement.loadFailed')}</p>
      ) : (
        <div className="space-y-2">
          {roles.map((role) => (
            <label
              key={role.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <input
                type="checkbox"
                className="mt-1 accent-primary"
                checked={selected.includes(role.code)}
                disabled={!canAssign}
                onChange={() =>
                  setSelected((current) =>
                    current.includes(role.code)
                      ? current.filter((code) => code !== role.code)
                      : [...current, role.code],
                  )
                }
              />
              <span className="min-w-0">
                <strong className="block text-sm">{role.name}</strong>
                <small className="block text-slate-500">
                  {role.code} ·{' '}
                  {t('editor.permissionCount', { count: role.permissionCount })}
                </small>
                {role.description && (
                  <span className="mt-1 block text-xs text-slate-500">
                    {role.description}
                  </span>
                )}
              </span>
            </label>
          ))}
          {!roles.length && (
            <p className="text-sm text-slate-500">
              {t('roleManagement.empty')}
            </p>
          )}
        </div>
      )}
      {canAssign && (
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={!changed}
            onClick={() => setSelected(user.roleCodes)}
          >
            {t('editor.cancelRoleChanges')}
          </Button>
          <Button
            disabled={!changed || !selected.length || updateRoles.isPending}
            onClick={() => void save()}
          >
            {t('editor.saveRoles')}
          </Button>
        </div>
      )}
    </section>
  )
}

export default function AdminUserDetailPage({ userId }: { userId: string }) {
  const { t, i18n } = useTranslation('adminUsers')
  const userQuery = useAdminUserDetail(userId)
  const profileQuery = useAdminUserProfile(userId)
  const canUpdate = usePermission('user.user.update')
  const canViewRoles = usePermission('user.role.view')
  const [tab, setTab] = useState<Tab>('overview')
  const [profileOpen, setProfileOpen] = useState(false)
  const profileMissing =
    isAxiosError(profileQuery.error) &&
    profileQuery.error.response?.status === 404
  const profile = profileQuery.data

  if (userQuery.isLoading)
    return (
      <div className="grid min-h-96 place-items-center text-slate-500">
        {t('loading')}
      </div>
    )
  if (!userQuery.data)
    return (
      <div className="grid min-h-96 place-items-center text-slate-500">
        {t('editor.loadFailed')}
      </div>
    )
  const user = userQuery.data
  const name = profile?.fullName || user.email || user.phone || user.id
  const statusLabel = t(`detail.statuses.${user.status}`, {
    defaultValue: user.status,
  })
  const tabs: Array<[Tab, string]> = [
    ['overview', t('detail.tabs.overview')],
    ...(canViewRoles
      ? [['roles', t('detail.tabs.roles')] as [Tab, string]]
      : []),
    ['territory', t('territory.title')],
    ['security', t('detail.tabs.security')],
  ]
  return (
    <div className="space-y-4 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs text-primary-700">
            Dashboard / {t('title')} / {name}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/users">
              <ArrowLeft className="mr-2 size-4" />
              {t('detail.back')}
            </Link>
          </Button>
        </div>
        {canUpdate && (
          <Button
            onClick={() => setProfileOpen(true)}
            disabled={
              profileQuery.isLoading ||
              (profileQuery.isError && !profileMissing)
            }
          >
            <Edit3 className="mr-2 size-4" />
            {t('detail.editInfo')}
          </Button>
        )}
      </header>
      <section
        className={`${panel} flex flex-col gap-4 p-5 md:flex-row md:items-center`}
      >
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-xl font-bold text-primary">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{name}</h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {user.roleCodes.join(', ') || '—'}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.status === 'active' ? 'bg-green-50 text-green-700' : user.status === 'blocked' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 break-all text-xs text-slate-500">ID: {user.id}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-4" />
              {user.email || '—'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-4" />
              {user.phone || '—'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatDate(user.createdAt, i18n.language)}
            </span>
          </div>
        </div>
      </section>
      <nav
        className="flex gap-6 overflow-x-auto border-b border-slate-200 dark:border-slate-700"
        aria-label={t('detail.title')}
      >
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${tab === value ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === 'overview' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className={`${panel} p-5`}>
            <h2 className="mb-2 flex items-center gap-2 font-bold">
              <UserRound className="size-5 text-primary" />
              {t('detail.personalInfo')}
            </h2>
            {profileQuery.isLoading ? (
              <p className="text-sm text-slate-500">{t('loading')}</p>
            ) : profileQuery.isError && !profileMissing ? (
              <p className="text-sm text-red-600">{t('editor.loadFailed')}</p>
            ) : (
              <dl>
                <Info
                  label={t('editor.fields.displayName')}
                  value={profile?.fullName}
                />
                <Info label={t('editor.fields.email')} value={user.email} />
                <Info label={t('editor.fields.phone')} value={user.phone} />
                <Info
                  label={t('detail.vehicleType')}
                  value={
                    profile?.vehicleType
                      ? t(`detail.vehicles.${profile.vehicleType}`)
                      : undefined
                  }
                />
                <Info
                  label={t('detail.workingCity')}
                  value={profile?.workingCity}
                />
                <Info label={t('detail.address')} value={profile?.address} />
              </dl>
            )}
          </section>
          <aside className="space-y-4">
            <section className={`${panel} p-5`}>
              <h2 className="mb-2 flex items-center gap-2 font-bold">
                <ShieldCheck className="size-5 text-primary" />
                {t('detail.account')}
              </h2>
              <dl>
                <Info label={t('form.status')} value={statusLabel} />
                <Info label={t('detail.provider')} value={user.authProvider} />
                <Info
                  label={t('detail.roleCount')}
                  value={String(user.roleCodes.length)}
                />
              </dl>
            </section>
            <section className={`${panel} p-5`}>
              <h2 className="mb-2 flex items-center gap-2 font-bold">
                <MapPin className="size-5 text-primary" />
                {t('detail.dates')}
              </h2>
              <dl>
                <Info
                  label={t('editor.createdAt')}
                  value={formatDate(user.createdAt, i18n.language)}
                />
                <Info
                  label={t('editor.updatedAt')}
                  value={formatDate(user.updatedAt, i18n.language)}
                />
              </dl>
            </section>
          </aside>
        </div>
      )}
      {tab === 'roles' && canViewRoles && <RolesPanel user={user} />}
      {tab === 'territory' && <TerritoryPanel userId={user.id} />}
      {tab === 'security' && (
        <section className={`${panel} p-5`}>
          <h2 className="mb-2 font-bold">{t('detail.tabs.security')}</h2>
          <dl>
            <Info label={t('form.status')} value={statusLabel} />
            <Info label={t('detail.provider')} value={user.authProvider} />
            <Info
              label={t('detail.permissionCount')}
              value={String(user.permissionCodes.length)}
            />
            <Info
              label={t('editor.updatedAt')}
              value={formatDate(user.updatedAt, i18n.language)}
            />
          </dl>
        </section>
      )}
      {canUpdate && (
        <ProfileDialog
          userId={user.id}
          profile={profile}
          open={profileOpen}
          onOpenChange={setProfileOpen}
        />
      )}
    </div>
  )
}
