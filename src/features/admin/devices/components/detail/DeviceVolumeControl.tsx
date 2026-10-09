import { Volume2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function DeviceVolumeControl({
  value,
  onChange,
}: {
  value: number
  onChange: (volume: number) => void
}) {
  const { t } = useTranslation('adminDevices')
  return (
    <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-bold text-blue-950 dark:text-white">
        {t('detail.volume')}
      </h2>
      <label className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <Volume2 className="size-5 text-blue-600" />
        <input
          type="range"
          aria-label={t('detail.volume')}
          min="0"
          max="100"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 accent-blue-600"
        />
        <strong className="min-w-10 text-right text-blue-950 dark:text-white">
          {value}%
        </strong>
      </label>
      <p className="mt-3 text-xs text-slate-500">
        {t('detail.demoConfigNotice')}
      </p>
    </section>
  )
}
