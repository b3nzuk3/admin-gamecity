import { Menu, PanelLeft } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { useAuth } from '@/auth/authContext'

export function AdminHeader({ title, onOpenMenu, onToggleSidebar }: { title: string; onOpenMenu: () => void; onToggleSidebar: () => void }) {
  const { user, logout } = useAuth()
  return <header className="admin-header">
    <div className="admin-header-left">
      <Button variant="icon" size="md" className="admin-mobile-menu-button" aria-label="Open navigation" onClick={onOpenMenu}><Menu size={21} /></Button>
      <Button variant="icon" size="md" className="admin-desktop-collapse-button" aria-label="Toggle sidebar" onClick={onToggleSidebar}><PanelLeft size={19} /></Button>
      <div><span className="admin-eyebrow">GameCity Electronics</span><h1>{title}</h1></div>
    </div>
    <div className="admin-header-right">
      <div className="admin-profile" aria-label="Admin profile">
        <span className="admin-profile-avatar" aria-hidden="true">A</span>
        <span className="admin-profile-copy"><strong>{user?.name || 'Admin'}</strong><small>{user?.email || 'Operations'}</small></span>
      </div>
      <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
    </div>
  </header>
}
