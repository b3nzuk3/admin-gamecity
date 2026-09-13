import { ArrowLeft, Construction } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Card, CardContent } from '@/components/primitives/Card'
import { PageHeader } from '@/components/layout/PageHeader'

export function CapabilityPendingPage({ title, description, capability, nextPhase = 'Phase 2' }: { title: string; description: string; capability: string; nextPhase?: string }) {
  const navigate = useNavigate()
  return <>
    <PageHeader eyebrow="Admin area" title={title} description={description} />
    <Card className="admin-pending-card"><CardContent><div className="admin-pending-icon"><Construction size={26} /></div><Badge tone="warning">{nextPhase} capability</Badge><h2>{capability}</h2><p>This route is intentionally scaffolded. It does not send mutations, show mock business data, or bypass the existing backend. The approved Phase 1 scope establishes the shell and API foundation first.</p><Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Go back</Button></CardContent></Card>
  </>
}
