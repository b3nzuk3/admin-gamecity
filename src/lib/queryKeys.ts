export const adminQueryKeys = {
  all: ['admin'] as const,
  authMe: ['admin', 'auth', 'me'] as const,
  dashboard: ['admin', 'dashboard'] as const,
  products: (params?: Record<string, string | number | undefined>) =>
    ['admin', 'products', params] as const,
  product: (id: string) => ['admin', 'product', id] as const,
  orders: (params?: Record<string, string | number | undefined>) =>
    ['admin', 'orders', params] as const,
  order: (id: string) => ['admin', 'order', id] as const,
  customers: (params?: Record<string, string | number | undefined>) =>
    ['admin', 'customers', params] as const,
  inventory: (params?: Record<string, string | number | undefined>) =>
    ['admin', 'inventory', params] as const,
} as const
