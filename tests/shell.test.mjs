import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => readFile(path.join(root, file), 'utf8')

test('admin deployment blocks indexing and preserves SPA refreshes', async () => {
  const [html, robots, vercel] = await Promise.all([
    read('index.html'),
    read('public/robots.txt'),
    read('vercel.json'),
  ])

  assert.match(html, /noindex, nofollow/)
  assert.match(robots, /Disallow: \/\s*$/)
  assert.match(vercel, /X-Robots-Tag/)
  assert.match(vercel, /"destination": "\/index.html"/)
})

test('the app exposes the approved admin route inventory', async () => {
  const routes = await read('src/app/adminRoutes.tsx')
  for (const route of [
    'products',
    'products/new',
    'products/:productId',
    'orders',
    'orders/:orderId',
    'customers',
    'users',
    'inventory',
    'categories',
    'homepage',
    'media',
    'settings',
  ]) {
    assert.match(routes, new RegExp(`path="${route.replaceAll('/', '\\/')}"`))
  }
})

test('browser configuration contains no backend credentials', async () => {
  const [client, envExample] = await Promise.all([read('src/services/api/client.ts'), read('.env.example')])
  assert.doesNotMatch(`${client}\n${envExample}`, /MONGODB|R2_SECRET|JWT_SECRET|MPESA_SECRET/i)
  assert.match(envExample, /VITE_API_BASE_URL/)
  assert.match(client, /signal/)
})

test('the admin visual contract uses the storefront palette and brand asset', async () => {
  const [tokens, logo] = await Promise.all([
    read('src/styles/tokens.css'),
    stat(path.join(root, 'public/gamecity.png')),
  ])
  assert.match(tokens, /--admin-accent:\s*#fdb813/i)
  assert.ok(logo.size > 1000)
})

test('phase 2 auth boundary is explicit and token access is centralized', async () => {
  const [routes, provider, guards, client, tokenStorage, types] = await Promise.all([
    read('src/app/adminRoutes.tsx'),
    read('src/auth/AuthProvider.tsx'),
    read('src/auth/routeGuards.tsx'),
    read('src/services/api/client.ts'),
    read('src/auth/tokenStorage.ts'),
    read('src/types/index.ts'),
  ])
  assert.match(routes, /path="\/login"/)
  assert.match(routes, /<AdminRoute \/>/)
  assert.match(provider, /adminAuthApi\.me\(\)/)
  assert.match(provider, /tokenStorage\.getToken\(\)/)
  assert.match(provider, /queryClient\.clear\(\)/)
  assert.match(provider, /navigate\('\/login'/)
  assert.match(guards, /Navigate to="\/login"/)
  assert.match(guards, /isAuthenticated/)
  assert.match(client, /Authorization/)
  assert.match(client, /response\.status === 401/)
  assert.match(tokenStorage, /gamecity_token/)
  assert.match(types, /ProductSummary/)
  assert.match(types, /ProductDetail/)
  assert.match(types, /ProductListResponse/)
  for (const field of ['_id', 'image_r2', 'image_r2_variants', 'images_r2', 'specifications', 'offer', 'count']) {
    assert.match(types, new RegExp(field.replaceAll('_', '\\_')))
  }
  assert.doesNotMatch(types, /featured|sku|publicationStatus/i)
  assert.doesNotMatch(`${provider}\n${client}\n${guards}`, /localStorage\.(getItem|setItem|removeItem)/)
})
