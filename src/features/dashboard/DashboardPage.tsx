import { useQuery } from '@tanstack/react-query'
import { Activity, ArrowRight, Boxes, CircleDollarSign, Info, Package, ShoppingCart, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/primitives/Card'
import { StatCard } from '@/components/primitives/StatCard'
import { Badge } from '@/components/primitives/Badge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'

import { PageHeader } from '@/components/layout/PageHeader'
import { adminQueryKeys } from '@/lib/queryKeys'
import { adminApi } from '@/services/api'

type HealthStatus = { status: string; database: string; timestamp: string }

export function DashboardPage() {
  const navigate = useNavigate()
  const health = useQuery({
    queryKey: adminQueryKeys.dashboard,
    queryFn: ({ signal }) => adminApi.get<HealthStatus>('/health', { signal }),
    staleTime: 30_000,
    retry: 1,
  })

  return <>
    <PageHeader eyebrow="Overview" title="Dashboard" description="Your Gamecity operations at a glance." action={{ label: 'Add product', to: '/products/new' }} />

    <div className="admin-system-banner"><Info size={17} aria-hidden="true" /><span><strong>Data connection</strong> · Live operational metrics will be available after the next integration phase.</span><Badge tone="accent">Phase 1</Badge></div>

    <section aria-label="Store overview" className="admin-metrics-panel">
      <StatCard label="Total products" value="N/A" detail="Awaiting data" icon={Package} />
      <StatCard label="Total users" value="N/A" detail="Access setup pending" icon={Users} tone="blue" />
      <StatCard label="Total orders" value="N/A" detail="Awaiting data" icon={ShoppingCart} tone="green" />
      <StatCard label="Revenue" value="N/A" detail="Awaiting data" icon={CircleDollarSign} tone="orange" />
    </section>

    <div className="admin-dashboard-grid">
      <Card className="admin-dashboard-primary">
        <CardHeader><div className="admin-card-heading"><div><CardTitle>Recent orders</CardTitle><p className="admin-card-subtitle">A quick view of your latest customer activity.</p></div><Link className="admin-text-link" to="/orders">View all <ArrowRight size={15} /></Link></div></CardHeader>
        <CardContent><EmptyState title="No orders to show" description="Recent orders will appear here when the data source is connected." /></CardContent>
      </Card>
      <div className="admin-dashboard-side">
        <Card className="admin-utility-card">
          <CardHeader><div className="admin-card-heading"><div><CardTitle>System status</CardTitle><p className="admin-card-subtitle">Read-only connection check</p></div><Activity size={18} className="admin-muted-icon" aria-hidden="true" /></div></CardHeader>
          <CardContent>{health.isPending ? <div className="admin-status-loading" role="status"><span className="admin-status-dot" aria-hidden="true" />Checking service…</div> : health.isError ? <ErrorState title="Connection unavailable" description="Check the API URL when backend access is enabled." /> : <div className="admin-health"><div><span>Service</span><strong>{health.data.status}</strong></div><div><span>Database</span><strong>{health.data.database}</strong></div></div>}</CardContent>
        </Card>
        <Card className="admin-utility-card">
          <CardHeader><div className="admin-card-heading"><div><CardTitle>Quick actions</CardTitle><p className="admin-card-subtitle">Common admin tasks</p></div></div></CardHeader>
          <CardContent><div className="admin-action-grid"><Button variant="secondary" onClick={() => navigate('/products')}><Package size={17} /> Products</Button><Button variant="secondary" onClick={() => navigate('/orders')}><ShoppingCart size={17} /> Orders</Button><Button variant="secondary" onClick={() => navigate('/inventory')}><Boxes size={17} /> Inventory</Button></div></CardContent>
        </Card>
      </div>
    </div>

    <div className="admin-dashboard-grid admin-dashboard-grid-bottom">
      <Card><CardHeader><div className="admin-card-heading"><div><CardTitle>Inventory alerts</CardTitle><p className="admin-card-subtitle">Know what needs attention before it sells out.</p></div><Boxes size={18} className="admin-muted-icon" aria-hidden="true" /></div></CardHeader><CardContent><EmptyState title="No alerts yet" description="Stock alerts will appear here once inventory is connected." action={<Link className="admin-text-link" to="/inventory">Open inventory <ArrowRight size={14} /></Link>} /></CardContent></Card>
      <Card><CardHeader><div className="admin-card-heading"><div><CardTitle>Recently added</CardTitle><p className="admin-card-subtitle">Keep your catalogue fresh and up to date.</p></div><Package size={18} className="admin-muted-icon" aria-hidden="true" /></div></CardHeader><CardContent><EmptyState title="No products to show" description="New catalogue items will appear here." action={<Link className="admin-text-link" to="/products/new">Add a product <ArrowRight size={14} /></Link>} /></CardContent></Card>
    </div>
  </>
}
