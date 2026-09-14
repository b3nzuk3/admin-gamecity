import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ProductCondition, ProductListParams, ProductSort } from '@/types'

const DEFAULT_LIMIT = 25
const DEFAULT_SORT: ProductSort = 'newest'

function parsePage(value: string | null) {
  const page = Number.parseInt(value || '', 10)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function parseLimit(value: string | null) {
  const limit = Number.parseInt(value || '', 10)
  return Number.isInteger(limit) && limit >= 10 && limit <= 100 ? limit : DEFAULT_LIMIT
}

function parseParams(searchParams: URLSearchParams): ProductListParams {
  const condition = searchParams.get('condition')
  const stock = searchParams.get('stock')
  const sort = searchParams.get('sort') as ProductSort | null
  return {
    page: parsePage(searchParams.get('page')),
    limit: parseLimit(searchParams.get('limit')),
    ...(searchParams.get('search') ? { search: searchParams.get('search') || undefined } : {}),
    ...(searchParams.get('category') ? { category: searchParams.get('category') || undefined } : {}),
    ...(searchParams.get('brand') ? { brand: searchParams.get('brand') || undefined } : {}),
    ...(condition === 'New' || condition === 'Pre-Owned' ? { condition } : {}),
    ...(stock === 'in-stock' || stock === 'out-of-stock' ? { stock } : {}),
    ...(sort && ['newest', 'oldest', 'name-asc', 'name-desc', 'price-asc', 'price-desc', 'stock-asc', 'stock-desc'].includes(sort) ? { sort } : { sort: DEFAULT_SORT }),
  }
}

function writeParams(current: URLSearchParams, patch: Partial<ProductListParams>) {
  const next = new URLSearchParams(current)
  const merged = { ...parseParams(current), ...patch }
  const defaults: Record<string, string | number | undefined> = { page: 1, limit: DEFAULT_LIMIT, sort: DEFAULT_SORT }
  for (const key of ['page', 'limit', 'search', 'category', 'brand', 'condition', 'stock', 'sort']) {
    const value = merged[key as keyof ProductListParams]
    if (value === undefined || value === '' || value === defaults[key]) next.delete(key)
    else next.set(key, String(value))
  }
  return next
}

export function useProductListState() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => parseParams(searchParams), [searchParams])
  const [searchInput, setSearchInput] = useState(params.search || '')

  useEffect(() => setSearchInput(params.search || ''), [params.search])

  useEffect(() => {
    const normalized = searchInput.trim()
    if (normalized === (params.search || '')) return undefined
    const timer = window.setTimeout(() => {
      setSearchParams((current) => writeParams(current, { search: normalized || undefined, page: 1 }), { replace: true })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [params.search, searchInput, setSearchParams])

  function update(patch: Partial<ProductListParams>, replace = true) {
    const nextPatch = Object.keys(patch).some((key) => !['page', 'limit'].includes(key)) ? { ...patch, page: 1 } : patch
    setSearchParams((current) => writeParams(current, nextPatch), { replace })
  }

  return { params, searchInput, setSearchInput, update }
}

export type { ProductCondition }
