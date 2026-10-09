import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMap, useMarkerContext } from './context'
import type { PopupProps, MarkerPopupProps, MarkerTooltipProps } from './types'
import { cn } from '@/utils/utils'
import { X } from 'lucide-react'
import * as MapLibreGL from 'maplibre-gl'

export function Popup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  popupClassName,
  closeButton = false,
  ...popupOptions
}: PopupProps) {
  const { map } = useMap()
  const popupRef = useRef<MapLibreGL.Popup | null>(null)
  const popupOptionsRef = useRef(popupOptions)

  const container = useMemo(() => document.createElement('div'), [])

  useEffect(() => {
    if (!map) return

    const popup = new MapLibreGL.Popup({
      offset: 16,
      ...(popupClassName ? { className: popupClassName } : {}),
      ...popupOptions,
      closeButton: false,
    })
      .setMaxWidth('none')
      .setDOMContent(container)
      .setLngLat([longitude, latitude])
      .addTo(map)

    const onCloseProp = () => onClose?.()
    popup.on('close', onCloseProp)
    popupRef.current = popup

    return () => {
      popup.off('close', onCloseProp)
      if (popup.isOpen()) {
        popup.remove()
      }
      popupRef.current = null
    }
  }, [map, popupClassName])

  useEffect(() => {
    popupRef.current?.setLngLat([longitude, latitude])
  }, [longitude, latitude])

  useEffect(() => {
    if (!popupRef.current) return
    const prev = popupOptionsRef.current

    if (prev.offset !== popupOptions.offset) {
      popupRef.current.setOffset(popupOptions.offset ?? 16)
    }
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
      popupRef.current.setMaxWidth(popupOptions.maxWidth ?? 'none')
    }

    popupOptionsRef.current = popupOptions
  }, [popupOptions])

  const handleClose = () => {
    popupRef.current?.remove()
    onClose?.()
  }

  return createPortal(
    <div className={className}>
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="ring-offset-background absolute top-1 right-1 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>,
    container,
  )
}

export function MarkerPopup({
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MarkerPopupProps) {
  const { markerRef, isReady } = useMarkerContext()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const popupRef = useRef<MapLibreGL.Popup | null>(null)
  const [mounted, setMounted] = useState(false)
  const popupOptionsRef = useRef(popupOptions)

  useEffect(() => {
    if (!isReady || !markerRef.current) return

    const container = document.createElement('div')
    containerRef.current = container

    const popup = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
    })
      .setMaxWidth('none')
      .setDOMContent(container)

    popupRef.current = popup
    markerRef.current.setPopup(popup)
    setMounted(true)

    return () => {
      popup.remove()
      popupRef.current = null
      containerRef.current = null
      setMounted(false)
    }
  }, [isReady])

  useEffect(() => {
    if (!popupRef.current) return
    const prev = popupOptionsRef.current

    if (prev.offset !== popupOptions.offset) {
      popupRef.current.setOffset(popupOptions.offset ?? 16)
    }
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
      popupRef.current.setMaxWidth(popupOptions.maxWidth ?? 'none')
    }

    popupOptionsRef.current = popupOptions
  }, [popupOptions])

  const handleClose = () => popupRef.current?.remove()

  if (!mounted || !containerRef.current) return null

  return createPortal(
    <div className={cn('animate-in fade-in-0 zoom-in-95 relative', className)}>
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="ring-offset-background focus:ring-ring absolute top-1 right-1 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>,
    containerRef.current,
  )
}

export function MarkerTooltip({
  children,
  className,
  ...popupOptions
}: MarkerTooltipProps) {
  const { markerRef, markerElementRef, map, isReady } = useMarkerContext()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const popupRef = useRef<MapLibreGL.Popup | null>(null)
  const [mounted, setMounted] = useState(false)
  const popupOptionsRef = useRef(popupOptions)

  useEffect(() => {
    if (!isReady || !markerRef.current || !markerElementRef.current || !map)
      return

    const container = document.createElement('div')
    containerRef.current = container

    const popup = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeOnClick: true,
      closeButton: false,
    })
      .setMaxWidth('none')
      .setDOMContent(container)

    popupRef.current = popup

    const markerElement = markerElementRef.current
    const marker = markerRef.current

    const handleMouseEnter = () => {
      popup.setLngLat(marker.getLngLat()).addTo(map)
    }
    const handleMouseLeave = () => popup.remove()

    markerElement.addEventListener('mouseenter', handleMouseEnter)
    markerElement.addEventListener('mouseleave', handleMouseLeave)
    setMounted(true)

    return () => {
      markerElement.removeEventListener('mouseenter', handleMouseEnter)
      markerElement.removeEventListener('mouseleave', handleMouseLeave)
      popup.remove()
      popupRef.current = null
      containerRef.current = null
      setMounted(false)
    }
  }, [isReady, map])

  useEffect(() => {
    if (!popupRef.current) return
    const prev = popupOptionsRef.current

    if (prev.offset !== popupOptions.offset) {
      popupRef.current.setOffset(popupOptions.offset ?? 16)
    }
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
      popupRef.current.setMaxWidth(popupOptions.maxWidth ?? 'none')
    }

    popupOptionsRef.current = popupOptions
  }, [popupOptions])

  if (!mounted || !containerRef.current) return null

  return createPortal(
    <div
      className={cn(
        'animate-in fade-in-0 zoom-in-95 rounded-md px-2 py-1 text-xs shadow-md',
        className,
      )}
    >
      {children}
    </div>,
    containerRef.current,
  )
}
