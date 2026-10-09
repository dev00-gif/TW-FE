import { describe, expect, it } from 'vitest'
import { reportService } from './reportService'
import { reportDayTotal } from '../utils'

describe('report mock service', () => {
  it('keeps all report totals aligned', async () => {
    const report = await reportService.overview({
      from: '2026-10-01',
      to: '2026-10-31',
      area: 'all',
    })
    expect(report.days).toHaveLength(31)
    expect(report.days.reduce((sum, day) => sum + reportDayTotal(day), 0)).toBe(
      report.metrics.total,
    )
    expect(report.metrics.success + report.metrics.failed).toBe(
      report.metrics.total,
    )
    expect(
      report.durationByType.reduce((sum, item) => sum + item.minutes, 0),
    ).toBe(report.metrics.durationMinutes)
  })

  it('filters by area and time', async () => {
    const all = await reportService.overview({
      from: '2026-10-01',
      to: '2026-10-07',
      area: 'all',
    })
    const local = await reportService.overview({
      from: '2026-10-01',
      to: '2026-10-07',
      area: 'dai-tu',
    })
    expect(local.days).toHaveLength(7)
    expect(local.areas).toHaveLength(1)
    expect(local.metrics.total).toBeLessThan(all.metrics.total)
  })
})
