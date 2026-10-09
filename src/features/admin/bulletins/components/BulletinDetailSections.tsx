import { useState } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import {
  Building2,
  CalendarDays,
  FileText,
  FileVideo,
  Headphones,
  ImageIcon,
  Languages,
  MapPin,
  Monitor,
  Radio,
  Settings2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatSize } from '@/features/admin/media/components/media-utils'
import { resolveMediaUrl } from '@/features/admin/media/utils/mediaUrl'
import type { Bulletin } from '../types'
import { BulletinRichText } from './BulletinRichText'
import { BulletinPriorityBadge, BulletinStatusBadge } from './BulletinBadges'

const card =
  'rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900'
const label = 'text-xs font-medium text-slate-500 dark:text-slate-400'
const value = 'mt-1 text-sm font-medium text-blue-950 dark:text-slate-100'

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Settings2
  children: React.ReactNode
}) {
  return (
    <h2 className="mb-5 flex items-center gap-2.5 text-base font-bold text-blue-950 dark:text-white">
      <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
        <Icon className="size-4" />
      </span>
      {children}
    </h2>
  )
}

function InfoField({
  title,
  children,
  icon: Icon,
}: {
  title: string
  children: React.ReactNode
  icon?: typeof Settings2
}) {
  return (
    <div className="min-w-0">
      <dt className={label}>{title}</dt>
      <dd
        className={`${value} flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700`}
      >
        {Icon && <Icon className="size-4 shrink-0 text-blue-600" />}
        <span className="min-w-0 break-words">{children}</span>
      </dd>
    </div>
  )
}

const date = (input?: string) => {
  if (!input) return '—'
  const parsed = parseISO(input)
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy HH:mm') : '—'
}

export function BulletinConfigurationCard({ item }: { item: Bulletin }) {
  const { t } = useTranslation('adminBulletins')
  return (
    <section className={card}>
      <SectionTitle icon={Settings2}>{t('configuration')}</SectionTitle>
      <dl className="grid gap-4 sm:grid-cols-2">
        <InfoField title={t('bulletinCode')}>{item.id}</InfoField>
        <div className="min-w-0">
          <dt className={label}>{t('channel')}</dt>
          <dd className="mt-1 flex min-h-10 flex-wrap items-center gap-2">
            {item.channels.map((channel) => (
              <span
                key={channel}
                className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
              >
                {channel === 'radio' ? (
                  <Radio className="size-3.5" />
                ) : (
                  <Monitor className="size-3.5" />
                )}
                {t(`channels.${channel}`)}
              </span>
            ))}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className={label}>{t('priority')}</dt>
          <dd className="mt-1 flex min-h-10 items-center">
            <BulletinPriorityBadge value={item.priority} />
          </dd>
        </div>
        <InfoField title={t('area')} icon={MapPin}>
          {item.area}
        </InfoField>
        <div className="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2">
          <InfoField title={t('effectiveFrom')} icon={CalendarDays}>
            {date(item.effectiveFrom)}
          </InfoField>
          <InfoField title={t('effectiveTo')} icon={CalendarDays}>
            {date(item.effectiveTo)}
          </InfoField>
        </div>
        <InfoField title={t('source')} icon={Building2}>
          {item.source ?? '—'}
        </InfoField>
        <InfoField title={t('language')} icon={Languages}>
          {item.language ?? '—'}
        </InfoField>
        <div className="min-w-0">
          <dt className={label}>{t('status')}</dt>
          <dd className="mt-1 flex min-h-10 items-center">
            <BulletinStatusBadge value={item.status} />
          </dd>
        </div>
      </dl>
    </section>
  )
}

export function BulletinContentCard({ item }: { item: Bulletin }) {
  const { t } = useTranslation('adminBulletins')
  return (
    <section className={card}>
      <SectionTitle icon={FileText}>{t('bulletinContent')}</SectionTitle>
      <div className="space-y-5">
        <div>
          <p className={label}>{t('summary')}</p>
          <p className="mt-1 min-h-20 rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:text-slate-200">
            {item.summary ?? item.content}
          </p>
        </div>
        <div>
          <p className={label}>{t('contentField')}</p>
          <div className="mt-1 min-h-52 rounded-lg border border-slate-200 px-3 py-3 dark:border-slate-700">
            <BulletinRichText content={item.content} />
          </div>
        </div>
      </div>
    </section>
  )
}

type MediaTab = 'audio' | 'images' | 'video' | 'documents'

export function BulletinMediaCard({ item }: { item: Bulletin }) {
  const { t } = useTranslation('adminBulletins')
  const [active, setActive] = useState<MediaTab>('audio')
  const tabs: { id: MediaTab; icon: typeof Headphones }[] = [
    { id: 'audio', icon: Headphones },
    { id: 'images', icon: ImageIcon },
    { id: 'video', icon: FileVideo },
    { id: 'documents', icon: FileText },
  ]
  const attachments = (item.attachments ?? []).filter((attachment) =>
    active === 'audio'
      ? attachment.mimeType.startsWith('audio/')
      : active === 'images'
        ? attachment.mimeType.startsWith('image/')
        : active === 'video'
          ? attachment.mimeType.startsWith('video/')
          : !attachment.mimeType.startsWith('audio/') &&
            !attachment.mimeType.startsWith('image/') &&
            !attachment.mimeType.startsWith('video/'),
  )
  return (
    <section className={card}>
      <SectionTitle icon={Headphones}>{t('attachments')}</SectionTitle>
      <div
        role="tablist"
        aria-label={t('attachments')}
        className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-700"
      >
        {tabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            id={`bulletin-media-${id}`}
            type="button"
            role="tab"
            aria-selected={active === id}
            aria-label={t(`media.${id}`)}
            aria-controls="bulletin-media-panel"
            onClick={() => setActive(id)}
            className={`flex min-h-10 items-center justify-center gap-1 border-b-2 px-1 text-xs font-medium transition-colors ${active === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-blue-600'}`}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{t(`media.${id}`)}</span>
          </button>
        ))}
      </div>
      <div
        id="bulletin-media-panel"
        role="tabpanel"
        aria-labelledby={`bulletin-media-${active}`}
        className="min-h-36 space-y-3 pt-4"
      >
        {attachments.length ? (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <p className="truncate text-sm font-medium text-blue-950 dark:text-white">
                {attachment.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatSize(attachment.size)}
              </p>
              {active === 'audio' && (
                <audio
                  controls
                  src={resolveMediaUrl(attachment.url)}
                  className="mt-2 w-full"
                />
              )}
              {active === 'images' && (
                <img
                  src={resolveMediaUrl(attachment.url)}
                  alt={attachment.name}
                  className="mt-2 max-h-48 w-full rounded object-contain"
                />
              )}
              {active === 'video' && (
                <video
                  controls
                  src={resolveMediaUrl(attachment.url)}
                  className="mt-2 max-h-48 w-full rounded"
                />
              )}
              {active === 'documents' && (
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
          <p className="py-8 text-center text-sm text-slate-500">
            {t('noMedia', { type: t(`media.${active}`).toLowerCase() })}
          </p>
        )}
      </div>
    </section>
  )
}

export function BulletinCoverCard({ item }: { item: Bulletin }) {
  const { t } = useTranslation('adminBulletins')
  return (
    <section className={card}>
      <SectionTitle icon={ImageIcon}>{t('representativeImage')}</SectionTitle>
      {item.image ? (
        <img
          src={resolveMediaUrl(item.image)}
          alt={t('coverAlt', { title: item.title })}
          className="aspect-[16/7] w-full rounded-lg bg-slate-100 object-cover dark:bg-slate-800"
        />
      ) : (
        <p className="grid aspect-[16/7] place-items-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700">
          {t('noCover')}
        </p>
      )}
    </section>
  )
}

export function BulletinScopeCard({ item }: { item: Bulletin }) {
  const { t } = useTranslation('adminBulletins')
  return (
    <section className={card}>
      <SectionTitle icon={MapPin}>{t('scope')}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
        <span className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
          <MapPin className="size-4" />
          {t('area')}
        </span>
        <div className="flex min-h-12 items-center gap-2 rounded-lg border border-blue-100 px-3 text-sm font-medium text-blue-950 dark:border-blue-900 dark:text-white">
          <MapPin className="size-4 text-blue-600" />
          {item.area}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{t('scopeNote')}</p>
    </section>
  )
}

export function BulletinHistoryCard({ item }: { item: Bulletin }) {
  const { t } = useTranslation('adminBulletins')
  return (
    <section className={card}>
      <SectionTitle icon={CalendarDays}>{t('history')}</SectionTitle>
      <ol className="space-y-4 border-l-2 border-blue-100 pl-4 text-sm dark:border-slate-700">
        <li>
          <strong>{t('createdEvent')}</strong>
          <p className="text-slate-500">
            {date(item.createdAt)} · {item.author}
          </p>
        </li>
        {item.reviewedAt && (
          <li>
            <strong>{t('reviewedEvent')}</strong>
            <p className="text-slate-500">
              {date(item.reviewedAt)} · {item.reviewer}
            </p>
          </li>
        )}
      </ol>
    </section>
  )
}
