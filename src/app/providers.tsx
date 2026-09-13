import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { createAdminQueryClient } from './queryClient'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createAdminQueryClient)
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
