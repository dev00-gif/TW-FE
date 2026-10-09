import { useState } from 'react'
import type { FormEvent } from 'react'
import { addDays, format } from 'date-fns'
import {
  CalendarDays,
  ChevronUp,
  Eye,
  FileText,
  ImagePlus,
  Monitor,
  Music2,
  Plus,
  Radio,
  Save,
  Send,
  Settings2,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { formatSize } from '@/features/admin/media/components/media-utils'
import { resolveMediaUrl } from '@/features/admin/media/utils/mediaUrl'
import { bulletinAreas } from '../services/bulletinService'
import { useBulletinCategories } from '../hooks/useBulletins'
import type {
  Bulletin,
  BulletinAttachment,
  BulletinChannel,
  BulletinDraft,
  BulletinPriority,
  BulletinStatus,
} from '../types'
import { bulletinContentText } from '../utils'
import { BulletinMediaPicker } from './BulletinMediaPicker'
import { BulletinRichText } from './BulletinRichText'
import type { BulletinMediaTarget } from './BulletinMediaPicker'

const card =
  'rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900'
const field =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-blue-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
const fieldLabel =
  'mb-1.5 block text-sm font-medium text-blue-950 dark:text-slate-100'
const compactField =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-blue-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
const compactLabel =
  'mb-1 block text-xs font-medium text-blue-950 dark:text-slate-100'
type MediaTab = 'audio' | 'images' | 'video' | 'documents'
const mediaTabs: MediaTab[] = ['audio', 'images', 'video', 'documents']

function mediaKind(mimeType: string): MediaTab {
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('image/')) return 'images'
  if (mimeType.startsWith('video/')) return 'video'
  return 'documents'
}

export function BulletinForm({
  item,
  saving,
  onCancel,
  onSave,
}: {
  item?: Bulletin
  saving: boolean
  onCancel: () => void
  onSave: (draft: BulletinDraft) => Promise<void>
}) {
  const { t } = useTranslation('adminBulletins')
  const user = useCurrentUser()
  const canViewMedia = usePermission('media.library.view')
  const categories = useBulletinCategories()
  const [draft, setDraft] = useState<BulletinDraft>(() => ({
    title: item?.title ?? '',
    content: item?.content ?? '',
    type: item?.type ?? 'news',
    channels: item?.channels ?? ['radio', 'display'],
    area: item?.area ?? bulletinAreas[0],
    priority: item?.priority ?? 'low',
    status: item?.status ?? 'pending',
    image: item?.image ?? '',
    summary: item?.summary ?? '',
    topics: item?.topics ?? [],
    source: item?.source ?? 'UBND tỉnh Thái Nguyên',
    language: item?.language ?? 'Tiếng Việt',
    effectiveFrom:
      item?.effectiveFrom?.slice(0, 16) ??
      format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    effectiveTo:
      item?.effectiveTo?.slice(0, 16) ??
      format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
    attachments: item?.attachments ?? [],
    author: item?.author ?? user?.displayName ?? user?.email ?? '',
    categoryIds: item?.categoryIds ?? [],
  }))
  const [activeMedia, setActiveMedia] = useState<MediaTab>('audio')
  const [pickerTarget, setPickerTarget] = useState<BulletinMediaTarget | null>(
    null,
  )
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState('')
  const update = (patch: Partial<BulletinDraft>) =>
    setDraft((current) => ({ ...current, ...patch }))
  const attachments = draft.attachments ?? []
  const visibleAttachments = attachments.filter(
    (attachment) => mediaKind(attachment.mimeType) === activeMedia,
  )
  const availableStatuses: BulletinStatus[] =
    item && item.status !== 'draft' && item.status !== 'pending'
      ? [item.status, 'draft', 'pending']
      : ['draft', 'pending']

  const save = async (status = draft.status) => {
    if (
      !draft.title.trim() ||
      !draft.summary?.trim() ||
      !bulletinContentText(draft.content) ||
      !draft.channels.length ||
      !draft.area ||
      !draft.effectiveFrom ||
      !draft.effectiveTo
    ) {
      setError(t('requiredFull'))
      return
    }
    if (
      draft.effectiveFrom &&
      draft.effectiveTo &&
      draft.effectiveFrom > draft.effectiveTo
    ) {
      setError(t('invalidEffectiveRange'))
      return
    }
    try {
      setError('')
      await onSave({
        ...draft,
        title: draft.title.trim(),
        summary: draft.summary.trim(),
        source: draft.source?.trim(),
        status,
      })
    } catch {
      setError(t('saveError'))
    }
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void save()
  }
  const toggleChannel = (channel: BulletinChannel, checked: boolean) =>
    update({
      channels: checked
        ? [...draft.channels, channel]
        : draft.channels.filter((value) => value !== channel),
    })
  const removeAttachment = (id: string) =>
    update({
      attachments: attachments.filter((attachment) => attachment.id !== id),
    })
  const toggleCategory = (id: string) =>
    update({
      categoryIds: draft.categoryIds?.includes(id)
        ? draft.categoryIds.filter((categoryId) => categoryId !== id)
        : [...(draft.categoryIds ?? []), id],
    })

  return (
    <form onSubmit={submit} className="space-y-4 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-950 dark:text-white">
            {t(item ? 'edit' : 'create')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('formDescription')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            variant="outlinePrimary"
            disabled={saving}
            onClick={() => void save('draft')}
          >
            <Save className="size-4" />
            {t('saveDraft')}
          </Button>
          <Button
            type="button"
            variant="outlinePrimary"
            onClick={() => setShowPreview((value) => !value)}
          >
            <Eye className="size-4" />
            {t('preview')}
          </Button>
          <Button type="submit" disabled={saving}>
            <Send className="size-4" />
            {t(item ? 'save' : 'create')}
          </Button>
        </div>
      </div>

      {showPreview && (
        <section className={card} aria-label={t('preview')}>
          <h2 className="mb-3 text-base font-bold text-blue-950 dark:text-white">
            {t('preview')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            {draft.image && (
              <img
                src={resolveMediaUrl(draft.image)}
                alt=""
                className="h-32 w-full rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-blue-950 dark:text-white">
                {draft.title || '—'}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {draft.summary || '—'}
              </p>
              <div className="mt-3 max-h-44 overflow-auto text-slate-700 dark:text-slate-200">
                <BulletinRichText content={draft.content} />
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <section className="space-y-4">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-blue-950 dark:text-white">
              <FileText className="size-5 text-blue-600" />
              {t('bulletinContent')}
            </h2>
            <div className="space-y-4">
              <label className="block">
                <span className={fieldLabel}>{t('titleField')} *</span>
                <input
                  className={field}
                  value={draft.title}
                  maxLength={255}
                  onChange={(event) => update({ title: event.target.value })}
                />
                <span className="mt-1 block text-right text-xs text-slate-500">
                  {draft.title.length}/255
                </span>
              </label>
              <label className="block">
                <span className={fieldLabel}>{t('summary')} *</span>
                <textarea
                  className={`${field} h-24 py-2`}
                  value={draft.summary ?? ''}
                  maxLength={500}
                  onChange={(event) => update({ summary: event.target.value })}
                />
                <span className="mt-1 block text-right text-xs text-slate-500">
                  {draft.summary?.length ?? 0}/500
                </span>
              </label>
              <div>
                <span className={fieldLabel}>{t('contentField')} *</span>
                <TiptapEditor
                  key={item?.id ?? 'new-bulletin'}
                  content={draft.content}
                  onChange={(content) => update({ content })}
                  placeholder={t('contentPlaceholder')}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-blue-950 dark:text-white">
              <Settings2 className="size-5 text-blue-600" />
              {t('configuration')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <span className={compactLabel}>{t('bulletinCode')}</span>
                <div
                  className={`${compactField} flex items-center bg-slate-50 dark:bg-slate-800`}
                >
                  {item?.id ?? t('generatedCode')}
                </div>
              </div>
              <fieldset>
                <legend className={compactLabel}>{t('channel')} *</legend>
                <div className="flex min-h-10 flex-wrap items-center gap-2">
                  {(['radio', 'display'] as const).map((channel) => (
                    <label
                      key={channel}
                      className="flex items-center gap-2 rounded-lg border border-blue-100 px-2 py-2 text-xs text-blue-700 dark:border-blue-900 dark:text-blue-200"
                    >
                      <Checkbox
                        checked={draft.channels.includes(channel)}
                        onCheckedChange={(checked) =>
                          toggleChannel(channel, checked === true)
                        }
                      />
                      {channel === 'radio' ? (
                        <Radio className="size-4" />
                      ) : (
                        <Monitor className="size-4" />
                      )}
                      {t(`channels.${channel}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label>
                <span className={compactLabel}>{t('priority')} *</span>
                <select
                  value={draft.priority}
                  onChange={(event) =>
                    update({ priority: event.target.value as BulletinPriority })
                  }
                  className={compactField}
                >
                  {(['low', 'medium', 'high'] as const).map((priority) => (
                    <option key={priority} value={priority}>
                      {t(`priorities.${priority}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={compactLabel}>{t('area')} *</span>
                <select
                  className={compactField}
                  value={draft.area}
                  onChange={(event) => update({ area: event.target.value })}
                >
                  {bulletinAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid min-w-0 gap-2 sm:grid-cols-2 md:col-span-2">
                <label className="min-w-0">
                  <span className={compactLabel}>{t('effectiveFrom')} *</span>
                  <input
                    type="datetime-local"
                    className={compactField}
                    value={draft.effectiveFrom ?? ''}
                    onChange={(event) =>
                      update({ effectiveFrom: event.target.value })
                    }
                  />
                </label>
                <label className="min-w-0">
                  <span className={compactLabel}>{t('effectiveTo')} *</span>
                  <input
                    type="datetime-local"
                    className={compactField}
                    value={draft.effectiveTo ?? ''}
                    onChange={(event) =>
                      update({ effectiveTo: event.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                <span className={compactLabel}>{t('source')}</span>
                <input
                  className={compactField}
                  value={draft.source ?? ''}
                  onChange={(event) => update({ source: event.target.value })}
                />
              </label>
              <label>
                <span className={compactLabel}>{t('language')}</span>
                <select
                  className={compactField}
                  value={draft.language ?? 'Tiếng Việt'}
                  onChange={(event) => update({ language: event.target.value })}
                >
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="English">English</option>
                </select>
              </label>
            </div>
          </section>
        </div>
        <div className="min-w-0 space-y-4">
          <section className={card}>
            <h2 className="mb-4 flex items-center justify-between text-base font-bold text-blue-950 dark:text-white">
              {t('publishBox')}
              <ChevronUp className="size-4 text-slate-400" />
            </h2>
            <label className="block space-y-1.5 text-sm">
              <span>{t('statusAfterSave')}</span>
              <select
                className={field}
                value={draft.status}
                onChange={(event) =>
                  update({ status: event.target.value as BulletinStatus })
                }
              >
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'pending'
                      ? t('sendForReview')
                      : t(`statuses.${status}`)}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="size-4" />
              {t('effectiveFrom')}:{' '}
              {draft.effectiveFrom?.replace('T', ' ') || '—'}
            </p>
          </section>
          <section className={card}>
            <h2 className="mb-4 flex items-center justify-between text-base font-bold text-blue-950 dark:text-white">
              {t('category')}
              <ChevronUp className="size-4 text-slate-400" />
            </h2>
            <div className="space-y-2">
              {categories.data?.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={draft.categoryIds?.includes(category.id) ?? false}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  {category.name}
                </label>
              ))}
              {!categories.data?.length && (
                <p className="text-xs text-slate-500">{t('emptyCategories')}</p>
              )}
            </div>
          </section>
          <section className={card}>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-blue-950 dark:text-white">
              <Music2 className="size-5 text-blue-600" />
              {t('attachments')}
            </h2>
            <div
              className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-700"
              role="tablist"
              aria-label={t('attachments')}
            >
              {mediaTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeMedia === tab}
                  onClick={() => setActiveMedia(tab)}
                  className={`min-h-10 border-b-2 px-1 text-xs font-medium ${activeMedia === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                >
                  {t(`media.${tab}`)}
                </button>
              ))}
            </div>
            <div className="space-y-2 py-3">
              {visibleAttachments.length ? (
                visibleAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-blue-950 dark:text-white">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatSize(attachment.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        aria-label={t('removeAttachment')}
                        className="rounded p-1 text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {activeMedia === 'audio' && (
                      <audio
                        controls
                        src={resolveMediaUrl(attachment.url)}
                        className="mt-2 w-full"
                      />
                    )}
                    {activeMedia === 'images' && (
                      <img
                        src={resolveMediaUrl(attachment.url)}
                        alt={attachment.name}
                        className="mt-2 max-h-44 w-full rounded object-contain"
                      />
                    )}
                    {activeMedia === 'video' && (
                      <video
                        controls
                        src={resolveMediaUrl(attachment.url)}
                        className="mt-2 max-h-44 w-full rounded"
                      />
                    )}
                    {activeMedia === 'documents' && (
                      <a
                        href={resolveMediaUrl(attachment.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                      >
                        {t('openAttachment')}
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-slate-500">
                  {t('noMedia', {
                    type: t(`media.${activeMedia}`).toLowerCase(),
                  })}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outlinePrimary"
              size="sm"
              disabled={!canViewMedia}
              onClick={() => setPickerTarget(activeMedia)}
            >
              <Plus className="size-4" />
              {t('addAttachment', {
                type: t(`media.${activeMedia}`).toLowerCase(),
              })}
            </Button>
          </section>
          <section className={card}>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-blue-950 dark:text-white">
              <ImagePlus className="size-5 text-blue-600" />
              {t('representativeImage')}
            </h2>
            {draft.image ? (
              <img
                src={resolveMediaUrl(draft.image)}
                alt={t('coverAlt', { title: draft.title })}
                className="aspect-[16/7] w-full rounded-lg bg-slate-100 object-cover"
              />
            ) : (
              <div className="grid aspect-[16/7] place-items-center rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
                <ImagePlus className="size-8" />
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outlinePrimary"
                size="sm"
                disabled={!canViewMedia}
                onClick={() => setPickerTarget('cover')}
              >
                <ImagePlus className="size-4" />
                {t('chooseImage')}
              </Button>
              {draft.image && (
                <Button
                  type="button"
                  variant="outlineSecondary"
                  size="sm"
                  onClick={() => update({ image: '' })}
                >
                  <Trash2 className="size-4" />
                  {t('removeImage')}
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200"
        >
          {error}
        </p>
      )}
      <BulletinMediaPicker
        target={pickerTarget}
        onClose={() => setPickerTarget(null)}
        onSelect={(selected) => {
          const url = selected.url || selected.path
          if (pickerTarget === 'cover') update({ image: url })
          else if (pickerTarget) {
            const attachment: BulletinAttachment = {
              id: selected.id,
              name: selected.name,
              url,
              mimeType: selected.mimeType,
              size: selected.size,
            }
            update({
              attachments: [
                ...attachments.filter((entry) => entry.id !== attachment.id),
                attachment,
              ],
            })
          }
          setPickerTarget(null)
        }}
      />
    </form>
  )
}
