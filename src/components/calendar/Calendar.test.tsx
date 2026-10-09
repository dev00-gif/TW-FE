// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Calendar } from './Calendar'

describe('Calendar', () => {
  it('marks today and renders supplied content without schedule-specific fields', () => {
    const date = new Date(2026, 9, 1)
    const { container, getByText } = render(
      <Calendar
        date={date}
        today={date}
        view="month"
        items={[{ key: 'event', startsAt: date, label: 'Reusable event' }]}
        getItemDate={(item) => item.startsAt}
        getItemKey={(item) => item.key}
        renderItem={(item) => <span>{item.label}</span>}
        moreLabel={(count) => `+${count}`}
      />,
    )
    expect(
      container
        .querySelector('[data-date="2026-10-01"]')
        ?.getAttribute('aria-current'),
    ).toBe('date')
    expect(getByText('Reusable event')).toBeTruthy()
  })
})
