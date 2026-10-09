import { MapPinned } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Controls, LIGHT_MAP_STYLE, Map, Marker } from '@/lib/map'
import type { Province, Ward } from '../types'

const thaiNguyen = { longitude: 105.84, latitude: 21.59 }

export function LocationMap({
  province,
  ward,
}: {
  province?: Province
  ward?: Ward
}) {
  const { t } = useTranslation('adminLocations')
  const hasLocation = province?.code === '19'
  const center: [number, number] = hasLocation
    ? [thaiNguyen.longitude, thaiNguyen.latitude]
    : [106.1, 16.3]
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-blue-950 dark:text-white">
          <MapPinned className="size-4 text-blue-600" />
          {t('mapTitle')}
        </h2>
        <span className="truncate text-xs text-slate-500">
          {ward?.name.trim() ?? province?.name.trim()}
        </span>
      </div>
      <div className="relative h-[490px] bg-blue-50">
        <Map
          key={province?.code ?? 'all'}
          style={LIGHT_MAP_STYLE}
          center={center}
          zoom={hasLocation ? 9 : 4.8}
        >
          <Controls position="top-left" showZoom />
          {hasLocation && (
            <Marker
              longitude={thaiNguyen.longitude}
              latitude={thaiNguyen.latitude}
            >
              <div className="flex flex-col items-center">
                <span className="grid size-10 place-items-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg">
                  <MapPinned className="size-5" />
                </span>
                <span className="mt-1 rounded bg-white px-2 py-1 text-xs font-semibold text-blue-900 shadow">
                  {province.name.trim()}
                </span>
              </div>
            </Marker>
          )}
        </Map>
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-sm dark:bg-slate-900/95 dark:text-slate-200">
          {hasLocation ? t('mapApproximate') : t('mapUnavailable')}
        </div>
      </div>
    </section>
  )
}
