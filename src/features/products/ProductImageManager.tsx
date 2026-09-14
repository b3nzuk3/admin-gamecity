import { ImagePlus, LoaderCircle, Star, Trash2, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/primitives/Button'
import type { ProductFormValues } from './productForm'
import { productsApi } from '@/services/api'

export type ImageFormPatch = Partial<Pick<ProductFormValues, 'image' | 'imageR2' | 'imageR2Variants' | 'images' | 'imagesR2' | 'uploadedKeys'>>

type Props = {
  value: Pick<ProductFormValues, 'image' | 'imageR2' | 'imageR2Variants' | 'images' | 'imagesR2' | 'uploadedKeys'>
  onChange: (patch: ImageFormPatch) => void
  error?: string
}

export function ProductImageManager({ value, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const primary = value.imageR2 || value.image
  const gallery = [
    ...value.imagesR2.map((url) => ({ url, source: 'r2' as const })),
    ...value.images.filter((url) => url !== primary && !value.imagesR2.includes(url)).map((url) => ({ url, source: 'legacy' as const })),
  ]

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploadError(null)
    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('images', file))
    try {
      const response = await productsApi.upload(formData)
      const urls = response.urls || []
      const keys = response.keys || []
      if (urls.length === 0) throw new Error(response.failures?.[0] || 'No images were uploaded')
      const nextPatch: ImageFormPatch = { uploadedKeys: [...value.uploadedKeys, ...keys] }
      if (!primary) {
        nextPatch.image = urls[0]
        nextPatch.imageR2 = urls[0]
        nextPatch.imageR2Variants = response.variants?.[0] || {}
        nextPatch.imagesR2 = [...value.imagesR2, ...urls.slice(1)]
      } else {
        nextPatch.imagesR2 = [...value.imagesR2, ...urls]
      }
      onChange(nextPatch)
      if (response.failed > 0) setUploadError(`${response.failed} image${response.failed === 1 ? '' : 's'} could not be uploaded.`)
    } catch (uploadException) {
      setUploadError(uploadException instanceof Error ? uploadException.message : 'Image upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removePrimary() {
    const nextR2 = [...value.imagesR2]
    const nextLegacy = [...value.images]
    const next = value.imageR2 ? (nextR2.shift() || nextLegacy.shift() || '') : (nextLegacy.shift() || nextR2.shift() || '')
    const nextIsR2 = Boolean(next && value.imagesR2.includes(next))
    onChange(next ? {
      image: next,
      imageR2: nextIsR2 ? next : '',
      imageR2Variants: {},
      imagesR2: nextIsR2 ? (value.imageR2 ? nextR2 : value.imagesR2.filter((item) => item !== next)) : value.imagesR2,
      images: nextIsR2 ? value.images : nextLegacy,
    } : { image: '', imageR2: '', imageR2Variants: {} })
  }

  function removeGallery(url: string, source: 'r2' | 'legacy') {
    onChange(source === 'r2'
      ? { imagesR2: value.imagesR2.filter((item) => item !== url) }
      : { images: value.images.filter((item) => item !== url) })
  }

  function moveGallery(index: number, direction: -1 | 1) {
    const r2 = [...value.imagesR2]
    const target = index + direction
    if (target < 0 || target >= r2.length) return
    ;[r2[index], r2[target]] = [r2[target], r2[index]]
    onChange({ imagesR2: r2 })
  }

  return <div className="admin-image-manager">
    <div className="admin-image-upload-row">
      <div>
        <span className="admin-input-label">Product images</span>
        <p className="admin-input-hint">Use WebP, PNG, or JPEG images up to 15 MB. The first image is the primary image.</p>
      </div>
      <input ref={inputRef} className="admin-visually-hidden" type="file" accept="image/*" multiple onChange={(event) => void handleFiles(event.target.files)} />
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}><Upload size={16} />{uploading ? 'Uploading…' : 'Choose images'}</Button>
    </div>
    {error && <p className="admin-field-error" role="alert">{error}</p>}
    {uploadError && <div className="admin-upload-error" role="alert"><X size={16} />{uploadError}</div>}
    {uploading && <div className="admin-upload-progress" role="status"><LoaderCircle size={16} className="admin-spin" /> Uploading images to secure storage…</div>}
    {primary ? <div className="admin-primary-image-card">
      <img src={primary} alt="Primary product preview" />
      <div><span className="admin-image-label"><Star size={14} fill="currentColor" /> Primary image</span><p>{value.imageR2 ? 'Stored in Cloudflare R2' : 'Existing storefront image'}</p></div>
      <Button type="button" variant="ghost" size="sm" aria-label="Remove primary image" onClick={removePrimary}><Trash2 size={15} /></Button>
    </div> : <div className="admin-image-empty"><ImagePlus size={24} /><span>No primary image selected</span></div>}
    {gallery.length > 0 && <div className="admin-gallery-grid">{gallery.map((item, index) => <div className="admin-gallery-item" key={`${item.source}-${item.url}`}>
      <img src={item.url} alt={`Product gallery image ${index + 1}`} />
      <div className="admin-gallery-actions">
        {item.source === 'r2' && <><Button type="button" variant="icon" size="sm" aria-label="Move image earlier" disabled={index === 0} onClick={() => moveGallery(index, -1)}>↑</Button><Button type="button" variant="icon" size="sm" aria-label="Move image later" disabled={index >= value.imagesR2.length - 1} onClick={() => moveGallery(index, 1)}>↓</Button></>}
        <Button type="button" variant="icon" size="sm" aria-label={`Remove gallery image ${index + 1}`} onClick={() => removeGallery(item.url, item.source)}><X size={14} /></Button>
      </div>
    </div>)}</div>}
  </div>
}
