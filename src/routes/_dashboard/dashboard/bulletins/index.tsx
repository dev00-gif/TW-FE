import { createFileRoute } from '@tanstack/react-router'
import { BulletinsPage } from '@/features/information-source/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/bulletins/')({
  beforeLoad: ({ context }) =>
    requirePermission('integration.gateway.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Bản tin | SOMICS' }] }),
  component: BulletinsPage,
})
