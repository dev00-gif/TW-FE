// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import i18n from '@/config/i18n'
import { DeviceVolumeControl } from './DeviceVolumeControl'

describe('DeviceVolumeControl', () => {
  it('shows the current volume and reports changes', async () => {
    await i18n.changeLanguage('vi')
    const onChange = vi.fn()
    const view = render(<DeviceVolumeControl value={68} onChange={onChange} />)

    expect(view.getByText('68%')).toBeTruthy()
    fireEvent.change(
      view.getByRole('slider', { name: 'Âm lượng phát thanh' }),
      {
        target: { value: '75' },
      },
    )
    expect(onChange).toHaveBeenCalledWith(75)
  })
})
