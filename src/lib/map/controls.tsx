import { useCallback, useEffect, useRef, useState } from 'react'
import { useMap } from './context'
import type { ControlsProps } from './types'
import { cn } from '@/utils/utils'
import { Layers, Locate, Loader2, Maximize, Minus, Plus } from 'lucide-react'
import { MAP_TILE_STYLES } from './styles'
import type { MapTileStyle } from './styles'
import { MapStylePanel } from './map-style-panel'

const positionClasses = {
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-right': 'bottom-10 right-2',
}

function ControlGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border [&>button:not(:last-child)]:border-border flex flex-col overflow-hidden rounded-md border-none bg-white shadow-sm [&>button:not(:last-child)]:border-b">
      {children}
    </div>
  )
}

function ControlButton({
  onClick,
  label,
  children,
  disabled = false,
  active = false,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      type="button"
      className={cn(
        'hover:bg-accent dark:hover:bg-accent/40 flex size-8 items-center justify-center transition-colors',
        active && 'bg-accent text-accent-foreground font-bold',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function Controls({
  position = 'top-right',
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
  showMapStyle = false,
  mapStyle = 'light',
  onMapStyleChange,
}: ControlsProps) {
  const { map, isLoaded } = useMap()
  const [waitingForLocation, setWaitingForLocation] = useState(false)

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 })
  }, [map])

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 })
  }, [map])

  const handleResetBearing = useCallback(() => {
    map?.resetNorthPitch({ duration: 300 })
  }, [map])

  const handleLocate = useCallback(() => {
    setWaitingForLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          }
          map?.flyTo({
            center: [coords.longitude, coords.latitude],
            zoom: 14,
            duration: 1500,
          })
          onLocate?.(coords)
          setWaitingForLocation(false)
        },
        () => {
          setWaitingForLocation(false)
        },
      )
    }
  }, [map, onLocate])

  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer()
    if (!container) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen()
    }
  }, [map])

  if (!isLoaded) return null
  return (
    <div
      className={cn(
        'absolute z-10 flex flex-col gap-1.5',
        positionClasses[position],
        className,
      )}
    >
      {showZoom && (
        <ControlGroup>
          <ControlButton onClick={handleZoomIn} label="Phóng to">
            <Plus className="size-4" />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} label="Thu nhỏ">
            <Minus className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
      {showMapStyle && onMapStyleChange && (
        <MapStylePanel
          mapStyle={mapStyle}
          embedded
          onStyleChange={(style) => {
            map?.setStyle(MAP_TILE_STYLES[style])
            onMapStyleChange(style)
          }}
        />
      )}
      {showCompass && (
        <ControlGroup>
          <CompassButton onClick={handleResetBearing} />
        </ControlGroup>
      )}
      {showLocate && (
        <ControlGroup>
          <ControlButton
            onClick={handleLocate}
            label="Vị trí của tôi"
            disabled={waitingForLocation}
          >
            {waitingForLocation ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Locate className="size-4" />
            )}
          </ControlButton>
        </ControlGroup>
      )}
      {showFullscreen && (
        <ControlGroup>
          <ControlButton
            onClick={handleFullscreen}
            label="Chuyển đổi toàn màn hình"
          >
            <Maximize className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
    </div>
  )
}

export function MapTileControl() {
  const { map } = useMap()
  const [mapTile, setMapTile] = useState<MapTileStyle>('light')

  return (
    <label className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <Layers className="size-4 text-slate-500" />
      <select
        value={mapTile}
        onChange={(event) => {
          const nextTile = event.target.value as MapTileStyle
          setMapTile(nextTile)
          map?.setStyle(MAP_TILE_STYLES[nextTile])
        }}
        className="max-w-24 bg-transparent text-xs outline-none"
        aria-label="Kiểu bản đồ"
      >
        <option value="light">Sáng</option>
        <option value="dark">Tối</option>
        <option value="satellite">Vệ tinh</option>
      </select>
    </label>
  )
}

export function CompassButton({ onClick }: { onClick: () => void }) {
  const { isLoaded, map } = useMap()
  const compassRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!isLoaded || !map || !compassRef.current) return

    const compass = compassRef.current

    const updateRotation = () => {
      const bearing = map.getBearing()
      const pitch = map.getPitch()
      compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`
    }

    map.on('rotate', updateRotation)
    map.on('pitch', updateRotation)
    updateRotation()

    return () => {
      map.off('rotate', updateRotation)
      map.off('pitch', updateRotation)
    }
  }, [isLoaded, map])

  return (
    <ControlButton onClick={onClick} label="Reset Bearing">
      <svg
        ref={compassRef}
        viewBox="0 0 24 24"
        className="size-5 transition-transform duration-200"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <path d="M12 2L16 12H12V2Z" className="fill-red-500" />
        <path d="M12 2L8 12H12V2Z" className="fill-red-300" />
        <path d="M12 22L16 12H12V22Z" className="fill-muted-foreground/60" />
        <path d="M12 22L8 12H12V22Z" className="fill-muted-foreground/30" />
      </svg>
    </ControlButton>
  )
}
