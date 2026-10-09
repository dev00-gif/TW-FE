import { createFileRoute } from '@tanstack/react-router'
import { LogsPage } from '@/features/information-source/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/reports/')({
  beforeLoad: ({ context }) =>
    requirePermission('integration.gateway.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Nhật ký API | SOMICS' }] }),
  component: LogsPage,
})
