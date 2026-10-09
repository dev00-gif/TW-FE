import { createFileRoute, redirect } from '@tanstack/react-router'
import { authService } from '@/features/auth/services/authService'

type VerifyEmailConfirmSearch = {
  token?: string
  email?: string
}

export const Route = createFileRoute('/(auth)/verify-email/confirm')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    email: typeof search.email === 'string' ? search.email : undefined,
  }),
  ssr: false,
  loader: async ({ location }) => {
    const queryParams = new URLSearchParams(location.searchStr)
    const query: VerifyEmailConfirmSearch = {
      token: queryParams.get('token') ?? undefined,
      email: queryParams.get('email') ?? undefined,
    }

    if (!query.token) {
      throw redirect({
        to: '/verify-email',
        search: {
          email: query.email,
        },
      })
    }

    try {
      await authService.verifyEmail({ token: query.token })
    } catch {
      throw redirect({
        to: '/verify-email',
        search: { email: query.email },
      })
    }

    throw redirect({
      to: '/login',
    })
  },
})
