export type Province = {
  id: string
  code: string
  name: string
  divisionType: string
  deviceCount: number
}

export type Ward = {
  id: string
  code: string
  provinceCode: string
  name: string
  divisionType: string
  deviceCount: number
}

export type LocationSummary = {
  provinceCount: number
  wardCount: number
  deviceCount: number
}
