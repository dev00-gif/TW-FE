import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/information-source/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/notifications/')({
  beforeLoad: ({ context }) =>
    requirePermission('integration.gateway.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Thông báo | SOMICS' }] }),
  component: NotificationsPage,
})
