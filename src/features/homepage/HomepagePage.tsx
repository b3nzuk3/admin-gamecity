import { useMemo, useState } from 'react'
import { Info, Plus, RefreshCw } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/primitives/Card'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { Dialog } from '@/components/primitives/Dialog'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SkeletonBlock } from '@/components/feedback/Skeleton'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Toast, ToastRegion } from '@/components/feedback/Toast'
import { homepageApi } from '@/services/api'
import { homepageKeys } from '@/lib/queryKeys'
import type { HomepageSection, HomepageSectionLayout } from '@/types'
import { HeroEditor } from './HeroEditor'
import { HomepageLayoutPicker } from './HomepageLayoutPicker'
import { HomepageSectionCard, type SectionPatch } from './HomepageSectionCard'
import { ProductPicker } from './ProductPicker'

export function HomepagePage() {
  const queryClient = useQueryClient()
  const [pickerSectionId, setPickerSectionId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HomepageSection | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<{ title: string; subtitle: string; layout: HomepageSectionLayout }>({ title: '', subtitle: '', layout: 'grid' })
  const [notice, setNotice] = useState<string | null>(null)

  const homepage = useQuery({
    queryKey: homepageKeys.admin(),
    queryFn: ({ signal }) => homepageApi.get({ signal }),
  })
  const sections = useMemo(() => homepage.data?.sections ?? [], [homepage.data?.sections])
  const pickerSection = useMemo(() => sections.find((section) => section.id === pickerSectionId) || null, [pickerSectionId, sections])

  function updateConfig(response: Awaited<ReturnType<typeof homepageApi.get>>) {
    queryClient.setQueryData(homepageKeys.admin(), response)
  }

  const createSection = useMutation({
    mutationFn: () => homepageApi.createSection({ title: createForm.title, subtitle: createForm.subtitle, layout: createForm.layout, productIds: [] }),
    onSuccess: (response) => {
      updateConfig(response)
      setCreateOpen(false)
      setCreateForm({ title: '', subtitle: '', layout: 'grid' })
      setNotice('Homepage section created.')
    },
    onError: (exception: unknown) => setNotice(exception instanceof Error ? exception.message : 'Unable to create the section.'),
  })
  const updateSection = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: SectionPatch }) => homepageApi.updateSection(id, patch),
    onSuccess: (response) => { updateConfig(response); setNotice('Homepage section updated.') },
    onError: (exception: unknown) => setNotice(exception instanceof Error ? exception.message : 'Unable to update the section.'),
  })
  const removeSection = useMutation({
    mutationFn: (id: string) => homepageApi.removeSection(id),
    onSuccess: (response) => { updateConfig(response); setDeleteTarget(null); setNotice('Homepage section removed. Catalogue products were not deleted.') },
    onError: (exception: unknown) => setNotice(exception instanceof Error ? exception.message : 'Unable to remove the section.'),
  })
  const reorderSections = useMutation({
    mutationFn: (sectionIds: string[]) => homepageApi.reorderSections(sectionIds),
    onSuccess: (response) => updateConfig(response),
    onError: (exception: unknown) => setNotice(exception instanceof Error ? exception.message : 'Unable to reorder sections.'),
  })
  const updateProducts = useMutation({
    mutationFn: ({ id, productIds }: { id: string; productIds: string[] }) => homepageApi.updateSectionProducts(id, productIds),
    onSuccess: (response) => { updateConfig(response); setPickerSectionId(null); setNotice('Homepage products updated.') },
    onError: (exception: unknown) => setNotice(exception instanceof Error ? exception.message : 'Unable to update homepage products.'),
  })
  const busy = createSection.isPending || updateSection.isPending || removeSection.isPending || reorderSections.isPending || updateProducts.isPending

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= sections.length) return
    const ids = sections.map((section) => section.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorderSections.mutate(ids)
  }

  if (homepage.isPending) return <><PageHeader eyebrow="Content" title="Homepage" description="Loading homepage merchandising…" /><SkeletonBlock lines={10} /></>
  if (homepage.isError || !homepage.data) return <><PageHeader eyebrow="Content" title="Homepage" description="Manage the storefront hero and curated product collections." /><ErrorState title="Homepage unavailable" description="The homepage configuration could not be loaded. Check the connection and try again." action={<Button type="button" variant="secondary" onClick={() => void homepage.refetch()}><RefreshCw size={16} /> Try again</Button>} /></>

  return <>
    <PageHeader eyebrow="Content" title="Homepage" description="Manage the storefront hero and curated product collections without changing the catalogue." action={{ label: 'Add section', onClick: () => setCreateOpen(true) }} />
    {!homepage.data.configured && <div className="admin-system-banner"><Info size={17} /><span><strong>Starter configuration.</strong> The storefront is using its safe catalogue fallback until you save a homepage section or hero setting.</span></div>}
    <HeroEditor hero={homepage.data.hero} />
    <div className="admin-homepage-sections-heading"><div><div className="admin-page-eyebrow">Merchandising</div><h2>Homepage sections</h2><p>Arrange curated collections using products that already exist in the catalogue.</p></div><Button type="button" variant="primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Add section</Button></div>
    <div className="admin-homepage-sections">{sections.length === 0 ? <Card><CardContent><div className="admin-state admin-homepage-empty-state"><h3>No homepage sections yet</h3><p>Create a section, then select products from the live catalogue. Removing a reference never removes its product.</p><Button type="button" variant="primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Create first section</Button></div></CardContent></Card> : sections.map((section, index) => <HomepageSectionCard key={section.id} section={section} index={index} count={sections.length} busy={busy} onProducts={() => setPickerSectionId(section.id)} onDelete={() => setDeleteTarget(section)} onReorder={(direction) => moveSection(index, direction)} onProductReorder={(productIds) => updateProducts.mutate({ id: section.id, productIds })} onEdit={(patch) => updateSection.mutate({ id: section.id, patch })} />)}</div>
    <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Add homepage section"><div className="admin-homepage-create-form"><p className="admin-form-muted">Start with a title and optionally add context. Products can be selected after the section is created.</p><Input label="Section title" value={createForm.title} onChange={(event) => setCreateForm({ ...createForm, title: event.target.value })} placeholder="Featured Gaming PCs" maxLength={100} required /><Input label="Subtitle (optional)" value={createForm.subtitle} onChange={(event) => setCreateForm({ ...createForm, subtitle: event.target.value })} placeholder="Curated components for your next build" maxLength={240} /><HomepageLayoutPicker name="new-homepage-section-layout" value={createForm.layout} onChange={(layout) => setCreateForm({ ...createForm, layout })} /><div className="admin-dialog-actions"><Button type="button" variant="secondary" onClick={() => setCreateOpen(false)} disabled={createSection.isPending}>Cancel</Button><Button type="button" variant="primary" onClick={() => createSection.mutate()} disabled={!createForm.title.trim() || createSection.isPending}>{createSection.isPending ? 'Creating…' : 'Create section'}</Button></div></div></Dialog>
    <ProductPicker open={Boolean(pickerSection)} section={pickerSection} onClose={() => setPickerSectionId(null)} onSave={(productIds) => { if (pickerSection) updateProducts.mutate({ id: pickerSection.id, productIds }) }} saving={updateProducts.isPending} />
    <ConfirmDialog open={Boolean(deleteTarget)} title="Remove homepage section?" description="The homepage section will be removed. The catalogue products themselves will NOT be deleted." confirmLabel="Remove section" onCancel={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) removeSection.mutate(deleteTarget.id) }} busy={removeSection.isPending} />
    {notice && <ToastRegion><Toast message={notice} tone={notice.toLowerCase().includes('unable') ? 'error' : 'success'} /></ToastRegion>}
  </>
}
