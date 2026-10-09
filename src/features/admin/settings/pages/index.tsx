import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe2, Image as ImageIcon, ImagePlus, Trash2 } from 'lucide-react'
import { Panel } from '@/components/common/Panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MediaPicker } from '@/features/admin/media/components/MediaPicker'
import { createMediaLabels } from '@/features/admin/media/components/media-labels'
import { mediaRecordsToItems } from '@/features/admin/media/components/media-utils'
import { MediaSettingsTab } from '@/features/admin/media/components/MediaSettingsTab'
import {
  useCreateMedia,
  useCreateMediaFolder,
  useDeleteMedia,
  useMediaList,
  useMediaSettings,
  useUpdateMedia,
} from '@/features/admin/media/hooks/useMediaSettings'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { resolveMediaUrl } from '@/features/admin/media/utils/mediaUrl'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/utils'
import {
  useUpdateWebsiteSettings,
  useWebsiteSettings,
} from '../hooks/useWebsiteSettings'
import type { WebsiteSettings } from '../services/settingsService'

type ImageField = 'logoUrl' | 'faviconUrl'

function WebsiteInfoTab() {
  const { t } = useTranslation('adminSettings')
  const { t: tMedia } = useTranslation('media')
  const canUpdate = usePermission('system.setting.update')
  const canViewMedia = usePermission('media.library.view')
  const canCreateMedia = usePermission('media.library.create')
  const canUpdateMedia = usePermission('media.library.update')
  const canDeleteMedia = usePermission('media.library.delete')
  const settingsQuery = useWebsiteSettings()
  const saveSettings = useUpdateWebsiteSettings()
  const mediaQuery = useMediaList({}, canViewMedia)
  const mediaSettings = useMediaSettings(canViewMedia)
  const createMedia = useCreateMedia()
  const createFolder = useCreateMediaFolder()
  const updateMedia = useUpdateMedia()
  const deleteMedia = useDeleteMedia()
  const [values, setValues] = useState<WebsiteSettings>({
    siteName: '',
    logoUrl: '',
    faviconUrl: '',
  })
  const [pickerTarget, setPickerTarget] = useState<ImageField | null>(null)
  const mediaLabels = useMemo(() => createMediaLabels(tMedia), [tMedia])
  const mediaItems = useMemo(
    () =>
      mediaRecordsToItems(
        mediaQuery.data?.pages.flatMap((page) => page.items) ?? [],
        mediaQuery.data?.pages.flatMap((page) => page.folders) ?? [],
      ),
    [mediaQuery.data?.pages],
  )

  useEffect(() => {
    if (settingsQuery.data) setValues(settingsQuery.data)
  }, [settingsQuery.data])

  const update = (field: keyof WebsiteSettings, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const save = async () => {
    try {
      await saveSettings.mutateAsync({
        siteName: values.siteName.trim(),
        logoUrl: values.logoUrl.trim(),
        faviconUrl: values.faviconUrl.trim(),
      })
      toast.success(t('website.saved'))
    } catch (error) {
      toast.apiError(error, t('website.saveFailed'))
    }
  }

  if (settingsQuery.isPending) {
    return <p className="text-sm text-slate-500">{t('loading')}</p>
  }
  if (settingsQuery.isError) {
    return (
      <div className="space-y-3 text-sm text-red-600">
        <p>{t('website.loadFailed')}</p>
        <Button variant="outline" onClick={() => void settingsQuery.refetch()}>
          {t('website.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t('website.title')}</h2>
        <p className="text-sm text-slate-500">{t('website.description')}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website-name">{t('website.siteName')}</Label>
        <Input
          id="website-name"
          maxLength={120}
          value={values.siteName}
          disabled={!canUpdate}
          onChange={(event) => update('siteName', event.target.value)}
        />
      </div>
      {(['logoUrl', 'faviconUrl'] as const).map((field) => (
        <div className="space-y-3" key={field}>
          <Label htmlFor={`website-${field}`}>
            {t(field === 'logoUrl' ? 'website.logo' : 'website.favicon')}
          </Label>
          <div className="flex h-32 w-72 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900">
            {values[field] ? (
              <img
                src={resolveMediaUrl(values[field])}
                alt={t(
                  field === 'logoUrl' ? 'website.logo' : 'website.favicon',
                )}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <ImagePlus className="size-7 text-slate-400" />
            )}
          </div>
          <p className="text-xs text-slate-500">{t('website.imageHint')}</p>
          <div className="flex flex-wrap gap-2">
            <Input
              id={`website-${field}`}
              className="min-w-56 max-w-lg flex-1"
              maxLength={2048}
              value={values[field]}
              disabled={!canUpdate}
              onChange={(event) => update(field, event.target.value)}
            />
            {canUpdate && canViewMedia && (
              <Button variant="outline" onClick={() => setPickerTarget(field)}>
                <ImagePlus />
                {t('website.chooseImage')}
              </Button>
            )}
            {canUpdate && values[field] && (
              <Button variant="outline" onClick={() => update(field, '')}>
                <Trash2 />
                {t('website.removeImage')}
              </Button>
            )}
          </div>
        </div>
      ))}
      {canUpdate && (
        <div className="flex justify-end">
          <Button
            disabled={saveSettings.isPending || !values.siteName.trim()}
            onClick={() => void save()}
          >
            {saveSettings.isPending ? t('website.saving') : t('website.save')}
          </Button>
        </div>
      )}
      <MediaPicker
        open={pickerTarget !== null}
        imageOnly
        items={mediaItems}
        labels={mediaLabels}
        title={t('website.pickerTitle')}
        closeLabel={t('website.close')}
        hasMore={mediaQuery.hasNextPage}
        isLoadingMore={mediaQuery.isFetchingNextPage}
        onLoadMore={() => void mediaQuery.fetchNextPage()}
        onCreateMedia={
          canCreateMedia
            ? (item) =>
                createMedia.mutateAsync({
                  name: item.name,
                  originalName: item.name,
                  path: item.path,
                  url: item.url ?? `/images/${item.name}`,
                  storageMode: mediaSettings.data?.storageMode ?? 'SOURCE',
                  mimeType: item.mimeType ?? 'application/octet-stream',
                  extension: item.name.split('.').pop() ?? '',
                  size: item.size ?? 0,
                  folder: item.path.split('/').slice(0, -1).join('/') || '/',
                  data: item.data,
                })
            : undefined
        }
        onCreateFolder={
          canCreateMedia
            ? (folder) =>
                createFolder
                  .mutateAsync({
                    name: folder.name,
                    parentPath: folder.parentPath,
                    storageMode: mediaSettings.data?.storageMode ?? 'SOURCE',
                  })
                  .then(() => undefined)
            : undefined
        }
        onRenameMedia={
          canUpdateMedia
            ? (item, name) => updateMedia.mutateAsync({ id: item.id, name })
            : undefined
        }
        onDeleteMedia={
          canDeleteMedia
            ? (item) =>
                deleteMedia.mutateAsync({ id: item.id }).then(() => undefined)
            : undefined
        }
        onClose={() => setPickerTarget(null)}
        onSelect={(item) => {
          if (pickerTarget) update(pickerTarget, item.url || item.path)
          setPickerTarget(null)
        }}
      />
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation('adminSettings')
  const canViewMedia = usePermission('media.library.view')
  const canUpdateMedia = usePermission('media.library.update')
  const [activeTab, setActiveTab] = useState<'website' | 'media'>('website')
  const showMedia = canViewMedia && canUpdateMedia

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('description')}
        </p>
      </div>
      <Panel>
        <div className="mb-6 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
          {[
            { id: 'website' as const, icon: Globe2 },
            ...(showMedia ? [{ id: 'media' as const, icon: ImageIcon }] : []),
          ].map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                activeTab === id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-500 hover:bg-white/60 dark:hover:bg-slate-800',
              )}
            >
              <Icon className="size-4" />
              {t(`tabs.${id}`)}
            </button>
          ))}
        </div>
        {activeTab === 'website' ? (
          <WebsiteInfoTab />
        ) : showMedia ? (
          <MediaSettingsTab />
        ) : null}
      </Panel>
    </div>
  )
}
