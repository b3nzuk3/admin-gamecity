import { useEffect, useState } from 'react'
import { Check, LoaderCircle, Search, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Dialog } from '@/components/primitives/Dialog'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { Badge } from '@/components/primitives/Badge'
import { ErrorState } from '@/components/feedback/ErrorState'
import { productsApi } from '@/services/api'
import { productKeys } from '@/lib/queryKeys'
import type { HomepageSection, ProductSummary } from '@/types'

export function ProductPicker({ open, section, onClose, onSave, saving = false }: { open: boolean; section: HomepageSection | null; onClose: () => void; onSave: (productIds: string[]) => void; saving?: boolean }) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const products = useQuery({
    queryKey: productKeys.list({ page: 1, limit: 30, search: search || undefined, sort: 'name-asc' }),
    queryFn: ({ signal }) => productsApi.list({ page: 1, limit: 30, search: search || undefined, sort: 'name-asc' }, { signal }),
    enabled: open,
  })

  useEffect(() => {
    if (!open || !section) return
    setSelectedIds(section.products.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((item) => item.productId))
    setSearch('')
  }, [open, section])

  function toggle(product: ProductSummary) {
    const id = product._id || product.id || ''
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  return <Dialog open={open} onClose={onClose} title={section ? `Add products to ${section.title}` : 'Add products'}>
    <div className="admin-picker">
      <p className="admin-form-muted">Select existing catalogue products. This only creates homepage references; it never duplicates or deletes catalogue products.</p>
      <div className="admin-picker-search"><Search size={17} /><Input aria-label="Search catalogue products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, description, or brand" /></div>
      <div className="admin-picker-summary"><Badge tone="accent">{selectedIds.length} selected</Badge><span>Choose up to 30 visible results at a time.</span></div>
      {products.isPending ? <div className="admin-picker-loading"><LoaderCircle size={18} className="admin-spin" /> Searching catalogue…</div> : products.isError ? <ErrorState title="Catalogue unavailable" description="Products could not be loaded. Try again." action={<Button type="button" variant="secondary" onClick={() => void products.refetch()}>Try again</Button>} /> : products.data.products.length === 0 ? <div className="admin-picker-empty">No catalogue products match this search.</div> : <div className="admin-picker-list">{products.data.products.map((product) => { const id = product._id || product.id || ''; const selected = selectedIds.includes(id); return <button type="button" className={`admin-picker-item${selected ? ' admin-picker-item-selected' : ''}`} key={id} onClick={() => toggle(product)} aria-pressed={selected}><img src={product.image} alt="" /><span className="admin-picker-item-copy"><strong>{product.name}</strong><small>{product.brand} · {product.category}</small><small>KES {product.price.toLocaleString('en-KE')} · {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}</small></span><span className="admin-picker-check" aria-hidden="true">{selected ? <Check size={17} /> : null}</span></button> })}</div>}
      <div className="admin-dialog-actions"><Button type="button" variant="secondary" onClick={onClose} disabled={saving}><X size={16} /> Cancel</Button><Button type="button" variant="primary" onClick={() => onSave(selectedIds)} disabled={saving}>{saving ? 'Saving…' : 'Save products'}</Button></div>
    </div>
  </Dialog>
}
