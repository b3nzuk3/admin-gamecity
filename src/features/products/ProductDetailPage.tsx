import { useState } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, productsApi } from '@/services/api'
import { productKeys } from '@/lib/queryKeys'
import { Button } from '@/components/primitives/Button'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { SkeletonBlock } from '@/components/feedback/Skeleton'
import { Toast, ToastRegion } from '@/components/feedback/Toast'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProductForm } from './ProductForm'

export function ProductDetailPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const product = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: ({ signal }) => productsApi.detail(productId, { signal }),
    enabled: Boolean(productId),
  })
  const brands = useQuery({ queryKey: productKeys.brands(), queryFn: ({ signal }) => productsApi.brands({ signal }) })
  const update = useMutation({
    mutationFn: (payload: Parameters<typeof productsApi.update>[1]) => productsApi.update(productId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(productKeys.detail(productId), updated)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      if (updated.mediaCleanup?.warning) setToast(updated.mediaCleanup.warning)
    },
  })
  const remove = useMutation({
    mutationFn: () => productsApi.remove(productId),
    onSuccess: (result) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) })
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      navigate('/products', { replace: true, state: { message: result.mediaCleanup?.warning || 'Product deleted.' } })
    },
  })

  if (product.isPending) return <><PageHeader eyebrow="Catalogue" title="Product" description="Loading catalogue item…" /><SkeletonBlock lines={10} /></>
  if (product.isError) {
    const notFound = product.error instanceof ApiError && product.error.status === 404
    return <><PageHeader eyebrow="Catalogue" title={notFound ? 'Product not found' : 'Product unavailable'} description={notFound ? 'This catalogue item no longer exists.' : 'The product could not be loaded.'} action={{ label: 'Back to products', to: '/products' }} /><ErrorState title={notFound ? 'Product not found' : 'Unable to load product'} description={notFound ? 'Return to the catalogue to choose another product.' : 'Check the connection and try again.'} action={!notFound ? <Button type="button" variant="secondary" onClick={() => void product.refetch()}>Try again</Button> : undefined} /></>
  }
  if (!product.data) return null

  return <>
    <PageHeader eyebrow="Catalogue" title={product.data.name} description="Edit the live catalogue fields without changing the public storefront contract." action={{ label: 'Back to products', to: '/products' }} />
    <div className="admin-detail-toolbar"><Link className="admin-text-link" to="/products"><ArrowLeft size={15} /> Back to catalogue</Link><Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}><Trash2 size={16} /> Delete product</Button></div>
    <ProductForm mode="edit" initialProduct={product.data} brands={brands.data || []} onSubmit={async (payload) => { await update.mutateAsync(payload) }} />
    <ConfirmDialog open={deleteOpen} title="Delete product?" description={`This permanently removes “${product.data.name}” from the catalogue. This action cannot be undone.`} confirmLabel="Delete product" onCancel={() => setDeleteOpen(false)} onConfirm={() => remove.mutate()} busy={remove.isPending} />
    {toast && <ToastRegion><Toast message={toast} tone="info" /></ToastRegion>}
  </>
}
