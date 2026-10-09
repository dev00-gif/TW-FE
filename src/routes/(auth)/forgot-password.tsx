import { createFileRoute, redirect } from '@tanstack/react-router'
import ForgotPasswordPage from '@/features/auth/pages/forgot-password/index.tsx'
import { getMe } from '@/features/auth/hooks/useAuth'
import { getAuthenticatedRedirect } from '@/features/auth/utils/authRedirect'

export const Route = createFileRoute('/(auth)/forgot-password')({
  head: () => ({ meta: [{ title: 'Quên mật khẩu' }] }),
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
  component: ForgotPasswordPage,
})
