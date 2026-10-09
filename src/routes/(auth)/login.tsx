import { createFileRoute, redirect } from '@tanstack/react-router'
import LoginPage from '@/features/auth/pages/login/index.tsx'
import { getAuthenticatedRedirect } from '@/features/auth/utils/authRedirect'
import { getMe } from '@/features/auth/hooks/useAuth'

export const Route = createFileRoute('/(auth)/login')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Đăng nhập' }] }),
  loader: async ({ context }) => {
    const user = await getMe(context.queryClient)
    if (user) {
      throw redirect({
        to: getAuthenticatedRedirect(user),
      })
    }
    return null
  },
  component: LoginPage,
})
