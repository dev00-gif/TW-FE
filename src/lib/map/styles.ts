import type * as MapLibreGL from 'maplibre-gl'

const MAPTILE_BASE_URL =
  import.meta.env.VITE_MAPTILE_BASE_URL ?? 'https://maptile.ozoship.com'

export const LIGHT_MAP_STYLE = `${MAPTILE_BASE_URL}/styles/light/style.json`
export const DARK_MAP_STYLE = `${MAPTILE_BASE_URL}/styles/dark/style.json`
export const SATELLITE_MAP_STYLE: MapLibreGL.StyleSpecification = {
  version: 8,
  sources: {
    'google-hybrid': {
      type: 'raster',
      tiles: [
        'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      ],
      tileSize: 256,
      attribution: '© Google Hybrid',
    },
  },
  layers: [{ id: 'google-hybrid', type: 'raster', source: 'google-hybrid' }],
}

export type MapTileStyle = 'light' | 'dark' | 'satellite'

export const MAP_TILE_STYLES: Record<
  MapTileStyle,
  string | MapLibreGL.StyleSpecification
> = {
  light: LIGHT_MAP_STYLE,
  dark: DARK_MAP_STYLE,
  satellite: SATELLITE_MAP_STYLE,
}
