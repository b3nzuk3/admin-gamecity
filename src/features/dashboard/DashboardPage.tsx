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
import { productKeys, userKeys } from '@/lib/queryKeys'
import { adminApi, productsApi, usersApi } from '@/services/api'

 type HealthStatus = { status: string; database: string; timestamp: string }

function productImage(product: { image: string; image_r2_variants?: Record<string, string> | null }) {
  return product.image_r2_variants?.thumbnail || product.image
}

export function DashboardPage() {
  const navigate = useNavigate()
  const health = useQuery({ queryKey: ['admin', 'dashboard', 'health'], queryFn: ({ signal }) => adminApi.get<HealthStatus>('/health', { signal }), staleTime: 30_000, retry: 1 })
  const recent = useQuery({ queryKey: productKeys.list({ page: 1, limit: 5, sort: 'newest' }), queryFn: ({ signal }) => productsApi.list({ page: 1, limit: 5, sort: 'newest' }, { signal }) })
  const outOfStock = useQuery({ queryKey: productKeys.list({ page: 1, limit: 5, stock: 'out-of-stock', sort: 'stock-asc' }), queryFn: ({ signal }) => productsApi.list({ page: 1, limit: 5, stock: 'out-of-stock', sort: 'stock-asc' }, { signal }) })
  const users = useQuery({ queryKey: userKeys.list(), queryFn: ({ signal }) => usersApi.list({ signal }) })

  return <>
    <PageHeader eyebrow="Overview" title="Dashboard" description="Your Gamecity operations at a glance." action={{ label: 'Add product', to: '/products/new' }} />
    <div className="admin-system-banner"><Info size={17} aria-hidden="true" /><span><strong>Catalogue connection</strong> · Product metrics below are sourced from the protected admin catalogue API.</span><Badge tone="success">Live</Badge></div>

    <section aria-label="Store overview" className="admin-metrics-panel">
      <StatCard label="Total products" value={recent.data ? String(recent.data.total) : 'N/A'} detail={recent.isPending ? 'Loading catalogue' : 'Catalogue items'} icon={Package} />
      <StatCard label="Total users" value={users.isPending ? '…' : users.isError ? 'N/A' : String(users.data.length)} detail={users.isError ? 'Unable to load users' : 'Registered accounts'} icon={Users} tone="blue" />
      <StatCard label="Total orders" value="N/A" detail="Not connected in Phase 3" icon={ShoppingCart} tone="green" />
      <StatCard label="Revenue" value="N/A" detail="Not connected in Phase 3" icon={CircleDollarSign} tone="orange" />
    </section>

    <div className="admin-dashboard-grid">
      <Card className="admin-dashboard-primary">
        <CardHeader><div className="admin-card-heading"><div><CardTitle>Recently added products</CardTitle><p className="admin-card-subtitle">The latest products added to the GameCity catalogue.</p></div><Link className="admin-text-link" to="/products">View all <ArrowRight size={15} /></Link></div></CardHeader>
        <CardContent>{recent.isPending ? <div className="admin-status-loading" role="status"><span className="admin-status-dot" aria-hidden="true" />Loading products…</div> : recent.isError ? <ErrorState title="Products unavailable" description="The catalogue could not be loaded." /> : recent.data.products.length === 0 ? <EmptyState title="No products to show" description="Create a product to populate this overview." action={<Link className="admin-text-link" to="/products/new">Add a product <ArrowRight size={14} /></Link>} /> : <div className="admin-recent-products">{recent.data.products.map((product) => <Link className="admin-recent-product" key={product._id} to={`/products/${product._id}`}><img src={productImage(product)} alt="" /><span><strong>{product.name}</strong><small>{product.brand} · KES {product.price.toLocaleString('en-KE')}</small></span><ArrowRight size={15} /></Link>)}</div>}</CardContent>
      </Card>
      <div className="admin-dashboard-side">
        <Card className="admin-utility-card">
          <CardHeader><div className="admin-card-heading"><div><CardTitle>System status</CardTitle><p className="admin-card-subtitle">Read-only connection check</p></div><Activity size={18} className="admin-muted-icon" aria-hidden="true" /></div></CardHeader>
          <CardContent>{health.isPending ? <div className="admin-status-loading" role="status"><span className="admin-status-dot" aria-hidden="true" />Checking service…</div> : health.isError ? <ErrorState title="Connection unavailable" description="Check the API URL when backend access is enabled." /> : <div className="admin-health"><div><span>Service</span><strong>{health.data.status}</strong></div><div><span>Database</span><strong>{health.data.database}</strong></div></div>}</CardContent>
        </Card>
        <Card className="admin-utility-card">
          <CardHeader><div className="admin-card-heading"><div><CardTitle>Quick actions</CardTitle><p className="admin-card-subtitle">Common admin tasks</p></div></div></CardHeader>
          <CardContent><div className="admin-action-grid"><Button type="button" variant="secondary" onClick={() => navigate('/products')}><Package size={17} /> Products</Button><Button type="button" variant="secondary" onClick={() => navigate('/orders')}><ShoppingCart size={17} /> Orders</Button><Button type="button" variant="secondary" onClick={() => navigate('/inventory')}><Boxes size={17} /> Inventory</Button></div></CardContent>
        </Card>
      </div>
    </div>

    <div className="admin-dashboard-grid admin-dashboard-grid-bottom">
      <Card><CardHeader><div className="admin-card-heading"><div><CardTitle>Inventory alerts</CardTitle><p className="admin-card-subtitle">Products currently out of stock.</p></div><Boxes size={18} className="admin-muted-icon" aria-hidden="true" /></div></CardHeader><CardContent>{outOfStock.isPending ? <div className="admin-status-loading" role="status"><span className="admin-status-dot" aria-hidden="true" />Checking stock…</div> : outOfStock.isError ? <ErrorState title="Inventory unavailable" description="Stock alerts could not be loaded." /> : outOfStock.data.total === 0 ? <EmptyState title="No stock alerts" description="All catalogue products currently have stock available." /> : <div className="admin-alert-list"><div className="admin-alert-summary"><Badge tone="danger">{outOfStock.data.total} out of stock</Badge><Link className="admin-text-link" to="/products?stock=out-of-stock">Review products <ArrowRight size={14} /></Link></div>{outOfStock.data.products.map((product) => <Link className="admin-alert-item" key={product._id} to={`/products/${product._id}`}><span>{product.name}</span><strong>0 available</strong></Link>)}</div>}</CardContent></Card>
      <Card><CardHeader><div className="admin-card-heading"><div><CardTitle>Recently added</CardTitle><p className="admin-card-subtitle">Keep your catalogue fresh and up to date.</p></div><Package size={18} className="admin-muted-icon" aria-hidden="true" /></div></CardHeader><CardContent>{recent.isPending ? <div className="admin-status-loading" role="status"><span className="admin-status-dot" aria-hidden="true" />Loading…</div> : recent.data?.products.length ? <div className="admin-mini-list">{recent.data.products.slice(0, 3).map((product) => <Link key={product._id} to={`/products/${product._id}`}><span>{product.name}</span><ArrowRight size={14} /></Link>)}</div> : <EmptyState title="No products to show" description="New catalogue items will appear here." action={<Link className="admin-text-link" to="/products/new">Add a product <ArrowRight size={14} /></Link>} />}</CardContent></Card>
    </div>
  </>
}
