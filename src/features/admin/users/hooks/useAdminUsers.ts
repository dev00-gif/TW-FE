import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authQueryKeys } from '@/features/auth/hooks/useAuth'
import type { User } from '@/features/auth/types/auth'
import { adminUserService } from '../services/userService'
import type { AdminUserListInput } from '../types'

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (input: AdminUserListInput) =>
    [...adminUserKeys.lists(), input] as const,
  stats: () => [...adminUserKeys.all, 'stats'] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminUserKeys.details(), id] as const,
  profile: (id: string) => [...adminUserKeys.detail(id), 'profile'] as const,
  roleManagement: () => [...adminUserKeys.all, 'role-management'] as const,
}

export function useAdminUsers(input: AdminUserListInput) {
  return useQuery({
    queryKey: adminUserKeys.list(input),
    queryFn: () => adminUserService.list(input),
    placeholderData: (previous) => previous,
  })
}

export function useAdminUserStats() {
  return useQuery({
    queryKey: adminUserKeys.stats(),
    queryFn: adminUserService.stats,
  })
}

export function useAdminUserDetail(id: string) {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: () => adminUserService.detail(id),
  })
}

export function useAdminUserProfile(id: string) {
  return useQuery({
    queryKey: adminUserKeys.profile(id),
    queryFn: () => adminUserService.profile(id),
    retry: false,
  })
}

export function useAdminRoleManagement() {
  return useQuery({
    queryKey: adminUserKeys.roleManagement(),
    queryFn: adminUserService.roleManagement,
  })
}

export function useAdminUserMutations() {
  const queryClient = useQueryClient()
  const invalidateLists = () =>
    queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
  const invalidateStats = () =>
    queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() })
  const invalidateRoleManagement = () =>
    queryClient.invalidateQueries({ queryKey: adminUserKeys.roleManagement() })
  const invalidateAuth = () =>
    queryClient.invalidateQueries({ queryKey: authQueryKeys.me() })
  const invalidateOwnAuth = (id: string) => {
    const currentUser = queryClient.getQueryData<User | null>(
      authQueryKeys.me(),
    )
    return currentUser?.id === id ? invalidateAuth() : Promise.resolve()
  }
  const invalidateUser = (id: string) =>
    Promise.all([
      invalidateLists(),
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) }),
      invalidateOwnAuth(id),
    ])
  const invalidateRoles = () =>
    Promise.all([
      invalidateRoleManagement(),
      invalidateLists(),
      invalidateStats(),
      queryClient.invalidateQueries({ queryKey: adminUserKeys.details() }),
      invalidateAuth(),
    ])
  const invalidateListAndStats = () =>
    Promise.all([invalidateLists(), invalidateStats()])
  const invalidateStatus = (ids: string[]) =>
    Promise.all([
      invalidateListAndStats(),
      ...ids.map((id) =>
        queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) }),
      ),
      ...ids.map(invalidateOwnAuth),
    ])
  return {
    create: useMutation({
      mutationFn: adminUserService.create,
      onSuccess: invalidateListAndStats,
    }),
    updateStatus: useMutation({
      mutationFn: adminUserService.updateStatus,
      onSuccess: (_result, input) => invalidateStatus([input.id]),
    }),
    bulkUpdateStatus: useMutation({
      mutationFn: adminUserService.bulkUpdateStatus,
      onSuccess: (_result, input) => invalidateStatus(input.ids),
    }),
    createProfile: useMutation({
      mutationFn: adminUserService.createProfile,
      onSuccess: (_result, input) => invalidateUser(input.id),
    }),
    updateProfile: useMutation({
      mutationFn: adminUserService.updateProfile,
      onSuccess: (_result, input) => invalidateUser(input.id),
    }),
    updateRoles: useMutation({
      mutationFn: adminUserService.updateRoles,
      onSuccess: (_result, input) =>
        Promise.all([
          invalidateUser(input.id),
          invalidateRoleManagement(),
          invalidateStats(),
        ]),
    }),
    createRole: useMutation({
      mutationFn: adminUserService.createRole,
      onSuccess: () =>
        Promise.all([invalidateRoleManagement(), invalidateStats()]),
    }),
    updateRole: useMutation({
      mutationFn: adminUserService.updateRole,
      onSuccess: invalidateRoles,
    }),
    deleteRole: useMutation({
      mutationFn: adminUserService.deleteRole,
      onSuccess: invalidateRoles,
    }),
  }
}
