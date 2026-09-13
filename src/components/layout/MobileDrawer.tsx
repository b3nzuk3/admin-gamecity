import { X } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { NavContent } from './Sidebar'

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return <div className="admin-mobile-drawer-layer" role="presentation">
    <button className="admin-mobile-drawer-overlay" aria-label="Close navigation" onClick={onClose} />
    <aside className="admin-mobile-drawer" aria-label="Mobile admin navigation">
      <div className="admin-brand">
        <div className="admin-brand-mark"><img src="/gamecity.png" alt="" /></div>
        <div className="admin-brand-copy"><strong>Gamecity</strong><span>Admin workspace</span></div>
        <Button variant="icon" size="sm" aria-label="Close navigation" onClick={onClose}><X size={19} /></Button>
      </div>
      <NavContent collapsed={false} onNavigate={onClose} />
    </aside>
  </div>
}
