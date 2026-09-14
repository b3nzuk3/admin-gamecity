import type { AdminUser } from '@/types'
import { adminApi } from './client'

export const usersApi = {
  list: (options?: { signal?: AbortSignal }) => adminApi.get<AdminUser[]>('/users', options),
}
