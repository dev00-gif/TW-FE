import { createFileRoute } from '@tanstack/react-router'
import AdminUsersPage from '@/features/admin/users/pages/list'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/users/')({
  beforeLoad: ({ context }) =>
    requirePermission('user.user.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Quản lý người dùng' }] }),
  component: AdminUsersPage,
})
