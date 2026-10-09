import { createFileRoute } from '@tanstack/react-router'
import { SchedulesPage } from '@/features/information-source/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/schedules/')({
  beforeLoad: ({ context }) =>
    requirePermission('integration.gateway.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Lịch phát | SOMICS' }] }),
  component: SchedulesPage,
})
