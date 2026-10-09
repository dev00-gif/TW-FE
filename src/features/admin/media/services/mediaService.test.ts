import { afterEach, describe, expect, it, vi } from 'vitest'
import { mediaService } from './mediaService'
import type { MediaRecord } from '../types'

describe('media file uploads', () => {
  afterEach(() => vi.restoreAllMocks())

  it('uses the configured storage and sends file bytes with the existing create contract', async () => {
    vi.spyOn(mediaService, 'getSettings').mockResolvedValue({
      storageMode: 'S3',
      endpoint: '',
      bucket: '',
      region: '',
      accessKeyId: '',
      secretAccessKey: '',
      forcePathStyle: false,
      maxUploadSizeMb: 50,
    })
    const created = {
      id: 'media-1',
      url: 'https://example.com/news.mp3',
    } as MediaRecord
    const create = vi.spyOn(mediaService, 'create').mockResolvedValue(created)
    const file = new File(['audio'], 'ban tin.mp3', { type: 'audio/mpeg' })
    expect(await mediaService.upload(file)).toBe(created)
    expect(create).toHaveBeenCalledWith({
      name: file.name,
      originalName: file.name,
      path: '/ban tin.mp3',
      url: '/images/ban%20tin.mp3',
      storageMode: 'S3',
      mimeType: 'audio/mpeg',
      extension: 'mp3',
      size: 5,
      folder: '/',
      data: 'YXVkaW8=',
    })
  })

  it('does not create media when reading storage settings fails', async () => {
    const error = new Error('Unavailable')
    vi.spyOn(mediaService, 'getSettings').mockRejectedValue(error)
    const create = vi.spyOn(mediaService, 'create')
    await expect(
      mediaService.upload(new File(['audio'], 'news.mp3')),
    ).rejects.toBe(error)
    expect(create).not.toHaveBeenCalled()
  })
})

describe('MP3 upload validation', () => {
  afterEach(() => vi.restoreAllMocks())
  const settings = {
    storageMode: 'SOURCE' as const,
    endpoint: '',
    bucket: '',
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
    forcePathStyle: false,
    maxUploadSizeMb: 1,
  }

  it('rejects files exceeding storage limits before reading or creating media', async () => {
    vi.spyOn(mediaService, 'getSettings').mockResolvedValue(settings)
    const create = vi.spyOn(mediaService, 'create')
    const reader = vi.spyOn(FileReader.prototype, 'readAsDataURL')
    await expect(
      mediaService.upload(
        new File([new Uint8Array(1024 * 1024 + 1)], 'news.mp3'),
      ),
    ).rejects.toThrow('File không được vượt quá 1 MB')
    expect(reader).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it('uses audio/mpeg when an MP3 file has no browser MIME type', async () => {
    vi.spyOn(mediaService, 'getSettings').mockResolvedValue(settings)
    const create = vi
      .spyOn(mediaService, 'create')
      .mockResolvedValue({ url: '/images/news.MP3' } as MediaRecord)
    await mediaService.upload(new File(['audio'], 'news.MP3'))
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ mimeType: 'audio/mpeg', data: 'YXVkaW8=' }),
    )
  })
})
