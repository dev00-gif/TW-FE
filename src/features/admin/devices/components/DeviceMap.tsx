import { useCallback, useMemo } from 'react'
import { MapPinned } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { FeatureCollection, Point } from 'geojson'
import {
  ClusteredGeoJsonSource,
  Controls,
  LIGHT_MAP_STYLE,
  Map,
} from '@/lib/map'
import type { Device, DeviceFilters } from '../types'
import { allowedDemoAreas } from '@/features/territory/demoAreas'
import { useTerritory } from '@/features/territory/useTerritory'

const dotClass = {
  active: 'bg-emerald-500',
  offline: 'bg-amber-500',
  error: 'bg-red-500',
  maintenance: 'bg-slate-500',
}
const selectClass =
  'h-9 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ] ?? c,
  )

export function DeviceMap({
  items,
  filters,
  onFiltersChange,
  onSelect,
}: {
  items: Device[]
  filters: DeviceFilters
  onFiltersChange: (filters: DeviceFilters) => void
  onSelect: (device: Device) => void
}) {
  const { t } = useTranslation('adminDevices')
  const { access } = useTerritory()
  const areas = allowedDemoAreas(access)
  const deviceAreas = areas.map((area) => area.name)
  const data = useMemo<FeatureCollection<Point>>(
    () => ({
      type: 'FeatureCollection',
      features: items.map((item) => ({
        type: 'Feature',
        id: item.id,
        geometry: {
          type: 'Point',
          coordinates: [item.longitude, item.latitude],
        },
        properties: {
          id: item.id,
          status:
            item.status === 'error'
              ? 'offline'
              : item.status === 'offline'
                ? 'warning'
                : item.status,
        },
      })),
    }),
    [items],
  )
  const getPopupHtml = useCallback(
    (feature: { properties: Record<string, unknown> | null }) => {
      const item = items.find((device) => device.id === feature.properties?.id)
      return item
        ? `<div style="padding:3px;font-size:12px"><strong>${escapeHtml(item.id)}</strong><br/>${escapeHtml(item.name)}<br/>${escapeHtml(item.area)}</div>`
        : ''
    },
    [items],
  )
  const handlePointClick = useCallback(
    (feature: { properties: Record<string, unknown> | null }) => {
      const item = items.find((device) => device.id === feature.properties?.id)
      if (item) onSelect(item)
    },
    [items, onSelect],
  )
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-blue-950 dark:text-white">
          <MapPinned className="size-5 text-blue-600" />
          {t('mapTitle')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <select
            className={selectClass}
            aria-label={t('allTypes')}
            value={filters.type}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                type: e.target.value as DeviceFilters['type'],
              })
            }
          >
            <option value="all">{t('allTypes')}</option>
            {(['speaker', 'display', 'camera'] as const).map((type) => (
              <option key={type} value={type}>
                {t(`types.${type}`)}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            aria-label={t('allStatuses')}
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value as DeviceFilters['status'],
              })
            }
          >
            <option value="all">{t('allStatuses')}</option>
            {(['active', 'offline', 'error', 'maintenance'] as const).map(
              (status) => (
                <option key={status} value={status}>
                  {t(`statuses.${status}`)}
                </option>
              ),
            )}
          </select>
          <select
            className={selectClass}
            aria-label={t('allAreas')}
            value={filters.area}
            onChange={(e) =>
              onFiltersChange({ ...filters, area: e.target.value })
            }
          >
            <option value="all">{t('allAreas')}</option>
            {deviceAreas.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="relative h-[390px] bg-slate-100 lg:h-[430px]">
        <Map style={LIGHT_MAP_STYLE} center={[105.83, 21.68]} zoom={8.75}>
          <Controls position="top-left" showZoom showLocate />
          <ClusteredGeoJsonSource
            sourceId="admin-device-map"
            data={data}
            getPopupHtml={getPopupHtml}
            onPointClick={handlePointClick}
          />
        </Map>
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/95 p-3 text-[11px] shadow-lg dark:bg-slate-900/95">
          <p className="mb-1 font-semibold text-blue-950 dark:text-white">
            {t('mapLegend')}
          </p>
          {(['active', 'offline', 'error', 'maintenance'] as const).map(
            (status) => (
              <div key={status} className="flex items-center gap-2 py-0.5">
                <span className={`size-2.5 rounded-full ${dotClass[status]}`} />
                <span>{t(`statuses.${status}`)}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
