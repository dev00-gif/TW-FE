import { createFileRoute } from '@tanstack/react-router'
import { OverviewPage } from '@/features/information-source/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/')({
  beforeLoad: ({ context }) =>
    requirePermission('integration.gateway.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Tổng quan | SOMICS' }] }),
  component: OverviewPage,
})
