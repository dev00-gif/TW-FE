import { createFileRoute } from '@tanstack/react-router'
import { ServiceConfigurationsPage } from '@/features/information-source/crud-pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute(
  '/_dashboard/dashboard/integration/configurations',
)({
  beforeLoad: ({ context }) =>
    requirePermission('integration.gateway.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Cấu hình dịch vụ | SOMICS' }] }),
  component: ServiceConfigurationsPage,
})
