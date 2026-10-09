import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BulletinForm } from '../../components/BulletinForm'
import { useBulletinDetail, useSaveBulletin } from '../../hooks/useBulletins'
import type { BulletinDraft } from '../../types'

export default function BulletinFormPage({
  bulletinId,
}: {
  bulletinId?: string
}) {
  const { t } = useTranslation('adminBulletins')
  const navigate = useNavigate()
  const detail = useBulletinDetail(bulletinId ?? '')
  const save = useSaveBulletin()
  const cancel = () => {
    if (bulletinId) {
      void navigate({
        to: '/dashboard/bulletins/$bulletinId',
        params: { bulletinId },
      })
    } else {
      void navigate({ to: '/dashboard/bulletins' })
    }
  }
  const saveItem = async (draft: BulletinDraft) => {
    const item = await save.mutateAsync({ id: bulletinId, draft })
    await navigate({
      to: '/dashboard/bulletins/$bulletinId',
      params: { bulletinId: item.id },
    })
  }

  if (bulletinId && detail.isPending)
    return <p className="p-5 text-sm text-slate-500">{t('loading')}</p>
  if (bulletinId && !detail.data)
    return <p className="p-5 text-sm text-slate-500">{t('notFound')}</p>

  return (
    <div className="space-y-4 pb-6">
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
          {t(bulletinId ? 'edit' : 'create')}
        </span>
      </nav>
      <BulletinForm
        key={bulletinId ?? 'new'}
        item={detail.data ?? undefined}
        saving={save.isPending}
        onCancel={cancel}
        onSave={saveItem}
      />
    </div>
  )
}
