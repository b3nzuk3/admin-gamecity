import { useEffect, useState } from 'react'
import { Filter, Plus, RefreshCw, SlidersHorizontal, X } from 'lucide-react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent } from '@/components/primitives/Card'
import { Pagination } from '@/components/primitives/Pagination'
import { SearchInput } from '@/components/primitives/SearchInput'
import { Select } from '@/components/primitives/Select'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SkeletonBlock } from '@/components/feedback/Skeleton'
import { Toast, ToastRegion } from '@/components/feedback/Toast'
import { PageHeader } from '@/components/layout/PageHeader'
import { productsApi } from '@/services/api'
import { productKeys } from '@/lib/queryKeys'
import type { ProductSummary } from '@/types'
import { PRODUCT_CATEGORIES } from './productCatalog'
import { ProductListTable } from './ProductListTable'
import { useProductListState } from './useProductListState'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name A–Z' }, { value: 'name-desc', label: 'Name Z–A' },
  { value: 'price-asc', label: 'Price low–high' }, { value: 'price-desc', label: 'Price high–low' },
  { value: 'stock-asc', label: 'Stock low–high' }, { value: 'stock-desc', label: 'Stock high–low' },
]

export function ProductsPage() {
  const { params, searchInput, setSearchInput, update } = useProductListState()
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<ProductSummary | null>(null)
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const products = useQuery({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => productsApi.list(params, { signal }),
    placeholderData: keepPreviousData,
  })
  const brands = useQuery({ queryKey: productKeys.brands(), queryFn: ({ signal }) => productsApi.brands({ signal }) })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: (result) => {
      setDeleteTarget(null)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      setToast({ message: result.mediaCleanup?.warning || 'Product deleted.', tone: 'success' })
    },
    onError: () => setToast({ message: 'Unable to delete this product. Try again.', tone: 'error' }),
  })

  useEffect(() => {
    if (products.data && params.page > products.data.pages) update({ page: products.data.pages })
  }, [params.page, products.data, update])

  function clearFilters() {
    setSearchInput('')
    update({ search: undefined, category: undefined, brand: undefined, condition: undefined, stock: undefined, sort: 'newest', page: 1 })
  }

  const hasFilters = Boolean(params.search || params.category || params.brand || params.condition || params.stock || params.sort !== 'newest')
  const rows = products.data?.products || []

  return <>
    <PageHeader eyebrow="Catalogue" title="Products" description="Search, filter, and maintain the products customers see in the GameCity catalogue." action={{ label: 'New product', to: '/products/new' }} />
    <Card className="admin-product-toolbar"><CardContent>
      <div className="admin-product-toolbar-top"><SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search by name, description, or brand" label="Search products" /><div className="admin-product-toolbar-actions"><Badge tone="neutral">{products.data?.total ?? '—'} products</Badge><Button type="button" variant="ghost" size="sm" onClick={() => void products.refetch()} disabled={products.isFetching}><RefreshCw size={15} className={products.isFetching ? 'admin-spin' : ''} /> Refresh</Button></div></div>
      <div className="admin-product-filters"><div className="admin-filter-label"><SlidersHorizontal size={15} /> Filters</div><Select aria-label="Filter by category" name="category-filter" value={params.category || ''} onChange={(event) => update({ category: event.target.value || undefined })} options={[{ value: '', label: 'All categories' }, ...PRODUCT_CATEGORIES.map((category) => ({ value: category.id, label: category.name }))]} /><Select aria-label="Filter by brand" name="brand-filter" value={params.brand || ''} onChange={(event) => update({ brand: event.target.value || undefined })} options={[{ value: '', label: 'All brands' }, ...(brands.data || []).map((brand) => ({ value: brand, label: brand }))]} /><Select aria-label="Filter by condition" name="condition-filter" value={params.condition || ''} onChange={(event) => update({ condition: event.target.value ? event.target.value as 'New' | 'Pre-Owned' : undefined })} options={[{ value: '', label: 'All conditions' }, { value: 'New', label: 'New' }, { value: 'Pre-Owned', label: 'Pre-Owned' }]} /><Select aria-label="Filter by stock" name="stock-filter" value={params.stock || ''} onChange={(event) => update({ stock: event.target.value ? event.target.value as 'in-stock' | 'out-of-stock' : undefined })} options={[{ value: '', label: 'All stock states' }, { value: 'in-stock', label: 'In stock' }, { value: 'out-of-stock', label: 'Out of stock' }]} /><Select aria-label="Sort products" name="sort-products" value={params.sort || 'newest'} onChange={(event) => update({ sort: event.target.value as typeof params.sort })} options={SORT_OPTIONS} />{hasFilters && <Button type="button" variant="ghost" size="sm" onClick={clearFilters}><X size={15} /> Clear filters</Button>}</div>
      <div className="admin-product-filter-summary"><Filter size={14} /> {hasFilters ? 'Showing filtered catalogue results' : 'Showing the full catalogue'}{products.isFetching && <span className="admin-filter-loading">Updating…</span>}</div>
    </CardContent></Card>

    <Card className="admin-product-results"><CardContent>{products.isPending ? <SkeletonBlock lines={7} /> : products.isError ? <ErrorState title="Products unavailable" description="The catalogue could not be loaded. Check the connection and try again." action={<Button type="button" variant="secondary" onClick={() => void products.refetch()}>Try again</Button>} /> : rows.length === 0 ? <EmptyState title={hasFilters ? 'No matching products' : 'No products yet'} description={hasFilters ? 'Try changing your search or filters.' : 'Create the first catalogue product to see it here.'} action={hasFilters ? <Button type="button" variant="secondary" onClick={clearFilters}>Clear filters</Button> : <Link className="admin-button admin-button-primary" to="/products/new"><Plus size={16} /> New product</Link>} /> : <ProductListTable products={rows} onDelete={setDeleteTarget} />}</CardContent></Card>
    {products.data && <Pagination page={products.data.page} pageCount={products.data.pages} onChange={(page) => update({ page }, false)} disabled={products.isFetching} />}
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete product?" description={deleteTarget ? `This permanently removes “${deleteTarget.name}” from the catalogue. This action cannot be undone.` : ''} confirmLabel="Delete product" onCancel={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget._id || deleteTarget.id || '') }} busy={deleteMutation.isPending} />
    {toast && <ToastRegion><Toast message={toast.message} tone={toast.tone} /></ToastRegion>}
  </>
}
