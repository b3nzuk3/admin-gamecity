import { adminEnv } from '@/lib/env'
import type { ApiErrorDetails } from '@/types'
import { tokenStorage } from '@/auth/tokenStorage'

export class ApiError extends Error {
  status: number
  details: ApiErrorDetails | null

  constructor(message: string, status: number, details: ApiErrorDetails | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null
}

let unauthorizedHandler: (() => void) | undefined

export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = undefined
  }
}

function isAuthRequest(path: string) {
  return path === '/admin/auth/login' || path === '/admin/auth/me'
}

async function readError(response: Response): Promise<ApiErrorDetails | null> {
  try {
    const data = (await response.json()) as unknown
    return data && typeof data === 'object' ? (data as ApiErrorDetails) : null
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: providedHeaders, ...init } = options
  const headers = new Headers(providedHeaders)
  const token = tokenStorage.getToken()

  if (token && !isAuthRequest(path)) headers.set('Authorization', `Bearer ${token}`)
  if (!(body instanceof FormData) && body !== undefined && body !== null) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${adminEnv.apiBaseUrl}${path}`, {
    ...init,
    headers,
    body:
      body instanceof FormData || typeof body === 'string' || body === null
        ? body
        : body === undefined
          ? undefined
          : JSON.stringify(body),
    signal: options.signal,
  })

  if (!response.ok) {
    const details = await readError(response)
    if (response.status === 401) {
      tokenStorage.clearToken()
      if (!isAuthRequest(path)) unauthorizedHandler?.()
    }
    throw new ApiError(
      details?.message || details?.error || `Request failed with status ${response.status}`,
      response.status,
      details,
    )
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}

export const adminApi = {
  request,
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: RequestOptions['body'], options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: RequestOptions['body'], options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
