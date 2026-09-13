import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Dialog } from '@/components/primitives/Dialog'

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onCancel, onConfirm, busy = false }: { open: boolean; title: string; description: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void; busy?: boolean }) {
  return <Dialog open={open} onClose={onCancel} title={title}><div className="admin-confirm"><AlertTriangle size={28} className="admin-confirm-icon" /><p>{description}</p><div className="admin-dialog-actions"><Button variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button><Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Working...' : confirmLabel}</Button></div></div></Dialog>
}
