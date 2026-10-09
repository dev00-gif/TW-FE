import { createUuid } from '@/utils/uuid'
import { slugify } from '@/utils/utils'
import type { BulletinCategory } from '../types'
import { bulletinService } from './bulletinService'

const STORAGE_KEY = 'somics-demo-bulletin-categories'

export const initialBulletinCategories: BulletinCategory[] = [
  {
    id: 'bulletin-category-1',
    name: 'Thời sự',
    slug: 'thoi-su',
    description: 'Tin tức và thời sự địa phương',
    parentId: null,
  },
  {
    id: 'bulletin-category-2',
    name: 'Cảnh báo',
    slug: 'canh-bao',
    description: 'Cảnh báo thời tiết và an toàn',
    parentId: null,
  },
  {
    id: 'bulletin-category-3',
    name: 'Khẩn cấp',
    slug: 'khan-cap',
    description: 'Thông tin cần phát khẩn cấp',
    parentId: null,
  },
  {
    id: 'bulletin-category-4',
    name: 'Tuyên truyền',
    slug: 'tuyen-truyen',
    description: 'Thông tin tuyên truyền cộng đồng',
    parentId: null,
  },
  {
    id: 'bulletin-category-5',
    name: 'Thông báo',
    slug: 'thong-bao',
    description: 'Thông báo hành chính',
    parentId: null,
  },
]

function readCategories(): BulletinCategory[] {
  if (typeof sessionStorage === 'undefined') return initialBulletinCategories
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return initialBulletinCategories
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed)
      ? (parsed as BulletinCategory[])
      : initialBulletinCategories
  } catch {
    return initialBulletinCategories
  }
}

function writeCategories(categories: BulletinCategory[]) {
  if (typeof sessionStorage !== 'undefined')
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
}

export const bulletinCategoryService = {
  list() {
    return readCategories()
  },
  async save(input: {
    id?: string
    name: string
    slug?: string
    description: string
    parentId: string | null
  }) {
    const categories = readCategories()
    const name = input.name.trim()
    const slug = slugify(input.slug?.trim() || name)
    if (!name || !slug) throw new Error('categoryNameRequired')
    if (
      categories.some(
        (category) => category.slug === slug && category.id !== input.id,
      )
    )
      throw new Error('categorySlugExists')
    if (
      input.parentId &&
      !categories.some((category) => category.id === input.parentId)
    )
      throw new Error('categoryParentNotFound')
    if (input.id && !categories.some((category) => category.id === input.id))
      throw new Error('categoryNotFound')
    let ancestor = input.parentId
    while (ancestor) {
      if (ancestor === input.id) throw new Error('categoryCycle')
      ancestor =
        categories.find((category) => category.id === ancestor)?.parentId ??
        null
    }
    const category: BulletinCategory = {
      id: input.id ?? createUuid(),
      name,
      slug,
      description: input.description.trim(),
      parentId: input.parentId,
    }
    writeCategories(
      input.id
        ? categories.map((current) =>
            current.id === input.id ? category : current,
          )
        : [...categories, category],
    )
    return category
  },
  async delete(id: string) {
    const categories = readCategories()
    if (!categories.some((category) => category.id === id))
      throw new Error('categoryNotFound')
    if (categories.some((category) => category.parentId === id))
      throw new Error('categoryHasChildren')
    if (bulletinService.all().some((item) => item.categoryIds?.includes(id)))
      throw new Error('categoryInUse')
    writeCategories(categories.filter((category) => category.id !== id))
  },
}
