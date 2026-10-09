import { createFileRoute } from '@tanstack/react-router'
import BulletinDetailPage from '@/features/admin/bulletins/pages/detail'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute(
  '/_dashboard/dashboard/bulletins/$bulletinId/',
)({
  beforeLoad: ({ context }) =>
    requirePermission('dashboard.overview.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Chi tiết bản tin | SOMICS' }] }),
  component: () => (
    <BulletinDetailPage bulletinId={Route.useParams().bulletinId} />
  ),
})
