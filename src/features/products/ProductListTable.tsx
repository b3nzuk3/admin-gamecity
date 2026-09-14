import { Edit3, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/data-display/Table'
import type { ProductSummary } from '@/types'
import { formatCategory } from './productCatalog'

const currency = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 })

function productId(product: ProductSummary) {
  return product._id || product.id || ''
}

function stockTone(stock: number) {
  return stock > 0 ? 'success' as const : 'danger' as const
}

function offerLabel(product: ProductSummary) {
  if (!product.offer?.enabled) return '—'
  return product.offer.type === 'percentage' ? `${product.offer.amount ?? 0}% off` : `${currency.format(product.offer.amount ?? 0)} off`
}

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ProductListTable({ products, onDelete }: { products: ProductSummary[]; onDelete: (product: ProductSummary) => void }) {
  return <>
    <div className="admin-product-table-desktop"><Table className="admin-product-table"><TableHeader><TableRow><TableHead>Image</TableHead><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Brand</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Condition</TableHead><TableHead>Offer</TableHead><TableHead>Updated</TableHead><TableHead><span className="admin-visually-hidden">Actions</span></TableHead></TableRow></TableHeader><TableBody>{products.map((product) => <TableRow key={productId(product)}>
      <TableCell><img className="admin-product-thumb" src={product.image_r2_variants?.thumbnail || product.image} alt="" /></TableCell>
      <TableCell><Link className="admin-product-name" to={`/products/${productId(product)}`}>{product.name}</Link><span className="admin-product-meta">{product.numReviews || 0} review{product.numReviews === 1 ? '' : 's'}</span></TableCell>
      <TableCell>{formatCategory(product.category)}</TableCell><TableCell>{product.brand}</TableCell><TableCell className="admin-product-price">{currency.format(product.price || 0)}</TableCell><TableCell><Badge tone={stockTone(product.countInStock)}>{product.countInStock > 0 ? `${product.countInStock} available` : 'Out of stock'}</Badge></TableCell><TableCell><Badge tone="neutral">{product.condition}</Badge></TableCell><TableCell>{product.offer?.enabled ? <Badge tone="accent">{offerLabel(product)}</Badge> : <span className="admin-muted-text">—</span>}</TableCell><TableCell>{formatDate(product.updatedAt || product.createdAt)}</TableCell><TableCell><div className="admin-row-actions"><Link className="admin-button admin-button-icon" to={`/products/${productId(product)}`} aria-label={`Edit ${product.name}`}><Edit3 size={15} /></Link><Button type="button" variant="icon" size="sm" aria-label={`Delete ${product.name}`} onClick={() => onDelete(product)}><Trash2 size={15} /></Button></div></TableCell>
    </TableRow>)}</TableBody></Table></div>
    <div className="admin-product-cards-mobile">{products.map((product) => <article className="admin-product-card-mobile" key={productId(product)}><div className="admin-product-card-top"><img className="admin-product-thumb admin-product-thumb-large" src={product.image_r2_variants?.thumbnail || product.image} alt="" /><div className="admin-product-card-title"><Link className="admin-product-name" to={`/products/${productId(product)}`}>{product.name}</Link><span className="admin-product-meta">{formatCategory(product.category)} · {product.brand}</span></div><details className="admin-row-menu"><summary aria-label={`Actions for ${product.name}`}><MoreHorizontal size={18} /></summary><div><Link className="admin-menu-action" to={`/products/${productId(product)}`}><Edit3 size={14} /> Edit</Link><button className="admin-menu-action admin-menu-danger" type="button" onClick={() => onDelete(product)}><Trash2 size={14} /> Delete</button></div></details></div><div className="admin-product-card-grid"><span><small>Price</small><strong>{currency.format(product.price || 0)}</strong></span><span><small>Stock</small><Badge tone={stockTone(product.countInStock)}>{product.countInStock > 0 ? product.countInStock : 'Out'}</Badge></span><span><small>Condition</small><strong>{product.condition}</strong></span><span><small>Offer</small><strong>{offerLabel(product)}</strong></span></div></article>)}</div>
  </>
}
