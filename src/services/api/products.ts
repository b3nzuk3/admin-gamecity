import type {
  Product,
  ProductDetail,
  ProductListParams,
  ProductListResponse,
  ProductPayload,
  ProductSummary,
  UploadResponse,
} from '@/types'
import { adminApi } from './client'

type ProductUpdateResponse = ProductDetail & { mediaCleanup?: { warning?: string } }

function toQuery(params: ProductListParams) {
  const query = new URLSearchParams()
  query.set('page', String(params.page))
  query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  if (params.brand) query.set('brand', params.brand)
  if (params.condition) query.set('condition', params.condition)
  if (params.stock) query.set('stock', params.stock)
  if (params.sort) query.set('sort', params.sort)
  return query.toString()
}

export function normalizeProduct(product: ProductSummary | ProductDetail): Product {
  const id = product._id || product.id || ''
  return { ...product, _id: id, id } as Product
}

export const productsApi = {
  list: async (params: ProductListParams, options?: { signal?: AbortSignal }) => {
    const response = await adminApi.get<ProductListResponse>(`/admin/products?${toQuery(params)}`, options)
    return { ...response, products: response.products.map(normalizeProduct), total: response.total ?? response.count ?? 0 }
  },
  detail: async (id: string, options?: { signal?: AbortSignal }) => normalizeProduct(await adminApi.get<ProductDetail>(`/products/${encodeURIComponent(id)}`, options)),
  brands: (options?: { signal?: AbortSignal }) => adminApi.get<string[]>('/products/brands', options),
  create: async (payload: ProductPayload) => normalizeProduct(await adminApi.post<ProductDetail>('/products', payload)),
  update: async (id: string, payload: ProductPayload) => {
    const response = await adminApi.put<ProductUpdateResponse>(`/products/${encodeURIComponent(id)}`, payload)
    return { ...normalizeProduct(response), mediaCleanup: response.mediaCleanup }
  },
  remove: (id: string) => adminApi.delete<{ message: string; mediaCleanup?: { warning?: string } }>(`/products/${encodeURIComponent(id)}`),
  upload: (formData: FormData, options?: { signal?: AbortSignal }) => adminApi.post<UploadResponse>('/upload', formData, options),
  deleteMedia: (keys: string[]) => adminApi.post<{ message: string }>('/upload/delete', { keys }),
}
