// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import {
  bulletinService,
  initialBulletins,
  parseBulletinImport,
} from './bulletinService'
import type { BulletinFilters } from '../types'

const filters: BulletinFilters = {
  search: '',
  type: 'all',
  channel: 'all',
  priority: 'all',
  area: 'all',
  status: 'all',
  author: '',
  from: '',
  to: '',
  page: 1,
  limit: 10,
}

describe('bulletin mock service', () => {
  beforeEach(() => sessionStorage.clear())

  it('returns consistent totals and paginates 128 mock bulletins', () => {
    const result = bulletinService.list(filters)
    expect(result.items).toHaveLength(10)
    expect(result.meta.total).toBe(128)
    expect(result.meta.totalPages).toBe(13)
    expect(
      result.counts.draft +
        result.counts.pending +
        result.counts.approved +
        result.counts.published +
        result.counts.rejected,
    ).toBe(result.counts.all)
  })

  it('finds a bulletin by id and returns null for an unknown id', () => {
    expect(bulletinService.detail(initialBulletins[0].id)?.title).toBe(
      initialBulletins[0].title,
    )
    expect(bulletinService.detail('missing')).toBeNull()
  })

  it('filters by title, channel, status, area and date', () => {
    const item = initialBulletins[0]
    const result = bulletinService.list({
      ...filters,
      search: item.id,
      channel: item.channels[0],
      status: item.status,
      area: item.area,
      from: item.createdAt.slice(0, 10),
      to: item.createdAt.slice(0, 10),
    })
    expect(result.filtered.map((entry) => entry.id)).toEqual([item.id])
  })

  it('saves, publishes and imports mock records', async () => {
    const original = initialBulletins[0]
    const saved = await bulletinService.save({
      id: original.id,
      draft: {
        title: 'Bản tin đã sửa',
        content: original.content,
        type: original.type,
        channels: original.channels,
        area: original.area,
        priority: original.priority,
        status: original.status,
        image: original.image,
      },
    })
    expect(bulletinService.list(filters).items[0].title).toBe(saved.title)
    expect(bulletinService.detail(saved.id)?.summary).toBe(original.summary)
    await bulletinService.setStatus({ id: saved.id, status: 'published' })
    expect(bulletinService.list(filters).items[0].status).toBe('published')
    expect(await bulletinService.importMany([original])).toBe(1)
    expect(bulletinService.list(filters).items[0].title).toBe(original.title)
  })

  it('rejects malformed imports', () => {
    expect(() => parseBulletinImport('[{"id":"x"}]')).toThrow()
    expect(() => parseBulletinImport('{"id":"x"}')).toThrow()
    expect(() =>
      parseBulletinImport(
        JSON.stringify([
          { ...initialBulletins[0], attachments: [{ id: 'bad' }] },
        ]),
      ),
    ).toThrow()
  })

  it('persists form metadata and media across creation and edits', async () => {
    const draft = {
      title: 'Bản tin mới',
      summary: 'Tóm tắt',
      content: '<p>Nội dung <strong>đậm</strong></p>',
      type: 'news' as const,
      channels: ['radio' as const],
      area: 'Toàn tỉnh',
      priority: 'low' as const,
      status: 'draft' as const,
      image: '/images/cover.jpg',
      topics: ['Y tế'],
      categoryIds: ['bulletin-category-1'],
      source: 'UBND tỉnh Thái Nguyên',
      language: 'Tiếng Việt',
      effectiveFrom: '2026-10-02T08:00',
      effectiveTo: '2026-10-09T08:00',
      attachments: [
        {
          id: 'media-1',
          name: 'audio.mp3',
          url: '/images/audio.mp3',
          mimeType: 'audio/mpeg',
          size: 1024,
        },
      ],
      author: 'Người tạo mẫu',
    }
    const created = await bulletinService.save({ draft })
    expect(bulletinService.detail(created.id)).toMatchObject(draft)
    await bulletinService.save({
      id: created.id,
      draft: { ...draft, title: 'Bản tin đã sửa' },
    })
    expect(bulletinService.detail(created.id)).toMatchObject({
      title: 'Bản tin đã sửa',
      attachments: draft.attachments,
      categoryIds: draft.categoryIds,
    })
  })
})
