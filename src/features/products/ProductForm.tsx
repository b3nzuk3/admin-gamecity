import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, ArrowLeft, Check, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/primitives/Card'
import { Input } from '@/components/primitives/Input'
import { Select } from '@/components/primitives/Select'
import { Textarea } from '@/components/primitives/Textarea'
import { ProductImageManager } from './ProductImageManager'
import { PRODUCT_CATEGORIES, specificationKeys } from './productCatalog'
import { emptyProductForm, formSnapshot, formToPayload, productToForm, validateProductForm, type ProductFormErrors, type ProductFormValues } from './productForm'
import { useDirtyFormGuard } from './useDirtyFormGuard'
import { productsApi } from '@/services/api'
import type { Product, ProductPayload } from '@/types'

export function ProductForm({
  mode,
  initialProduct,
  brands,
  onSubmit,
  cancelTo = '/products',
}: {
  mode: 'create' | 'edit'
  initialProduct?: Product
  brands: string[]
  onSubmit: (payload: ProductPayload, values: ProductFormValues) => Promise<void>
  cancelTo?: string
}) {
  const initialValues = useMemo(() => initialProduct ? productToForm(initialProduct) : emptyProductForm(), [initialProduct])
  const [values, setValues] = useState<ProductFormValues>(initialValues)
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const initialSnapshot = useMemo(() => formSnapshot(initialValues), [initialValues])
  const dirty = formSnapshot(values) !== initialSnapshot
  useDirtyFormGuard(dirty)

  useEffect(() => {
    setValues(initialValues)
    setErrors({})
    setSubmitError(null)
  }, [initialValues])

  const visibleSpecs = specificationKeys(values.category)
  const hiddenSpecs = Object.entries(values.specifications).filter(([key, value]) => value.trim() && !visibleSpecs.includes(key))

  function update<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError(null)
  }

  function updateSpecification(key: string, value: string) {
    setValues((current) => ({ ...current, specifications: { ...current.specifications, [key]: value } }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateProductForm(values, mode)
    setErrors(nextErrors)
    setSubmitError(null)
    if (Object.keys(nextErrors).length > 0) return
    setSubmitting(true)
    try {
      await onSubmit(formToPayload(values), values)
    } catch (error) {
      if (values.uploadedKeys.length > 0) {
        void productsApi.deleteMedia(values.uploadedKeys).catch(() => undefined)
      }
      setSubmitError(error instanceof Error ? error.message : 'Unable to save product')
    } finally {
      setSubmitting(false)
    }
  }

  return <form className="admin-product-form" onSubmit={handleSubmit} noValidate>
    {submitError && <div className="admin-form-error" role="alert"><AlertTriangle size={17} /> <span>{submitError}</span></div>}

    <Card className="admin-form-section">
      <CardHeader><CardTitle>Basic information</CardTitle><p className="admin-card-subtitle">Use the same catalogue fields shown on the storefront.</p></CardHeader>
      <CardContent className="admin-form-grid">
        <Input label="Product name" name="name" value={values.name} onChange={(event) => update('name', event.target.value)} error={errors.name} required />
        <Textarea label="Description" name="description" value={values.description} onChange={(event) => update('description', event.target.value)} error={errors.description} required className="admin-form-full" />
      </CardContent>
    </Card>

    <div className="admin-form-columns">
      <Card className="admin-form-section">
        <CardHeader><CardTitle>Pricing & inventory</CardTitle><p className="admin-card-subtitle">Zero is valid for both price and stock.</p></CardHeader>
        <CardContent className="admin-form-grid">
          <Input label="Price (KES)" name="price" type="number" min="0" step="0.01" value={values.price} onChange={(event) => update('price', event.target.value)} error={errors.price} required />
          <Input label="Count in stock" name="countInStock" type="number" min="0" step="1" value={values.countInStock} onChange={(event) => update('countInStock', event.target.value)} error={errors.countInStock} required />
        </CardContent>
      </Card>
      <Card className="admin-form-section">
        <CardHeader><CardTitle>Category & brand</CardTitle><p className="admin-card-subtitle">Categories remain strings to preserve public URLs and filters.</p></CardHeader>
        <CardContent className="admin-form-grid">
          <Select label="Category" name="category" value={values.category} onChange={(event) => update('category', event.target.value)} error={errors.category} options={[{ value: '', label: 'Choose category' }, ...PRODUCT_CATEGORIES.map((category) => ({ value: category.id, label: category.name }))]} required />
          <div className="admin-input-wrap"><label className="admin-input-label" htmlFor="brand">Brand</label><input id="brand" name="brand" list="product-brands" className={`admin-input ${errors.brand ? 'admin-input-error' : ''}`} value={values.brand} onChange={(event) => update('brand', event.target.value)} required /><datalist id="product-brands">{brands.map((brand) => <option key={brand} value={brand} />)}</datalist>{errors.brand && <span className="admin-input-error">{errors.brand}</span>}<span className="admin-input-hint">Select an existing brand or type a new one.</span></div>
          <Select label="Condition" name="condition" value={values.condition} onChange={(event) => update('condition', event.target.value as ProductFormValues['condition'])} error={errors.condition} options={[{ value: 'New', label: 'New' }, { value: 'Pre-Owned', label: 'Pre-Owned' }]} />
        </CardContent>
      </Card>
    </div>

    <Card className="admin-form-section">
      <CardHeader><CardTitle>Specifications</CardTitle><p className="admin-card-subtitle">Fields change with the selected category; compatible values are preserved.</p></CardHeader>
      <CardContent>
        {hiddenSpecs.length > 0 && <div className="admin-spec-warning" role="status"><AlertTriangle size={16} /><span>Changing category kept {hiddenSpecs.length} populated field{hiddenSpecs.length === 1 ? '' : 's'} that are not shown for this category. They will be preserved in the product data.</span></div>}
        {visibleSpecs.length === 0 ? <p className="admin-form-muted">No category-specific specifications are defined for this category.</p> : <div className="admin-form-grid">{visibleSpecs.map((key) => <Input key={key} label={key} name={`spec-${key}`} value={values.specifications[key] || ''} onChange={(event) => updateSpecification(key, event.target.value)} />)}</div>}
      </CardContent>
    </Card>

    <Card className="admin-form-section admin-offer-section">
      <CardHeader><div className="admin-card-heading"><div><CardTitle>Offer</CardTitle><p className="admin-card-subtitle">Preserves percentage and fixed discount semantics.</p></div><label className="admin-toggle"><input type="checkbox" aria-label="Enable offer" checked={values.offerEnabled} onChange={(event) => update('offerEnabled', event.target.checked)} /><span className="admin-toggle-track" aria-hidden="true" /><span>Enable offer</span></label></div></CardHeader>
      {values.offerEnabled && <CardContent className="admin-form-grid admin-offer-content">
        <Select label="Offer type" name="offerType" value={values.offerType} onChange={(event) => update('offerType', event.target.value as ProductFormValues['offerType'])} options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed amount' }]} />
        <Input label={values.offerType === 'percentage' ? 'Discount (%)' : 'Discount (KES)'} name="offerAmount" type="number" min="0" step="0.01" value={values.offerAmount} onChange={(event) => update('offerAmount', event.target.value)} error={errors.offer} />
        <Input label="Start date" name="offerStartDate" type="date" value={values.offerStartDate} onChange={(event) => update('offerStartDate', event.target.value)} />
        <Input label="End date" name="offerEndDate" type="date" value={values.offerEndDate} onChange={(event) => update('offerEndDate', event.target.value)} />
      </CardContent>}
      {values.offerEnabled && errors.offer && <p className="admin-form-section-error">{errors.offer}</p>}
    </Card>

    <Card className="admin-form-section">
      <CardHeader><CardTitle>Images</CardTitle><p className="admin-card-subtitle">Uploads use the protected GameCity R2 pipeline.</p></CardHeader>
      <CardContent><ProductImageManager value={values} onChange={(patch) => setValues((current) => ({ ...current, ...patch }))} error={errors.image} /></CardContent>
    </Card>

    <div className="admin-form-actions"><Link className="admin-button admin-button-secondary" to={cancelTo}><ArrowLeft size={16} /> Cancel</Link><Button type="submit" variant="primary" size="lg" disabled={submitting}>{submitting ? 'Saving…' : <><Save size={16} /> {mode === 'create' ? 'Create product' : 'Save changes'}</>}</Button>{dirty && <span className="admin-dirty-note"><Check size={14} /> Unsaved changes</span>}</div>
  </form>
}
