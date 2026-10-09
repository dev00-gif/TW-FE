import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Download,
  LockKeyhole,
  Plus,
  Search,
  ShieldCheck,
  UnlockKeyhole,
  UserRoundCheck,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  useAdminUsers,
  useAdminUserStats,
  useAdminUserMutations,
} from '../../hooks/useAdminUsers'
import type { AdminUserListInput, AdminUserListItem } from '../../types'
import { Pagination } from '@/components/table/Pagination'
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
import { useCurrentUserId } from '@/features/auth/hooks/useAuth'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { toast } from '@/utils/toast'

const selectClass =
  'h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-gray-800'
const statuses = ['active', 'unverified', 'blocked'] as const

function AddUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('adminUsers')
  const { create } = useAdminUserMutations()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })
  useEffect(() => {
    if (open) setForm({ fullName: '', email: '', phone: '', password: '' })
  }, [open])
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.fullName.trim()) return
    try {
      await create.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      })
      toast.success(t('form.success'))
      onOpenChange(false)
    } catch (error) {
      toast.apiError(error, t('form.failed'))
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('form.title')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {(
            [
              ['fullName', t('form.name'), 'text'],
              ['email', t('form.email'), 'email'],
              ['phone', t('form.phone'), 'tel'],
              ['password', t('form.password'), 'password'],
            ] as const
          ).map(([field, label, type]) => (
            <label key={field} className="block space-y-1 text-sm font-medium">
              <span>{label}</span>
              <Input
                type={type}
                value={form[field]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                required={field !== 'phone'}
                minLength={field === 'password' ? 8 : undefined}
              />
            </label>
          ))}
          <p className="text-xs text-slate-500">{t('list.defaultRole')}</p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={create.isPending || !form.fullName.trim()}
            >
              {create.isPending ? t('form.saving') : t('form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminUsersPage() {
  const { t, i18n } = useTranslation('adminUsers')
  const canCreate = usePermission('user.user.create')
  const canApprove = usePermission('user.user.approve')
  const currentUserId = useCurrentUserId()
  const { updateStatus, bulkUpdateStatus } = useAdminUserMutations()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<AdminUserListInput['status']>()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<'active' | 'blocked'>('active')
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    )
    return () => window.clearTimeout(timeout)
  }, [search])
  const input = useMemo<AdminUserListInput>(
    () => ({
      search: debouncedSearch || undefined,
      role: role || undefined,
      status,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit,
    }),
    [debouncedSearch, role, status, dateFrom, dateTo, page, limit],
  )
  const query = useAdminUsers(input)
  const stats = useAdminUserStats()
  const items = query.data?.items ?? []
  const selectable = items.filter(
    (user) =>
      user.id !== currentUserId &&
      user.status !== 'unverified' &&
      !user.roleCodes.includes('SUPER_ADMIN'),
  )
  const allSelected =
    selectable.length > 0 && selectable.every((user) => selected.has(user.id))
  useEffect(() => setSelected(new Set()), [input])
  useEffect(() => {
    if (query.data && page > Math.max(1, query.data.meta.totalPages)) {
      setPage(Math.max(1, query.data.meta.totalPages))
    }
  }, [query.data, page])
  const roleEntries = Object.entries(stats.data?.roles ?? {}).sort(
    (a, b) => b[1] - a[1],
  )
  const maxRoleCount = Math.max(1, ...roleEntries.map(([, count]) => count))
  const resetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setRole('')
    setStatus(undefined)
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }
  const changeStatus = async (user: AdminUserListItem) => {
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked'
    if (
      nextStatus === 'blocked' &&
      !window.confirm(t('list.blockConfirm', { name: user.name }))
    )
      return
    try {
      await updateStatus.mutateAsync({ id: user.id, status: nextStatus })
      toast.success(t('list.statusSuccess'))
    } catch (error) {
      toast.apiError(error, t('list.statusFailed'))
    }
  }
  const applyBulk = async () => {
    if (
      bulkStatus === 'blocked' &&
      !window.confirm(t('list.bulkBlockConfirm', { count: selected.size }))
    )
      return
    try {
      await bulkUpdateStatus.mutateAsync({
        ids: [...selected],
        status: bulkStatus,
      })
      setSelected(new Set())
      toast.success(t('list.statusSuccess'))
    } catch (error) {
      toast.apiError(error, t('list.statusFailed'))
    }
  }
  const exportCsv = () => {
    const rows = [
      [
        'ID',
        t('list.columns.user'),
        t('form.email'),
        t('form.phone'),
        t('list.columns.roles'),
        t('form.status'),
        t('list.columns.createdAt'),
      ],
      ...items.map((user) => [
        user.id,
        user.name,
        user.email ?? '',
        user.phone ?? '',
        user.roleCodes.join(', '),
        t(`detail.statuses.${user.status}`),
        user.createdAt,
      ]),
    ]
    const csv =
      '\uFEFF' +
      rows
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(','),
        )
        .join('\n')
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  const cards = [
    {
      label: t('list.stats.total'),
      value: stats.data?.total,
      icon: UsersRound,
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: t('list.stats.active'),
      value: stats.data?.active,
      icon: UserRoundCheck,
      tone: 'bg-green-50 text-green-700',
    },
    {
      label: t('list.stats.new'),
      value: stats.data?.newUsers,
      icon: UserRoundPlus,
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      label: t('list.stats.blocked'),
      value: stats.data?.blocked,
      icon: LockKeyhole,
      tone: 'bg-red-50 text-red-700',
    },
  ]
  return (
    <div className="w-full min-w-0 space-y-4 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs text-primary-700">
            Dashboard / {t('title')}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('list.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={!items.length}
          >
            <Download className="mr-2 size-4" />
            {t('list.exportPage')}
          </Button>
          {canCreate && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 size-4" />
              {t('list.add')}
            </Button>
          )}
        </div>
      </header>
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-gray-800"
          >
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-full ${tone}`}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs text-slate-500">
                {label}
              </span>
              <strong className="text-xl">
                {stats.isLoading || stats.isError
                  ? '—'
                  : (value ?? 0).toLocaleString(i18n.language)}
              </strong>
            </span>
          </div>
        ))}
      </section>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <main className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-gray-800">
          <nav
            className="flex gap-6 overflow-x-auto border-b border-slate-200 px-4 dark:border-slate-700"
            aria-label={t('list.roleFilter')}
          >
            {[
              ['', t('list.allRoles'), stats.data?.total],
              ...roleEntries.map(
                ([code, count]) => [code, code, count] as const,
              ),
            ].map(([code, label, count]) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setRole(String(code))
                  setPage(1)
                }}
                className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${role === code ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}
              >
                {label} ({count ?? 0})
              </button>
            ))}
          </nav>
          <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_140px_145px_145px_auto]">
            <label className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">{t('list.search')}</span>
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder={t('list.search')}
                className="pl-9"
              />
            </label>
            <select
              aria-label={t('form.status')}
              className={selectClass}
              value={status ?? ''}
              onChange={(event) => {
                setStatus(
                  (event.target.value as AdminUserListInput['status']) ||
                    undefined,
                )
                setPage(1)
              }}
            >
              <option value="">{t('list.allStatuses')}</option>
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {t(`detail.statuses.${value}`)}
                </option>
              ))}
            </select>
            <label className="flex flex-col text-[10px] text-slate-500">
              <span>{t('list.from')}</span>
              <input
                type="date"
                className={`${selectClass} w-full`}
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => {
                  setDateFrom(event.target.value)
                  setPage(1)
                }}
              />
            </label>
            <label className="flex flex-col text-[10px] text-slate-500">
              <span>{t('list.to')}</span>
              <input
                type="date"
                className={`${selectClass} w-full`}
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => {
                  setDateTo(event.target.value)
                  setPage(1)
                }}
              />
            </label>
            <Button variant="outline" onClick={resetFilters}>
              {t('list.clear')}
            </Button>
          </div>
          {canApprove && selected.size > 0 && (
            <div className="mx-4 mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <strong className="mr-auto">
                {t('list.selected', { count: selected.size })}
              </strong>
              <select
                aria-label={t('form.status')}
                className={selectClass}
                value={bulkStatus}
                onChange={(event) =>
                  setBulkStatus(event.target.value as 'active' | 'blocked')
                }
              >
                <option value="active">{t('detail.statuses.active')}</option>
                <option value="blocked">{t('detail.statuses.blocked')}</option>
              </select>
              <Button
                size="sm"
                disabled={bulkUpdateStatus.isPending}
                onClick={() => void applyBulk()}
              >
                {t('list.apply')}
              </Button>
            </div>
          )}
          {query.isError ? (
            <div className="grid min-h-72 place-items-center text-sm text-red-600">
              {t('list.loadFailed')}
            </div>
          ) : query.isLoading ? (
            <div className="grid min-h-72 place-items-center text-sm text-slate-500">
              {t('loading')}
            </div>
          ) : items.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-y border-slate-100 bg-slate-50 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                  <tr>
                    {canApprove && (
                      <th className="px-4 py-3 font-medium">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          aria-label={t('list.selectPage')}
                          checked={allSelected}
                          disabled={!selectable.length}
                          onChange={() =>
                            setSelected(
                              allSelected
                                ? new Set()
                                : new Set(selectable.map((user) => user.id)),
                            )
                          }
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 font-medium">
                      {t('list.columns.user')}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t('list.columns.contact')}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t('list.columns.roles')}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t('form.status')}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t('list.columns.createdAt')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      {t('list.columns.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-700"
                    >
                      {canApprove && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            aria-label={t('list.selectUser', {
                              name: user.name,
                            })}
                            checked={selected.has(user.id)}
                            disabled={
                              user.id === currentUserId ||
                              user.status === 'unverified' ||
                              user.roleCodes.includes('SUPER_ADMIN')
                            }
                            onChange={() =>
                              setSelected((current) => {
                                const next = new Set(current)
                                if (next.has(user.id)) next.delete(user.id)
                                else next.add(user.id)
                                return next
                              })
                            }
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <Link
                          to="/dashboard/users/$userId"
                          params={{ userId: user.id }}
                          className="flex items-center gap-3 hover:text-primary"
                        >
                          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              user.name.slice(0, 2).toUpperCase()
                            )}
                          </span>
                          <span className="min-w-0">
                            <strong className="block max-w-44 truncate">
                              {user.name}
                            </strong>
                            <small className="block max-w-44 truncate text-slate-400">
                              {user.id}
                            </small>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <span className="block">{user.email || '—'}</span>
                        <small className="text-slate-400">
                          {user.phone || '—'}
                        </small>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex max-w-48 flex-wrap gap-1">
                          {user.roleCodes.map((code) => (
                            <span
                              key={code}
                              className="rounded bg-primary/10 px-2 py-1 text-xs text-primary"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs ${user.status === 'active' ? 'text-green-700' : user.status === 'blocked' ? 'text-red-700' : 'text-amber-700'}`}
                        >
                          <i
                            className={`size-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : user.status === 'blocked' ? 'bg-red-500' : 'bg-amber-500'}`}
                          />
                          {t(`detail.statuses.${user.status}`)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                        {new Intl.DateTimeFormat(i18n.language, {
                          dateStyle: 'medium',
                        }).format(new Date(user.createdAt))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild size="sm" variant="ghost">
                            <Link
                              to="/dashboard/users/$userId"
                              params={{ userId: user.id }}
                            >
                              {t('list.view')}
                            </Link>
                          </Button>
                          {canApprove &&
                            user.status !== 'unverified' &&
                            !user.roleCodes.includes('SUPER_ADMIN') &&
                            user.id !== currentUserId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                aria-label={
                                  user.status === 'blocked'
                                    ? t('list.unblock')
                                    : t('list.block')
                                }
                                disabled={
                                  updateStatus.isPending &&
                                  updateStatus.variables.id === user.id
                                }
                                onClick={() => void changeStatus(user)}
                              >
                                {user.status === 'blocked' ? (
                                  <UnlockKeyhole className="size-4 text-green-700" />
                                ) : (
                                  <LockKeyhole className="size-4 text-red-600" />
                                )}
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center text-sm text-slate-500">
              <div className="text-center">
                <UsersRound className="mx-auto mb-3 size-9 text-slate-300" />
                {t('list.empty')}
              </div>
            </div>
          )}
          {query.data && (
            <Pagination
              pagination={query.data.meta}
              displayedCount={items.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setLimit(size)
                setPage(1)
              }}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          )}
        </main>
        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-gray-800">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <ShieldCheck className="size-4 text-primary" />
            {t('list.roleDistribution')}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{t('list.roleNote')}</p>
          <div className="mt-5 space-y-4">
            {roleEntries.map(([code, count]) => (
              <div key={code}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium">{code}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.round((count / maxRoleCount) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!roleEntries.length && (
              <p className="text-xs text-slate-500">{t('list.noRoles')}</p>
            )}
          </div>
        </aside>
      </div>
      {canCreate && <AddUserDialog open={addOpen} onOpenChange={setAddOpen} />}
    </div>
  )
}
