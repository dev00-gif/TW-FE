import { createFileRoute } from '@tanstack/react-router'
import NewPostPage from '@/features/admin/posts/pages/new'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute(
  '/_dashboard/dashboard/posts/$postId/edit/',
)({
  beforeLoad: ({ context }) =>
    requirePermission('post.post.update', context.queryClient),
  head: () => ({ meta: [{ title: 'Chỉnh sửa bài viết' }] }),
  component: () => <NewPostPage postId={Route.useParams().postId} />,
})
