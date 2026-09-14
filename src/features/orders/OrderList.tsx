import { CheckCircle2, Eye, RotateCcw, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/data-display/Table'
import type { Order, OrderItem } from '@/types'

const currency = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 })

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function customerName(order: Order) {
  return order.user?.name || order.guestName || 'Guest customer'
}

function customerContact(order: Order) {
  return order.user?.email || order.guestEmail || order.guestPhone || 'No contact details'
}

function itemName(item: OrderItem) {
  if (item.name) return item.name
  if (item.product && typeof item.product !== 'string') return item.product.name
  return 'Catalogue product'
}

function itemSummary(order: Order) {
  const count = order.order_items.reduce((total, item) => total + (item.quantity || 0), 0)
  return `${count} item${count === 1 ? '' : 's'}`
}

function statusBadge(order: Order) {
  return <Badge tone={order.status === 'completed' ? 'success' : 'warning'}>{order.status === 'completed' ? 'Completed' : 'Pending'}</Badge>
}

export function OrderList({ orders, onStatus, onDelete }: { orders: Order[]; onStatus: (order: Order) => void; onDelete: (order: Order) => void }) {
  return <>
    <div className="admin-order-table-desktop"><Table className="admin-order-table"><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead><span className="admin-visually-hidden">Actions</span></TableHead></TableRow></TableHeader><TableBody>{orders.map((order) => <TableRow key={order.id}>
      <TableCell><Link className="admin-order-id" to={`/orders/${order.id}`}>#{order.id.slice(-8)}</Link><span className="admin-product-meta">{order.id}</span></TableCell>
      <TableCell><strong className="admin-order-customer">{customerName(order)}</strong><span className="admin-product-meta">{customerContact(order)}</span></TableCell>
      <TableCell><span className="admin-order-items-count">{itemSummary(order)}</span><span className="admin-product-meta">{order.order_items.slice(0, 2).map(itemName).join(', ')}{order.order_items.length > 2 ? '…' : ''}</span></TableCell>
      <TableCell className="admin-product-price">{currency.format(order.total_price || 0)}</TableCell>
      <TableCell><span className="admin-order-payment">{order.paymentMethod || '—'}</span><span className="admin-product-meta">{order.is_paid ? 'Paid' : 'Unpaid'}</span></TableCell>
      <TableCell>{statusBadge(order)}</TableCell>
      <TableCell>{formatDate(order.createdAt)}</TableCell>
      <TableCell><div className="admin-row-actions"><Link className="admin-button admin-button-icon" to={`/orders/${order.id}`} aria-label={`View order ${order.id}`}><Eye size={15} /></Link><Button type="button" variant="icon" size="sm" aria-label={order.status === 'completed' ? `Reopen order ${order.id}` : `Complete order ${order.id}`} onClick={() => onStatus(order)}>{order.status === 'completed' ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}</Button><Button type="button" variant="icon" size="sm" aria-label={`Delete order ${order.id}`} onClick={() => onDelete(order)}><Trash2 size={15} /></Button></div></TableCell>
    </TableRow>)}</TableBody></Table></div>
    <div className="admin-order-cards-mobile">{orders.map((order) => <article className="admin-order-card-mobile" key={order.id}>
      <div className="admin-order-card-header"><div><Link className="admin-order-id" to={`/orders/${order.id}`}>Order #{order.id.slice(-8)}</Link><span className="admin-product-meta">{formatDate(order.createdAt)}</span></div>{statusBadge(order)}</div>
      <div className="admin-order-card-customer"><strong>{customerName(order)}</strong><span>{customerContact(order)}</span></div>
      <div className="admin-order-card-items">{order.order_items.slice(0, 3).map((item, index) => <span key={`${item.name}-${index}`}>{itemName(item)} × {item.quantity}</span>)}{order.order_items.length > 3 && <span>+{order.order_items.length - 3} more</span>}</div>
      <div className="admin-order-card-footer"><span><small>Total</small><strong>{currency.format(order.total_price || 0)}</strong></span><span><small>Payment</small><strong>{order.is_paid ? 'Paid' : 'Unpaid'}</strong></span><div className="admin-row-actions"><Link className="admin-button admin-button-icon" to={`/orders/${order.id}`} aria-label={`View order ${order.id}`}><Eye size={15} /></Link><Button type="button" variant="icon" size="sm" aria-label={order.status === 'completed' ? `Reopen order ${order.id}` : `Complete order ${order.id}`} onClick={() => onStatus(order)}>{order.status === 'completed' ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}</Button><Button type="button" variant="icon" size="sm" aria-label={`Delete order ${order.id}`} onClick={() => onDelete(order)}><Trash2 size={15} /></Button></div></div>
    </article>)}</div>
  </>
}
