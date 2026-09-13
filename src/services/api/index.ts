import { adminApi } from './client'
import type { AdminUser, LoginCredentials, LoginResponse } from '@/types'

export { adminApi, ApiError, onUnauthorized } from './client'
export { adminEnv, isConfiguredApiUrl } from '@/lib/env'

export const adminAuthApi = {
  login: (credentials: LoginCredentials) =>
    adminApi.post<LoginResponse>('/admin/auth/login', credentials),
  me: () => adminApi.get<{ user: AdminUser }>('/admin/auth/me'),
}
