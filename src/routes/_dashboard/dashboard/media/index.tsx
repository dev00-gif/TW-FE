import { createFileRoute } from '@tanstack/react-router'
import MediaPage from '@/features/admin/media/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/media/')({
  beforeLoad: ({ context }) =>
    requirePermission('media.library.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Media' }] }),
  component: MediaPage,
})
