import { describe, expect, it } from 'vitest'
import {
  filterDevices,
  initialDevices,
  parseDeviceImport,
} from './deviceMockService'

describe('device mock data', () => {
  it('has the expected summary and a selectable first device', () => {
    expect(initialDevices).toHaveLength(1248)
    expect(initialDevices[0].id).toBe('TN-PT-001')
    expect(
      initialDevices.filter((item) => item.status === 'active'),
    ).toHaveLength(1156)
  })

  it('filters search, type, status and area together', () => {
    const selected = initialDevices[0]
    expect(
      filterDevices(initialDevices, {
        search: selected.id,
        type: selected.type,
        status: selected.status,
        area: selected.area,
      }),
    ).toEqual([selected])
  })

  it('accepts exported records and rejects incomplete imports', () => {
    expect(parseDeviceImport(JSON.stringify([initialDevices[0]]))).toEqual([
      initialDevices[0],
    ])
    expect(() => parseDeviceImport('{"id":"x"}')).toThrow()
    expect(() => parseDeviceImport('[{"id":"x"}]')).toThrow()
  })

  it('fills in the default volume for older demo records', () => {
    const { volume: _volume, ...legacy } = initialDevices[0]
    expect(parseDeviceImport(JSON.stringify([legacy]))[0].volume).toBe(80)
  })

  it('rejects malformed firmware history in imported demo records', () => {
    expect(() =>
      parseDeviceImport(
        JSON.stringify([{ ...initialDevices[0], firmwareHistory: 'invalid' }]),
      ),
    ).toThrow()
  })
})
