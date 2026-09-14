import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ProductForm } from './ProductForm'
import { productKeys } from '@/lib/queryKeys'
import { productsApi } from '@/services/api'

export function ProductCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const brands = useQuery({ queryKey: productKeys.brands(), queryFn: ({ signal }) => productsApi.brands({ signal }) })
  const create = useMutation({
    mutationFn: productsApi.create,
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product._id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })

  return <>
    <PageHeader eyebrow="Catalogue" title="New product" description="Add a product using the existing GameCity catalogue fields and secure image pipeline." />
    {brands.isError ? <ErrorState title="Brands unavailable" description="Existing brands could not be loaded. You can still type a brand manually." /> : null}
    <ProductForm mode="create" brands={brands.data || []} onSubmit={async (payload) => {
      const product = await create.mutateAsync(payload)
      navigate(`/products/${product._id}`, { replace: true })
    }} />
  </>
}
