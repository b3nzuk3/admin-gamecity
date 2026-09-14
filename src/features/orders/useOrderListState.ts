import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { OrderListParams, OrderStatus } from '@/types'

const DEFAULT_LIMIT = 25

function parsePage(value: string | null) {
  const page = Number.parseInt(value || '', 10)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function parseStatus(value: string | null): OrderStatus | undefined {
  return value === 'pending' || value === 'completed' ? value : undefined
}

function parseParams(searchParams: URLSearchParams): OrderListParams {
  const status = parseStatus(searchParams.get('status'))
  return {
    page: parsePage(searchParams.get('page')),
    limit: DEFAULT_LIMIT,
    ...(searchParams.get('search') ? { search: searchParams.get('search') || undefined } : {}),
    ...(status ? { status } : {}),
  }
}

function writeParams(current: URLSearchParams, patch: Partial<OrderListParams>) {
  const next = new URLSearchParams(current)
  const merged = { ...parseParams(current), ...patch }
  if (merged.page === 1) next.delete('page')
  else next.set('page', String(merged.page))
  if (!merged.search) next.delete('search')
  else next.set('search', merged.search)
  if (!merged.status) next.delete('status')
  else next.set('status', merged.status)
  return next
}

export function useOrderListState() {
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

  function update(patch: Partial<OrderListParams>, replace = true) {
    const nextPatch = Object.keys(patch).some((key) => key !== 'page') ? { ...patch, page: 1 } : patch
    setSearchParams((current) => writeParams(current, nextPatch), { replace })
  }

  return { params, searchInput, setSearchInput, update }
}
