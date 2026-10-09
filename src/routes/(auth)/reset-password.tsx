import { createFileRoute, redirect } from '@tanstack/react-router'
import ResetPasswordPage from '@/features/auth/pages/reset-password/index.tsx'
import { getMe } from '@/features/auth/hooks/useAuth'
import { getAuthenticatedRedirect } from '@/features/auth/utils/authRedirect'

export const Route = createFileRoute('/(auth)/reset-password')({
  head: () => ({ meta: [{ title: 'Đặt lại mật khẩu' }] }),
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  loader: async ({ context }) => {
    const user = await getMe(context.queryClient)
    if (user) {
      throw redirect({
        to: getAuthenticatedRedirect(user),
      })
    }
    return null
  },
  component: ResetPasswordPage,
})
