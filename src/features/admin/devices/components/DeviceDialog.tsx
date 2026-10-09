import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Device } from '../types'
import { allowedDemoAreas } from '@/features/territory/demoAreas'
import { useTerritory } from '@/features/territory/useTerritory'

const fieldClass =
  'mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800'

export function DeviceDialog({
  item,
  onClose,
  onSave,
}: {
  item?: Device
  onClose: () => void
  onSave: (device: Device) => void
}) {
  const { t } = useTranslation('adminDevices')
  const { access } = useTerritory()
  const areas = allowedDemoAreas(access)
  const deviceAreas = areas.map((area) => area.name)
  const [draft, setDraft] = useState<Device>(
    () =>
      item ?? {
        id: '',
        name: '',
        type: 'speaker',
        area: deviceAreas[0] ?? '',
        provinceCode: areas[0]?.provinceCode,
        wardCode:
          areas[0] && 'wardCode' in areas[0] ? areas[0].wardCode : undefined,
        address: '',
        longitude: 105.84,
        latitude: 21.59,
        status: 'active',
        firmware: 'v1.0.0',
        installedAt: new Date().toISOString().slice(0, 10),
        uptimeDays: 0,
        signal: -67,
        nextBroadcast: '',
        program: '',
        cpu: 32,
        ram: 45,
        storage: 68,
        temperature: 42,
        volume: 80,
      },
  )
  const [error, setError] = useState('')
  const update = (patch: Partial<Device>) =>
    setDraft((current) => ({ ...current, ...patch }))
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (
      !draft.area ||
      !draft.id.trim() ||
      !draft.name.trim() ||
      !draft.address.trim() ||
      !Number.isFinite(draft.latitude) ||
      !Number.isFinite(draft.longitude) ||
      Math.abs(draft.latitude) > 90 ||
      Math.abs(draft.longitude) > 180 ||
      !Number.isFinite(draft.volume) ||
      draft.volume < 0 ||
      draft.volume > 100
    ) {
      setError(t('invalidFields'))
      return
    }
    onSave({
      ...draft,
      id: draft.id.trim(),
      name: draft.name.trim(),
      address: draft.address.trim(),
    })
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t(item ? 'editDevice' : 'addDevice')}</DialogTitle>
          <DialogDescription>{t('formDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs">
              {t('deviceCode')}
              <input
                className={fieldClass}
                value={draft.id}
                disabled={!!item}
                onChange={(e) => update({ id: e.target.value })}
                required
              />
            </label>
            <label className="text-xs">
              {t('deviceName')}
              <input
                className={fieldClass}
                value={draft.name}
                onChange={(e) => update({ name: e.target.value })}
                required
              />
            </label>
            <label className="text-xs">
              {t('deviceType')}
              <select
                className={fieldClass}
                value={draft.type}
                onChange={(e) =>
                  update({ type: e.target.value as Device['type'] })
                }
              >
                {(['speaker', 'display', 'camera'] as const).map((type) => (
                  <option key={type} value={type}>
                    {t(`types.${type}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              {t('status')}
              <select
                className={fieldClass}
                value={draft.status}
                onChange={(e) =>
                  update({ status: e.target.value as Device['status'] })
                }
              >
                {(['active', 'offline', 'error', 'maintenance'] as const).map(
                  (status) => (
                    <option key={status} value={status}>
                      {t(`statuses.${status}`)}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="text-xs">
              {t('area')}
              <select
                className={fieldClass}
                value={draft.area}
                onChange={(e) => {
                  const area = areas.find(
                    (candidate) => candidate.name === e.target.value,
                  )
                  update({
                    area: e.target.value,
                    provinceCode: area?.provinceCode,
                    wardCode:
                      area && 'wardCode' in area ? area.wardCode : undefined,
                  })
                }}
              >
                {deviceAreas.map((area) => (
                  <option key={area}>{area}</option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              {t('installLocation')}
              <input
                className={fieldClass}
                value={draft.address}
                onChange={(e) => update({ address: e.target.value })}
                required
              />
            </label>
            <label className="text-xs">
              {t('latitude')}
              <input
                type="number"
                step="any"
                className={fieldClass}
                value={draft.latitude}
                onChange={(e) => update({ latitude: Number(e.target.value) })}
                required
              />
            </label>
            <label className="text-xs">
              {t('longitude')}
              <input
                type="number"
                step="any"
                className={fieldClass}
                value={draft.longitude}
                onChange={(e) => update({ longitude: Number(e.target.value) })}
                required
              />
            </label>
            <label className="text-xs">
              {t('firmware')}
              <input
                className={fieldClass}
                value={draft.firmware}
                onChange={(e) => update({ firmware: e.target.value })}
              />
            </label>
            <label className="text-xs">
              {t('installedAt')}
              <input
                type="date"
                className={fieldClass}
                value={draft.installedAt}
                onChange={(e) => update({ installedAt: e.target.value })}
              />
            </label>
            <label className="text-sm">
              {t('detail.volume')}
              <input
                type="number"
                min="0"
                max="100"
                className={fieldClass}
                value={draft.volume}
                onChange={(e) => update({ volume: Number(e.target.value) })}
                required
              />
            </label>
          </div>
          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">{t('save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
