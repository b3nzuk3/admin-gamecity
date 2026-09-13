import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="admin-state admin-empty-state"><div className="admin-state-icon"><Inbox size={24} /></div><h3>{title}</h3><p>{description}</p>{action}</div>
}
