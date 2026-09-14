import { useEffect } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Filter, RefreshCw, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent } from '@/components/primitives/Card'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SkeletonBlock } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { Pagination } from '@/components/primitives/Pagination'
import { SearchInput } from '@/components/primitives/SearchInput'
import { Select } from '@/components/primitives/Select'
import { productsApi } from '@/services/api'
import { productKeys } from '@/lib/queryKeys'
import type { ProductSort } from '@/types'
import { PRODUCT_CATEGORIES } from '@/features/products/productCatalog'
import { InventoryTable } from './InventoryTable'
import { useProductListState } from '@/features/products/useProductListState'

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: 'stock-asc', label: 'Stock low–high' },
  { value: 'stock-desc', label: 'Stock high–low' },
  { value: 'newest', label: 'Newest first' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'price-asc', label: 'Price low–high' },
]

export function InventoryPage() {
  const { params, searchInput, setSearchInput, update } = useProductListState()
  const products = useQuery({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => productsApi.list(params, { signal }),
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    if (products.data && params.page > products.data.pages) update({ page: products.data.pages })
  }, [params.page, products.data, update])

  const rows = products.data?.products || []
  const hasFilters = Boolean(params.search || params.category || params.stock || params.sort !== 'newest')

  function clearFilters() {
    setSearchInput('')
    update({ search: undefined, category: undefined, brand: undefined, condition: undefined, stock: undefined, sort: 'newest', page: 1 })
  }

  return <>
    <PageHeader eyebrow="Catalog" title="Inventory" description="Monitor availability using the catalogue’s countInStock field. This view is read-only; open a product to change stock." />
    <div className="admin-system-banner admin-inventory-note"><Filter size={17} /><span><strong>Inventory source.</strong> Availability is derived directly from products. There is no separate stock ledger or stock-history feature yet.</span></div>
    <Card className="admin-product-toolbar"><CardContent>
      <div className="admin-product-toolbar-top"><SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search by product name, description, or brand" label="Search inventory" /><div className="admin-product-toolbar-actions"><span className="admin-orders-result-count">{products.data?.total ?? '—'} matching products</span><Button type="button" variant="ghost" size="sm" onClick={() => void products.refetch()} disabled={products.isFetching}><RefreshCw size={15} className={products.isFetching ? 'admin-spin' : ''} /> Refresh</Button></div></div>
      <div className="admin-inventory-filters"><div className="admin-filter-label"><SlidersHorizontal size={15} /> Filters</div><Select aria-label="Filter inventory by category" name="inventory-category-filter" value={params.category || ''} onChange={(event) => update({ category: event.target.value || undefined })} options={[{ value: '', label: 'All categories' }, ...PRODUCT_CATEGORIES.map((category) => ({ value: category.id, label: category.name }))]} /><Select aria-label="Filter inventory by availability" name="inventory-stock-filter" value={params.stock || ''} onChange={(event) => update({ stock: event.target.value ? event.target.value as 'in-stock' | 'out-of-stock' : undefined })} options={[{ value: '', label: 'All availability' }, { value: 'in-stock', label: 'In stock' }, { value: 'out-of-stock', label: 'Out of stock' }]} /><Select aria-label="Sort inventory" name="inventory-sort" value={params.sort || 'newest'} onChange={(event) => update({ sort: event.target.value as ProductSort })} options={SORT_OPTIONS} />{hasFilters && <Button type="button" variant="ghost" size="sm" onClick={clearFilters}><X size={15} /> Clear filters</Button>}</div>
      <div className="admin-product-filter-summary">{hasFilters ? 'Showing filtered inventory results' : 'Showing the full catalogue'}{products.isFetching && <span className="admin-filter-loading">Updating…</span>}</div>
    </CardContent></Card>
    <Card className="admin-inventory-results"><CardContent>{products.isPending ? <SkeletonBlock lines={7} /> : products.isError ? <ErrorState title="Inventory unavailable" description="The catalogue stock data could not be loaded. Check the connection and try again." action={<Button type="button" variant="secondary" onClick={() => void products.refetch()}>Try again</Button>} /> : rows.length === 0 ? <EmptyState title={hasFilters ? 'No matching inventory' : 'No products yet'} description={hasFilters ? 'Try changing your search or availability filters.' : 'Create a catalogue product to start tracking availability.'} action={hasFilters ? <Button type="button" variant="secondary" onClick={clearFilters}>Clear filters</Button> : undefined} /> : <InventoryTable products={rows} />}</CardContent></Card>
    {products.data && <Pagination page={products.data.page} pageCount={products.data.pages} onChange={(page) => update({ page }, false)} disabled={products.isFetching} />}
  </>
}
