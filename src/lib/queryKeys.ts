import type { OrderListParams, ProductListParams } from '@/types'

function canonicalize(params: ProductListParams) {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '')
      .sort(([left], [right]) => left.localeCompare(right)),
  )
}

export const productKeys = {
  all: ['admin', 'products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), canonicalize(params)] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  brands: () => [...productKeys.all, 'brands'] as const,
}

export const userKeys = {
  all: ['admin', 'users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
}

export const orderKeys = {
  all: ['admin', 'orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
}

export const homepageKeys = {
  all: ['admin', 'homepage'] as const,
  admin: () => [...homepageKeys.all, 'config'] as const,
  products: (sectionId: string) => [...homepageKeys.all, 'products', sectionId] as const,
}

export const adminQueryKeys = {
  all: ['admin'] as const,
  authMe: ['admin', 'auth', 'me'] as const,
  dashboard: ['admin', 'dashboard'] as const,
  products: (params?: Record<string, string | number | undefined>) => ['admin', 'products', params] as const,
  product: (id: string) => ['admin', 'product', id] as const,
  orders: (params?: Record<string, string | number | undefined>) => ['admin', 'orders', params] as const,
  order: (id: string) => ['admin', 'order', id] as const,
  customers: (params?: Record<string, string | number | undefined>) => ['admin', 'customers', params] as const,
  inventory: (params?: Record<string, string | number | undefined>) => ['admin', 'inventory', params] as const,
}
