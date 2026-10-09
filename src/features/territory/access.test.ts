import { describe, expect, it } from 'vitest'
import { canAccessTerritory } from './access'
import type { TerritoryAccess } from './access'

const wardAccess: TerritoryAccess = {
  hasFullAccess: false,
  scopes: [
    {
      scopeType: 'WARD',
      scopeId: 'ward',
      code: '5443',
      name: 'Phường Phan Đình Phùng',
      provinceCode: '19',
    },
  ],
}
describe('territory access rules', () => {
  it('does not grant access when a user has no scopes or a record has no location', () => {
    expect(
      canAccessTerritory(
        { hasFullAccess: false, scopes: [] },
        { provinceCode: '19', wardCode: '5443' },
      ),
    ).toBe(false)
    expect(canAccessTerritory(wardAccess, {})).toBe(false)
  })
  it('requires matching province and ward codes, not the label', () => {
    expect(
      canAccessTerritory(wardAccess, { provinceCode: '19', wardCode: '5443' }),
    ).toBe(true)
    expect(
      canAccessTerritory(wardAccess, { provinceCode: '01', wardCode: '5443' }),
    ).toBe(false)
    expect(
      canAccessTerritory(wardAccess, { provinceCode: '19', wardCode: '5830' }),
    ).toBe(false)
    expect(canAccessTerritory(wardAccess, { provinceCode: '19' })).toBe(false)
  })
  it('allows a whole province including its wards but not another province', () => {
    const access: TerritoryAccess = {
      hasFullAccess: false,
      scopes: [{ ...wardAccess.scopes[0], scopeType: 'PROVINCE', code: '19' }],
    }
    expect(
      canAccessTerritory(access, { provinceCode: '19', wardCode: '5830' }),
    ).toBe(true)
    expect(canAccessTerritory(access, { provinceCode: '19' })).toBe(true)
    expect(canAccessTerritory(access, { provinceCode: '01' })).toBe(false)
  })
})
