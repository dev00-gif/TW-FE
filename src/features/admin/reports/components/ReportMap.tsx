import { MapPinned } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Controls, LIGHT_MAP_STYLE, Map, Marker } from '@/lib/map'
import type { ReportArea } from '../types'

export function ReportMap({ areas }: { areas: ReportArea[] }) {
  const { t, i18n } = useTranslation('adminReports')
  const number = new Intl.NumberFormat(
    i18n.language === 'en' ? 'en-US' : 'vi-VN',
  )
  const max = Math.max(1, ...areas.map((area) => area.broadcasts))

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-bold text-blue-950 dark:border-slate-800 dark:text-white">
        <MapPinned className="size-4 text-blue-600" />
        {t('mapTitle')}
      </h2>
      <div className="relative h-[320px] bg-blue-50">
        <Map style={LIGHT_MAP_STYLE} center={[105.83, 21.75]} zoom={8.6}>
          <Controls position="bottom-right" showZoom />
          {areas.map((area) => {
            const size = 30 + Math.round((area.broadcasts / max) * 22)
            return (
              <Marker
                key={area.id}
                longitude={area.longitude}
                latitude={area.latitude}
              >
                <div
                  className="group relative flex flex-col items-center"
                  title={`${area.name}: ${number.format(area.broadcasts)} ${t('broadcasts')}`}
                >
                  <span
                    className="grid rounded-full border-2 border-white bg-blue-600 text-xs font-bold text-white shadow-lg ring-2 ring-blue-500/25"
                    style={{ width: size, height: size, placeItems: 'center' }}
                  >
                    {number.format(area.broadcasts)}
                  </span>
                  <span className="mt-0.5 max-w-24 rounded bg-white/90 px-1 text-center text-[10px] font-semibold leading-tight text-blue-950 shadow-sm">
                    {area.name}
                  </span>
                </div>
              </Marker>
            )
          })}
        </Map>
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-sm">
          <span className="mr-1 inline-block size-2.5 rounded-full bg-blue-600" />
          {t('mapLegend')}
        </div>
      </div>
    </section>
  )
}
