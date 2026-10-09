import { api } from '@/lib/apiClient'

export type ListPostsInput = {
  search?: string
  status?: 'DRAFT' | 'PUBLISHED'
  categoryId?: string
  authorId?: string
  page?: number
  limit?: number
}
export type ListPostCategoriesInput = { search?: string }
export type CreatePostInput = {
  title: string
  slug?: string
  excerpt?: string
  content?: string
  status?: 'DRAFT' | 'PUBLISHED'
  visibility?: 'PUBLIC' | 'PRIVATE'
  featuredImage?: string
  metaVideoUrl?: string
  categoryIds?: string[]
}
export type UpdatePostInput = CreatePostInput & { id: string }
export type CreatePostCategoryInput = {
  name: string
  slug?: string
  description?: string
  imageUrl?: string
  parentId?: string | null
}
export type UpdatePostCategoryInput = Partial<CreatePostCategoryInput> & {
  id: string
}
type ListResult<T> = {
  items: T[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
type PostTaxonomyLink = {
  categoryId: string
  category: { id: string; name: string; slug: string }
}
type PostMeta = { metaKey: string; metaValue: unknown }
type PostRecord = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  status: 'DRAFT' | 'PUBLISHED'
  visibility: 'PUBLIC' | 'PRIVATE'
  featuredImage: string | null
  updatedAt: string
  categories: PostTaxonomyLink[]
  metas: PostMeta[]
}
type PostCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  parentId?: string | null
  parent?: { id: string; name: string } | null
  _count?: { posts: number }
}

export const postService = {
  list: (input: ListPostsInput) =>
    api.get<ListResult<PostRecord>>('/posts', input),
  detail: (id: string) => api.get<PostRecord>(`/posts/${id}`),
  create: (input: CreatePostInput) => api.post('/posts', input),
  update: ({ id, ...input }: UpdatePostInput) => api.put(`/posts/${id}`, input),
  categories: (input: ListPostCategoriesInput) =>
    api.get<PostCategory[]>('/posts/categories', input),
  createCategory: (input: CreatePostCategoryInput) =>
    api.post('/posts/categories', input),
  updateCategory: ({ id, ...input }: UpdatePostCategoryInput) =>
    api.put(`/posts/categories/${id}`, input),
  deleteCategory: (id: string) => api.delete(`/posts/categories/${id}`),
}
