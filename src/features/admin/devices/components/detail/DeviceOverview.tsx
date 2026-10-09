import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Controls, LIGHT_MAP_STYLE, Map, Marker } from '@/lib/map'
import type { Device } from '../../types'
import { DeviceIllustration } from '../DeviceIllustration'

const cardClass =
  'min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export function DeviceOverview({ device }: { device: Device }) {
  const { t } = useTranslation('adminDevices')
  const info = [
    ['deviceCode', device.id],
    ['deviceName', device.name],
    ['deviceType', t(`types.${device.type}`)],
    ['area', device.area],
    ['installLocation', device.address],
    [
      'coordinates',
      `${device.latitude.toFixed(5)}, ${device.longitude.toFixed(5)}`,
    ],
    ['detail.group', t('detail.centralCluster')],
    ['installedAt', device.installedAt],
    ['detail.note', '—'],
  ] as const
  return (
    <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <section className={cardClass} aria-label={t('detail.deviceInformation')}>
        <div className="grid h-full gap-3 sm:grid-cols-[minmax(130px,0.55fr)_minmax(0,1fr)]">
          <DeviceIllustration
            type={device.type}
            className="min-h-64 rounded-lg"
          />
          <dl className="min-w-0 text-sm">
            {info.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-[105px_minmax(0,1fr)] gap-2 border-b border-slate-100 py-1.5 last:border-0 dark:border-slate-800"
              >
                <dt className="text-slate-500">{t(key)}</dt>
                <dd className="break-words font-medium text-blue-950 dark:text-slate-100">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section
        id="device-location"
        className={`${cardClass} relative h-[400px] p-0 2xl:h-[430px]`}
        aria-label={t('detail.locationMap')}
      >
        <Map
          style={LIGHT_MAP_STYLE}
          center={[device.longitude, device.latitude]}
          zoom={14}
        >
          <Controls position="top-left" showZoom />
          <Marker longitude={device.longitude} latitude={device.latitude}>
            <div className="relative grid size-8 place-items-center rounded-full border-[3px] border-white bg-blue-600 text-white shadow-lg">
              <MapPin className="size-4" />
              <span className="sr-only">{device.address}</span>
            </div>
          </Marker>
        </Map>
        <div className="pointer-events-none absolute right-2 bottom-2 left-2 rounded-lg bg-white/95 p-3 text-sm shadow-md dark:bg-slate-900/95">
          <strong className="text-blue-700">{device.address}</strong>
          <br />
          <span className="text-slate-500">{device.area}</span>
        </div>
      </section>
    </div>
  )
}
