import { api, authTokens } from '@/lib/apiClient'
import { informationSourceService } from '@/features/information-source/service'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegistrationResponse,
  ResendVerificationEmailRequest,
  ResetPasswordRequest,
  User,
  VerifyEmailRequest,
} from '../types/auth'

type LoginResponse = {
  id: string
  roleCodes: string[]
  permissionCodes: string[]
  isSuperAdmin: boolean
  canAccessDashboard: boolean
  access_token: string
  refresh_token: string
  expires_at: string
}

const normalizeUser = (user: User): User => ({
  ...user,
  avatarUrl: user.profile?.avatarUrl,
  displayName: user.profile?.fullName ?? user.email ?? user.phone ?? user.id,
})

export const authService = {
  login: async (credentials: LoginRequest): Promise<User> => {
    const { Content: tokens } =
      await informationSourceService.dv001<LoginResponse>({
        Username: credentials.login,
        Password: credentials.password,
      })
    authTokens.set(tokens)
    const user = await authService.getMe()
    if (!user) throw new Error('Unable to load the current user profile')
    return user
  },

  getMe: async (): Promise<User | null> => {
    if (!authTokens.access()) return null
    try {
      return normalizeUser(await api.get<User>('/auth/profile'))
    } catch {
      authTokens.clear()
      return null
    }
  },

  logoutSession: async () => {
    try {
      return await api.post<{ message: string }>('/auth/logout')
    } finally {
      authTokens.clear()
    }
  },

  register: (credentials: RegisterRequest) =>
    api.post<RegistrationResponse>('/auth/register', credentials),

  resendVerificationEmail: (credentials: ResendVerificationEmailRequest) =>
    api.post<{ message: string }>('/auth/resend-verification', credentials),

  forgotPassword: (credentials: ForgotPasswordRequest) =>
    api.post<{ message: string }>('/auth/forgot-password', credentials),

  resetPassword: (credentials: ResetPasswordRequest) =>
    api.post<{ message: string }>('/auth/reset-password', credentials),

  verifyEmail: (credentials: VerifyEmailRequest) =>
    api.post<{ message: string }>('/auth/verify-email', credentials),
}
