export type AdminUser = {
  id: string
  name: string
  email: string
  isAdmin: boolean
  joinDate?: string
  createdAt?: string
  updatedAt?: string
}

export type Customer = AdminUser

export type LoginCredentials = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  user: AdminUser
}

export type AuthState = {
  status: 'loading' | 'authenticated' | 'unauthenticated' | 'forbidden'
  user: AdminUser | null
}

export type AuthContextValue = AuthState & {
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

export type ProductCondition = 'New' | 'Pre-Owned'
export type ProductOfferType = 'percentage' | 'fixed'

export type ProductOffer = {
  enabled?: boolean
  type?: ProductOfferType
  amount?: number
  startDate?: string
  endDate?: string
}

export type ProductSummary = {
  _id: string
  id?: string
  name: string
  image: string
  image_r2?: string | null
  image_r2_variants?: Record<string, string> | null
  brand: string
  category: string
  price: number
  countInStock: number
  condition: ProductCondition
  rating: number
  numReviews: number
  offer?: ProductOffer
  createdAt?: string
  updatedAt?: string
}

export type ProductDetail = ProductSummary & {
  description: string
  images?: string[]
  images_r2?: string[]
  specifications?: Record<string, unknown>
  offer?: ProductOffer
  reviews?: Array<{
    user: string
    name: string
    rating: number
    comment: string
    createdAt?: string
    updatedAt?: string
  }>
}

export type Product = ProductDetail

export type ProductListResponse = {
  products: ProductSummary[]
  page: number
  pages: number
  total?: number
  count?: number
  hasMore?: boolean
}

export type ProductListParams = {
  page: number
  limit: number
  search?: string
  category?: string
  brand?: string
  condition?: ProductCondition
  stock?: 'in-stock' | 'out-of-stock'
  sort?: ProductSort
}

export type ProductSort =
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'stock-asc'
  | 'stock-desc'

export type ProductPayload = {
  name: string
  description: string
  price: number
  category: string
  countInStock: number
  brand: string
  condition: ProductCondition
  image: string
  image_r2?: string | null
  image_r2_variants?: Record<string, string> | null
  images?: string[]
  images_r2?: string[]
  specifications?: Record<string, string>
  offer?: ProductOffer
}

export type UploadResponse = {
  urls: string[]
  keys: string[]
  variants?: Array<Record<string, string>>
  uploaded: number
  failed: number
  failures?: string[]
}

export type OrderStatus = 'pending' | 'completed'

export type OrderCustomer = {
  id?: string
  _id?: string
  name?: string
  email?: string
}

export type OrderItem = {
  _id?: string
  product: ProductSummary | string | null
  name: string
  quantity: number
  price: number
  image: string
}

export type Order = {
  id: string
  user: OrderCustomer | null
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  order_items: OrderItem[]
  paymentMethod?: string
  payment_result?: {
    id?: string
    status?: string
    update_time?: string
    email_address?: string
  }
  total_price: number
  is_paid: boolean
  paid_at?: string
  is_delivered: boolean
  delivered_at?: string
  status: OrderStatus
  createdAt?: string
  updatedAt?: string
}

export type OrderDetail = {
  id: string
  user: OrderCustomer | null
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  orderItems: OrderItem[]
  paymentMethod?: string
  paymentResult?: {
    id?: string
    status?: string
    update_time?: string
    email_address?: string
  }
  totalPrice: number
  isPaid: boolean
  paidAt?: string
  isDelivered: boolean
  deliveredAt?: string
  status: OrderStatus
  createdAt?: string
  updatedAt?: string
}

export type OrderListParams = {
  page: number
  limit: number
  search?: string
  status?: OrderStatus
}

export type OrderListResponse = {
  orders: Order[]
  page: number
  pages: number
  total: number
  hasMore: boolean
}

export type PaginatedProducts = ProductListResponse

export type ApiErrorDetails = {
  code?: string
  message?: string
  error?: string
  [key: string]: unknown
}

export type HomepageHero = {
  eyebrow: string
  title: string
  highlightText: string
  description: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  imageUrl: string
  imageAlt: string
  enabled: boolean
}

export type HomepageProductReference = {
  productId: string
  sortOrder: number
  product: ProductSummary | null
  missing: boolean
}

export type HomepageSectionLayout = 'grid' | 'carousel'

export type HomepageSection = {
  id: string
  title: string
  subtitle: string
  type: 'MANUAL_PRODUCTS'
  enabled: boolean
  sortOrder: number
  layout: HomepageSectionLayout
  viewAllLabel: string
  viewAllHref: string
  products: HomepageProductReference[]
}

export type HomepageResponse = {
  configured: boolean
  hero: HomepageHero
  sections: HomepageSection[]
}

export type HomepageHeroPayload = Partial<HomepageHero>
export type HomepageSectionPayload = {
  title: string
  subtitle?: string
  type?: 'MANUAL_PRODUCTS'
  enabled?: boolean
  layout?: HomepageSectionLayout
  viewAllLabel?: string
  viewAllHref?: string
  productIds?: string[]
}
