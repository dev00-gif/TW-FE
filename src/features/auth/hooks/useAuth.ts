import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { authService } from '../services/authService'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationEmailRequest,
  ResetPasswordRequest,
} from '../types/auth'

export const authQueryKeys = {
  me: () => ['auth', 'me'] as const,
}

const meQueryOptions = {
  queryKey: authQueryKeys.me(),
  queryFn: authService.getMe,
  staleTime: Infinity,
  retry: false,
}

export function getMe(queryClient: QueryClient) {
  return queryClient.ensureQueryData(meQueryOptions)
}

export function useMe() {
  return useQuery(meQueryOptions)
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (user) => queryClient.setQueryData(authQueryKeys.me(), user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.logoutSession,
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(authQueryKeys.me(), null)
    },
  })
}

export function useCurrentUser() {
  return useMe().data ?? null
}

export function useCurrentUserId() {
  return useCurrentUser()?.id ?? null
}

export function useAuth() {
  const me = useMe()
  const login = useLogin()
  return {
    user: me.data ?? null,
    isAuthenticated: Boolean(me.data),
    isLoading: me.isPending,
    login: login.mutateAsync,
  }
}

export function useCreateRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  })
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: (data: ResendVerificationEmailRequest) =>
      authService.resendVerificationEmail(data),
  })
}

export function useForgotPassword() {
  return useMutation({
    retry: false,
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
  })
}
