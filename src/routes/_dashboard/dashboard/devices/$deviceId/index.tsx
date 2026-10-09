import { createFileRoute } from '@tanstack/react-router'
import { DeviceDetailPage } from '@/features/information-source/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute(
  '/_dashboard/dashboard/devices/$deviceId/',
)({
  beforeLoad: ({ context }) =>
    requirePermission('integration.gateway.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Chi tiết thiết bị | SOMICS' }] }),
  component: () => <DeviceDetailPage deviceId={Route.useParams().deviceId} />,
})
