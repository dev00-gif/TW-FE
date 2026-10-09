// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ScheduleCalendar } from './ScheduleCalendar'
import type { ScheduleItem } from '../types'

const item: ScheduleItem = {
  id: 'example',
  title: 'Bản tin sáng',
  content: 'Bản tin sáng',
  category: 'normal',
  channel: 'radio',
  area: 'Toàn tỉnh',
  scheduledAt: '2025-01-01T08:00:00',
  status: 'pending',
  deviceCount: 12,
}

describe('ScheduleCalendar', () => {
  it('renders schedule and opens it when selected', () => {
    const onSelect = vi.fn()
    const { getByTitle } = render(
      <ScheduleCalendar
        date={new Date(2025, 0, 1)}
        mode="month"
        items={[item]}
        onSelect={onSelect}
      />,
    )
    fireEvent.click(getByTitle('08:00 Bản tin sáng'))
    expect(onSelect).toHaveBeenCalledWith(item)
  })
})
