import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as MapLibreGL from 'maplibre-gl'
import { useMap } from './context'
import type { MarkerProps } from './types'

export function Marker({
  longitude,
  latitude,
  children,
  draggable,
  onDragEnd,
}: MarkerProps) {
  const { map, isLoaded } = useMap()
  const markerRef = useRef<MapLibreGL.Marker | null>(null)
  const onDragEndRef = useRef(onDragEnd)
  const [element, setElement] = useState<HTMLElement | null>(null)

  onDragEndRef.current = onDragEnd

  useEffect(() => {
    if (!map || !isLoaded) return
    const markerElement = document.createElement('div')
    const marker = new MapLibreGL.Marker({
      element: markerElement,
      draggable,
    })
      .setLngLat([longitude, latitude])
      .addTo(map)
    setElement(markerElement)
    marker.on('dragend', () => {
      const point = marker.getLngLat()
      onDragEndRef.current?.({ lng: point.lng, lat: point.lat })
    })
    markerRef.current = marker
    return () => {
      marker.remove()
      markerRef.current = null
      setElement(null)
    }
  }, [map, isLoaded, draggable])

  useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude])
  }, [latitude, longitude])

  return element ? createPortal(children, element) : null
}
