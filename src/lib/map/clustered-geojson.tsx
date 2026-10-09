import { useEffect } from 'react'
import * as MapLibreGL from 'maplibre-gl'
import { useMap } from './context'

export function ClusteredGeoJsonSource({
  sourceId,
  data,
  onBoundsChange,
  getPopupHtml,
  clusterValueProperty,
  onPointClick,
}: {
  sourceId: string
  data: GeoJSON.FeatureCollection
  onBoundsChange?: (bounds: MapLibreGL.LngLatBounds) => void
  getPopupHtml?: (feature: MapLibreGL.MapGeoJSONFeature) => string
  onPointClick?: (feature: MapLibreGL.MapGeoJSONFeature) => void
  /** Numeric feature property summed into each cluster and displayed on markers. */
  clusterValueProperty?: string
}) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return
    const sourceData = data
    const source = map.getSource(sourceId)
    if (source) {
      if (source.type === 'geojson') {
        const geoJsonSource = source as MapLibreGL.GeoJSONSource
        geoJsonSource.setData(sourceData)
      }
      return
    }
    map.addSource(sourceId, {
      type: 'geojson',
      data: sourceData,
      cluster: true,
      clusterMaxZoom: 16,
      clusterRadius: 48,
      ...(clusterValueProperty && {
        clusterProperties: {
          total_count: ['+', ['coalesce', ['get', clusterValueProperty], 0]],
        },
      }),
    })
    map.addLayer({
      id: `${sourceId}-clusters`,
      type: 'circle',
      source: sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', clusterValueProperty ? 'total_count' : 'point_count'],
          '#1d4ed8',
          50,
          '#f59e0b',
          200,
          '#dc2626',
        ],
        'circle-radius': [
          'step',
          ['get', clusterValueProperty ? 'total_count' : 'point_count'],
          18,
          50,
          25,
          200,
          32,
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.96,
      },
    })
    map.addLayer({
      id: `${sourceId}-cluster-count`,
      type: 'symbol',
      source: sourceId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': clusterValueProperty
          ? ['to-string', ['get', 'total_count']]
          : '{point_count_abbreviated}',
        'text-size': 12,
      },
      paint: { 'text-color': '#ffffff' },
    })
    map.addLayer({
      id: `${sourceId}-points`,
      type: 'circle',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'status'],
          'active',
          '#22c55e',
          'warning',
          '#f59e0b',
          'offline',
          '#ef4444',
          'maintenance',
          '#94a3b8',
          '#1e40af',
        ],
        'circle-radius': clusterValueProperty ? 17 : 8,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.98,
      },
    })
    if (clusterValueProperty) {
      map.addLayer({
        id: `${sourceId}-point-count`,
        type: 'symbol',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['to-string', ['get', clusterValueProperty]],
          'text-size': 11,
        },
        paint: { 'text-color': '#ffffff' },
      })
    }
  }, [clusterValueProperty, data, isLoaded, map, sourceId])

  useEffect(() => {
    if (!map || !isLoaded) return
    const clusterLayer = `${sourceId}-clusters`
    const pointLayer = `${sourceId}-points`
    const updateBounds = () => onBoundsChange?.(map.getBounds())
    const openCluster = async (event: MapLibreGL.MapLayerMouseEvent) => {
      const feature = event.features?.[0]
      if (!feature) return
      const source = map.getSource(sourceId)
      if (!source || source.type !== 'geojson') return
      const zoom = await (
        source as MapLibreGL.GeoJSONSource
      ).getClusterExpansionZoom(feature.properties.cluster_id)
      map.easeTo({
        center: (feature.geometry as GeoJSON.Point).coordinates as [
          number,
          number,
        ],
        zoom,
      })
    }
    const openPoint = (event: MapLibreGL.MapLayerMouseEvent) => {
      const feature = event.features?.[0]
      if (!feature) return
      onPointClick?.(feature)
      if (!getPopupHtml) return
      const popup = new MapLibreGL.Popup({
        closeButton: false,
        maxWidth: '360px',
        className: 'address-map-popup',
      })
        .setLngLat(
          (feature.geometry as GeoJSON.Point).coordinates as [number, number],
        )
        .setHTML(getPopupHtml(feature))
        .addTo(map)
      popup
        .getElement()
        .querySelector<HTMLButtonElement>('[data-copy-coordinates]')
        ?.addEventListener('click', (clickEvent) => {
          const value = (clickEvent.currentTarget as HTMLButtonElement).dataset
            .copyCoordinates
          if (value) void navigator.clipboard.writeText(value)
        })
    }
    map.on('moveend', updateBounds)
    map.on('click', clusterLayer, openCluster)
    map.on('click', pointLayer, openPoint)
    const showPointer = () => {
      map.getCanvas().style.cursor = 'pointer'
    }
    const clearPointer = () => {
      map.getCanvas().style.cursor = ''
    }
    map.on('mouseenter', clusterLayer, showPointer)
    map.on('mouseenter', pointLayer, showPointer)
    map.on('mouseleave', clusterLayer, clearPointer)
    map.on('mouseleave', pointLayer, clearPointer)
    updateBounds()
    return () => {
      map.off('moveend', updateBounds)
      map.off('click', clusterLayer, openCluster)
      map.off('click', pointLayer, openPoint)
      map.off('mouseenter', clusterLayer, showPointer)
      map.off('mouseenter', pointLayer, showPointer)
      map.off('mouseleave', clusterLayer, clearPointer)
      map.off('mouseleave', pointLayer, clearPointer)
    }
  }, [getPopupHtml, isLoaded, map, onBoundsChange, onPointClick, sourceId])

  return null
}
