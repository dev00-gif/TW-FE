import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { apiBaseUrl } from '@/lib/apiClient'
import { MediaPreview } from './MediaPreview'

describe('MediaPreview', () => {
  it('keeps the encoded image path readable by the API server', () => {
    const path = '/images/đâsdsad.jpg'
    const markup = renderToStaticMarkup(
      <MediaPreview
        item={{
          id: 'media-1',
          name: 'đâsdsad.jpg',
          type: 'file',
          path,
          url: path,
          date: new Date('2026-09-21'),
        }}
      />,
    )

    expect(markup).toContain(new URL(path, apiBaseUrl).href)
    expect(markup).not.toContain('%25C4')
  })
})
