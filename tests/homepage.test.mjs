import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const routes = readFileSync('src/app/adminRoutes.tsx', 'utf8')
const nav = readFileSync('src/components/layout/navigation.ts', 'utf8')
const page = readFileSync('src/features/homepage/HomepagePage.tsx', 'utf8')
const dialog = readFileSync('src/components/primitives/Dialog.tsx', 'utf8')
const layoutPicker = readFileSync('src/features/homepage/HomepageLayoutPicker.tsx', 'utf8')
const api = readFileSync('src/services/api/homepage.ts', 'utf8')
const picker = readFileSync('src/features/homepage/ProductPicker.tsx', 'utf8')

test('admin homepage is enabled and uses a real management page', () => {
  assert.match(routes, /path="homepage" element={<HomepagePage \/>}/)
  assert.match(nav, /label: 'Homepage',[\s\S]{0,100}enabled: true/)
  assert.match(page, /<HeroEditor hero={homepage\.data\.hero} \/>/)
  assert.match(page, /<ProductPicker/)
  assert.match(page, /<HomepageLayoutPicker/)
  assert.match(page, /ConfirmDialog/)
  assert.match(page, /admin-homepage-empty-state/)
  assert.doesNotMatch(page, /Sparkles/)
  assert.match(dialog, /onCloseRef/)
  assert.match(dialog, /input:\s*not\(\[disabled\]\)/)
  assert.match(dialog, /\}, \[open\]\)/)
  assert.match(layoutPicker, /Catalogue grid/)
  assert.match(layoutPicker, /Swipeable carousel/)
})

test('homepage admin API exposes guarded merchandising operations', () => {
  assert.match(api, /\/admin\/homepage'/)
  assert.match(api, /\/admin\/homepage\/hero'/)
  assert.match(api, /sections\/reorder/)
  assert.match(api, /sections\/\$\{encodeURIComponent\(id\)\}\/products/)
  assert.match(picker, /productsApi\.list/)
  assert.match(picker, /aria-pressed={selected}/)
})
