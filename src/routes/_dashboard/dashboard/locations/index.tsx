import { createFileRoute } from '@tanstack/react-router'
import LocationsPage from '@/features/admin/locations/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/locations/')({
  beforeLoad: ({ context }) =>
    requirePermission('dashboard.overview.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Quản lý địa bàn | SOMICS' }] }),
  component: LocationsPage,
})
