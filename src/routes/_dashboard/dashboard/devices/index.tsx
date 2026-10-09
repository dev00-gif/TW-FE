import { createFileRoute } from '@tanstack/react-router'
import { DevicesPage } from '@/features/information-source/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/devices/')({
  beforeLoad: ({ context }) =>
    requirePermission('integration.gateway.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Thiết bị | SOMICS' }] }),
  component: DevicesPage,
})
