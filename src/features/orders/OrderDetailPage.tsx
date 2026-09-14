import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/primitives/Card'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SkeletonBlock } from '@/components/feedback/Skeleton'
import { Select } from '@/components/primitives/Select'
import { Toast, ToastRegion } from '@/components/feedback/Toast'
import { PageHeader } from '@/components/layout/PageHeader'
import { ordersApi } from '@/services/api'
import { orderKeys } from '@/lib/queryKeys'
import type { OrderDetail, OrderItem, OrderStatus } from '@/types'

const currency = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 })

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })
}

function itemName(item: OrderItem) {
  if (item.name) return item.name
  if (item.product && typeof item.product !== 'string') return item.product.name
  return 'Catalogue product'
}

function itemProductId(item: OrderItem) {
  if (!item.product) return ''
  return typeof item.product === 'string' ? item.product : item.product._id || item.product.id || ''
}

function customerName(order: OrderDetail) {
  return order.user?.name || order.guestName || 'Guest customer'
}

function customerEmail(order: OrderDetail) {
  return order.user?.email || order.guestEmail || '—'
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="admin-order-info-row"><dt>{label}</dt><dd>{value}</dd></div>
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const id = orderId || ''
  const queryClient = useQueryClient()
  const [statusDraft, setStatusDraft] = useState<OrderStatus>('pending')
  const [confirmStatus, setConfirmStatus] = useState(false)
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const order = useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: ({ signal }) => ordersApi.detail(id, { signal }),
    enabled: Boolean(orderId),
  })
  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      setConfirmStatus(false)
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      setToast({ message: 'Order status updated.', tone: 'success' })
    },
    onError: () => setToast({ message: 'Unable to update this order status.', tone: 'error' }),
  })

  useEffect(() => {
    if (order.data) setStatusDraft(order.data.status)
  }, [order.data])

  const details = order.data
  const statusChanged = Boolean(details && statusDraft !== details.status)

  return <>
    <PageHeader eyebrow="Sales" title={details ? `Order #${details.id.slice(-8)}` : 'Order detail'} description="Review the current order, customer, payment, and fulfilment state." action={{ label: 'Back to orders', to: '/orders' }} />
    <div className="admin-detail-toolbar"><Link className="admin-text-link" to="/orders"><ArrowLeft size={15} /> Back to all orders</Link>{details && <Badge tone={details.status === 'completed' ? 'success' : 'warning'}>{details.status === 'completed' ? 'Completed' : 'Pending'}</Badge>}</div>
    {order.isPending ? <Card><CardContent><SkeletonBlock lines={8} /></CardContent></Card> : order.isError || !details ? <Card><CardContent><ErrorState title="Order unavailable" description="This order could not be loaded. It may not exist or the order service is unavailable." action={<Button type="button" variant="secondary" onClick={() => void order.refetch()}>Try again</Button>} /></CardContent></Card> : <>
      <div className="admin-order-detail-grid">
        <Card><CardHeader><div className="admin-card-heading"><div><CardTitle>Customer</CardTitle><p className="admin-card-subtitle">The customer identity recorded on this order</p></div></div></CardHeader><CardContent><dl className="admin-order-info-list"><InfoRow label="Name" value={customerName(details)} /><InfoRow label="Email" value={customerEmail(details)} /><InfoRow label="Phone" value={details.guestPhone || '—'} /><InfoRow label="Order placed" value={formatDate(details.createdAt)} /></dl></CardContent></Card>
        <Card><CardHeader><div className="admin-card-heading"><div><CardTitle>Fulfilment</CardTitle><p className="admin-card-subtitle">Completing or reopening an order changes stock quantities.</p></div></div></CardHeader><CardContent><div className="admin-order-status-form"><Select label="Order status" name="order-detail-status" value={statusDraft} onChange={(event) => setStatusDraft(event.target.value as OrderStatus)} options={[{ value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }]} /><Button type="button" variant="primary" onClick={() => setConfirmStatus(true)} disabled={!statusChanged || statusMutation.isPending}>{statusMutation.isPending ? 'Saving…' : 'Save status'}</Button></div><dl className="admin-order-info-list admin-order-info-list-spaced"><InfoRow label="Delivered" value={details.isDelivered ? 'Yes' : 'No'} /><InfoRow label="Delivered at" value={formatDate(details.deliveredAt)} /></dl></CardContent></Card>
        <Card><CardHeader><div className="admin-card-heading"><div><CardTitle>Payment</CardTitle><p className="admin-card-subtitle">Payment fields returned by the order service</p></div></div></CardHeader><CardContent><dl className="admin-order-info-list"><InfoRow label="Method" value={details.paymentMethod || '—'} /><InfoRow label="Payment status" value={details.isPaid ? 'Paid' : 'Unpaid'} /><InfoRow label="Paid at" value={formatDate(details.paidAt)} /><InfoRow label="Order total" value={currency.format(details.totalPrice || 0)} /></dl></CardContent></Card>
      </div>
      <Card className="admin-order-items-detail"><CardHeader><div className="admin-card-heading"><div><CardTitle>Items</CardTitle><p className="admin-card-subtitle">{details.orderItems.length} line item{details.orderItems.length === 1 ? '' : 's'} in this order</p></div></div></CardHeader><CardContent><div className="admin-order-detail-items">{details.orderItems.length === 0 ? <p className="admin-form-muted">No order items were returned.</p> : details.orderItems.map((item, index) => { const productId = itemProductId(item); return <div className="admin-order-detail-item" key={`${productId || item.name}-${index}`}><img src={item.image} alt="" /><div className="admin-order-detail-item-copy">{productId ? <Link className="admin-product-name" to={`/products/${productId}`}>{itemName(item)}</Link> : <strong>{itemName(item)}</strong>}<span>{item.quantity} × {currency.format(item.price || 0)}</span></div><strong className="admin-product-price">{currency.format((item.price || 0) * (item.quantity || 0))}</strong></div> })}</div></CardContent></Card>
    </>}
    <ConfirmDialog open={confirmStatus} title={statusDraft === 'completed' ? 'Complete order?' : 'Reopen order?'} description={statusDraft === 'completed' ? 'This marks the order as delivered and decreases its item quantities from stock.' : 'This marks the order as pending and restores its item quantities to stock.'} confirmLabel={statusDraft === 'completed' ? 'Complete order' : 'Reopen order'} onCancel={() => setConfirmStatus(false)} onConfirm={() => statusMutation.mutate(statusDraft)} busy={statusMutation.isPending} />
    {toast && <ToastRegion><Toast message={toast.message} tone={toast.tone} /></ToastRegion>}
  </>
}
