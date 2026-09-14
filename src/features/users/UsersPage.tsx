import { useMemo, useState } from 'react'
import { RefreshCw, Search, ShieldCheck, UserRound, Users as UsersIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent } from '@/components/primitives/Card'
import { Input } from '@/components/primitives/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/data-display/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SkeletonBlock } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { usersApi } from '@/services/api'
import { userKeys } from '@/lib/queryKeys'
import type { AdminUser } from '@/types'

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(user: AdminUser) {
  return user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'
}

function matches(user: AdminUser, term: string) {
  const query = term.trim().toLowerCase()
  return !query || `${user.name} ${user.email}`.toLowerCase().includes(query)
}

function UserIdentity({ user }: { user: AdminUser }) {
  return <div className="admin-user-identity"><span className="admin-user-avatar" aria-hidden="true">{initials(user)}</span><span><strong>{user.name || 'Unnamed user'}</strong><small>{user.email}</small></span></div>
}

function UserTable({ users }: { users: AdminUser[] }) {
  return <div className="admin-users-table-desktop"><Table className="admin-users-table"><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Last updated</TableHead></TableRow></TableHeader><TableBody>{users.map((user) => <TableRow key={user.id}><TableCell><UserIdentity user={user} /></TableCell><TableCell>{user.isAdmin ? <Badge tone="accent"><ShieldCheck size={13} /> Administrator</Badge> : <Badge tone="neutral"><UserRound size={13} /> Customer</Badge>}</TableCell><TableCell>{formatDate(user.joinDate || user.createdAt)}</TableCell><TableCell>{formatDate(user.updatedAt)}</TableCell></TableRow>)}</TableBody></Table></div>
}

function UserCards({ users }: { users: AdminUser[] }) {
  return <div className="admin-users-cards-mobile">{users.map((user) => <article className="admin-user-card" key={user.id}><UserIdentity user={user} /><div className="admin-user-card-meta"><span>Role<strong>{user.isAdmin ? 'Administrator' : 'Customer'}</strong></span><span>Joined<strong>{formatDate(user.joinDate || user.createdAt)}</strong></span></div></article>)}</div>
}

export function UsersPage() {
  const [search, setSearch] = useState('')
  const users = useQuery({ queryKey: userKeys.list(), queryFn: ({ signal }) => usersApi.list({ signal }) })
  const filteredUsers = useMemo(() => (users.data || []).filter((user) => matches(user, search)), [search, users.data])
  const adminCount = users.data?.filter((user) => user.isAdmin).length || 0

  return <>
    <PageHeader eyebrow="People" title="Users" description="View the people who have signed up for GameCity and their account roles." />
    <section className="admin-user-summary" aria-label="User summary"><div><UsersIcon size={20} /><span><strong>{users.data?.length ?? '—'}</strong><small>Registered users</small></span></div><div><ShieldCheck size={20} /><span><strong>{users.isPending ? '—' : adminCount}</strong><small>Administrators</small></span></div></section>
    <Card className="admin-users-card"><CardContent>
      <div className="admin-users-toolbar"><div className="admin-users-search"><Search size={17} aria-hidden="true" /><Input aria-label="Search users" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" /></div><Button type="button" variant="ghost" onClick={() => void users.refetch()} disabled={users.isFetching}><RefreshCw size={15} className={users.isFetching ? 'admin-spin' : ''} /> Refresh</Button></div>
      {users.isPending ? <SkeletonBlock lines={6} /> : users.isError ? <ErrorState title="Users unavailable" description="The registered user list could not be loaded." action={<Button type="button" variant="secondary" onClick={() => void users.refetch()}>Try again</Button>} /> : filteredUsers.length === 0 ? <EmptyState title={search ? 'No matching users' : 'No users yet'} description={search ? 'Try a different name or email address.' : 'Signed-up users will appear here.'} /> : <><UserTable users={filteredUsers} /><UserCards users={filteredUsers} /></>}
    </CardContent></Card>
  </>
}
