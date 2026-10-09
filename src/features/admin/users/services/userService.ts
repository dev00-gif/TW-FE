import { api } from '@/lib/apiClient'
import type {
  AdminRoleManagement,
  AdminUserDetail,
  AdminUserProfile,
  AdminUserProfileInput,
  AdminUserListInput,
  AdminUserListResult,
  AdminUserStats,
} from '../types'

type RoleInput = {
  name: string
  code: string
  description?: string
  canAccessDashboard: boolean
  permissionCodes: string[]
}

export const adminUserService = {
  list: (input: AdminUserListInput) =>
    api.get<AdminUserListResult>('/users', input),
  stats: () => api.get<AdminUserStats>('/users/stats'),
  create: (input: {
    fullName: string
    email: string
    phone?: string
    password: string
  }) => api.post('/users', input),
  updateStatus: ({
    id,
    status,
  }: {
    id: string
    status: 'active' | 'blocked'
  }) => api.patch(`/users/${id}/status`, { status }),
  bulkUpdateStatus: ({
    ids,
    status,
  }: {
    ids: string[]
    status: 'active' | 'blocked'
  }) => api.patch('/users/status/bulk', { ids, status }),
  detail: (id: string) => api.get<AdminUserDetail>(`/users/${id}`),
  profile: (id: string) => api.get<AdminUserProfile>(`/users/${id}/profile`),
  createProfile: ({ id, ...input }: AdminUserProfileInput & { id: string }) =>
    api.post(`/users/${id}/profile`, input),
  updateProfile: ({ id, ...input }: AdminUserProfileInput & { id: string }) =>
    api.put(`/users/${id}/profile`, input),
  updateRoles: ({ id, roleCodes }: { id: string; roleCodes: string[] }) =>
    api.put(`/users/${id}/roles`, { roleCodes }),
  roleManagement: async (): Promise<AdminRoleManagement> => {
    const result = await api.get<AdminRoleManagement>('/roles')
    return {
      ...result,
      roles: result.roles.map((role) => ({
        ...role,
        users: role.users.map((user) => ({
          ...user,
          name: user.name ?? user.email,
          avatarUrl: user.avatarUrl ?? null,
        })),
      })),
    }
  },
  createRole: (input: RoleInput) => api.post('/roles', input),
  updateRole: ({ id, ...input }: RoleInput & { id: string }) =>
    api.put(`/roles/${id}`, input),
  deleteRole: (id: string) => api.delete(`/roles/${id}`),
}

export type ListAdminUsersInput = Record<string, never>
