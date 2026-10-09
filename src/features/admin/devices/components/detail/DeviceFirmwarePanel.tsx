import { useTranslation } from 'react-i18next'
import { getDeviceFirmwareHistory } from '../../services/deviceDetailMock'
import type { Device } from '../../types'

export function DeviceFirmwarePanel({ device }: { device: Device }) {
  const { t, i18n } = useTranslation('adminDevices')
  const isLatest = device.firmware === 'v1.2.4'
  const history = getDeviceFirmwareHistory(device)
  return (
    <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-bold text-blue-950 dark:text-white">
        {t('detail.firmwareUpdates')}
      </h2>
      <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500">{t('detail.currentVersion')}</p>
          <p className="text-lg font-bold text-blue-950 dark:text-white">
            {device.firmware}
          </p>
          <p className="text-xs text-slate-500">
            {t('installedAt')}: {device.installedAt}
          </p>
        </div>
        <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
          {t('detail.stable')}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500">{t('detail.latestVersion')}</p>
          <p className="text-lg font-bold text-rose-600">v1.2.4</p>
          <p className="text-xs text-slate-500">{t('detail.demoRelease')}</p>
        </div>
        <span className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
          {t(isLatest ? 'detail.current' : 'detail.updateAvailable')}
        </span>
      </div>
      <h3 className="mt-5 text-sm font-semibold text-blue-950 dark:text-white">
        {t('detail.firmwareHistory')}
      </h3>
      <ol className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
        {history.map((event, index) => (
          <li
            key={`${event.version}-${event.updatedAt}-${index}`}
            className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
          >
            <div>
              <p className="font-semibold text-blue-950 dark:text-white">
                {event.version}
              </p>
              <p className="text-slate-500">
                {t(`detail.firmwareEvent.${event.kind}`)}
              </p>
            </div>
            <time dateTime={event.updatedAt} className="text-slate-500">
              {Number.isNaN(Date.parse(event.updatedAt))
                ? event.updatedAt
                : new Intl.DateTimeFormat(
                    i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US',
                    {
                      dateStyle: 'medium',
                      timeStyle: event.kind === 'updated' ? 'short' : undefined,
                    },
                  ).format(new Date(event.updatedAt))}
            </time>
          </li>
        ))}
      </ol>
    </section>
  )
}
