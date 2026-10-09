export type User = {
  id: string
  email?: string
  phone?: string
  status: string
  roleCodes: string[]
  permissionCodes: string[]
  isSuperAdmin: boolean
  canAccessDashboard: boolean
  createdAt: string
  avatarUrl?: string
  displayName?: string
  profile?: {
    id: string
    fullName: string
    avatarUrl?: string
    createdAt: string
  }
}

export interface LoginRequest {
  login: string
  password: string
}

export interface RegisterRequest {
  userLogin: string
  displayName: string
  userEmail: string
  userPhone: string
  userPass: string
  confirm_password: string
  referrerCode?: string
}

export interface RegistrationResponse {
  id: string
  email: string
  status: string
  createdAt: string
}

export interface ResendVerificationEmailRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirm_password: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
