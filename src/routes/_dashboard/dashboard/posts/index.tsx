import { createFileRoute } from '@tanstack/react-router'
import PostsPage from '@/features/admin/posts/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/posts/')({
  beforeLoad: ({ context }) =>
    requirePermission('post.post.view', context.queryClient),
  head: () => ({ meta: [{ title: 'Bài viết' }] }),
  component: PostsPage,
})
