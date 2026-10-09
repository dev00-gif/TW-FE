import { useEffect, useRef, useState } from 'react'
import * as MapLibreGL from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useTranslation } from 'react-i18next'
import { MapContext } from './context'
import type { MapProps } from './types'

export function Map({
  children,
  style,
  center,
  zoom = 13,
  ...props
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreGL.Map | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !containerRef.current) return

    // MapLibre v6 is ESM-only and uses a module worker. Explicitly providing
    // the URL lets Vite emit and serve the worker correctly in SSR builds.
    MapLibreGL.setWorkerUrl(maplibreWorkerUrl)

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...(style ? { style } : {}),
      ...(center ? { center } : {}),
      zoom,
      ...props,
    })
    const handleStyleLoading = () => setIsLoaded(false)
    const handleStyleReady = () => setIsLoaded(true)

    // MapLibre v6 can emit style loading events while setStyle() is replacing
    // the current style. Keep child sources/layers paused until the new style
    // is ready; otherwise addSource/addLayer may run against an unloaded style.
    map.on('styledataloading', handleStyleLoading)
    map.on('style.load', handleStyleReady)
    map.on('load', handleStyleReady)
    mapRef.current = map
    return () => {
      map.off('styledataloading', handleStyleLoading)
      map.off('style.load', handleStyleReady)
      map.off('load', handleStyleReady)
      map.remove()
      mapRef.current = null
      setIsLoaded(false)
    }
    // MapLibre must only be initialized once on the client.
  }, [isMounted])

  return (
    <MapContext.Provider value={{ map: mapRef.current, isLoaded }}>
      <div ref={containerRef} className="relative h-full min-h-64 w-full">
        {!isLoaded && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-900">
            {t('common.loading')}
          </div>
        )}
        {isMounted && children}
      </div>
    </MapContext.Provider>
  )
}
