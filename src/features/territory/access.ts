export type TerritoryScope = {
  scopeType: 'PROVINCE' | 'WARD'
  scopeId: string
  code: string
  name: string
  provinceCode: string
}
export type TerritoryAccess = {
  hasFullAccess: boolean
  scopes: TerritoryScope[]
}
export type TerritoryReference = { provinceCode?: string; wardCode?: string }
export const noTerritoryAccess: TerritoryAccess = {
  hasFullAccess: false,
  scopes: [],
}

export function canAccessTerritory(
  access: TerritoryAccess,
  item: TerritoryReference,
) {
  if (access.hasFullAccess) return true
  if (!item.provinceCode) return false
  return access.scopes.some((scope) =>
    scope.scopeType === 'PROVINCE'
      ? scope.code === item.provinceCode
      : scope.provinceCode === item.provinceCode &&
        scope.code === item.wardCode,
  )
}

export function assertTerritory(
  access: TerritoryAccess,
  item: TerritoryReference,
) {
  if (!canAccessTerritory(access, item))
    throw new Error('Bạn không có quyền thao tác tại địa bàn này')
}
