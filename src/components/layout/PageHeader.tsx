import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/primitives/Button'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: { label: string; to?: string; onClick?: () => void } }) {
  return <div className="admin-page-header">
    <div><div className="admin-page-eyebrow">{eyebrow || 'Workspace'}</div><h2>{title}</h2>{description && <p>{description}</p>}</div>
    {action && (action.to ? <Link className="admin-button admin-button-primary" to={action.to}>{action.label}<ArrowUpRight size={16} /></Link> : <Button variant="primary" onClick={action.onClick}>{action.label}<ArrowUpRight size={16} /></Button>)}
  </div>
}
