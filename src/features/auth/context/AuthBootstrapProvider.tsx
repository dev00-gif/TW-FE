import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authQueryKeys, useMe } from '../hooks/useAuth'

export function AuthBootstrapProvider({
  children,
}: {
  children: ReactNode
}) {
  const queryClient = useQueryClient()
  useMe()

  useEffect(() => {
    const clearAuth = () => {
      queryClient.clear()
      queryClient.setQueryData(authQueryKeys.me(), null)
    }
    window.addEventListener('logout', clearAuth)
    return () => window.removeEventListener('logout', clearAuth)
  }, [queryClient])

  return children
}
