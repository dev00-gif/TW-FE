/** Single source of truth for module identifiers shared by permissions and audit logs. */
export const MODULE_CATALOG = {
  integration: { name: 'Thông tin nguồn', resources: ['gateway'] },
  device: { name: 'Thiết bị', resources: ['device'] },
  broadcast: { name: 'Lịch phát', resources: ['schedule'] },
  dashboard: { name: 'Dashboard', resources: ['overview'] },
  media: { name: 'Media', resources: ['library'] },
  post: {
    name: 'Bài viết',
    resources: ['post', 'post_category'],
  },
  appearance: { name: 'Giao diện', resources: ['menu'] },
  user: { name: 'Người dùng', resources: ['user', 'role'] },
  system: { name: 'Hệ thống', resources: ['setting', 'audit_log'] },
} as const

export type ModuleCode = keyof typeof MODULE_CATALOG
export type ModuleResource<TModule extends ModuleCode = ModuleCode> =
  (typeof MODULE_CATALOG)[TModule]['resources'][number]
