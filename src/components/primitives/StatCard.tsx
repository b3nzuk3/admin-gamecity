import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'

export function StatCard({ label, value, detail, icon: Icon, tone = 'accent' }: {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  tone?: 'accent' | 'blue' | 'green' | 'orange'
}) {
  return (
    <Card className="admin-stat-card">
      <div className="admin-stat-top"><span className="admin-stat-label">{label}</span><div className={`admin-stat-icon admin-stat-icon-${tone}`}><Icon size={19} strokeWidth={2.2} /></div></div>
      <strong className={`admin-stat-value${value === 'N/A' ? ' admin-stat-value-unavailable' : ''}`} aria-label={value === 'N/A' ? `${label} unavailable` : undefined}>{value}</strong>
      <span className="admin-stat-detail">{detail}</span>
    </Card>
  )
}
