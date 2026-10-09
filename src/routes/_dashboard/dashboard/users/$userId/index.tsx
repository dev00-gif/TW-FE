import { createFileRoute } from '@tanstack/react-router'
import AdminUserDetailPage from '@/features/admin/users/pages/detail'
import { requireUserDetailAccess } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/users/$userId/')({
  beforeLoad: ({ params, context }) =>
    requireUserDetailAccess(params.userId, context.queryClient),
  head: () => ({ meta: [{ title: 'Chi tiết người dùng' }] }),
  component: () => <AdminUserDetailPage userId={Route.useParams().userId} />,
})
