import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent } from '@/components/primitives/Card'
import { Select } from '@/components/primitives/Select'
import { SearchInput } from '@/components/primitives/SearchInput'
import { Pagination } from '@/components/primitives/Pagination'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SkeletonBlock } from '@/components/feedback/Skeleton'
import { Toast, ToastRegion } from '@/components/feedback/Toast'
import { PageHeader } from '@/components/layout/PageHeader'
import { ordersApi } from '@/services/api'
import { orderKeys } from '@/lib/queryKeys'
import type { Order, OrderStatus } from '@/types'
import { OrderList } from './OrderList'
import { useOrderListState } from './useOrderListState'

export function OrdersPage() {
  const { params, searchInput, setSearchInput, update } = useOrderListState()
  const queryClient = useQueryClient()
  const [statusTarget, setStatusTarget] = useState<Order | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const orders = useQuery({
    queryKey: orderKeys.list(params),
    queryFn: ({ signal }) => ordersApi.list(params, { signal }),
    placeholderData: keepPreviousData,
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      setStatusTarget(null)
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      setToast({ message: 'Order status updated.', tone: 'success' })
    },
    onError: () => setToast({ message: 'Unable to update this order status.', tone: 'error' }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ordersApi.remove(id),
    onSuccess: () => {
      setDeleteTarget(null)
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      setToast({ message: 'Order deleted.', tone: 'success' })
    },
    onError: () => setToast({ message: 'Unable to delete this order.', tone: 'error' }),
  })

  useEffect(() => {
    if (orders.data && params.page > orders.data.pages) update({ page: orders.data.pages })
  }, [orders.data, params.page, update])

  const rows = orders.data?.orders || []
  const hasFilters = Boolean(params.search || params.status)

  function clearFilters() {
    setSearchInput('')
    update({ search: undefined, status: undefined, page: 1 })
  }

  return <>
    <PageHeader eyebrow="Sales" title="Orders" description="Review customer orders and fulfilment state using the live order service." />
    <Card className="admin-order-toolbar"><CardContent>
      <div className="admin-product-toolbar-top"><SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search order ID, customer, email, or phone" label="Search orders" /><div className="admin-product-toolbar-actions"><span className="admin-orders-result-count">{orders.data?.total ?? '—'} matching orders</span><Button type="button" variant="ghost" size="sm" onClick={() => void orders.refetch()} disabled={orders.isFetching}><RefreshCw size={15} className={orders.isFetching ? 'admin-spin' : ''} /> Refresh</Button></div></div>
      <div className="admin-order-filters"><div className="admin-filter-label"><SlidersHorizontal size={15} /> Filters</div><Select aria-label="Filter orders by status" name="order-status-filter" value={params.status || ''} onChange={(event) => update({ status: (event.target.value || undefined) as OrderStatus | undefined })} options={[{ value: '', label: 'All order statuses' }, { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }]} />{hasFilters && <Button type="button" variant="ghost" size="sm" onClick={clearFilters}><X size={15} /> Clear filters</Button>}</div>
      <div className="admin-product-filter-summary">{hasFilters ? 'Showing filtered order results' : 'Showing the newest orders first'}{orders.isFetching && <span className="admin-filter-loading">Updating…</span>}</div>
    </CardContent></Card>

    <Card className="admin-order-results"><CardContent>{orders.isPending ? <SkeletonBlock lines={7} /> : orders.isError ? <ErrorState title="Orders unavailable" description="The order service could not be loaded. Check the connection and try again." action={<Button type="button" variant="secondary" onClick={() => void orders.refetch()}>Try again</Button>} /> : rows.length === 0 ? <EmptyState title={hasFilters ? 'No matching orders' : 'No orders yet'} description={hasFilters ? 'Try changing your search or status filter.' : 'Orders will appear here after customers complete checkout.'} action={hasFilters ? <Button type="button" variant="secondary" onClick={clearFilters}>Clear filters</Button> : undefined} /> : <OrderList orders={rows} onStatus={setStatusTarget} onDelete={setDeleteTarget} />}</CardContent></Card>
    {orders.data && <Pagination page={orders.data.page} pageCount={orders.data.pages} onChange={(page) => update({ page }, false)} disabled={orders.isFetching} />}

    <ConfirmDialog open={Boolean(statusTarget)} title={statusTarget?.status === 'completed' ? 'Reopen order?' : 'Complete order?'} description={statusTarget?.status === 'completed' ? 'Reopening marks this order as pending and restores its item quantities to stock.' : 'Completing marks this order as delivered and decreases its item quantities from stock. Confirm the fulfilment decision before continuing.'} confirmLabel={statusTarget?.status === 'completed' ? 'Reopen order' : 'Complete order'} onCancel={() => setStatusTarget(null)} onConfirm={() => { if (statusTarget) statusMutation.mutate({ id: statusTarget.id, status: statusTarget.status === 'completed' ? 'pending' : 'completed' }) }} busy={statusMutation.isPending} />
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete order?" description={deleteTarget ? `This permanently removes order #${deleteTarget.id}. This action cannot be undone.` : ''} confirmLabel="Delete order" onCancel={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id) }} busy={deleteMutation.isPending} />
    {toast && <ToastRegion><Toast message={toast.message} tone={toast.tone} /></ToastRegion>}
  </>
}
