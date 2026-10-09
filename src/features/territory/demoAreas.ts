import { canAccessTerritory } from './access'
import type { TerritoryAccess } from './access'

// Reference codes from the same province/ward dataset seeded by the backend.
export const demoAreas = [
  {
    name: 'Phường Phan Đình Phùng',
    provinceCode: '19',
    wardCode: '5443',
    longitude: 105.84,
    latitude: 21.59,
  },
  {
    name: 'Xã Đại Từ',
    provinceCode: '19',
    wardCode: '5830',
    longitude: 105.65,
    latitude: 21.64,
  },
  {
    name: 'Xã Định Hóa',
    provinceCode: '19',
    wardCode: '5569',
    longitude: 105.61,
    latitude: 21.89,
  },
  {
    name: 'Xã Phú Lương',
    provinceCode: '19',
    wardCode: '5611',
    longitude: 105.74,
    latitude: 21.72,
  },
  {
    name: 'Xã Võ Nhai',
    provinceCode: '19',
    wardCode: '5716',
    longitude: 106.02,
    latitude: 21.76,
  },
  {
    name: 'Xã Đồng Hỷ',
    provinceCode: '19',
    wardCode: '5692',
    longitude: 105.98,
    latitude: 21.65,
  },
  {
    name: 'Phường Sông Công',
    provinceCode: '19',
    wardCode: '5518',
    longitude: 105.82,
    latitude: 21.49,
  },
  {
    name: 'Xã Phú Bình',
    provinceCode: '19',
    wardCode: '5908',
    longitude: 105.96,
    latitude: 21.49,
  },
]
export const provinceArea = {
  name: 'Toàn tỉnh Thái Nguyên',
  provinceCode: '19',
  wardCode: undefined,
}
export const areaReference = (name: string) =>
  name === provinceArea.name
    ? provinceArea
    : demoAreas.find((area) => area.name === name)
export const allowedDemoAreas = (
  access: TerritoryAccess,
  includeProvince = false,
): { name: string; provinceCode: string; wardCode?: string }[] => {
  const assigned = access.scopes.map((scope) => ({
    name: scope.scopeType === 'WARD' ? scope.name : `Toàn tỉnh ${scope.name}`,
    provinceCode: scope.provinceCode,
    wardCode: scope.scopeType === 'WARD' ? scope.code : undefined,
  }))
  const options = [
    ...demoAreas,
    ...(includeProvince ? [provinceArea] : []),
    ...assigned.filter((area) => includeProvince || area.wardCode),
  ]
  return [
    ...new Map(
      options
        .filter((area) => canAccessTerritory(access, area))
        .map((area) => [`${area.provinceCode}:${area.wardCode ?? ''}`, area]),
    ).values(),
  ]
}
