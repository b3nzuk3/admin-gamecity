import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('src/features/homepage/HomepagePage.tsx', 'utf8')
const editor = readFileSync('src/features/homepage/AnnouncementEditor.tsx', 'utf8')
const api = readFileSync('src/services/api/homepage.ts', 'utf8')
const types = readFileSync('src/types/index.ts', 'utf8')

 test('homepage renders the announcement editor before the hero editor', () => {
  assert.match(page, /<AnnouncementEditor announcement={homepage\.data\.announcement} \/>[\s\S]*<HeroEditor hero={homepage\.data\.hero} \/>/)
  assert.match(editor, /Announcement bar/)
  assert.match(editor, /Announcement text/)
  assert.match(editor, /Mobile announcement \(optional\)/)
  assert.match(editor, /Show announcement bar on the storefront/)
  assert.match(editor, /save\.isPending/)
  assert.match(editor, /dirtyRef/)
})

test('homepage announcement editor uses the guarded admin API contract', () => {
  assert.match(api, /updateAnnouncement/)
  assert.match(api, /\/admin\/homepage\/announcement'/)
  assert.match(types, /export type HomepageAnnouncement = \{[\s\S]*enabled: boolean[\s\S]*text: string[\s\S]*mobileText: string[\s\S]*linkLabel: string[\s\S]*linkHref: string/)
  assert.match(types, /announcement: HomepageAnnouncement/)
  assert.match(types, /HomepageAnnouncementPayload = Partial<HomepageAnnouncement>/)
})
