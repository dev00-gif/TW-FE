import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  result: T
  timestamp: string
  path: string
}

type TokenResponse = {
  access_token: string
  refresh_token: string
}

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  (import.meta.env.PROD
    ? 'http://tw.45.252.248.184.nip.io/api/v1'
    : 'http://localhost:3000/api/v1')

const storage = () =>
  typeof window === 'undefined' ? null : window.localStorage

export const authTokens = {
  access: () => storage()?.getItem(ACCESS_TOKEN_KEY) ?? null,
  refresh: () => storage()?.getItem(REFRESH_TOKEN_KEY) ?? null,
  set: (tokens: TokenResponse) => {
    storage()?.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
    storage()?.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  },
  clear: () => {
    storage()?.removeItem(ACCESS_TOKEN_KEY)
    storage()?.removeItem(REFRESH_TOKEN_KEY)
  },
}

export const apiClient = axios.create({ baseURL: apiBaseUrl, timeout: 30_000 })

apiClient.interceptors.request.use((config) => {
  const token = authTokens.access()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

type RetryConfig = AxiosRequestConfig & { _retry?: boolean }
let refreshRequest: Promise<string> | null = null

apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const originalRequest = error.config as RetryConfig | undefined
  const refreshToken = authTokens.refresh()
  if (
    error.response?.status !== 401 ||
    !originalRequest ||
    originalRequest._retry ||
    !refreshToken ||
    originalRequest.url?.includes('/oauth/token') ||
    originalRequest.url?.includes('/auth/login') ||
    originalRequest.url?.includes('/auth/refresh')
  ) {
    throw error
  }

  originalRequest._retry = true
  refreshRequest ??= axios
    .post<ApiEnvelope<TokenResponse>>(`${apiBaseUrl}/auth/refresh`, {
      refresh_token: refreshToken,
    })
    .then(({ data }) => {
      authTokens.set(data.result)
      return data.result.access_token
    })
    .finally(() => {
      refreshRequest = null
    })

  try {
    const accessToken = await refreshRequest
    originalRequest.headers = {
      ...originalRequest.headers,
      Authorization: `Bearer ${accessToken}`,
    }
    return apiClient.request(originalRequest)
  } catch (refreshError) {
    authTokens.clear()
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('logout'))
    throw refreshError
  }
})

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.request<ApiEnvelope<T>>(config)
  return data.result
}

export const api = {
  get: <T>(url: string, params?: unknown) =>
    request<T>({ method: 'GET', url, params }),
  post: <T>(url: string, data?: unknown) =>
    request<T>({ method: 'POST', url, data }),
  put: <T>(url: string, data?: unknown) =>
    request<T>({ method: 'PUT', url, data }),
  patch: <T>(url: string, data?: unknown) =>
    request<T>({ method: 'PATCH', url, data }),
  delete: <T>(url: string) => request<T>({ method: 'DELETE', url }),
}
