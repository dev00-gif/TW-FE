import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import {
  useProvinces,
  useWards,
} from '@/features/admin/locations/hooks/useLocations'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { territoryKey } from '@/features/territory/useTerritory'
import type {
  TerritoryAccess,
  TerritoryScope,
} from '@/features/territory/access'
import { toast } from '@/utils/toast'

const selectClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-gray-800'

export function TerritoryPanel({ userId }: { userId: string }) {
  const { t } = useTranslation('adminUsers')
  const actor = useCurrentUser()
  const mayAssign =
    usePermission('user.user.approve') &&
    Boolean(actor?.isSuperAdmin || actor?.roleCodes.includes('ADMIN'))
  const client = useQueryClient()
  const query = useQuery({
    queryKey: territoryKey(userId),
    queryFn: () => api.get<TerritoryAccess>(`/users/${userId}/scopes`),
  })
  const provinces = useProvinces()
  const [provinceId, setProvinceId] = useState('')
  const province = provinces.data?.find((item) => item.id === provinceId)
  const wards = useWards(province?.code ?? '')
  const [mode, setMode] = useState<'PROVINCE' | 'WARD'>('WARD')
  const [wardIds, setWardIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState<TerritoryScope[]>([])
  useEffect(() => {
    if (query.data) setDraft(query.data.scopes)
  }, [query.data])
  const changed =
    JSON.stringify(
      draft.map((scope) => `${scope.scopeType}:${scope.scopeId}`).sort(),
    ) !==
    JSON.stringify(
      (query.data?.scopes ?? [])
        .map((scope) => `${scope.scopeType}:${scope.scopeId}`)
        .sort(),
    )
  const save = useMutation({
    mutationFn: () =>
      api.put<TerritoryAccess>(`/users/${userId}/scopes`, {
        scopes: draft.map(({ scopeType, scopeId }) => ({ scopeType, scopeId })),
      }),
    onSuccess: async (result) => {
      client.setQueryData(territoryKey(userId), result)
      await Promise.all([
        client.invalidateQueries({ queryKey: ['admin', 'devices'] }),
        client.invalidateQueries({ queryKey: ['admin', 'schedules'] }),
      ])
      toast.success(t('territory.saved'))
    },
    onError: (error) => toast.apiError(error, t('territory.saveFailed')),
  })
  const add = () => {
    if (!province) return
    const additions: TerritoryScope[] =
      mode === 'PROVINCE'
        ? [
            {
              scopeType: 'PROVINCE',
              scopeId: province.id,
              code: province.code,
              name: province.name,
              provinceCode: province.code,
            },
          ]
        : (wards.data ?? [])
            .filter((ward) => wardIds.includes(ward.id))
            .map((ward) => ({
              scopeType: 'WARD',
              scopeId: ward.id,
              code: ward.code,
              name: ward.name,
              provinceCode: ward.provinceCode,
            }))
    const duplicates = additions.filter((addition) =>
      draft.some(
        (scope) =>
          scope.scopeType === addition.scopeType &&
          scope.scopeId === addition.scopeId,
      ),
    )
    if (duplicates.length) {
      toast.warning(
        t('territory.alreadyAdded', {
          names: duplicates.map((scope) => scope.name).join(', '),
        }),
      )
    }
    if (duplicates.length === additions.length) return
    setDraft((current) => [
      ...new Map(
        [...current, ...additions].map((scope) => [
          `${scope.scopeType}:${scope.scopeId}`,
          scope,
        ]),
      ).values(),
    ])
    setWardIds([])
  }
  if (query.isPending)
    return <p className="p-5 text-sm text-slate-500">{t('loading')}</p>
  if (query.isError)
    return (
      <div role="alert" className="p-5">
        <p>{t('territory.loadFailed')}</p>
        <Button variant="outline" onClick={() => void query.refetch()}>
          {t('territory.retry')}
        </Button>
      </div>
    )
  const editable = mayAssign && !query.data.hasFullAccess
  const visibleWards = (wards.data ?? []).filter((ward) =>
    ward.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  )
  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-gray-800">
      <div>
        <h2 className="flex items-center gap-2 font-bold">
          <MapPin className="size-5 text-primary" />
          {t('territory.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {t('territory.description')}
        </p>
      </div>
      {query.data.hasFullAccess ? (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          {t('territory.allAccess')}
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {!draft.length && (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                {t('territory.noAccess')}
              </p>
            )}
            {draft.map((scope) => (
              <div
                key={`${scope.scopeType}:${scope.scopeId}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
              >
                <div>
                  <strong className="text-sm">{scope.name}</strong>
                  <p className="text-xs text-slate-500">
                    {scope.scopeType === 'PROVINCE'
                      ? t('territory.wholeProvince')
                      : t('territory.ward')}
                  </p>
                </div>
                {editable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`${t('territory.remove')} ${scope.name}`}
                    disabled={save.isPending}
                    onClick={() =>
                      setDraft((current) =>
                        current.filter((item) => item !== scope),
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {editable && (
            <>
              <fieldset
                disabled={save.isPending}
                className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span>{t('territory.province')}</span>
                    <select
                      className={selectClass}
                      value={provinceId}
                      onChange={(event) => {
                        setProvinceId(event.target.value)
                        setWardIds([])
                        setSearch('')
                      }}
                    >
                      <option value="">{t('territory.chooseProvince')}</option>
                      {(provinces.data ?? []).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>{t('territory.mode')}</span>
                    <select
                      className={selectClass}
                      value={mode}
                      onChange={(event) =>
                        setMode(event.target.value as 'PROVINCE' | 'WARD')
                      }
                    >
                      <option value="WARD">
                        {t('territory.selectedWards')}
                      </option>
                      <option value="PROVINCE">
                        {t('territory.wholeProvince')}
                      </option>
                    </select>
                  </label>
                </div>
                {provinces.isError && (
                  <p role="alert" className="text-sm text-red-600">
                    {t('territory.loadFailed')}
                  </p>
                )}
                {province && mode === 'WARD' && (
                  <div className="space-y-2">
                    <input
                      aria-label={t('territory.searchWards')}
                      placeholder={t('territory.searchWards')}
                      className={selectClass}
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                    {wards.isPending ? (
                      <p>{t('loading')}</p>
                    ) : wards.isError ? (
                      <p role="alert">{t('territory.loadFailed')}</p>
                    ) : (
                      <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                        {visibleWards.map((ward) => (
                          <label
                            key={ward.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-100 p-2 text-sm dark:border-slate-700"
                          >
                            <input
                              type="checkbox"
                              checked={wardIds.includes(ward.id)}
                              onChange={() =>
                                setWardIds((current) =>
                                  current.includes(ward.id)
                                    ? current.filter((id) => id !== ward.id)
                                    : [...current, ward.id],
                                )
                              }
                            />
                            {ward.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={add}
                  disabled={
                    !province ||
                    (mode === 'WARD' && (!wardIds.length || wards.isError))
                  }
                >
                  <Plus className="mr-2 size-4" />
                  {t('territory.add')}
                </Button>
              </fieldset>
              {draft.length > 100 && (
                <p role="alert" className="text-sm text-red-600">
                  {t('territory.limit')}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={!changed || save.isPending}
                  onClick={() => setDraft(query.data.scopes)}
                >
                  {t('territory.reset')}
                </Button>
                <Button
                  onClick={() => save.mutate()}
                  disabled={!changed || save.isPending || draft.length > 100}
                >
                  {save.isPending ? t('territory.saving') : t('territory.save')}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
