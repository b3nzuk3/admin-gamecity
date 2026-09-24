import { ImageOff, ImagePlus, LoaderCircle, RefreshCw, Star, Trash2, Upload, X } from 'lucide-react'
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

type GalleryItem = {
  url: string
  source: 'r2' | 'legacy'
  sourceIndex: number
}

type UploadAction = 'primary' | 'gallery' | 'gallery-replacement'

export function ProductImageManager({ value, onChange, error }: Props) {
  const primaryInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const galleryReplacementInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAction, setUploadingAction] = useState<UploadAction | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [missingImages, setMissingImages] = useState<string[]>([])
  const [galleryReplacement, setGalleryReplacement] = useState<GalleryItem | null>(null)
  const primary = value.imageR2 || value.image
  const gallery: GalleryItem[] = [
    ...value.imagesR2.map((url, sourceIndex) => ({ url, source: 'r2' as const, sourceIndex })),
    ...value.images
      .filter((url) => url !== primary && !value.imagesR2.includes(url))
      .map((url, sourceIndex) => ({ url, source: 'legacy' as const, sourceIndex })),
  ]
  const uploading = uploadingAction !== null

  function markMissing(url: string) {
    setMissingImages((current) => current.includes(url) ? current : [...current, url])
  }

  function markLoaded(url: string) {
    setMissingImages((current) => current.filter((item) => item !== url))
  }

  async function uploadFiles(files: File[]) {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))
    const response = await productsApi.upload(formData)
    const urls = response.urls || []
    if (urls.length === 0) throw new Error(response.failures?.[0] || 'No images were uploaded')
    if (response.failed > 0) {
      setUploadError(`${response.failed} image${response.failed === 1 ? '' : 's'} could not be uploaded.`)
    }
    return { response, urls, keys: response.keys || [] }
  }

  async function replacePrimary(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadingAction('primary')
    try {
      const { response, urls, keys } = await uploadFiles([file])
      onChange({
        image: urls[0],
        imageR2: urls[0],
        imageR2Variants: response.variants?.[0] || {},
        uploadedKeys: [...value.uploadedKeys, ...keys],
      })
      markLoaded(urls[0])
    } catch (uploadException) {
      setUploadError(uploadException instanceof Error ? uploadException.message : 'Primary image upload failed')
    } finally {
      setUploadingAction(null)
      if (primaryInputRef.current) primaryInputRef.current.value = ''
    }
  }

  async function addGalleryImages(files: FileList | null) {
    if (!files?.length) return
    setUploadError(null)
    setUploadingAction('gallery')
    try {
      const { urls, keys } = await uploadFiles(Array.from(files))
      onChange({
        imagesR2: [...value.imagesR2, ...urls],
        uploadedKeys: [...value.uploadedKeys, ...keys],
      })
    } catch (uploadException) {
      setUploadError(uploadException instanceof Error ? uploadException.message : 'Gallery image upload failed')
    } finally {
      setUploadingAction(null)
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  function chooseGalleryReplacement(item: GalleryItem) {
    setGalleryReplacement(item)
    galleryReplacementInputRef.current?.click()
  }

  async function replaceGallery(files: FileList | null) {
    const file = files?.[0]
    const target = galleryReplacement
    if (!file || !target) return
    setUploadError(null)
    setUploadingAction('gallery-replacement')
    try {
      const { urls, keys } = await uploadFiles([file])
      const replacementUrl = urls[0]
      if (target.source === 'r2') {
        const imagesR2 = [...value.imagesR2]
        imagesR2[target.sourceIndex] = replacementUrl
        onChange({ imagesR2, uploadedKeys: [...value.uploadedKeys, ...keys] })
      } else {
        onChange({
          images: value.images.filter((url) => url !== target.url),
          imagesR2: [...value.imagesR2, replacementUrl],
          uploadedKeys: [...value.uploadedKeys, ...keys],
        })
      }
      markLoaded(replacementUrl)
    } catch (uploadException) {
      setUploadError(uploadException instanceof Error ? uploadException.message : 'Gallery image replacement failed')
    } finally {
      setUploadingAction(null)
      setGalleryReplacement(null)
      if (galleryReplacementInputRef.current) galleryReplacementInputRef.current.value = ''
    }
  }

  function removePrimary() {
    onChange({ image: '', imageR2: '', imageR2Variants: {} })
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

  const primaryMissing = Boolean(primary && missingImages.includes(primary))

  return <div className="admin-image-manager">
    <div className="admin-image-upload-row">
      <div>
        <span className="admin-input-label">Product images</span>
        <p className="admin-input-hint">Set the primary image separately, then add or replace gallery images. WebP, PNG, and JPEG files up to 15 MB are supported.</p>
      </div>
      <input ref={primaryInputRef} className="admin-visually-hidden" type="file" accept="image/*" onChange={(event) => void replacePrimary(event.target.files)} />
      <input ref={galleryInputRef} className="admin-visually-hidden" type="file" accept="image/*" multiple onChange={(event) => void addGalleryImages(event.target.files)} />
      <input ref={galleryReplacementInputRef} className="admin-visually-hidden" type="file" accept="image/*" onChange={(event) => void replaceGallery(event.target.files)} />
      <Button type="button" variant="secondary" onClick={() => galleryInputRef.current?.click()} disabled={uploading || !primary} title={!primary ? 'Choose a primary image first' : undefined}>
        <Upload size={16} />{uploadingAction === 'gallery' ? 'Uploading…' : 'Add gallery images'}
      </Button>
    </div>
    {error && <p className="admin-field-error" role="alert">{error}</p>}
    {uploadError && <div className="admin-upload-error" role="alert"><X size={16} />{uploadError}</div>}
    {uploading && <div className="admin-upload-progress" role="status"><LoaderCircle size={16} className="admin-spin" /> Uploading images to secure storage…</div>}

    {primary ? <div className={`admin-primary-image-card${primaryMissing ? ' admin-image-missing' : ''}`}>
      <img src={primary} alt="Primary product preview" onError={() => markMissing(primary)} onLoad={() => markLoaded(primary)} />
      <div>
        {primaryMissing
          ? <span className="admin-image-missing-label"><ImageOff size={15} /> Image missing from storage</span>
          : <span className="admin-image-label"><Star size={14} fill="currentColor" /> Primary image</span>}
        <p>{primaryMissing ? 'Upload a replacement before saving this product.' : value.imageR2 ? 'Stored in Cloudflare R2' : 'Existing storefront image'}</p>
      </div>
      <div className="admin-primary-image-actions">
        <Button type="button" variant="secondary" size="sm" aria-label="Replace primary image" onClick={() => primaryInputRef.current?.click()} disabled={uploading}>
          <RefreshCw size={15} /> {uploadingAction === 'primary' ? 'Replacing…' : 'Replace'}
        </Button>
        <Button type="button" variant="ghost" size="sm" aria-label="Remove primary image" onClick={removePrimary} disabled={uploading}><Trash2 size={15} /></Button>
      </div>
    </div> : <div className="admin-image-empty">
      <ImagePlus size={24} />
      <span>No primary image selected</span>
      <Button type="button" variant="secondary" size="sm" onClick={() => primaryInputRef.current?.click()} disabled={uploading}>Choose primary image</Button>
    </div>}

    {gallery.length > 0 && <div className="admin-gallery-grid">{gallery.map((item, index) => {
      const missing = missingImages.includes(item.url)
      return <div className={`admin-gallery-item${missing ? ' admin-image-missing' : ''}`} key={`${item.source}-${item.url}`}>
        <img src={item.url} alt={`Product gallery image ${index + 1}`} onError={() => markMissing(item.url)} onLoad={() => markLoaded(item.url)} />
        {missing && <span className="admin-gallery-missing-label"><ImageOff size={15} /> Missing image</span>}
        <div className="admin-gallery-actions">
          {item.source === 'r2' && <><Button type="button" variant="icon" size="sm" aria-label="Move image earlier" disabled={uploading || index === 0} onClick={() => moveGallery(item.sourceIndex, -1)}>↑</Button><Button type="button" variant="icon" size="sm" aria-label="Move image later" disabled={uploading || item.sourceIndex >= value.imagesR2.length - 1} onClick={() => moveGallery(item.sourceIndex, 1)}>↓</Button></>}
          <Button type="button" variant="icon" size="sm" aria-label={`Replace gallery image ${index + 1}`} title="Replace gallery image" onClick={() => chooseGalleryReplacement(item)} disabled={uploading}><RefreshCw size={14} /></Button>
          <Button type="button" variant="icon" size="sm" aria-label={`Remove gallery image ${index + 1}`} onClick={() => removeGallery(item.url, item.source)} disabled={uploading}><X size={14} /></Button>
        </div>
      </div>
    })}</div>}
  </div>
}
