import { useTranslation } from 'react-i18next'
import { useTerritory } from './useTerritory'

export function TerritoryNotice() {
  const { t } = useTranslation('adminUsers')
  const { access, pending, error } = useTerritory()
  return (
    <p
      role={error ? 'alert' : 'status'}
      className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
    >
      {pending
        ? t('loading')
        : error
          ? t('territory.loadFailed')
          : access.hasFullAccess
            ? t('territory.allAccess')
            : access.scopes.length
              ? t('territory.accessSummary', {
                  names: access.scopes.map((scope) => scope.name).join(', '),
                })
              : t('territory.noAccess')}
    </p>
  )
}
