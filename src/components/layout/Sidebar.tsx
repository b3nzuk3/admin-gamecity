import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { navSections } from './navigation'

function NavContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return <nav className="admin-sidebar-nav" aria-label="Admin navigation">
    {navSections.map((section, sectionIndex) => <div className="admin-nav-section" key={section.label || sectionIndex}>
      {section.label && <p className="admin-nav-section-label">{section.label}</p>}
      {section.items.map(({ label, path, icon: Icon, enabled }) => enabled ? (
        <NavLink key={path} to={path} onClick={onNavigate} className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link-active' : ''}`} end={path === '/'} title={collapsed ? label : undefined}>
          <Icon size={19} strokeWidth={2} aria-hidden="true" /><span>{label}</span>
        </NavLink>
      ) : <div key={path} className="admin-nav-link admin-nav-link-disabled" aria-disabled="true" title={collapsed ? `${label} is planned` : undefined}>
        <Icon size={19} strokeWidth={2} aria-hidden="true" /><span>{label}</span><small>Planned</small>
      </div>)}
    </div>)}
  </nav>
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return <aside className={`admin-sidebar${collapsed ? ' admin-sidebar-collapsed' : ''}`}>
    <div className="admin-brand">
      <div className="admin-brand-mark"><img src="/gamecity.png" alt="" /></div>
      <div className="admin-brand-copy"><strong>Gamecity</strong><span>Admin workspace</span></div>
    </div>
    <NavContent collapsed={collapsed} />
    <div className="admin-sidebar-footer">
      <Button variant="icon" size="sm" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </Button>
      {!collapsed && <span>Operations console</span>}
    </div>
  </aside>
}

export { NavContent }
