import { createFileRoute, redirect } from '@tanstack/react-router'
import VerifyEmailPage from '@/features/auth/pages/verify-email/index.tsx'
import { getMe } from '@/features/auth/hooks/useAuth'
import { getAuthenticatedRedirect } from '@/features/auth/utils/authRedirect'

export const Route = createFileRoute('/(auth)/verify-email')({
  head: () => ({ meta: [{ title: 'Xác minh email' }] }),
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === 'string' ? search.email : undefined,
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
  component: VerifyEmailPage,
})
