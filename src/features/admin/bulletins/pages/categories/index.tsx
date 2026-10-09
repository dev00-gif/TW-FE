import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { slugify } from '@/utils/utils'
import {
  useBulletinCategories,
  useDeleteBulletinCategory,
  useSaveBulletinCategory,
} from '../../hooks/useBulletins'
import { bulletinService } from '../../services/bulletinService'
import type { BulletinCategory } from '../../types'

type CategoryForm = Pick<
  BulletinCategory,
  'name' | 'slug' | 'description' | 'parentId'
>
const emptyForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  parentId: null,
}

export default function BulletinCategoriesPage() {
  const { t } = useTranslation('adminBulletins')
  const query = useBulletinCategories()
  const save = useSaveBulletinCategory()
  const remove = useDeleteBulletinCategory()
  const [editingId, setEditingId] = useState<string | undefined>()
  const [form, setForm] = useState<CategoryForm>(emptyForm)
  const [slugEdited, setSlugEdited] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const categories = query.data ?? []
  const bulletinCounts = useMemo(() => {
    const counts = new Map<string, number>()
    bulletinService
      .all()
      .forEach((bulletin) =>
        bulletin.categoryIds?.forEach((id) =>
          counts.set(id, (counts.get(id) ?? 0) + 1),
        ),
      )
    return counts
  }, [])
  const filtered = categories.filter((category) =>
    `${category.name} ${category.slug}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  )
  const reset = () => {
    setEditingId(undefined)
    setForm(emptyForm)
    setSlugEdited(false)
    setError('')
  }
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await save.mutateAsync({ ...form, id: editingId })
      reset()
    } catch (cause) {
      setError(
        cause instanceof Error
          ? t(cause.message, { defaultValue: t('categorySaveError') })
          : t('categorySaveError'),
      )
    }
  }
  const deleteCategory = async (category: BulletinCategory) => {
    if (!window.confirm(t('categoryDeleteConfirm', { name: category.name })))
      return
    try {
      setError('')
      await remove.mutateAsync(category.id)
      if (editingId === category.id) reset()
    } catch (cause) {
      setError(
        cause instanceof Error
          ? t(cause.message, { defaultValue: t('categoryDeleteError') })
          : t('categoryDeleteError'),
      )
    }
  }

  return (
    <div className="space-y-5 pb-8">
      <div>
        <nav
          className="mb-2 flex items-center gap-2 text-xs text-slate-500"
          aria-label={t('breadcrumb')}
        >
          <Link to="/dashboard/bulletins" className="hover:text-blue-600">
            {t('breadcrumb')}
          </Link>
          <span>›</span>
          <span>{t('categories')}</span>
        </nav>
        <h1 className="text-2xl font-bold text-blue-950 dark:text-white">
          {t('categories')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('categoryDescription')}
        </p>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(280px,3fr)_minmax(0,7fr)]">
        <form
          onSubmit={(event) => void submit(event)}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="text-base font-semibold text-blue-950 dark:text-white">
            {t(editingId ? 'editCategory' : 'newCategory')}
          </h2>
          <label className="block space-y-1.5 text-sm">
            <span>{t('categoryName')} *</span>
            <Input
              required
              value={form.name}
              onChange={(event) => {
                const name = event.target.value
                setForm((current) => ({
                  ...current,
                  name,
                  slug: slugEdited ? current.slug : slugify(name),
                }))
              }}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span>{t('categorySlug')} *</span>
            <Input
              required
              value={form.slug}
              onChange={(event) => {
                setSlugEdited(true)
                setForm((current) => ({
                  ...current,
                  slug: slugify(event.target.value),
                }))
              }}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span>{t('parentCategory')}</span>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
              value={form.parentId ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  parentId: event.target.value || null,
                }))
              }
            >
              <option value="">{t('rootCategory')}</option>
              {categories
                .filter((category) => category.id !== editingId)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span>{t('categoryDescriptionLabel')}</span>
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="min-h-24"
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending}>
              {t(editingId ? 'save' : 'newCategory')}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={reset}>
                {t('cancel')}
              </Button>
            )}
          </div>
        </form>
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
            <h2 className="font-semibold text-blue-950 dark:text-white">
              {t('categoryList')} ({categories.length})
            </h2>
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 dark:border-slate-700">
              <Search className="size-4 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('categorySearch')}
                className="h-8 border-0 px-0 shadow-none"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3">{t('categoryName')}</th>
                  <th className="px-4 py-3">{t('parentCategory')}</th>
                  <th className="px-4 py-3">{t('categoryDescriptionLabel')}</th>
                  <th className="px-4 py-3">{t('bulletinCount')}</th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((category) => (
                  <tr
                    key={category.id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-700">
                        {category.name}
                      </span>
                      <span className="block text-xs text-slate-400">
                        /{category.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {categories.find(
                        (parent) => parent.id === category.parentId,
                      )?.name ?? t('rootCategory')}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-500">
                      {category.description || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {bulletinCounts.get(category.id) ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={t('editCategory')}
                          onClick={() => {
                            setEditingId(category.id)
                            setForm({
                              name: category.name,
                              slug: category.slug,
                              description: category.description,
                              parentId: category.parentId,
                            })
                            setSlugEdited(true)
                            setError('')
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={t('deleteCategory')}
                          disabled={remove.isPending}
                          onClick={() => void deleteCategory(category)}
                        >
                          <Trash2 className="size-4 text-rose-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <p className="p-8 text-center text-sm text-slate-500">
                {t('emptyCategories')}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
