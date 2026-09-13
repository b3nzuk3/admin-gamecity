import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute, PublicOnlyRoute } from '@/auth/routeGuards'
import { AdminShell } from '@/components/layout/AdminShell'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { CapabilityPendingPage } from '@/features/CapabilityPendingPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { ProductCreatePage } from '@/features/products/ProductCreatePage'
import { ProductDetailPage } from '@/features/products/ProductDetailPage'
import { OrdersPage } from '@/features/orders/OrdersPage'
import { OrderDetailPage } from '@/features/orders/OrderDetailPage'
import { CustomersPage } from '@/features/customers/CustomersPage'
import { InventoryPage } from '@/features/inventory/InventoryPage'

export function AdminRoutes() {
  return <Routes>
    <Route element={<PublicOnlyRoute />}>
      <Route path="/login" element={<LoginPage />} />
    </Route>
    <Route element={<AdminRoute />}>
      <Route element={<AdminShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage title="Products" description="Manage the GameCity catalogue without changing the storefront contract." capability="Product listing and CRUD are scheduled for the next migration phase." />} />
        <Route path="products/new" element={<ProductCreatePage title="New Product" description="Create a product in the existing catalogue." capability="The product form will be connected after API contracts and media upload permissions are confirmed." />} />
        <Route path="products/:productId" element={<ProductDetailPage title="Product editor" description="Review and edit a catalogue item." capability="The product editor is scaffolded but does not send writes in Phase 2." />} />
        <Route path="orders" element={<OrdersPage title="Orders" description="Review customer orders and fulfilment state." capability="Order reads and status transitions will be connected in the orders phase." />} />
        <Route path="orders/:orderId" element={<OrderDetailPage title="Order detail" description="Review one order and its customer-facing status." capability="Order detail is reserved for the orders phase." />} />
        <Route path="customers" element={<CustomersPage title="Customers" description="Understand customer accounts and order history." capability="Customer data will use the safe admin user contract before it is exposed here." />} />
        <Route path="inventory" element={<InventoryPage title="Inventory" description="Monitor availability across the catalogue." capability="Inventory views will be derived from the existing product source of truth in a later phase." />} />
        <Route path="categories" element={<CapabilityPendingPage title="Categories" description="Organize catalogue products into stable storefront categories." capability="Category management is planned and is not enabled in Phase 2." />} />
        <Route path="homepage" element={<CapabilityPendingPage title="Homepage merchandising" description="Control homepage sections and featured products." capability="Homepage merchandising is planned and is not enabled in Phase 2." />} />
        <Route path="media" element={<CapabilityPendingPage title="Media library" description="Manage product and merchandising imagery." capability="Media management is planned after the existing upload surface has been secured." />} />
        <Route path="settings" element={<CapabilityPendingPage title="Settings" description="Configure admin and storefront operational settings." capability="Settings storage and permissions are planned for a later phase." />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
