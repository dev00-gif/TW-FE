import type { ReactNode } from 'react'
import type * as MapLibreGL from 'maplibre-gl'
import type { MapTileStyle } from './styles'

export type MapProps = {
  children?: ReactNode
  style?: string | MapLibreGL.StyleSpecification
  center?: [number, number]
  zoom?: number
} & Omit<MapLibreGL.MapOptions, 'container' | 'style' | 'center' | 'zoom'>

export type MapContextValue = {
  map: MapLibreGL.Map | null
  isLoaded: boolean
}

export type MarkerProps = {
  longitude: number
  latitude: number
  children: ReactNode
  draggable?: boolean
  onDragEnd?: (coordinates: { lng: number; lat: number }) => void
}

export type ControlsProps = {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showZoom?: boolean
  showCompass?: boolean
  showLocate?: boolean
  showFullscreen?: boolean
  className?: string
  onLocate?: (coordinates: { longitude: number; latitude: number }) => void
  showMapStyle?: boolean
  mapStyle?: MapTileStyle
  onMapStyleChange?: (style: MapTileStyle) => void
}

export type PopupProps = ReactNode extends never
  ? never
  : MapLibreGL.PopupOptions & {
      longitude: number
      latitude: number
      children: ReactNode
      className?: string
      popupClassName?: string
      closeButton?: boolean
      onClose?: () => void
    }

export type MarkerPopupProps = MapLibreGL.PopupOptions & {
  children: ReactNode
  className?: string
  closeButton?: boolean
}

export type MarkerTooltipProps = MapLibreGL.PopupOptions & {
  children: ReactNode
  className?: string
}

export type RouteProps = {
  coordinates: Array<[number, number]>
  color?: string
  width?: number
  opacity?: number
  dashArray?: number[]
}
