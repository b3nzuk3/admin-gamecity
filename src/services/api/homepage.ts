import type { HomepageHeroPayload, HomepageResponse, HomepageSectionPayload } from '@/types'
import { adminApi } from './client'

export const homepageApi = {
  get: (options?: { signal?: AbortSignal }) => adminApi.get<HomepageResponse>('/admin/homepage', options),
  updateHero: (payload: HomepageHeroPayload) => adminApi.put<HomepageResponse>('/admin/homepage/hero', payload),
  createSection: (payload: HomepageSectionPayload) => adminApi.post<HomepageResponse>('/admin/homepage/sections', payload),
  updateSection: (id: string, payload: HomepageSectionPayload) => adminApi.put<HomepageResponse>(`/admin/homepage/sections/${encodeURIComponent(id)}`, payload),
  removeSection: (id: string) => adminApi.delete<HomepageResponse>(`/admin/homepage/sections/${encodeURIComponent(id)}`),
  reorderSections: (sectionIds: string[]) => adminApi.put<HomepageResponse>('/admin/homepage/sections/reorder', { sectionIds }),
  updateSectionProducts: (id: string, productIds: string[]) => adminApi.put<HomepageResponse>(`/admin/homepage/sections/${encodeURIComponent(id)}/products`, { productIds }),
}
