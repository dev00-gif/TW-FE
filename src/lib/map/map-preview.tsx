import { useEffect, useState } from 'react'
import { Crosshair, MapPin, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMap } from './context'
import { Map } from './map'
import { Marker } from './marker'
import { Popup } from './popup'
import { MapStylePanel } from './map-style-panel'
import { MAP_TILE_STYLES } from './styles'
import type { MapTileStyle } from './styles'

function ColoredMapMarker({
  tone,
  size = 'md',
}: {
  tone: 'primary' | 'amber' | 'blue'
  size?: 'sm' | 'md'
}) {
  const toneClass = {
    primary: 'text-primary fill-primary',
    amber: 'text-amber-500 fill-amber-500',
    blue: 'text-blue-500 fill-blue-500',
  }[tone]
  const sizeClass = size === 'sm' ? 'size-6' : 'size-8'
  const dotClass = size === 'sm' ? 'top-2 size-1.5' : 'top-2.5 size-2'

  return (
    <span className={`relative block ${sizeClass} drop-shadow-md`}>
      <MapPin className={`absolute inset-0 ${sizeClass} ${toneClass}`} />
      <span
        className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-white ${dotClass}`}
      />
    </span>
  )
}

function MapViewport({
  latitude,
  longitude,
  comparisonPoints,
}: {
  latitude: number
  longitude: number
  comparisonPoints?: {
    old?: { latitude: number; longitude: number }
    proposed?: { latitude: number; longitude: number }
  }
}) {
  const { map } = useMap()
  useEffect(() => {
    if (!map) return
    const points = [comparisonPoints?.old, comparisonPoints?.proposed].filter(
      (point): point is { latitude: number; longitude: number } =>
        point != null,
    )
    if (points.length > 1) {
      const longitudes = points.map((point) => point.longitude)
      const latitudes = points.map((point) => point.latitude)
      map.fitBounds(
        [
          [Math.min(...longitudes), Math.min(...latitudes)],
          [Math.max(...longitudes), Math.max(...latitudes)],
        ],
        { padding: 80, maxZoom: 15, duration: 700 },
      )
      return
    }
    map.flyTo({ center: [longitude, latitude], zoom: 15, duration: 700 })
  }, [comparisonPoints, latitude, longitude, map])
  return null
}

function MapPointPicker({
  enabled,
  onPoint,
}: {
  enabled: boolean
  onPoint: (longitude: number, latitude: number) => void
}) {
  const { map } = useMap()

  useEffect(() => {
    if (!map || !enabled) return
    const handleClick = (event: { lngLat: { lng: number; lat: number } }) =>
      onPoint(event.lngLat.lng, event.lngLat.lat)
    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [enabled, map, onPoint])

  return null
}

function PreviewControls({
  onCurrentLocation,
}: {
  onCurrentLocation?: (longitude: number, latitude: number) => void
}) {
  const { map } = useMap()

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const nextLongitude = coords.longitude
      const nextLatitude = coords.latitude
      map?.flyTo({ center: [nextLongitude, nextLatitude], zoom: 15 })
      onCurrentLocation?.(nextLongitude, nextLatitude)
    })
  }

  return (
    <div className="absolute top-24 right-3 z-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => map?.zoomIn()}
        className="grid size-9 place-items-center"
        aria-label="Phóng to"
      >
        <Plus className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => map?.zoomOut()}
        className="grid size-9 place-items-center border-y border-slate-200 dark:border-slate-700"
        aria-label="Thu nhỏ"
      >
        <Minus className="size-4" />
      </button>
      <button
        type="button"
        onClick={handleCurrentLocation}
        className="grid size-9 place-items-center"
        aria-label="Vị trí hiện tại"
      >
        <Crosshair className="size-4" />
      </button>
    </div>
  )
}

function PreviewMapStyleControl({
  value,
  onChange,
}: {
  value: MapTileStyle
  onChange: (value: MapTileStyle) => void
}) {
  const { map } = useMap()
  return (
    <MapStylePanel
      mapStyle={value}
      onStyleChange={(style) => {
        map?.setStyle(MAP_TILE_STYLES[style])
        onChange(style)
      }}
    />
  )
}

export function MapPreview({
  latitude = 10.7769,
  longitude = 106.6869,
  onUpdateCoordinates,
  onSaveMapPoint,
  showSelectedMarker,
  canSelectPoint = true,
  selectPointLabel = 'Chọn điểm trên bản đồ',
  addressPlaceholder = 'Nhập tên địa chỉ tại điểm đã chọn',
  cancelLabel = 'Hủy',
  saveLabel = 'Lưu địa chỉ',
  comparisonPoints,
  comparisonLabels,
  markerPopup,
  mapClassName = 'h-72',
}: {
  latitude?: number
  longitude?: number
  address?: string
  onUpdateCoordinates?: (longitude: number, latitude: number) => void
  onSaveMapPoint?: (
    address: string,
    longitude: number,
    latitude: number,
  ) => void
  showSelectedMarker?: boolean
  canSelectPoint?: boolean
  selectPointLabel?: string
  addressPlaceholder?: string
  cancelLabel?: string
  saveLabel?: string
  comparisonPoints?: {
    old?: { latitude: number; longitude: number }
    proposed?: { latitude: number; longitude: number }
  }
  comparisonLabels?: {
    old?: string
    proposed?: string
  }
  markerPopup?: {
    title?: string
    address?: string
    coordinateLabel?: string
  }
  mapClassName?: string
}) {
  const [isPickingPoint, setIsPickingPoint] = useState(false)
  const [mapStyle, setMapStyle] = useState<MapTileStyle>('light')
  const [pendingPoint, setPendingPoint] = useState<{
    longitude: number
    latitude: number
  } | null>(null)
  const [draftAddress, setDraftAddress] = useState('')
  const [shopMarker, setShopMarker] = useState<{
    longitude: number
    latitude: number
  } | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{
    longitude: number
    latitude: number
  } | null>(null)

  useEffect(() => {
    if (showSelectedMarker === undefined) return
    setShopMarker(showSelectedMarker ? { longitude, latitude } : null)
  }, [latitude, longitude, showSelectedMarker])

  const handlePoint = (nextLongitude: number, nextLatitude: number) => {
    setPendingPoint({ longitude: nextLongitude, latitude: nextLatitude })
  }

  const handleCancel = () => {
    setPendingPoint(null)
    setDraftAddress('')
    setIsPickingPoint(false)
  }

  const handleSave = () => {
    if (!pendingPoint || !draftAddress.trim()) return
    onSaveMapPoint?.(
      draftAddress.trim(),
      pendingPoint.longitude,
      pendingPoint.latitude,
    )
    setShopMarker(pendingPoint)
    setPendingPoint(null)
    setDraftAddress('')
    setIsPickingPoint(false)
  }

  useEffect(() => {
    if (!canSelectPoint && isPickingPoint) {
      setIsPickingPoint(false)
      setPendingPoint(null)
      setDraftAddress('')
    }
  }, [canSelectPoint, isPickingPoint])

  return (
    <div className="space-y-2">
      <div
        className={`relative ${mapClassName} overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900`}
      >
        <Map
          center={[longitude, latitude]}
          zoom={15}
          style={MAP_TILE_STYLES.light}
        >
          <MapViewport
            latitude={latitude}
            longitude={longitude}
            comparisonPoints={comparisonPoints}
          />
          <MapPointPicker enabled={isPickingPoint} onPoint={handlePoint} />
          {pendingPoint && (
            <Marker
              longitude={pendingPoint.longitude}
              latitude={pendingPoint.latitude}
            >
              <ColoredMapMarker tone="amber" />
            </Marker>
          )}
          {comparisonPoints?.old && (
            <>
              <Marker
                longitude={comparisonPoints.old.longitude}
                latitude={comparisonPoints.old.latitude}
              >
                <ColoredMapMarker tone="amber" />
              </Marker>
              <Popup
                longitude={comparisonPoints.old.longitude}
                latitude={comparisonPoints.old.latitude}
                closeButton={false}
                popupClassName="maplibregl-popup--clean"
                className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-amber-800 dark:bg-slate-900"
              >
                <p className="font-semibold text-amber-600 dark:text-amber-400">
                  {comparisonLabels?.old}
                </p>
                <p className="mt-1 font-mono text-slate-700 dark:text-slate-200">
                  {comparisonPoints.old.latitude.toFixed(6)},{' '}
                  {comparisonPoints.old.longitude.toFixed(6)}
                </p>
              </Popup>
            </>
          )}
          {comparisonPoints?.proposed && (
            <>
              <Marker
                longitude={comparisonPoints.proposed.longitude}
                latitude={comparisonPoints.proposed.latitude}
              >
                <ColoredMapMarker tone="primary" />
              </Marker>
              <Popup
                longitude={comparisonPoints.proposed.longitude}
                latitude={comparisonPoints.proposed.latitude}
                closeButton={false}
                popupClassName="maplibregl-popup--clean"
                className="rounded-lg border border-primary/30 bg-white px-3 py-2 text-xs shadow-lg dark:bg-slate-900"
              >
                <p className="font-semibold text-primary">
                  {comparisonLabels?.proposed}
                </p>
                <p className="mt-1 font-mono text-slate-700 dark:text-slate-200">
                  {comparisonPoints.proposed.latitude.toFixed(6)},{' '}
                  {comparisonPoints.proposed.longitude.toFixed(6)}
                </p>
              </Popup>
            </>
          )}
          {!comparisonPoints && shopMarker && (
            <>
              <Marker
                longitude={shopMarker.longitude}
                latitude={shopMarker.latitude}
                draggable
                onDragEnd={({ lng, lat }) => {
                  setShopMarker({ longitude: lng, latitude: lat })
                  onUpdateCoordinates?.(lng, lat)
                }}
              >
                <ColoredMapMarker tone="primary" />
              </Marker>
              {markerPopup && (
                <Popup
                  longitude={shopMarker.longitude}
                  latitude={shopMarker.latitude}
                  closeButton={false}
                  popupClassName="maplibregl-popup--clean"
                  className="max-w-64 rounded-lg border border-primary/30 bg-white px-3 py-2 text-xs shadow-lg dark:bg-slate-900"
                >
                  {markerPopup.title && (
                    <p className="font-semibold text-primary">
                      {markerPopup.title}
                    </p>
                  )}
                  {markerPopup.address && (
                    <p className="mt-1 text-slate-700 dark:text-slate-200">
                      {markerPopup.address}
                    </p>
                  )}
                  {markerPopup.coordinateLabel && (
                    <p className="mt-1 font-mono text-slate-500 dark:text-slate-400">
                      {markerPopup.coordinateLabel}:{' '}
                      {shopMarker.latitude.toFixed(6)},{' '}
                      {shopMarker.longitude.toFixed(6)}
                    </p>
                  )}
                </Popup>
              )}
            </>
          )}
          {currentLocation && (
            <Marker
              longitude={currentLocation.longitude}
              latitude={currentLocation.latitude}
            >
              <ColoredMapMarker tone="blue" size="sm" />
            </Marker>
          )}
          <PreviewControls
            onCurrentLocation={(nextLongitude, nextLatitude) =>
              setCurrentLocation({
                longitude: nextLongitude,
                latitude: nextLatitude,
              })
            }
          />
          <PreviewMapStyleControl value={mapStyle} onChange={setMapStyle} />
        </Map>
        <Button
          type="button"
          size="sm"
          variant={isPickingPoint ? 'primary' : 'outline'}
          disabled={!canSelectPoint}
          className="absolute top-3 left-3 z-10 h-8 px-2 text-xs shadow-sm backdrop-blur"
          onClick={() => {
            setIsPickingPoint((value) => !value)
            setPendingPoint(null)
          }}
        >
          {selectPointLabel}
        </Button>
      </div>
      {pendingPoint && (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            className="flex-1"
            value={draftAddress}
            onChange={(event) => setDraftAddress(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSave()
            }}
            placeholder={addressPlaceholder}
          />
          <Button
            type="button"
            disabled={!draftAddress.trim()}
            onClick={handleSave}
          >
            {saveLabel}
          </Button>
          <Button type="button" variant="error" onClick={handleCancel}>
            {cancelLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
