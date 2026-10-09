import { allowedDemoAreas } from '@/features/territory/demoAreas'
import { useTerritory } from '@/features/territory/useTerritory'
import { useRef, useState } from 'react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useUploadMedia } from '@/features/admin/media/hooks/useMediaSettings'
import { resolveMediaUrl } from '@/features/admin/media/utils/mediaUrl'
import { getApiErrorMessage } from '@/utils/apiError'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type {
  ScheduleAttachment,
  ScheduleCategory,
  ScheduleChannel,
  ScheduleInput,
  ScheduleItem,
  ScheduleStatus,
} from '../types'
import { isHttpUrl } from '../utils'
import { ScheduleAttachmentFields } from './ScheduleAttachmentFields'

type Mode = 'create' | 'edit' | 'view'
const fieldClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

export function ScheduleDialog({
  mode,
  item,
  selectedDate,
  onClose,
  onSave,
  saving,
}: {
  mode: Mode
  item?: ScheduleItem
  selectedDate: Date
  onClose: () => void
  onSave: (input: ScheduleInput) => Promise<void>
  saving: boolean
}) {
  const { t } = useTranslation('adminSchedules')
  const { access } = useTerritory()
  const areas = allowedDemoAreas(access, true)
  const canUpload = usePermission('media.library.create')
  const upload = useUploadMedia()
  const [source, setSource] = useState<ScheduleAttachment['type']>(
    item?.attachment?.type ?? 'upload',
  )
  const [file, setFile] = useState<File | null>(null)
  const [uploadedFile, setUploadedFile] = useState<
    Extract<ScheduleAttachment, { type: 'upload' }> | undefined
  >(item?.attachment?.type === 'upload' ? item.attachment : undefined)
  const [url, setUrl] = useState(
    item?.attachment?.type === 'url' ? item.attachment.url : '',
  )
  const [submitting, setSubmitting] = useState(false)
  const submitInProgress = useRef(false)
  const busy = saving || submitting
  const [draft, setDraft] = useState<ScheduleInput>(() =>
    item
      ? {
          title: item.title,
          content: item.content,
          category: item.category,
          channel: item.channel,
          area: item.area,
          provinceCode: item.provinceCode,
          wardCode: item.wardCode,
          scheduledAt: item.scheduledAt,
          status: item.status,
          image: item.image,
          deviceCount: item.deviceCount,
        }
      : {
          title: '',
          content: '',
          category: 'normal',
          channel: 'radio',
          area: areas[0]?.name ?? '',
          provinceCode: areas[0]?.provinceCode,
          wardCode:
            areas[0] && 'wardCode' in areas[0] ? areas[0].wardCode : undefined,
          scheduledAt: `${format(selectedDate, 'yyyy-MM-dd')}T08:00:00`,
          status: 'pending',
          deviceCount: 12,
        },
  )
  const [error, setError] = useState('')
  const update = (patch: Partial<ScheduleInput>) =>
    setDraft((current) => ({ ...current, ...patch }))
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (saving || submitInProgress.current) return
    if (
      !draft.area ||
      !draft.title.trim() ||
      !draft.content.trim() ||
      Number.isNaN(new Date(draft.scheduledAt).getTime())
    ) {
      setError(t('requiredFields'))
      return
    }
    const contentUrl = url.trim()
    if (source === 'url' && contentUrl && !isHttpUrl(contentUrl)) {
      setError(t('invalidUrl'))
      return
    }
    if (source === 'upload' && file && !canUpload) {
      setError(t('uploadNotAllowed'))
      return
    }
    submitInProgress.current = true
    setSubmitting(true)
    setError('')
    try {
      let attachment: ScheduleAttachment | undefined
      if (source === 'url') {
        if (contentUrl) attachment = { type: 'url', url: contentUrl }
      } else {
        attachment = uploadedFile
        if (file) {
          const media = await upload.mutateAsync(file)
          attachment = {
            type: 'upload',
            mediaId: media.id,
            name: media.name,
            url: media.url,
            mimeType: media.mimeType,
            size: media.size,
          }
          setUploadedFile(attachment)
          setFile(null)
        }
      }
      await onSave({ ...draft, attachment })
    } catch (cause) {
      setError(getApiErrorMessage(cause, t('saveFailed')))
    } finally {
      submitInProgress.current = false
      setSubmitting(false)
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t(mode)}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        {mode === 'view' ? (
          <div className="grid gap-3 text-sm text-slate-700 dark:text-slate-200">
            <div>
              <strong>{t('scheduleName')}:</strong> {item?.title}
            </div>
            <div>
              <strong>{t('postContent')}:</strong> {item?.content}
            </div>
            {item?.attachment && (
              <div className="space-y-1">
                <strong>{t('attachment')}:</strong>
                <a
                  href={resolveMediaUrl(item.attachment.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block break-all text-blue-600 underline dark:text-blue-300"
                >
                  {item.attachment.type === 'upload'
                    ? item.attachment.name
                    : item.attachment.url}
                </a>
              </div>
            )}
            <div>
              <strong>{t('category')}:</strong>{' '}
              {t(`categories.${item?.category}`)}
            </div>
            <div>
              <strong>{t('channel')}:</strong> {t(`channels.${item?.channel}`)}
            </div>
            <div>
              <strong>{t('area')}:</strong> {item?.area} (
              {t('deviceCount', { count: item?.deviceCount })})
            </div>
            <div>
              <strong>{t('broadcastTime')}:</strong>{' '}
              {item && format(new Date(item.scheduledAt), 'dd/MM/yyyy HH:mm')}
            </div>
            <div>
              <strong>{t('status')}:</strong> {t(`statuses.${item?.status}`)}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('close')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            <fieldset disabled={busy} className="min-w-0 space-y-4">
              <label className="block space-y-1 text-sm font-medium">
                <span>{t('titleField')}</span>
                <input
                  autoFocus
                  value={draft.title}
                  onChange={(event) => update({ title: event.target.value })}
                  className={fieldClass}
                />
              </label>
              <label className="block space-y-1 text-sm font-medium">
                <span>{t('contentField')}</span>
                <textarea
                  value={draft.content}
                  onChange={(event) => update({ content: event.target.value })}
                  className={`${fieldClass} h-20 py-2`}
                />
              </label>
              <ScheduleAttachmentFields
                source={source}
                onSourceChange={(next) => {
                  setSource(next)
                  setError('')
                }}
                file={file}
                onFileChange={(next) => {
                  setFile(next)
                  setUploadedFile(undefined)
                  setError('')
                }}
                uploadedFile={uploadedFile}
                url={url}
                onUrlChange={(next) => {
                  setUrl(next)
                  setError('')
                }}
                canUpload={canUpload}
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-sm font-medium">
                  <span>{t('dateField')}</span>
                  <input
                    type="date"
                    value={draft.scheduledAt.slice(0, 10)}
                    onChange={(event) =>
                      update({
                        scheduledAt: `${event.target.value}T${draft.scheduledAt.slice(11, 16)}:00`,
                      })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  <span>{t('hourField')}</span>
                  <input
                    type="time"
                    value={draft.scheduledAt.slice(11, 16)}
                    onChange={(event) =>
                      update({
                        scheduledAt: `${draft.scheduledAt.slice(0, 10)}T${event.target.value}:00`,
                      })
                    }
                    className={fieldClass}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-sm font-medium">
                  <span>{t('category')}</span>
                  <select
                    value={draft.category}
                    onChange={(event) =>
                      update({
                        category: event.target.value as ScheduleCategory,
                      })
                    }
                    className={fieldClass}
                  >
                    {(
                      [
                        'normal',
                        'propaganda',
                        'warning',
                        'emergency',
                        'maintenance',
                      ] as const
                    ).map((value) => (
                      <option key={value} value={value}>
                        {t(`categories.${value}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium">
                  <span>{t('channel')}</span>
                  <select
                    value={draft.channel}
                    onChange={(event) =>
                      update({ channel: event.target.value as ScheduleChannel })
                    }
                    className={fieldClass}
                  >
                    {(['radio', 'digital', 'both'] as const).map((value) => (
                      <option key={value} value={value}>
                        {t(`channels.${value}`)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-sm font-medium">
                  <span>{t('area')}</span>
                  <select
                    value={draft.area}
                    onChange={(event) =>
                      (() => {
                        const area = areas.find(
                          (candidate) => candidate.name === event.target.value,
                        )
                        update({
                          area: event.target.value,
                          provinceCode: area?.provinceCode,
                          wardCode:
                            area && 'wardCode' in area
                              ? area.wardCode
                              : undefined,
                        })
                      })()
                    }
                    className={fieldClass}
                  >
                    {areas.map((area) => (
                      <option key={area.name} value={area.name}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium">
                  <span>{t('devicesField')}</span>
                  <input
                    type="number"
                    min={1}
                    value={draft.deviceCount}
                    onChange={(event) =>
                      update({ deviceCount: Number(event.target.value) })
                    }
                    className={fieldClass}
                  />
                </label>
              </div>
              <label className="block space-y-1 text-sm font-medium">
                <span>{t('status')}</span>
                <select
                  value={draft.status}
                  onChange={(event) =>
                    update({ status: event.target.value as ScheduleStatus })
                  }
                  className={fieldClass}
                >
                  {(['published', 'pending', 'cancelled'] as const).map(
                    (value) => (
                      <option key={value} value={value}>
                        {t(`statuses.${value}`)}
                      </option>
                    ),
                  )}
                </select>
              </label>
              {error && (
                <p role="alert" className="text-xs text-red-600">
                  {error}
                </p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={busy}>
                  {upload.isPending ? t('uploading') : t('save')}
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
