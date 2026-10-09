import { describe, expect, it } from 'vitest'
import { aggregateReportDays, reportDayTotal } from './utils'
import type { ReportDay } from './types'

const days: ReportDay[] = [
  {
    date: '2026-10-01',
    normal: 2,
    emergency: 1,
    warning: 0,
    other: 1,
    success: 3,
    failed: 1,
    durationMinutes: 60,
  },
  {
    date: '2026-10-02',
    normal: 3,
    emergency: 0,
    warning: 1,
    other: 0,
    success: 4,
    failed: 0,
    durationMinutes: 70,
  },
]

describe('report aggregation', () => {
  it('adds categories and outcomes consistently', () => {
    expect(reportDayTotal(days[0])).toBe(4)
    expect(aggregateReportDays(days, 'month')).toEqual([
      {
        date: '2026-10-01',
        normal: 5,
        emergency: 1,
        warning: 1,
        other: 1,
        success: 7,
        failed: 1,
        durationMinutes: 130,
      },
    ])
  })
})
