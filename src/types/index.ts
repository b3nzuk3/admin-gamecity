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

export type ProductSummary = {
  _id: string
  name: string
  image: string
  image_r2?: string | null
  image_r2_variants?: Record<string, string> | null
  brand: string
  category: string
  price: number
  countInStock: number
  condition: 'New' | 'Pre-Owned'
  rating: number
  numReviews: number
  createdAt?: string
  updatedAt?: string
}

export type ProductDetail = ProductSummary & {
  description: string
  images?: string[]
  images_r2?: string[]
  specifications?: Record<string, unknown>
  offer?: {
    enabled?: boolean
    type?: 'percentage' | 'fixed'
    amount?: number
    startDate?: string
    endDate?: string
  }
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
  count: number
}

export type PaginatedProducts = ProductListResponse

export type Order = {
  id: string
  total_price: number
  status: 'pending' | 'completed'
  is_paid: boolean
  is_delivered: boolean
  createdAt?: string
}

export type ApiErrorDetails = {
  code?: string
  message?: string
  error?: string
  [key: string]: unknown
}
