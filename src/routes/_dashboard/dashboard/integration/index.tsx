import { createFileRoute } from '@tanstack/react-router'
import { ServicesPage } from '@/features/information-source/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/integration/')({
  beforeLoad: ({ context }) =>
    requirePermission('integration.gateway.view', context.queryClient),
  head: () => ({ meta: [{ title: '20 dịch vụ API | SOMICS' }] }),
  validateSearch: (search: Record<string, unknown>): { service?: string } => ({
    service: typeof search.service === 'string' ? search.service : undefined,
  }),
  component: ServicesPage,
})
