import type { Province, Ward } from './types'

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replaceAll('đ', 'd')
    .replaceAll('Đ', 'D')
    .toLowerCase()
    .trim()
}

export function filterLocations<T extends Province | Ward>(
  items: T[],
  search: string,
): T[] {
  const keyword = normalizeSearch(search)
  return keyword
    ? items.filter((item) =>
        normalizeSearch(`${item.name} ${item.code}`).includes(keyword),
      )
    : items
}

export function exportLocationsCsv(items: Array<Province | Ward>) {
  const escape = (value: string | number) =>
    `"${String(value).replaceAll('"', '""')}"`
  const rows = [
    ['code', 'name', 'division_type', 'device_count', 'province_code'],
    ...items.map((item) => [
      item.code,
      item.name.trim(),
      item.divisionType,
      item.deviceCount,
      'provinceCode' in item ? item.provinceCode : '',
    ]),
  ]
  const csv = `\uFEFF${rows.map((row) => row.map(escape).join(',')).join('\r\n')}`
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'dia-ban.csv'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
