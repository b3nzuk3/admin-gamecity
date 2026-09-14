import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => readFile(path.join(root, file), 'utf8')

test('orders pages use the protected paginated API and expose real actions', async () => {
  const [page, detail, list, api, routes] = await Promise.all([
    read('src/features/orders/OrdersPage.tsx'),
    read('src/features/orders/OrderDetailPage.tsx'),
    read('src/features/orders/OrderList.tsx'),
    read('src/services/api/orders.ts'),
    read('src/app/adminRoutes.tsx'),
  ])

  assert.match(routes, /path="orders" element={<OrdersPage \/>}/)
  assert.match(routes, /path="orders\/:orderId" element={<OrderDetailPage \/>}/)
  assert.match(page, /ordersApi\.list\(params/)
  assert.match(page, /ordersApi\.updateStatus/)
  assert.match(page, /ordersApi\.remove/)
  assert.match(detail, /ordersApi\.detail\(id/)
  assert.match(detail, /Completing or reopening an order changes stock quantities/)
  assert.match(list, /\/orders\/\$\{order\.id\}/)
  assert.match(api, /\/admin\/orders/)
  assert.match(api, /page/)
  assert.match(api, /status/)
})

test('inventory remains derived from product stock and offers mobile-safe states', async () => {
  const [page, table] = await Promise.all([
    read('src/features/inventory/InventoryPage.tsx'),
    read('src/features/inventory/InventoryTable.tsx'),
  ])

  assert.match(page, /productsApi\.list\(params/)
  assert.match(page, /countInStock field/)
  assert.match(page, /read-only/)
  assert.match(page, /inventory-stock-filter/)
  assert.match(table, /countInStock/)
  assert.match(table, /admin-inventory-cards-mobile/)
  assert.match(table, /Low stock/)
})
