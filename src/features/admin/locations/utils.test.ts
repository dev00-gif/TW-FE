import { describe, expect, it } from 'vitest'
import { filterLocations } from './utils'
import type { Ward } from './types'

const rows: Ward[] = [
  {
    id: '1',
    code: '1840',
    provinceCode: '19',
    name: 'Phường Đức Xuân',
    divisionType: 'phường',
    deviceCount: 2,
  },
  {
    id: '2',
    code: '1843',
    provinceCode: '19',
    name: 'Phường Bắc Kạn',
    divisionType: 'phường',
    deviceCount: 0,
  },
]

describe('filterLocations', () => {
  it('searches Vietnamese names without requiring accents', () => {
    expect(filterLocations(rows, 'duc xuan')).toEqual([rows[0]])
  })

  it('searches codes and keeps all items for an empty keyword', () => {
    expect(filterLocations(rows, '1843')).toEqual([rows[1]])
    expect(filterLocations(rows, '')).toEqual(rows)
  })
})
