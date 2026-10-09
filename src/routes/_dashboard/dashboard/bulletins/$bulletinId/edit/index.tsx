import { createFileRoute } from '@tanstack/react-router'
import BulletinFormPage from '@/features/admin/bulletins/pages/form'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute(
  '/_dashboard/dashboard/bulletins/$bulletinId/edit/',
)({
  beforeLoad: ({ context }) =>
    requirePermission('dashboard.overview.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Sửa bản tin | SOMICS' }] }),
  component: () => (
    <BulletinFormPage bulletinId={Route.useParams().bulletinId} />
  ),
})
