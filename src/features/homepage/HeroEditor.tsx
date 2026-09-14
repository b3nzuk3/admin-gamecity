import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Save, Upload } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/primitives/Card'
import { Input } from '@/components/primitives/Input'
import { Textarea } from '@/components/primitives/Textarea'
import { Toast, ToastRegion } from '@/components/feedback/Toast'
import { homepageApi } from '@/services/api'
import { productsApi } from '@/services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { homepageKeys } from '@/lib/queryKeys'
import type { HomepageHero } from '@/types'

type Props = { hero: HomepageHero }

export function HeroEditor({ hero }: Props) {
  const [form, setForm] = useState<HomepageHero>(hero)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => setForm(hero), [hero])

  const save = useMutation({
    mutationFn: () => homepageApi.updateHero(form),
    onSuccess: (response) => {
      queryClient.setQueryData(homepageKeys.admin(), response)
      setNotice('Hero configuration saved.')
      setError(null)
    },
    onError: (exception: unknown) => setError(exception instanceof Error ? exception.message : 'Unable to save the hero.'),
  })

  function update(field: keyof HomepageHero, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }))
    setNotice(null)
  }

  async function uploadHero(file: File | undefined) {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const data = new FormData()
      data.append('images', file)
      const result = await productsApi.upload(data)
      if (!result.urls?.[0]) throw new Error(result.failures?.[0] || 'Hero image upload failed')
      update('imageUrl', result.urls[0])
      setNotice('Hero image uploaded. Save the hero to publish it.')
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Hero image upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return <Card className="admin-homepage-hero-card">
    <CardHeader>
      <div className="admin-card-heading"><div><CardTitle>Hero</CardTitle><p className="admin-card-subtitle">Set the first impression for the storefront. The image uses the existing authenticated R2 upload pipeline.</p></div><span className="admin-homepage-card-kicker">Editorial split layout</span></div>
    </CardHeader>
    <CardContent>
      <div className="admin-homepage-hero-grid">
        <div className="admin-homepage-hero-fields">
          <Input label="Eyebrow" value={form.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} maxLength={80} />
          <Input label="Title" value={form.title} onChange={(event) => update('title', event.target.value)} maxLength={120} required />
          <Input label="Highlighted phrase" hint="Optional phrase rendered in the amber accent." value={form.highlightText} onChange={(event) => update('highlightText', event.target.value)} maxLength={80} />
          <Textarea label="Description" value={form.description} onChange={(event) => update('description', event.target.value)} maxLength={500} required />
          <div className="admin-homepage-two-column">
            <Input label="Primary CTA label" value={form.primaryCtaLabel} onChange={(event) => update('primaryCtaLabel', event.target.value)} maxLength={80} required />
            <Input label="Primary CTA link" hint="Local path or https URL." value={form.primaryCtaHref} onChange={(event) => update('primaryCtaHref', event.target.value)} maxLength={500} required />
            <Input label="Secondary CTA label" value={form.secondaryCtaLabel} onChange={(event) => update('secondaryCtaLabel', event.target.value)} maxLength={80} />
            <Input label="Secondary CTA link" hint="Local path or https URL." value={form.secondaryCtaHref} onChange={(event) => update('secondaryCtaHref', event.target.value)} maxLength={500} />
          </div>
        </div>
        <div className="admin-homepage-hero-media">
          <div className="admin-homepage-image-preview">{form.imageUrl ? <img src={form.imageUrl} alt="Hero preview" /> : <div><ImagePlus size={26} /><span>No hero image selected</span></div>}</div>
          <Input label="Image URL" value={form.imageUrl} onChange={(event) => update('imageUrl', event.target.value)} maxLength={1000} required />
          <Input label="Image alt text" value={form.imageAlt} onChange={(event) => update('imageAlt', event.target.value)} maxLength={200} required />
          <input ref={inputRef} className="admin-visually-hidden" type="file" accept="image/*" onChange={(event) => void uploadHero(event.target.files?.[0])} />
          <Button type="button" variant="secondary" fullWidth onClick={() => inputRef.current?.click()} disabled={uploading}><Upload size={16} />{uploading ? 'Uploading…' : 'Upload hero image'}</Button>
          <label className="admin-toggle"><input type="checkbox" checked={form.enabled} onChange={(event) => update('enabled', event.target.checked)} /><span className="admin-toggle-track" aria-hidden="true" /><span>Show hero on the storefront</span></label>
        </div>
      </div>
      {error && <p className="admin-form-error" role="alert">{error}</p>}
      <div className="admin-form-actions admin-homepage-actions"><span className="admin-form-muted">Changes are published when you save.</span><Button type="button" variant="primary" onClick={() => save.mutate()} disabled={save.isPending || uploading}><Save size={16} />{save.isPending ? 'Saving…' : 'Save hero'}</Button></div>
    </CardContent>
    {notice && <ToastRegion><Toast message={notice} tone="success" /></ToastRegion>}
  </Card>
}
