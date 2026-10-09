import { describe, expect, it } from 'vitest'
import { isHttpUrl, parseScheduleImport, scheduleMonthRange } from './utils'
import type { ScheduleInput } from './types'

describe('schedule import', () => {
  it('uses the selected current month for the initial filter', () => {
    expect(scheduleMonthRange(new Date(2026, 9, 1))).toEqual({
      from: '2026-10-01',
      to: '2026-10-31',
    })
  })

  it('rejects malformed imports', () => {
    expect(parseScheduleImport('{').success).toBe(false)
    expect(parseScheduleImport('[{"title":"only a title"}]').success).toBe(
      false,
    )
  })

  it('round-trips URL and uploaded-file attachments with their territory references', () => {
    const input: ScheduleInput = {
      title: 'Bản tin sáng',
      content: 'Nội dung',
      category: 'normal',
      channel: 'radio',
      area: 'Phường Phan Đình Phùng',
      provinceCode: '19',
      wardCode: '5443',
      scheduledAt: '2026-10-07T08:00:00',
      status: 'pending',
      deviceCount: 12,
    }
    const inputs: ScheduleInput[] = [
      {
        ...input,
        attachment: { type: 'url', url: 'https://example.com/news.mp3' },
      },
      {
        ...input,
        attachment: {
          type: 'upload',
          mediaId: 'media-1',
          name: 'news.mp3',
          url: '/uploads/news.mp3',
          mimeType: 'audio/mpeg',
          size: 5,
        },
      },
    ]
    const result = parseScheduleImport(JSON.stringify(inputs))
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toEqual(inputs)
    expect(
      parseScheduleImport(
        JSON.stringify([
          { ...input, attachment: { type: 'url', url: 'javascript:alert(1)' } },
        ]),
      ).success,
    ).toBe(false)
  })

  it('only accepts absolute HTTP or HTTPS URLs', () => {
    expect(isHttpUrl('https://example.com/news.mp3')).toBe(true)
    expect(isHttpUrl('http://example.com/news.mp3')).toBe(true)
    expect(isHttpUrl('example.com/news.mp3')).toBe(false)
    expect(isHttpUrl('data:audio/mpeg;base64,YXVkaW8=')).toBe(false)
  })
})
