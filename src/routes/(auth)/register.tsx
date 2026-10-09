import { createFileRoute, redirect } from '@tanstack/react-router'
import RegisterPage from '@/features/auth/pages/register/index.tsx'
import { getMe } from '@/features/auth/hooks/useAuth'
import { getAuthenticatedRedirect } from '@/features/auth/utils/authRedirect'

export const Route = createFileRoute('/(auth)/register')({
  head: () => ({ meta: [{ title: 'Đăng ký' }] }),
  ssr: false,
  loader: async ({ context }) => {
    const user = await getMe(context.queryClient)
    if (user) {
      throw redirect({
        to: getAuthenticatedRedirect(user),
      })
    }
    return null
  },
  component: RegisterPage,
})
