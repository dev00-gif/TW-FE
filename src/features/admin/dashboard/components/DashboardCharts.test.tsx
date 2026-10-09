// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { dashboardService } from '../services/dashboardService'
import { BroadcastChart, DeviceStatusChart } from './DashboardCharts'

describe('dashboard charts', () => {
  it('renders both charts with mock data', async () => {
    const overview = await dashboardService.overview()
    const status = render(<DeviceStatusChart statuses={overview.statuses} />)
    expect(status.container.querySelector('svg')).not.toBeNull()
    status.unmount()
    const broadcasts = render(
      <BroadcastChart broadcasts={overview.broadcasts} />,
    )
    expect(broadcasts.container.querySelector('svg')).not.toBeNull()
  })
})
