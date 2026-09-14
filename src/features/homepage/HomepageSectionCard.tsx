import { Edit3, GripVertical, PackagePlus, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/primitives/Card'
import { Input } from '@/components/primitives/Input'
import { HomepageLayoutPicker } from './HomepageLayoutPicker'
import type { HomepageSection } from '@/types'

export type SectionPatch = Pick<HomepageSection, 'title' | 'subtitle' | 'enabled' | 'layout' | 'viewAllLabel' | 'viewAllHref'>

type Props = {
  section: HomepageSection
  index: number
  count: number
  onEdit: (patch: SectionPatch) => void
  onDelete: () => void
  onProducts: () => void
  onReorder: (direction: -1 | 1) => void
  onProductReorder: (productIds: string[]) => void
  busy?: boolean
}

export function HomepageSectionCard({ section, index, count, onEdit, onDelete, onProducts, onReorder, onProductReorder, busy = false }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<SectionPatch>({ title: section.title, subtitle: section.subtitle, enabled: section.enabled, layout: section.layout || 'grid', viewAllLabel: section.viewAllLabel, viewAllHref: section.viewAllHref })
  const productIds = section.products.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((item) => item.productId)

  function saveEdit() {
    onEdit(form)
    setEditing(false)
  }

  function moveProduct(indexToMove: number, direction: -1 | 1) {
    const target = indexToMove + direction
    if (target < 0 || target >= productIds.length) return
    const next = [...productIds]
    ;[next[indexToMove], next[target]] = [next[target], next[indexToMove]]
    onProductReorder(next)
  }

  return <Card className={`admin-homepage-section-card${section.enabled ? '' : ' admin-homepage-section-disabled'}`}>
    <CardHeader>
      <div className="admin-card-heading"><div className="admin-homepage-section-heading"><GripVertical size={18} className="admin-muted-icon" aria-hidden="true" /><div><CardTitle>{section.title}</CardTitle><p className="admin-card-subtitle">{section.subtitle || 'Manual product collection'} · {section.layout === 'carousel' ? 'Swipeable carousel' : 'Catalogue grid'} · {section.products.length} product{section.products.length === 1 ? '' : 's'}</p></div></div><div className="admin-homepage-section-heading-actions"><Badge tone={section.enabled ? 'success' : 'neutral'}>{section.enabled ? 'Enabled' : 'Disabled'}</Badge><Button type="button" variant="icon" size="sm" aria-label="Move section up" onClick={() => onReorder(-1)} disabled={index === 0 || busy}>↑</Button><Button type="button" variant="icon" size="sm" aria-label="Move section down" onClick={() => onReorder(1)} disabled={index === count - 1 || busy}>↓</Button></div></div>
    </CardHeader>
    <CardContent>
      {editing ? <div className="admin-homepage-section-edit"><Input label="Section title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={100} required /><Input label="Subtitle (optional)" value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} maxLength={240} /><HomepageLayoutPicker name={`homepage-section-${section.id}-layout`} value={form.layout} onChange={(layout) => setForm({ ...form, layout })} /><div className="admin-homepage-two-column"><Input label="View-all label (optional)" value={form.viewAllLabel} onChange={(event) => setForm({ ...form, viewAllLabel: event.target.value })} maxLength={50} /><Input label="View-all link (optional)" value={form.viewAllHref} onChange={(event) => setForm({ ...form, viewAllHref: event.target.value })} maxLength={500} /></div><label className="admin-toggle"><input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} /><span className="admin-toggle-track" aria-hidden="true" /><span>Show this section on the storefront</span></label><div className="admin-dialog-actions"><Button type="button" variant="secondary" onClick={() => setEditing(false)}><X size={15} /> Cancel</Button><Button type="button" variant="primary" onClick={saveEdit} disabled={busy}><Save size={15} /> Save section</Button></div></div> : <>
        <div className="admin-homepage-products-list">{section.products.length === 0 ? <p className="admin-form-muted">No products selected yet. Add products from the existing catalogue.</p> : section.products.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((reference, productIndex) => <div className="admin-homepage-product-row" key={`${reference.productId}-${productIndex}`}><div className="admin-homepage-product-identity">{reference.product ? <img src={reference.product.image} alt="" /> : <div className="admin-homepage-product-missing">?</div>}<span><strong>{reference.product?.name || 'Unavailable catalogue product'}</strong><small>{reference.product ? `${reference.product.brand} · KES ${reference.product.price.toLocaleString('en-KE')}` : `Reference ${reference.productId} is missing. Remove it before saving changes.`}</small></span></div><div className="admin-homepage-product-actions"><Badge tone={reference.product ? 'neutral' : 'danger'}>{reference.product ? (reference.product.countInStock > 0 ? 'In stock' : 'Out of stock') : 'Missing'}</Badge><Button type="button" variant="icon" size="sm" aria-label={`Move ${reference.product?.name || 'product'} up`} onClick={() => moveProduct(productIndex, -1)} disabled={productIndex === 0 || busy}>↑</Button><Button type="button" variant="icon" size="sm" aria-label={`Move ${reference.product?.name || 'product'} down`} onClick={() => moveProduct(productIndex, 1)} disabled={productIndex === productIds.length - 1 || busy}>↓</Button><Button type="button" variant="icon" size="sm" aria-label={`Remove ${reference.product?.name || 'product'} from homepage`} onClick={() => onProductReorder(productIds.filter((id) => id !== reference.productId))} disabled={busy}><Trash2 size={15} /></Button></div></div>)}</div>
        <div className="admin-homepage-section-actions"><Button type="button" variant="primary" size="sm" onClick={onProducts} disabled={busy}><PackagePlus size={15} /> Add products</Button><Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)} disabled={busy}><Edit3 size={15} /> Edit section</Button><Button type="button" variant="ghost" size="sm" onClick={onDelete} disabled={busy}><Trash2 size={15} /> Remove section</Button></div>
      </>}
    </CardContent>
  </Card>
}
