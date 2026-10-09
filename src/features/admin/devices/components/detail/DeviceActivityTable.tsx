import { useTranslation } from 'react-i18next'
import type { DeviceActivity } from '../../services/deviceDetailMock'

const categoryClass = {
  normal: 'bg-blue-50 text-blue-700',
  propaganda: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  emergency: 'bg-rose-50 text-rose-700',
}
const statusClass = {
  upcoming: 'bg-amber-50 text-amber-700',
  pending: 'bg-blue-50 text-blue-700',
  published: 'bg-emerald-50 text-emerald-700',
}

export function DeviceActivityTable({
  title,
  items,
}: {
  title: string
  items: DeviceActivity[]
}) {
  const { t, i18n } = useTranslation('adminDevices')
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="border-b border-slate-100 px-4 py-3 text-base font-bold text-blue-950 dark:border-slate-800 dark:text-white">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-2.5">{t('detail.time')}</th>
              <th className="px-4 py-2.5">{t('detail.broadcastName')}</th>
              <th className="px-4 py-2.5">{t('detail.category')}</th>
              <th className="px-4 py-2.5">{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                  {new Intl.DateTimeFormat(locale, {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(item.at))}
                </td>
                <td className="px-4 py-3 font-medium text-blue-950 dark:text-white">
                  {t(`activity.${item.titleKey}`)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 ${categoryClass[item.category]}`}
                  >
                    {t(`activity.category.${item.category}`)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 ${statusClass[item.status]}`}
                  >
                    {t(`activity.status.${item.status}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
