// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClusteredGeoJsonSource } from './clustered-geojson'

const map = vi.hoisted(() => ({
  getSource: vi.fn(() => undefined),
  addSource: vi.fn(),
  addLayer: vi.fn(),
  getBounds: vi.fn(() => ({})),
  on: vi.fn(),
  off: vi.fn(),
  getCanvas: vi.fn(() => ({ style: { cursor: '' } })),
}))

vi.mock('./context', () => ({ useMap: () => ({ map, isLoaded: true }) }))

describe('ClusteredGeoJsonSource', () => {
  beforeEach(() => vi.clearAllMocks())

  it('groups nearby features and sums their device counts', () => {
    render(
      <ClusteredGeoJsonSource
        sourceId="devices"
        data={{ type: 'FeatureCollection', features: [] }}
        clusterValueProperty="count"
      />,
    )

    expect(map.addSource).toHaveBeenCalledWith(
      'devices',
      expect.objectContaining({
        type: 'geojson',
        cluster: true,
        clusterRadius: 48,
        clusterProperties: {
          total_count: ['+', ['coalesce', ['get', 'count'], 0]],
        },
      }),
    )
    expect(map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'devices-clusters' }),
    )
    expect(map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'devices-point-count' }),
    )
  })
})
