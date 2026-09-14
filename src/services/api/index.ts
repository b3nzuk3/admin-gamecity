import { adminApi } from './client'
import type { AdminUser, LoginCredentials, LoginResponse } from '@/types'

export { adminApi, ApiError, onUnauthorized } from './client'
export { adminEnv, isConfiguredApiUrl } from '@/lib/env'
export { productsApi, normalizeProduct } from './products'
export { usersApi } from './users'
export { ordersApi } from './orders'
export { homepageApi } from './homepage'
export type { ProductListParams, ProductPayload } from '@/types'

export const adminAuthApi = {
  login: (credentials: LoginCredentials) =>
    adminApi.post<LoginResponse>('/admin/auth/login', credentials),
  me: () => adminApi.get<{ user: AdminUser }>('/admin/auth/me'),
}
