import { Link } from 'react-router-dom'
import { Badge } from '@/components/primitives/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/data-display/Table'
import type { ProductSummary } from '@/types'
import { formatCategory } from '@/features/products/productCatalog'

const currency = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 })

function productId(product: ProductSummary) {
  return product._id || product.id || ''
}

function stockState(value: number) {
  if (value <= 0) return { label: 'Out of stock', tone: 'danger' as const }
  if (value <= 5) return { label: 'Low stock', tone: 'warning' as const }
  return { label: 'In stock', tone: 'success' as const }
}

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function InventoryTable({ products }: { products: ProductSummary[] }) {
  return <>
    <div className="admin-inventory-table-desktop"><Table className="admin-inventory-table"><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Brand</TableHead><TableHead>Unit price</TableHead><TableHead>Units available</TableHead><TableHead>State</TableHead><TableHead>Updated</TableHead><TableHead><span className="admin-visually-hidden">Actions</span></TableHead></TableRow></TableHeader><TableBody>{products.map((product) => { const state = stockState(product.countInStock); return <TableRow key={productId(product)}>
      <TableCell><div className="admin-inventory-product"><img className="admin-product-thumb" src={product.image_r2_variants?.thumbnail || product.image} alt="" /><div><Link className="admin-product-name" to={`/products/${productId(product)}`}>{product.name}</Link><span className="admin-product-meta">{product.condition}</span></div></div></TableCell>
      <TableCell>{formatCategory(product.category)}</TableCell><TableCell>{product.brand}</TableCell><TableCell className="admin-product-price">{currency.format(product.price || 0)}</TableCell><TableCell><strong className="admin-inventory-quantity">{product.countInStock}</strong></TableCell><TableCell><Badge tone={state.tone}>{state.label}</Badge></TableCell><TableCell>{formatDate(product.updatedAt || product.createdAt)}</TableCell><TableCell><Link className="admin-button admin-button-icon" to={`/products/${productId(product)}`} aria-label={`Open ${product.name}`}><span aria-hidden="true">→</span></Link></TableCell>
    </TableRow> })}</TableBody></Table></div>
    <div className="admin-inventory-cards-mobile">{products.map((product) => { const state = stockState(product.countInStock); return <article className="admin-inventory-card-mobile" key={productId(product)}><div className="admin-inventory-card-top"><img className="admin-product-thumb admin-product-thumb-large" src={product.image_r2_variants?.thumbnail || product.image} alt="" /><div className="admin-product-card-title"><Link className="admin-product-name" to={`/products/${productId(product)}`}>{product.name}</Link><span className="admin-product-meta">{formatCategory(product.category)} · {product.brand}</span></div>{state && <Badge tone={state.tone}>{state.label}</Badge>}</div><div className="admin-inventory-card-grid"><span><small>Available</small><strong>{product.countInStock}</strong></span><span><small>Unit price</small><strong>{currency.format(product.price || 0)}</strong></span><span><small>Condition</small><strong>{product.condition}</strong></span><span><small>Updated</small><strong>{formatDate(product.updatedAt || product.createdAt)}</strong></span></div></article> })}</div>
  </>
}
