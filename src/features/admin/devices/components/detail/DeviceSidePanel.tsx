import { useState } from 'react'
import { BellRing, RotateCcw, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Switch } from '@/components/ui/switch'

export function DeviceSidePanel() {
  const { t } = useTranslation('adminDevices')
  const [mode, setMode] = useState('automatic')
  const [emergency, setEmergency] = useState(true)
  const [sync, setSync] = useState(true)
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-bold text-blue-950 dark:text-white">
        {t('detail.quickConfiguration')}
      </h2>
      <div className="mt-3 space-y-4 text-sm">
        <label className="flex flex-wrap items-center gap-2">
          <Settings2 className="size-4 text-blue-600" />
          <span className="min-w-0 flex-1">{t('detail.operatingMode')}</span>
          <select
            className="max-w-40 rounded-md border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="automatic">{t('detail.automatic')}</option>
            <option value="manual">{t('detail.manual')}</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <BellRing className="size-4 text-blue-600" />
          <span className="flex-1">{t('detail.allowEmergency')}</span>
          <Switch checked={emergency} onCheckedChange={setEmergency} />
        </label>
        <label className="flex items-center gap-2">
          <RotateCcw className="size-4 text-blue-600" />
          <span className="flex-1">{t('detail.autoSync')}</span>
          <Switch checked={sync} onCheckedChange={setSync} />
        </label>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        {t('detail.demoConfigNotice')}
      </p>
    </section>
  )
}
