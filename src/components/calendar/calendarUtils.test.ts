import { describe, expect, it } from 'vitest'
import { calendarDays, groupCalendarItems } from './calendarUtils'

describe('shared calendar utilities', () => {
  it('builds Monday-first month, week and day grids', () => {
    const date = new Date(2025, 0, 1)
    const month = calendarDays(date, 'month')
    expect(month).toHaveLength(35)
    expect(month[0].getDate()).toBe(30)
    expect(month.at(-1)?.getDate()).toBe(2)
    expect(calendarDays(date, 'week')).toHaveLength(7)
    expect(calendarDays(date, 'day')).toEqual([date])
  })

  it('groups and sorts arbitrary items by date', () => {
    const items = [
      { id: '2', date: new Date(2025, 0, 10, 14) },
      { id: '1', date: new Date(2025, 0, 10, 8) },
      { id: '3', date: new Date(2025, 0, 11, 8) },
    ]
    const grouped = groupCalendarItems(items, (item) => item.date)
    expect(grouped.get('2025-01-10')?.map((item) => item.id)).toEqual([
      '1',
      '2',
    ])
  })
})
