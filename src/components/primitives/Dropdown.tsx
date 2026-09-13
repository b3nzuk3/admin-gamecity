import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

export function Dropdown({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="admin-dropdown">
      <summary>{label}<ChevronDown size={15} aria-hidden="true" /></summary>
      <div className="admin-dropdown-menu">{children}</div>
    </details>
  )
}
