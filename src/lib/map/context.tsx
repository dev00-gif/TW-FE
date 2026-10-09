import { createContext, useContext, useRef } from 'react'
import type * as MapLibreGL from 'maplibre-gl'
import type { MapContextValue } from './types'

export const MapContext = createContext<MapContextValue | null>(null)

export function useMap() {
  const context = useContext(MapContext)
  if (!context) throw new Error('Map components must be used inside Map')
  return context
}

export function useMarkerContext() {
  const markerRef = useRef<MapLibreGL.Marker | null>(null)
  const markerElementRef = useRef<HTMLElement | null>(null)
  const { map, isLoaded } = useMap()
  return { markerRef, markerElementRef, map, isReady: isLoaded }
}
