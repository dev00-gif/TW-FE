import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import i18n from '@/config/i18n'
import { LocationTree } from './LocationTree'

describe('LocationTree', () => {
  it('shows device counts for provinces and wards instead of the province code', async () => {
    await i18n.changeLanguage('vi')
    const view = render(
      <LocationTree
        provinces={[
          {
            id: 'province-1',
            code: '19',
            name: 'Tỉnh Thái Nguyên',
            divisionType: 'tỉnh',
            deviceCount: 12,
          },
        ]}
        wards={[
          {
            id: 'ward-1',
            code: '1840',
            provinceCode: '19',
            name: 'Phường Đức Xuân',
            divisionType: 'phường',
            deviceCount: 3,
          },
        ]}
        provinceCode="19"
        wardCode={null}
        search=""
        onSearch={vi.fn()}
        onProvinceSelect={vi.fn()}
        onWardSelect={vi.fn()}
        wardsLoading={false}
      />,
    )

    expect(view.getByTitle('Số thiết bị: 12').textContent).toBe('12')
    expect(view.getByTitle('Số thiết bị: 3').textContent).toBe('3')
    expect(view.queryByText('19')).toBeNull()
  })
})
