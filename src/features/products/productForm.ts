import type { Product, ProductPayload, ProductOffer } from '@/types'
import { categoryId, categoryName } from './productCatalog'

export type ProductFormValues = {
  name: string
  description: string
  price: string
  countInStock: string
  brand: string
  category: string
  condition: 'New' | 'Pre-Owned'
  specifications: Record<string, string>
  offerEnabled: boolean
  offerType: 'percentage' | 'fixed'
  offerAmount: string
  offerStartDate: string
  offerEndDate: string
  image: string
  imageR2: string
  imageR2Variants: Record<string, string>
  images: string[]
  imagesR2: string[]
  uploadedKeys: string[]
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues | 'offer', string>>

function dateInputValue(value?: string) {
  if (!value) return ''
  return value.slice(0, 10)
}

export function emptyProductForm(): ProductFormValues {
  return {
    name: '', description: '', price: '', countInStock: '0', brand: '', category: '', condition: 'New',
    specifications: {}, offerEnabled: false, offerType: 'percentage', offerAmount: '0',
    offerStartDate: '', offerEndDate: '', image: '', imageR2: '', imageR2Variants: {},
    images: [], imagesR2: [], uploadedKeys: [],
  }
}

export function productToForm(product: Product): ProductFormValues {
  const offer = product.offer || {}
  const primary = product.image_r2 || product.image || ''
  const r2Gallery = product.images_r2 || []
  const legacyGallery = (product.images || []).filter((url) => url !== primary && !r2Gallery.includes(url))
  return {
    ...emptyProductForm(),
    name: product.name || '',
    description: product.description || '',
    price: String(product.price ?? 0),
    countInStock: String(product.countInStock ?? 0),
    brand: product.brand || '',
    category: categoryId(product.category) || product.category || '',
    condition: product.condition || 'New',
    specifications: Object.fromEntries(Object.entries(product.specifications || {}).map(([key, value]) => [key, String(value ?? '')])),
    offerEnabled: Boolean(offer.enabled),
    offerType: offer.type || 'percentage',
    offerAmount: String(offer.amount ?? 0),
    offerStartDate: dateInputValue(offer.startDate),
    offerEndDate: dateInputValue(offer.endDate),
    image: primary,
    imageR2: product.image_r2 || '',
    imageR2Variants: product.image_r2_variants || {},
    images: legacyGallery,
    imagesR2: r2Gallery,
  }
}

function numeric(value: string) {
  return Number(value)
}

export function validateProductForm(values: ProductFormValues, mode: 'create' | 'edit'): ProductFormErrors {
  const errors: ProductFormErrors = {}
  if (!values.name.trim()) errors.name = 'Product name is required'
  if (!values.description.trim()) errors.description = 'Description is required'
  if (!values.brand.trim()) errors.brand = 'Brand is required'
  if (!values.category) errors.category = 'Category is required'
  if (values.condition !== 'New' && values.condition !== 'Pre-Owned') errors.condition = 'Choose a valid condition'

  const price = numeric(values.price)
  if (values.price.trim() === '' || !Number.isFinite(price) || price < 0) errors.price = 'Price must be a non-negative number'
  const stock = numeric(values.countInStock)
  if (!Number.isInteger(stock) || stock < 0) errors.countInStock = 'Stock must be a non-negative integer'
  if (mode === 'create' && !values.image.trim() && !values.imageR2.trim()) errors.image = 'A primary image is required'

  if (values.offerEnabled) {
    const amount = numeric(values.offerAmount)
    if (!Number.isFinite(amount) || amount < 0) errors.offer = 'Offer amount must be non-negative'
    else if (values.offerType === 'percentage' && amount > 100) errors.offer = 'Percentage offers must be between 0 and 100'
    else if (values.offerType === 'fixed' && amount > price) errors.offer = 'Fixed offers cannot exceed the product price'
    if (values.offerStartDate && Number.isNaN(Date.parse(values.offerStartDate))) errors.offer = 'Offer start date is invalid'
    if (values.offerEndDate && Number.isNaN(Date.parse(values.offerEndDate))) errors.offer = 'Offer end date is invalid'
    if (values.offerStartDate && values.offerEndDate && values.offerEndDate < values.offerStartDate) errors.offer = 'Offer end date cannot be before start date'
  }
  return errors
}

function cleanSpecifications(values: Record<string, string>) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim()))
}

export function formToPayload(values: ProductFormValues): ProductPayload {
  const offer: ProductOffer = {
    enabled: values.offerEnabled,
    type: values.offerType,
    amount: numeric(values.offerAmount || '0'),
    ...(values.offerStartDate ? { startDate: values.offerStartDate } : {}),
    ...(values.offerEndDate ? { endDate: values.offerEndDate } : {}),
  }
  const primary = values.imageR2 || values.image
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    price: numeric(values.price),
    category: categoryName(values.category),
    countInStock: numeric(values.countInStock),
    brand: values.brand.trim(),
    condition: values.condition,
    image: primary,
    image_r2: values.imageR2 || null,
    image_r2_variants: Object.keys(values.imageR2Variants).length > 0 ? values.imageR2Variants : null,
    images: values.images,
    images_r2: values.imagesR2,
    specifications: cleanSpecifications(values.specifications),
    offer,
  }
}

export function formSnapshot(values: ProductFormValues) {
  const snapshot = { ...values }
  delete snapshot.uploadedKeys
  return JSON.stringify(snapshot)
}
