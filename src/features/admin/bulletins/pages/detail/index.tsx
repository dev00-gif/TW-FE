import { Link } from '@tanstack/react-router'
import { ArrowLeft, CalendarDays, Pencil, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { BulletinStatusBadge } from '../../components/BulletinBadges'
import {
  BulletinConfigurationCard,
  BulletinContentCard,
  BulletinCoverCard,
  BulletinHistoryCard,
  BulletinMediaCard,
} from '../../components/BulletinDetailSections'
import {
  useBulletinCategories,
  useBulletinDetail,
  useSetBulletinStatus,
} from '../../hooks/useBulletins'

export default function BulletinDetailPage({
  bulletinId,
}: {
  bulletinId: string
}) {
  const { t } = useTranslation('adminBulletins')
  const detail = useBulletinDetail(bulletinId)
  const categories = useBulletinCategories()
  const setStatus = useSetBulletinStatus()
  const item = detail.data

  if (detail.isPending)
    return <p className="p-5 text-sm text-slate-500">{t('loading')}</p>
  if (!item)
    return <p className="p-5 text-sm text-slate-500">{t('notFound')}</p>

  const selectedCategories = (item.categoryIds ?? [])
    .map((id) => categories.data?.find((category) => category.id === id))
    .filter((category) => category !== undefined)

  const publish = () => {
    if (window.confirm(t('confirmPublish'))) {
      void setStatus.mutateAsync({ id: item.id, status: 'published' })
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <nav
        aria-label={t('breadcrumb')}
        className="flex flex-wrap items-center gap-2 text-xs text-slate-500"
      >
        <Link to="/dashboard" className="hover:text-blue-600">
          {t('home')}
        </Link>
        <span>›</span>
        <Link to="/dashboard/bulletins" className="hover:text-blue-600">
          {t('breadcrumb')}
        </Link>
        <span>›</span>
        <span className="text-blue-700 dark:text-blue-300">
          {t('detailTitle')}
        </span>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-blue-950 dark:text-white">
              {item.title}
            </h1>
            <BulletinStatusBadge value={item.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {t('bulletinCode')}: {item.id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outlinePrimary" asChild>
            <Link to="/dashboard/bulletins">
              <ArrowLeft className="size-4" />
              {t('backToList')}
            </Link>
          </Button>
          <Button variant="outlinePrimary" asChild>
            <Link to="/dashboard/schedules">
              <CalendarDays className="size-4" />
              {t('schedule')}
            </Link>
          </Button>
          <Button variant="outlinePrimary" asChild>
            <Link
              to="/dashboard/bulletins/$bulletinId/edit"
              params={{ bulletinId }}
            >
              <Pencil className="size-4" />
              {t('edit')}
            </Link>
          </Button>
          <Button
            onClick={publish}
            disabled={item.status !== 'approved' || setStatus.isPending}
          >
            <Send className="size-4" />
            {t('publish')}
          </Button>
        </div>
      </div>
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0 space-y-5">
          <BulletinContentCard item={item} />
          <BulletinConfigurationCard item={item} />
        </main>
        <aside className="min-w-0 space-y-4">
          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-base font-bold text-blue-950 dark:text-white">
              {t('category')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.isPending ? (
                <p className="text-sm text-slate-500">{t('loading')}</p>
              ) : selectedCategories.length ? (
                selectedCategories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                  >
                    {category.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">{t('emptyCategories')}</p>
              )}
            </div>
          </section>
          <BulletinCoverCard item={item} />
          <BulletinMediaCard item={item} />
          <BulletinHistoryCard item={item} />
        </aside>
      </div>
    </div>
  )
}
