import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

export function Dialog({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title">
        <div className="admin-dialog-header">
          <h2 id="admin-dialog-title">{title}</h2>
          <Button variant="icon" size="sm" aria-label="Close dialog" onClick={onClose}><X size={18} /></Button>
        </div>
        <div className="admin-dialog-content">{children}</div>
      </section>
    </div>
  )
}
