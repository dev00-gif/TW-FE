import { createFileRoute } from '@tanstack/react-router'
import { BusinessDataPage } from '@/features/information-source/crud-pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/integration/data')({
  beforeLoad: ({ context }) =>
    requirePermission('integration.gateway.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Dữ liệu nghiệp vụ | SOMICS' }] }),
  validateSearch: (search: Record<string, unknown>): { kind?: string } => ({
    kind: typeof search.kind === 'string' ? search.kind : undefined,
  }),
  component: BusinessDataPage,
})
