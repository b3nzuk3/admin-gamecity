import type {
  Order,
  OrderCustomer,
  OrderDetail,
  OrderItem,
  OrderListParams,
  OrderListResponse,
  OrderStatus,
  ProductSummary,
} from '@/types'
import { adminApi } from './client'

function toQuery(params: OrderListParams) {
  const query = new URLSearchParams()
  query.set('page', String(params.page))
  query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.status) query.set('status', params.status)
  return query.toString()
}

function normalizeCustomer(customer: OrderCustomer | null | undefined) {
  if (!customer) return null
  return { ...customer, id: customer.id || customer._id }
}

function normalizeItem(item: OrderItem): OrderItem {
  const product = item.product
  if (!product || typeof product === 'string') return { ...item, product }
  const normalized = product as ProductSummary
  return { ...item, product: { ...normalized, _id: normalized._id || normalized.id || '' } }
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    id: String(order.id || ''),
    user: normalizeCustomer(order.user),
    order_items: (order.order_items || []).map(normalizeItem),
  }
}

type RawOrderDetail = Omit<OrderDetail, 'id' | 'user' | 'orderItems'> & {
  _id: string
  user?: OrderCustomer | null
  orderItems?: OrderItem[]
}

function normalizeDetail(order: RawOrderDetail): OrderDetail {
  return {
    ...order,
    id: String(order._id || ''),
    user: normalizeCustomer(order.user),
    orderItems: (order.orderItems || []).map(normalizeItem),
  }
}

export const ordersApi = {
  list: async (params: OrderListParams, options?: { signal?: AbortSignal }) => {
    const response = await adminApi.get<OrderListResponse>(`/admin/orders?${toQuery(params)}`, options)
    return { ...response, orders: response.orders.map(normalizeOrder) }
  },
  detail: async (id: string, options?: { signal?: AbortSignal }) => {
    const response = await adminApi.get<RawOrderDetail>(`/admin/orders/${encodeURIComponent(id)}`, options)
    return normalizeDetail(response)
  },
  updateStatus: (id: string, status: OrderStatus) =>
    adminApi.put<RawOrderDetail>(`/admin/orders/${encodeURIComponent(id)}/status`, { status }),
  remove: (id: string) =>
    adminApi.delete<{ message: string }>(`/admin/orders/${encodeURIComponent(id)}`),
}
