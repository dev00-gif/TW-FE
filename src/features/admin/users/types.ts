export type AdminPermission = {
  id: string
  code: string
  module: string
  resource: string
  action: 'view' | 'create' | 'update' | 'delete' | 'approve'
  name: string
  description?: string | null
}

export type AdminManagedRole = {
  id: string
  code: string
  name: string
  description?: string | null
  canAccessDashboard: boolean
  isSystem: boolean
  userCount: number
  permissionCount: number
  permissionCodes: string[]
  users: Array<{
    id: string
    email: string
    name?: string
    avatarUrl?: string | null
  }>
}

export type AdminRoleManagement = {
  stats: {
    roles: number
    users: number
    permissions: number
    customRoles: number
  }
  permissions: AdminPermission[]
  roles: AdminManagedRole[]
}

export type AdminUserDetail = {
  id: string
  email?: string | null
  phone?: string | null
  authProvider: string
  status: string
  roleCodes: string[]
  permissionCodes: string[]
  isSuperAdmin: boolean
  createdAt: string
  updatedAt: string
}

export type AdminUserProfile = {
  id: string
  userId: string
  fullName: string
  avatarUrl?: string | null
  vehicleType?: 'bike' | 'electric_bike' | 'car' | null
  address?: string | null
  workingCity?: string | null
  createdAt: string
  updatedAt: string
}

export type AdminUserProfileInput = {
  fullName: string
  avatarUrl?: string
  vehicleType?: 'bike' | 'electric_bike' | 'car'
  address?: string
  workingCity?: string
}

export type AdminUserListInput = {
  search?: string
  status?: 'active' | 'blocked' | 'unverified'
  role?: string
  dateFrom?: string
  dateTo?: string
  page: number
  limit: number
}

export type AdminUserListItem = {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatarUrl: string | null
  roleCodes: string[]
  status: 'active' | 'blocked' | 'unverified'
  authProvider: string
  createdAt: string
}

export type AdminUserListResult = {
  items: AdminUserListItem[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export type AdminUserStats = {
  total: number
  active: number
  blocked: number
  unverified: number
  newUsers: number
  roles: Record<string, number>
}
