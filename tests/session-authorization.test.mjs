import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import ts from 'typescript'

test('session bootstrap sends the bearer token while login does not', async (t) => {
  const source = readFileSync(new URL('../src/services/api/client.ts', import.meta.url), 'utf8')
    .replace(/import .* from ['"]@\/lib\/env['"]/, "const adminEnv = { apiBaseUrl: 'https://api.example.invalid/api' }")
    .replace(/import type .* from ['"]@\/types['"]/, '')
    .replace(/import .* from ['"]@\/auth\/tokenStorage['"]/, "const tokenStorage = { getToken: () => 'isolated-test-token', clearToken: () => {} }")
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
  const { adminApi } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
  const requests = []
  t.mock.method(globalThis, 'fetch', async (url, options) => { requests.push({ url, options }); return new globalThis.Response('{}', { status: 200 }) })
  await adminApi.get('/admin/auth/me')
  await adminApi.post('/admin/auth/login', {})
  await adminApi.put('/admin/homepage/announcement', { text: 'New message' })
  assert.equal(requests[0].options.headers.get('Authorization'), 'Bearer isolated-test-token')
  assert.equal(requests[1].options.headers.get('Authorization'), null)
  assert.equal(requests[2].options.headers.get('Authorization'), 'Bearer isolated-test-token')
})
