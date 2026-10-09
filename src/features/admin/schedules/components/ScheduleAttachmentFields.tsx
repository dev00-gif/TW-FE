import { useId, useRef } from 'react'
import { Link2, Upload, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ScheduleAttachment } from '../types'

type FileAttachment = Extract<ScheduleAttachment, { type: 'upload' }>

export function ScheduleAttachmentFields({
  source,
  onSourceChange,
  file,
  onFileChange,
  uploadedFile,
  url,
  onUrlChange,
  canUpload,
}: {
  source: ScheduleAttachment['type']
  onSourceChange: (source: ScheduleAttachment['type']) => void
  file: File | null
  onFileChange: (file: File | null) => void
  uploadedFile?: FileAttachment
  url: string
  onUrlChange: (url: string) => void
  canUpload: boolean
}) {
  const { t } = useTranslation('adminSchedules')
  const id = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const fieldClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  return (
    <div className="space-y-1.5">
      <div className="grid items-start gap-3 sm:grid-cols-[170px_minmax(0,1fr)]">
        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
          <span>{t('contentSource')}</span>
          <select
            value={source}
            onChange={(event) =>
              onSourceChange(event.target.value as ScheduleAttachment['type'])
            }
            className={fieldClass}
          >
            <option value="upload">{t('sources.upload')}</option>
            <option value="url">{t('sources.url')}</option>
          </select>
        </label>
        {source === 'upload' ? (
          <div className="min-w-0 space-y-1">
            <label htmlFor={id} className="block text-sm font-medium">
              {t('attachmentFile')}
            </label>
            <input
              ref={fileInput}
              id={id}
              type="file"
              disabled={!canUpload}
              onChange={(event) => {
                onFileChange(event.target.files?.[0] ?? null)
                event.target.value = ''
              }}
              className="hidden"
            />
            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white pr-3 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                disabled={!canUpload}
                onClick={() => fileInput.current?.click()}
                className="flex h-full shrink-0 items-center gap-1.5 rounded-l-lg border-r border-slate-200 bg-slate-50 px-3 text-xs font-medium text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-700 dark:text-blue-300"
              >
                <Upload className="size-3.5" aria-hidden="true" />
                {t('chooseFile')}
              </button>
              <span
                className="min-w-0 flex-1 truncate text-xs text-slate-500 dark:text-slate-300"
                title={file?.name ?? uploadedFile?.name}
              >
                {file?.name ?? uploadedFile?.name ?? t('noFileSelected')}
              </span>
              {(file || uploadedFile) && (
                <button
                  type="button"
                  aria-label={t('removeAttachment')}
                  onClick={() => onFileChange(null)}
                  className="shrink-0 rounded text-slate-400 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-blue-500"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
            <span>{t('attachmentUrl')}</span>
            <div className="relative">
              <Link2
                className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                inputMode="url"
                value={url}
                onChange={(event) => onUrlChange(event.target.value)}
                placeholder={t('urlPlaceholder')}
                className={`${fieldClass} pl-9`}
              />
            </div>
          </label>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {source === 'upload' && !canUpload
          ? t('uploadNotAllowed')
          : t('attachmentOptional')}
      </p>
    </div>
  )
}
