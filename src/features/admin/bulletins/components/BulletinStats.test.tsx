// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import i18n from '@/config/i18n'
import { BulletinStats } from './BulletinStats'

describe('BulletinStats', () => {
  it('changes the status filter from a summary card', async () => {
    await i18n.changeLanguage('vi')
    const onChange = vi.fn()
    const view = render(
      <BulletinStats
        counts={{
          all: 10,
          draft: 2,
          pending: 2,
          approved: 3,
          published: 2,
          rejected: 1,
        }}
        value="all"
        onChange={onChange}
      />,
    )
    fireEvent.click(view.getByRole('button', { name: /Chờ duyệt/ }))
    expect(onChange).toHaveBeenCalledWith('pending')
  })
})
