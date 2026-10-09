import { createFileRoute } from '@tanstack/react-router'
import PostCategoriesPage from '@/features/admin/posts/pages/categories'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/posts/categories/')(
  {
    beforeLoad: ({ context }) =>
      requirePermission('post.post_category.view', context.queryClient),
    head: () => ({ meta: [{ title: 'Danh mục bài viết' }] }),
    component: PostCategoriesPage,
  },
)
