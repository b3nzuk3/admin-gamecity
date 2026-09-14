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
import { UsersPage } from '@/features/users/UsersPage'
import { InventoryPage } from '@/features/inventory/InventoryPage'
import { HomepagePage } from '@/features/homepage/HomepagePage'

export function AdminRoutes() {
  return <Routes>
    <Route element={<PublicOnlyRoute />}>
      <Route path="/login" element={<LoginPage />} />
    </Route>
    <Route element={<AdminRoute />}>
      <Route element={<AdminShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductCreatePage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="customers" element={<Navigate to="/users" replace />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="categories" element={<CapabilityPendingPage title="Categories" description="Organize catalogue products into stable storefront categories." capability="Category management is planned and is not enabled in Phase 2." />} />
        <Route path="homepage" element={<HomepagePage />} />
        <Route path="media" element={<CapabilityPendingPage title="Media library" description="Manage product and merchandising imagery." capability="Media management is planned after the existing upload surface has been secured." />} />
        <Route path="settings" element={<CapabilityPendingPage title="Settings" description="Configure admin and storefront operational settings." capability="Settings storage and permissions are planned for a later phase." />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
