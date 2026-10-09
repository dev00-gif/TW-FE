import { redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { PermissionActionCode } from '@/types/permission'
import { getMe } from '../hooks/useAuth'

export async function requirePermission(
  permission: PermissionActionCode,
  queryClient: QueryClient,
) {
  const user = await getMe(queryClient)

  if (!user) throw redirect({ to: '/login' })
  if (user.isSuperAdmin || user.permissionCodes.includes(permission)) return

  throw redirect({ to: '/dashboard/forbidden' })
}

export async function requireUserDetailAccess(
  userId: string,
  queryClient: QueryClient,
) {
  const user = await getMe(queryClient)

  if (!user) throw redirect({ to: '/login' })
  if (
    user.id === userId ||
    user.isSuperAdmin ||
    user.permissionCodes.includes('user.user.view')
  )
    return

  throw redirect({ to: '/dashboard/forbidden' })
}
