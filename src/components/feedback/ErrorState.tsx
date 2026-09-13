import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

export function ErrorState({ title = 'Something went wrong', description, action }: { title?: string; description: string; action?: ReactNode }) {
  return <div className="admin-state admin-error-state"><div className="admin-state-icon"><AlertTriangle size={24} /></div><h3>{title}</h3><p>{description}</p>{action}</div>
}
