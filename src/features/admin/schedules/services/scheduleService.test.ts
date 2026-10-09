import { describe, expect, it } from 'vitest'
import { endOfMonth, format } from 'date-fns'
import { scheduleService } from './scheduleService'
import type { ScheduleFilters } from '../types'

const now = new Date()
const month = format(now, 'yyyy-MM')
const filters: ScheduleFilters = {
  from: `${month}-01`,
  to: format(endOfMonth(now), 'yyyy-MM-dd'),
  search: '',
  category: 'all',
  channel: 'all',
  status: 'all',
  area: 'all',
}

describe('scheduleService mock', () => {
  it('filters by date, category, channel, status and search', async () => {
    const result = await scheduleService.list({
      ...filters,
      from: `${month}-10`,
      to: `${month}-10`,
      category: 'warning',
      channel: 'radio',
      status: 'pending',
      search: 'mưa',
    })
    expect(result.map((item) => item.id)).toEqual(['2'])
  })

  it('creates, updates and cancels a mock schedule', async () => {
    const created = await scheduleService.create({
      title: 'Test schedule',
      content: 'Test content',
      category: 'normal',
      channel: 'radio',
      area: 'Toàn tỉnh',
      scheduledAt: '2099-02-02T08:00:00',
      status: 'pending',
      deviceCount: 10,
    })
    expect(
      (
        await scheduleService.list({
          ...filters,
          from: '2099-02-01',
          to: '2099-02-28',
        })
      ).some((item) => item.id === created.id),
    ).toBe(true)
    await scheduleService.update({
      id: created.id,
      input: { ...created, title: 'Updated schedule' },
    })
    await scheduleService.cancel(created.id)
    const result = await scheduleService.list({
      ...filters,
      from: '2099-02-01',
      to: '2099-02-28',
    })
    expect(result.find((item) => item.id === created.id)).toMatchObject({
      title: 'Updated schedule',
      status: 'cancelled',
    })
  })
})
