import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '@/features/admin/settings/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/settings/')({
  beforeLoad: ({ context }) =>
    requirePermission('system.setting.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Cài đặt hệ thống' }] }),
  component: SettingsPage,
})
