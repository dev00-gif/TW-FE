import { createFileRoute } from '@tanstack/react-router'
import BulletinCategoriesPage from '@/features/admin/bulletins/pages/categories'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute(
  '/_dashboard/dashboard/bulletins/categories/',
)({
  beforeLoad: ({ context }) =>
    requirePermission('dashboard.overview.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Danh mục bản tin | SOMICS' }] }),
  component: BulletinCategoriesPage,
})
