import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MediaPicker } from '@/features/admin/media/components/MediaPicker'
import { createMediaLabels } from '@/features/admin/media/components/media-labels'
import { mediaRecordsToItems } from '@/features/admin/media/components/media-utils'
import type {
  MediaItem,
  MediaRecordLike,
} from '@/features/admin/media/components/types'
import {
  useCreateMedia,
  useCreateMediaFolder,
  useDeleteMedia,
  useMediaList,
  useMediaSettings,
  useUpdateMedia,
} from '@/features/admin/media/hooks/useMediaSettings'
import { usePermission } from '@/features/auth/hooks/usePermission'

export type BulletinMediaTarget =
  | 'cover'
  | 'audio'
  | 'images'
  | 'video'
  | 'documents'

function matchesTarget(item: MediaItem, target: BulletinMediaTarget): boolean {
  if (item.type === 'folder') return true
  const mime = item.mimeType ?? ''
  if (target === 'cover' || target === 'images')
    return mime.startsWith('image/')
  if (target === 'audio') return mime.startsWith('audio/')
  if (target === 'video') return mime.startsWith('video/')
  return (
    mime === 'application/pdf' ||
    mime.startsWith('text/') ||
    mime.includes('document')
  )
}

function filterItems(
  items: MediaItem[],
  target: BulletinMediaTarget,
): MediaItem[] {
  return items
    .filter((item) => matchesTarget(item, target))
    .map((item) =>
      item.type === 'folder'
        ? { ...item, children: filterItems(item.children ?? [], target) }
        : item,
    )
}

export function BulletinMediaPicker({
  target,
  onClose,
  onSelect,
}: {
  target: BulletinMediaTarget | null
  onClose: () => void
  onSelect: (item: MediaRecordLike) => void
}) {
  const { t } = useTranslation('adminBulletins')
  const { t: tMedia } = useTranslation('media')
  const canView = usePermission('media.library.view')
  const canCreate = usePermission('media.library.create')
  const canUpdate = usePermission('media.library.update')
  const canDelete = usePermission('media.library.delete')
  const query = useMediaList({}, Boolean(target) && canView)
  const settings = useMediaSettings(Boolean(target) && canView)
  const create = useCreateMedia()
  const createFolder = useCreateMediaFolder()
  const update = useUpdateMedia()
  const remove = useDeleteMedia()
  const labels = useMemo(() => createMediaLabels(tMedia), [tMedia])
  const items = useMemo(
    () =>
      mediaRecordsToItems(
        query.data?.pages.flatMap((page) => page.items) ?? [],
        query.data?.pages.flatMap((page) => page.folders) ?? [],
      ),
    [query.data?.pages],
  )

  if (!target || !canView) return null

  return (
    <MediaPicker
      open
      imageOnly={target === 'cover' || target === 'images'}
      videoOnly={target === 'video'}
      items={filterItems(items, target)}
      labels={labels}
      title={
        target === 'cover' ? t('representativeImage') : t(`media.${target}`)
      }
      closeLabel={t('close')}
      hasMore={query.hasNextPage}
      isLoadingMore={query.isFetchingNextPage}
      onLoadMore={() => void query.fetchNextPage()}
      onCreateMedia={
        canCreate
          ? (item) =>
              create.mutateAsync({
                name: item.name,
                originalName: item.name,
                path: item.path,
                url: item.url ?? `/images/${item.name}`,
                storageMode: settings.data?.storageMode ?? 'SOURCE',
                mimeType: item.mimeType ?? 'application/octet-stream',
                extension: item.name.split('.').pop() ?? '',
                size: item.size ?? 0,
                folder: item.path.split('/').slice(0, -1).join('/') || '/',
                data: item.data,
              })
          : undefined
      }
      onCreateFolder={
        canCreate
          ? (folder) =>
              createFolder
                .mutateAsync({
                  name: folder.name,
                  parentPath: folder.parentPath,
                  storageMode: settings.data?.storageMode ?? 'SOURCE',
                })
                .then(() => undefined)
          : undefined
      }
      onRenameMedia={
        canUpdate
          ? (item, name) => update.mutateAsync({ id: item.id, name })
          : undefined
      }
      onDeleteMedia={
        canDelete
          ? (item) => remove.mutateAsync({ id: item.id }).then(() => undefined)
          : undefined
      }
      onClose={onClose}
      onSelect={onSelect}
    />
  )
}
