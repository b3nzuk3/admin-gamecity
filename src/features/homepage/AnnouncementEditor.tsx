import { useEffect, useRef, useState } from 'react'
import { Save } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/primitives/Card'
import { Input } from '@/components/primitives/Input'
import { Textarea } from '@/components/primitives/Textarea'
import { Toast, ToastRegion } from '@/components/feedback/Toast'
import { homepageApi } from '@/services/api'
import { homepageKeys } from '@/lib/queryKeys'
import type { HomepageAnnouncement } from '@/types'

type Props = { announcement: HomepageAnnouncement }

export function AnnouncementEditor({ announcement }: Props) {
  const [form, setForm] = useState<HomepageAnnouncement>(announcement)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const dirtyRef = useRef(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!dirtyRef.current) setForm(announcement)
  }, [announcement])

  const save = useMutation({
    mutationFn: () => homepageApi.updateAnnouncement(form),
    onSuccess: (response) => {
      dirtyRef.current = false
      setForm(response.announcement)
      queryClient.setQueryData(homepageKeys.admin(), response)
      setNotice('Announcement bar configuration saved.')
      setError(null)
    },
    onError: (exception: unknown) => setError(exception instanceof Error ? exception.message : 'Unable to save the announcement bar.'),
  })

  function update(field: keyof HomepageAnnouncement, value: string | boolean) {
    dirtyRef.current = true
    setForm((current) => ({ ...current, [field]: value }))
    setError(null)
    setNotice(null)
  }

  return <Card className="admin-homepage-announcement-card" aria-busy={save.isPending}>
    <CardHeader>
      <div className="admin-card-heading"><div><CardTitle>Announcement bar</CardTitle><p className="admin-card-subtitle">Update the short message displayed across the storefront without editing code.</p></div><span className="admin-homepage-card-kicker">Storefront notice</span></div>
    </CardHeader>
    <CardContent>
      <fieldset className="admin-homepage-announcement-fields" disabled={save.isPending}>
        <Textarea label="Announcement text" hint="Required. Up to 240 characters on desktop." value={form.text} onChange={(event) => update('text', event.target.value)} maxLength={240} required />
        <Input label="Mobile announcement (optional)" hint="Up to 120 characters. Leave blank to use the announcement text on mobile." value={form.mobileText} onChange={(event) => update('mobileText', event.target.value)} maxLength={120} />
        <div className="admin-homepage-two-column">
          <Input label="Link label (optional)" value={form.linkLabel} onChange={(event) => update('linkLabel', event.target.value)} maxLength={80} />
          <Input label="Link destination (optional)" hint="Local path or http(s) URL. Leave both link fields blank to remove the CTA." value={form.linkHref} onChange={(event) => update('linkHref', event.target.value)} maxLength={500} />
        </div>
        <label className="admin-toggle"><input type="checkbox" checked={form.enabled} onChange={(event) => update('enabled', event.target.checked)} /><span className="admin-toggle-track" aria-hidden="true" /><span>Show announcement bar on the storefront</span></label>
      </fieldset>
      {error && <p className="admin-form-error" role="alert">{error}</p>}
      <div className="admin-form-actions admin-homepage-actions"><span className="admin-form-muted">{save.isPending ? 'Saving announcement…' : 'Changes are published when you save.'}</span><Button type="button" variant="primary" onClick={() => save.mutate()} disabled={save.isPending || !form.text.trim()}><Save size={16} />{save.isPending ? 'Saving…' : 'Save announcement'}</Button></div>
    </CardContent>
    {notice && <ToastRegion><Toast message={notice} tone="success" /></ToastRegion>}
  </Card>
}
