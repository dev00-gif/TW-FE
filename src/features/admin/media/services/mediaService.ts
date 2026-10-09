import { api } from '@/lib/apiClient'
import type { MediaRecord, MediaSettings, MediaStorageMode } from '../types'

export type MediaListInput = {
  uploadedById?: string
  search?: string
  folder?: string
  type?: 'file' | 'folder'
  page?: number
  limit?: number
}
export type CreateMediaInput = Omit<
  MediaRecord,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'width' | 'height' | 'altText'
> & { data?: string; width?: number; height?: number; altText?: string }
export type CreateMediaFolderInput = {
  name: string
  parentPath?: string
  storageMode: MediaStorageMode
}
export type UpdateMediaInput = {
  name?: string
  folder?: string
  altText?: string
}
export type UpdateMediaSettingsInput = MediaSettings
export type MediaListResult = {
  items: MediaRecord[]
  folders: Array<{
    id: string
    name: string
    path: string
    storageMode: MediaStorageMode
    parentId: string | null
    count: number
    createdAt: string
  }>
  uploaders: Array<{ id: string; displayName: string }>
  storage: { usedBytes: number; totalBytes: number | null }
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPrevious: boolean
    hasNext: boolean
  }
}

export const mediaService = {
  list: (input: MediaListInput) => api.get<MediaListResult>('/media', input),
  create: (input: CreateMediaInput) => api.post<MediaRecord>('/media', input),
  upload: async (file: File): Promise<MediaRecord> => {
    const settings = await mediaService.getSettings()
    if (file.size > settings.maxUploadSizeMb * 1024 * 1024) {
      throw new Error(`File không được vượt quá ${settings.maxUploadSizeMb} MB`)
    }
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    return mediaService.create({
      name: file.name,
      originalName: file.name,
      path: `/${file.name}`,
      url: `/images/${encodeURIComponent(file.name)}`,
      storageMode: settings.storageMode,
      mimeType:
        file.type ||
        (/\.mp3$/i.test(file.name) ? 'audio/mpeg' : 'application/octet-stream'),
      extension: file.name.split('.').pop() ?? '',
      size: file.size,
      folder: '/',
      data,
    })
  },
  createFolder: (input: CreateMediaFolderInput) =>
    api.post('/media/folders', input),
  update: ({ id, ...input }: UpdateMediaInput & { id: string }) =>
    api.patch<MediaRecord>(`/media/${id}`, input),
  delete: ({ id }: { id: string }) => api.delete(`/media/${id}`),
  getSettings: () => api.get<MediaSettings>('/media/settings'),
  updateSettings: (input: UpdateMediaSettingsInput) =>
    api.put<MediaSettings>('/media/settings', input),
}
