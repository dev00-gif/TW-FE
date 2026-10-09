// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import i18n from '@/config/i18n'
import { ScheduleFilters } from './ScheduleFilters'
import type { ScheduleFilters as Filters } from '../types'

vi.mock('@/features/territory/useTerritory', () => ({
  useTerritory: () => ({ access: { hasFullAccess: true, scopes: [] } }),
}))

const filters: Filters = {
  from: '2026-10-01',
  to: '2026-10-31',
  search: '',
  category: 'all',
  channel: 'all',
  status: 'all',
  area: 'all',
}

describe('ScheduleFilters', () => {
  it('applies the shared date range picker to schedule filters', async () => {
    await i18n.changeLanguage('vi')
    const onChange = vi.fn()
    const view = render(<ScheduleFilters value={filters} onChange={onChange} />)
    fireEvent.click(
      view.getByRole('button', { name: '01/10/2026 - 31/10/2026' }),
    )
    fireEvent.change(view.getByLabelText('Ngày bắt đầu'), {
      target: { value: '2026-10-10' },
    })
    fireEvent.change(view.getByLabelText('Ngày kết thúc'), {
      target: { value: '2026-10-20' },
    })
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(view.getByRole('button', { name: 'Áp dụng' }))
    expect(onChange).toHaveBeenCalledWith({
      ...filters,
      from: '2026-10-10',
      to: '2026-10-20',
    })
  })
})
