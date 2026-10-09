import { createFileRoute } from '@tanstack/react-router'
import BulletinFormPage from '@/features/admin/bulletins/pages/form'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/bulletins/new/')({
  beforeLoad: ({ context }) =>
    requirePermission('dashboard.overview.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Tạo bản tin | SOMICS' }] }),
  component: BulletinFormPage,
})
