import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { AdminHeader } from './AdminHeader'
import { MobileDrawer } from './MobileDrawer'
import { Sidebar } from './Sidebar'

const titles: Array<{ match: string; title: string }> = [
  { match: '/products/new', title: 'New Product' },
  { match: '/products/', title: 'Product' },
  { match: '/products', title: 'Products' },
  { match: '/orders/', title: 'Order' },
  { match: '/orders', title: 'Orders' },
  { match: '/customers', title: 'Customers' },
  { match: '/inventory', title: 'Inventory' },
  { match: '/categories', title: 'Categories' },
  { match: '/homepage', title: 'Homepage' },
  { match: '/media', title: 'Media' },
  { match: '/settings', title: 'Settings' },
]

function getTitle(pathname: string) {
  return titles.find(({ match }) => match === pathname || (match.endsWith('/') && pathname.startsWith(match)))?.title || 'Dashboard'
}

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  return <div className="admin-app">
    <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
    <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    <div className={`admin-main${collapsed ? ' admin-main-collapsed' : ''}`}>
      <AdminHeader title={getTitle(pathname)} onOpenMenu={() => setMobileOpen(true)} onToggleSidebar={() => setCollapsed((value) => !value)} />
      <main className="admin-content"><div className="admin-content-inner"><Outlet /></div></main>
    </div>
  </div>
}
