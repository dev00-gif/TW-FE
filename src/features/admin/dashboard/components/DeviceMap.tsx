import { useCallback, useMemo, useState } from 'react'
import { Map as MapIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { FeatureCollection, Point } from 'geojson'
import {
  ClusteredGeoJsonSource,
  Controls,
  LIGHT_MAP_STYLE,
  Map,
} from '@/lib/map'
import type {
  BroadcastChannel,
  DashboardOverview,
  DeviceStatus,
} from '../types'

const statusColors: Record<DeviceStatus, string> = {
  active: 'bg-emerald-500',
  warning: 'bg-amber-500',
  offline: 'bg-red-500',
  maintenance: 'bg-slate-400',
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ] ?? character,
  )
}

export function DeviceMap({
  locations,
}: {
  locations: DashboardOverview['locations']
}) {
  const { t } = useTranslation('adminDashboard')
  const [channel, setChannel] = useState<BroadcastChannel | 'all'>('all')
  const [status, setStatus] = useState<DeviceStatus | 'all'>('all')
  const visible = useMemo(
    () =>
      locations.filter(
        (item) =>
          (channel === 'all' || item.channel === channel) &&
          (status === 'all' || item.status === status),
      ),
    [locations, channel, status],
  )
  const data = useMemo<FeatureCollection<Point>>(
    () => ({
      type: 'FeatureCollection',
      features: visible.map((item) => ({
        type: 'Feature',
        id: item.id,
        geometry: {
          type: 'Point',
          coordinates: [item.longitude, item.latitude],
        },
        properties: {
          id: item.id,
          count: item.count,
          status: item.status,
          name: item.name,
        },
      })),
    }),
    [visible],
  )
  const getPopupHtml = useCallback(
    (feature: { properties: Record<string, unknown> | null }) => {
      const id = String(feature.properties?.id ?? '')
      const item = locations.find((location) => location.id === id)
      if (!item) return ''
      return `<div style="padding:4px 2px;font-size:13px"><strong>${escapeHtml(item.name)}</strong><br/>${escapeHtml(t('devices'))}: ${item.count.toLocaleString()}</div>`
    },
    [locations, t],
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <h2 className="flex items-center gap-3 text-base font-semibold text-slate-900 dark:text-white">
          <MapIcon className="size-5 text-blue-600" />
          {t('deviceMap')}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={t('allChannels')}
            value={channel}
            onChange={(event) =>
              setChannel(event.target.value as typeof channel)
            }
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">{t('allChannels')}</option>
            <option value="radio">{t('radio')}</option>
            <option value="digital">{t('digital')}</option>
          </select>
          <select
            aria-label={t('allStatuses')}
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">{t('allStatuses')}</option>
            {(['active', 'warning', 'offline', 'maintenance'] as const).map(
              (value) => (
                <option key={value} value={value}>
                  {t(value)}
                </option>
              ),
            )}
          </select>
          <a
            href="#device-status"
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            {t('viewDetails')}
          </a>
        </div>
      </div>
      <div className="relative h-[430px] overflow-hidden bg-[#e5f0e4]">
        <Map style={LIGHT_MAP_STYLE} center={[105.83, 21.68]} zoom={8.75}>
          <Controls position="bottom-left" showZoom />
          <ClusteredGeoJsonSource
            sourceId="dashboard-devices"
            data={data}
            clusterValueProperty="count"
            getPopupHtml={getPopupHtml}
          />
        </Map>
        <div className="pointer-events-none absolute bottom-3 left-12 rounded-lg bg-white/95 p-3 text-[11px] shadow-md dark:bg-slate-900/95">
          {(['active', 'warning', 'offline', 'maintenance'] as const).map(
            (value) => (
              <div key={value} className="flex items-center gap-2 py-0.5">
                <span
                  className={`size-3 rounded-full ${statusColors[value]}`}
                />
                {t(value)}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
