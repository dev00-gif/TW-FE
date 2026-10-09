import type { ModuleCode, PermissionActionCode } from '@/types/permission'

export interface ChildItem {
  id: string
  titleKey: string
  icon?: string
  url: string
  moduleCode?: ModuleCode
  permission?: PermissionActionCode
  badge?: string
  badgeKey?: 'pendingDispatch' | 'shipperTransfer'
}

export interface MenuItem {
  id: string
  titleKey: string
  icon: string
  url?: string
  children?: ChildItem[]
  moduleCode?: ModuleCode
  permission?: PermissionActionCode
}

const SidebarContent: MenuItem[] = [
  {
    id: 'dashboard',
    titleKey: 'sidebar.dashboard',
    icon: 'solar:widget-2-linear',
    url: '/dashboard',
    permission: 'integration.gateway.view',
  },
  {
    id: 'bulletins',
    titleKey: 'sidebar.bulletins',
    icon: 'solar:document-text-linear',
    url: '/dashboard/bulletins',
    permission: 'integration.gateway.view',
  },
  {
    id: 'schedules',
    titleKey: 'sidebar.schedules',
    icon: 'solar:calendar-date-linear',
    url: '/dashboard/schedules',
    permission: 'integration.gateway.view',
  },
  {
    id: 'devices',
    titleKey: 'sidebar.devices',
    icon: 'solar:monitor-linear',
    url: '/dashboard/devices',
    permission: 'integration.gateway.view',
  },
  {
    id: 'integration',
    titleKey: 'sidebar.integration',
    icon: 'solar:code-circle-linear',
    url: '/dashboard/integration',
    permission: 'integration.gateway.view',
  },
  {
    id: 'serviceConfigurations',
    titleKey: 'sidebar.serviceConfigurations',
    icon: 'solar:settings-linear',
    url: '/dashboard/integration/configurations',
    permission: 'integration.gateway.view',
  },
  {
    id: 'sourceData',
    titleKey: 'sidebar.sourceData',
    icon: 'solar:database-linear',
    url: '/dashboard/integration/data',
    permission: 'integration.gateway.view',
  },
  {
    id: 'notifications',
    titleKey: 'sidebar.notifications',
    icon: 'solar:bell-linear',
    url: '/dashboard/notifications',
    permission: 'integration.gateway.view',
  },
  {
    id: 'reports',
    titleKey: 'sidebar.reports',
    icon: 'solar:history-linear',
    url: '/dashboard/reports',
    permission: 'integration.gateway.view',
  },
  {
    id: 'locations',
    titleKey: 'sidebar.locations',
    icon: 'solar:map-point-linear',
    url: '/dashboard/locations',
    permission: 'dashboard.overview.view',
  },
  {
    id: 'media',
    titleKey: 'sidebar.media',
    icon: 'solar:gallery-linear',
    url: '/dashboard/media',
    permission: 'media.library.view',
  },
  {
    id: 'userList',
    titleKey: 'sidebar.userList',
    icon: 'solar:users-group-rounded-linear',
    url: '/dashboard/users',
    permission: 'user.user.view',
  },
  {
    id: 'rolePermissions',
    titleKey: 'sidebar.rolePermissions',
    icon: 'solar:shield-keyhole-linear',
    url: '/dashboard/users/roles',
    permission: 'user.role.view',
  },
  {
    id: 'auditLogs',
    titleKey: 'sidebar.auditLogs',
    icon: 'solar:history-linear',
    url: '/dashboard/audit-logs',
    permission: 'system.audit_log.view',
  },
  {
    id: 'settings',
    titleKey: 'sidebar.settings',
    icon: 'solar:settings-linear',
    url: '/dashboard/settings',
    permission: 'system.setting.view',
  },
]

export default SidebarContent
