// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import {
  bulletinCategoryService,
  initialBulletinCategories,
} from './bulletinCategoryService'
import { bulletinService } from './bulletinService'

describe('bulletin categories', () => {
  beforeEach(() => sessionStorage.clear())

  it('lists seeded categories and saves new and edited categories', async () => {
    expect(bulletinCategoryService.list()).toHaveLength(5)
    const created = await bulletinCategoryService.save({
      name: 'Sức khỏe cộng đồng',
      description: 'Thông tin y tế',
      parentId: initialBulletinCategories[0].id,
    })
    expect(created.slug).toBe('suc-khoe-cong-dong')
    expect(bulletinCategoryService.list()).toContainEqual(created)

    await bulletinCategoryService.save({ ...created, name: 'Sức khỏe' })
    expect(
      bulletinCategoryService
        .list()
        .find((category) => category.id === created.id)?.name,
    ).toBe('Sức khỏe')
    await bulletinCategoryService.delete(created.id)
    expect(bulletinCategoryService.list()).not.toContainEqual(created)
  })

  it('rejects duplicate slugs, category cycles and deletion of in-use categories', async () => {
    await expect(
      bulletinCategoryService.save({
        name: 'Thời sự',
        description: '',
        parentId: null,
      }),
    ).rejects.toThrow('categorySlugExists')
    const child = await bulletinCategoryService.save({
      name: 'Danh mục con',
      description: '',
      parentId: initialBulletinCategories[0].id,
    })
    await expect(
      bulletinCategoryService.save({
        ...initialBulletinCategories[0],
        parentId: child.id,
      }),
    ).rejects.toThrow('categoryCycle')
    await expect(
      bulletinCategoryService.delete(initialBulletinCategories[0].id),
    ).rejects.toThrow('categoryHasChildren')
    await bulletinCategoryService.delete(child.id)
    expect(
      bulletinService
        .all()
        .some((bulletin) =>
          bulletin.categoryIds?.includes(initialBulletinCategories[0].id),
        ),
    ).toBe(true)
    await expect(
      bulletinCategoryService.delete(initialBulletinCategories[0].id),
    ).rejects.toThrow('categoryInUse')
  })
})
